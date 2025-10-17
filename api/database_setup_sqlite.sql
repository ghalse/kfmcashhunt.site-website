-- R20 Competition Database Setup - SQLite3
-- SQLite database schema for logging serial number queries
-- This file should be run on the server hosting the API (example.org)

-- Note: SQLite will automatically create the database file when first accessed
-- The API will automatically create tables if they don't exist

-- Manual setup (if needed):
-- sqlite3 /path/to/r20_competition.db < database_setup_sqlite.sql

-- Create query log table
CREATE TABLE IF NOT EXISTS query_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    serial_number TEXT NOT NULL,
    is_winner INTEGER NOT NULL DEFAULT 0,
    client_ip TEXT NOT NULL,
    query_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    client_fingerprint TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_serial_number ON query_log(serial_number);
CREATE INDEX IF NOT EXISTS idx_client_ip ON query_log(client_ip);
CREATE INDEX IF NOT EXISTS idx_query_time ON query_log(query_time);
CREATE INDEX IF NOT EXISTS idx_is_winner ON query_log(is_winner);
CREATE INDEX IF NOT EXISTS idx_client_fingerprint ON query_log(client_fingerprint);

-- Create a view for query statistics
CREATE VIEW IF NOT EXISTS query_statistics AS
SELECT
    COUNT(*) as total_queries,
    COUNT(DISTINCT serial_number) as unique_serials_checked,
    COUNT(DISTINCT client_ip) as unique_clients,
    SUM(is_winner) as winner_queries,
    DATE(query_time) as query_date,
    COUNT(*) as daily_queries
FROM query_log
GROUP BY DATE(query_time)
ORDER BY query_date DESC;

-- Create a view for popular serial numbers
CREATE VIEW IF NOT EXISTS popular_serials AS
SELECT
    serial_number,
    COUNT(*) as query_count,
    MIN(query_time) as first_query,
    MAX(query_time) as last_query,
    COUNT(DISTINCT client_ip) as unique_clients,
    MAX(is_winner) as is_winning_number
FROM query_log
GROUP BY serial_number
HAVING query_count > 1
ORDER BY query_count DESC, first_query ASC;

-- Show initial statistics
SELECT 'SQLite3 database setup complete for example.org API!' as status;