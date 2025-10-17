<?php
/**
 * R20 Competition API
 * Minimal PHP script for logging serial number queries
 * Designed to be hosted separately from the static frontend
 */

// Check JSON extension first since we need it for error responses
if (!extension_loaded('json')) {
    http_response_code(500);
    die('{"error":"JSON extension is required but not loaded"}');
}

// Check other required extensions
if (!extension_loaded('pdo')) {
    http_response_code(500);
    die(json_encode(['error' => 'PDO extension is required but not loaded']));
}

if (!extension_loaded('pdo_sqlite')) {
    http_response_code(500);
    die(json_encode(['error' => 'PDO SQLite extension is required but not loaded']));
}

if (!extension_loaded('filter')) {
    http_response_code(500);
    die(json_encode(['error' => 'Filter extension is required but not loaded']));
}

// Set content type to JSON and CORS headers for GitHub Pages
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // In production, replace * with specific GitHub Pages URL
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Origin');
header('Access-Control-Max-Age: 3600'); // Cache preflight for 1 hour

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Database configuration - SQLite3 with environment variable support
$db_path = $_ENV['KFM_DB_PATH'] ?? $_SERVER['KFM_DB_PATH'] ?? __DIR__ . '/r20_competition.db';

/**
 * Get SQLite database connection
 */
function getDbConnection($db_path) {
    try {
        // Ensure directory exists
        $dir = dirname($db_path);

        if (!is_dir($dir)) {
            if (!mkdir($dir, 0755, true)) {
                error_log("Failed to create directory: " . $dir);
                throw new Exception("Cannot create database directory: " . $dir);
            }
        }

        // Check directory permissions
        if (!is_writable($dir)) {
            error_log("Directory not writable: " . $dir);
            throw new Exception("Database directory is not writable: " . $dir);
        }

        // Check if database file exists and its permissions
        if (file_exists($db_path)) {
            if (!is_writable($db_path)) {
                error_log("Database file not writable: " . $db_path);
                throw new Exception("Database file is not writable: " . $db_path);
            }
        }

        $pdo = new PDO(
            "sqlite:" . $db_path,
            null,
            null,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );

        // Create tables if they don't exist
        createTables($pdo);

        return $pdo;
    } catch (PDOException $e) {
        error_log("Database PDO error: " . $e->getMessage());
        error_log("Database path was: " . $db_path);
        return null;
    } catch (Exception $e) {
        error_log("Database general error: " . $e->getMessage());
        return null;
    }
}

/**
 * Create database tables if they don't exist
 */
function createTables($pdo) {
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS query_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                serial_number TEXT NOT NULL,
                is_winner INTEGER NOT NULL DEFAULT 0,
                client_ip TEXT NOT NULL,
                query_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                user_agent TEXT
            )
        ");

        // Create indexes for better performance
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_serial_number ON query_log(serial_number)");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_client_ip ON query_log(client_ip)");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_query_time ON query_log(query_time)");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_is_winner ON query_log(is_winner)");

    } catch (PDOException $e) {
        error_log("Table creation error: " . $e->getMessage());
        throw $e;
    }
}

/**
 * Get client IP address
 */
function getClientIP() {
    $ip_keys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];

    foreach ($ip_keys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }

    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

/**
 * Validate serial number format
 */
function validateSerialNumber($serial) {
    return preg_match('/^[A-Z]{2}[0-9]{6,8}[A-Z]$/', $serial);
}

/**
 * Rate limiting check (basic implementation)
 */
function checkRateLimit($client_ip, $max_requests = 100) {
    $rate_limit_file = sys_get_temp_dir() . '/r20_rate_' . md5($client_ip);

    if (!file_exists($rate_limit_file)) {
        file_put_contents($rate_limit_file, json_encode([
            'count' => 1,
            'first_request' => time()
        ]));
        return true;
    }

    $data = json_decode(file_get_contents($rate_limit_file), true);

    // Reset counter if more than an hour has passed
    if (time() - $data['first_request'] > 3600) {
        file_put_contents($rate_limit_file, json_encode([
            'count' => 1,
            'first_request' => time()
        ]));
        return true;
    }

    if ($data['count'] >= $max_requests) {
        return false;
    }

    $data['count']++;
    file_put_contents($rate_limit_file, json_encode($data));
    return true;
}

/**
 * Log a query to the database
 */
function logQuery($pdo, $serial_number, $is_winner, $client_ip, $user_agent = null) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO query_log (serial_number, is_winner, client_ip, query_time, user_agent)
            VALUES (?, ?, ?, datetime('now'), ?)
        ");

        $result = $stmt->execute([$serial_number, $is_winner, $client_ip, $user_agent]);

        if ($result) {
            return $pdo->lastInsertId();
        }

        return false;
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        return false;
    }
}

/**
 * Get privacy-friendly previous query information
 */
function getPreviousQueryInfo($pdo, $serial_number, $current_ip, $current_user_agent) {
    try {
        $stmt = $pdo->prepare("
            SELECT client_ip, query_time, is_winner, user_agent
            FROM query_log
            WHERE serial_number = ?
            ORDER BY query_time ASC
        ");

        $stmt->execute([$serial_number]);
        $results = $stmt->fetchAll();

        if (empty($results)) {
            return null;
        }

        // Check if current user has queried this serial before
        $is_same_user = false;
        $timestamps = [];

        foreach ($results as $query) {
            $timestamps[] = $query['query_time'];

            // Check if same IP and user agent (indicating same user)
            if ($query['client_ip'] === $current_ip &&
                $query['user_agent'] === $current_user_agent) {
                $is_same_user = true;
            }
        }

        return [
            'first_query_time' => $results[0]['query_time'],
            'query_count' => count($results),
            'all_timestamps' => $timestamps,
            'queried_by_same_user' => $is_same_user,
            'first_query_was_winner' => (bool)$results[0]['is_winner']
        ];
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        return null;
    }
}

/**
 * Check if serial number was previously queried
 */
function getPreviousQuery($pdo, $serial_number) {
    try {
        $stmt = $pdo->prepare("
            SELECT client_ip, query_time, is_winner
            FROM query_log
            WHERE serial_number = ?
            ORDER BY query_time ASC
            LIMIT 1
        ");

        $stmt->execute([$serial_number]);
        $result = $stmt->fetch();

        return $result ?: null;
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        return null;
    }
}

/**
 * Get query statistics
 */
function getQueryStats($pdo) {
    try {
        $stmt = $pdo->prepare("
            SELECT
                COUNT(*) as total_queries,
                COUNT(DISTINCT serial_number) as unique_serials,
                COUNT(DISTINCT client_ip) as unique_clients,
                SUM(is_winner) as winner_queries
            FROM query_log
        ");

        $stmt->execute();
        return $stmt->fetch();
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        return null;
    }
}

/**
 * Send JSON response
 */
function sendResponse($success, $data = null, $message = '', $http_code = 200) {
    http_response_code($http_code);

    $response = [
        'success' => $success,
        'timestamp' => date('Y-m-d H:i:s'),
        'data' => $data
    ];

    if ($message) {
        $response['message'] = $message;
    }

    echo json_encode($response, JSON_PRETTY_PRINT);
    exit;
}

// Debug endpoint - GET request to see database configuration
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['debug'])) {
    global $db_path;
    $dir = dirname($db_path);

    $debug_info = [
        'database_path' => $db_path,
        'database_directory' => $dir,
        'directory_exists' => is_dir($dir),
        'directory_writable' => is_dir($dir) ? is_writable($dir) : false,
        'file_exists' => file_exists($db_path),
        'file_writable' => file_exists($db_path) ? is_writable($db_path) : 'N/A',
        'current_user' => get_current_user(),
        'php_version' => PHP_VERSION,
        'extensions' => [
            'pdo' => extension_loaded('pdo'),
            'pdo_sqlite' => extension_loaded('pdo_sqlite'),
            'sqlite3' => extension_loaded('sqlite3')
        ]
    ];

    echo json_encode($debug_info, JSON_PRETTY_PRINT);
    exit;
}// Main API logic
try {
    // Only accept POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse(false, null, 'Only POST requests allowed', 405);
    }

    // Get client IP for rate limiting
    $client_ip = getClientIP();

    // Basic rate limiting
    if (!checkRateLimit($client_ip, 100)) {
        sendResponse(false, null, 'Rate limit exceeded. Please try again later.', 429);
    }

    // Get POST data
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    $action = $input['action'] ?? '';

    if (empty($action)) {
        sendResponse(false, null, 'Action parameter required', 400);
    }

    // Get database connection
    $pdo = getDbConnection($db_path);
    if (!$pdo) {
        // If database is not available, return success but with limited functionality
        sendResponse(true, [
            'logged' => false,
            'message' => 'Query logging temporarily unavailable'
        ], 'Database connection failed');
    }

    switch ($action) {
        case 'log_query':
            $serial_number = strtoupper(trim($input['serial_number'] ?? ''));
            $is_winner = (int)($input['is_winner'] ?? 0);
            $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';

            // Validate serial number
            if (!validateSerialNumber($serial_number)) {
                sendResponse(false, null, 'Invalid serial number format', 400);
            }

            // Check for previous queries of this serial number (privacy-friendly)
            $previous_query_info = getPreviousQueryInfo($pdo, $serial_number, $client_ip, $user_agent);

            // Log the new query
            $log_id = logQuery($pdo, $serial_number, $is_winner, $client_ip, $user_agent);

            $response_data = [
                'logged' => $log_id !== false,
                'log_id' => $log_id,
                'serial_number' => $serial_number,
                'is_winner' => (bool)$is_winner,
                'previous_queries' => $previous_query_info
            ];

            sendResponse(true, $response_data, 'Query logged successfully');
            break;

        case 'get_stats':
            $stats = getQueryStats($pdo);
            sendResponse(true, $stats, 'Statistics retrieved');
            break;

        case 'health_check':
            sendResponse(true, [
                'database' => $pdo !== null,
                'database_type' => 'SQLite3',
                'database_path' => $db_path,
                'php_version' => PHP_VERSION,
                'timestamp' => date('Y-m-d H:i:s'),
                'server' => 'api.kfmcashhunt.site'
            ], 'API is healthy');
            break;

        default:
            sendResponse(false, null, 'Unknown action', 400);
    }

} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    sendResponse(false, null, 'Internal server error', 500);
}
?>