<?php
/**
 * Configuration file for R20 Competition API
 * This file should be hosted on mombe.org/kfm/api/
 * Copy this to config.php and update with your settings
 */

return [
    // Database configuration for mombe.org - SQLite3
    'database' => [
        'type' => 'sqlite',
        'path' => '/path/to/r20_competition.db', // Set via KFM_DB_PATH environment variable
        'auto_create' => true // Automatically create tables if they don't exist
    ],

    // Application settings
    'app' => [
        'title' => 'R20 Competition API',
        'debug' => false, // Set to true for development
        'timezone' => 'Africa/Johannesburg',
        'max_queries_per_ip_per_hour' => 100, // Rate limiting
        'allowed_origins' => [
            'https://*.github.io',
            'https://github.io',
            'http://localhost:3000', // For local development
            'http://127.0.0.1:3000'
        ]
    ],

    // Security settings
    'security' => [
        'log_ip_addresses' => true,
        'log_user_agents' => false,
        'enable_rate_limiting' => true,
        'enable_cors' => true
    ],

    // Server-specific settings
    'server' => [
        'host' => 'api.kfmcashhunt.site',
        'api_path' => '/',
        'log_path' => '/var/log/r20_competition/',
        'temp_path' => '/tmp/r20_competition/'
    ]
];
?>