# R20 Competition API

This directory contains the PHP backend API that needs to be hosted on **api.kfmcashhunt.site/**.

## Files in this directory:

- `index.php` - Main API endpoint
- `database_setup_sqlite.sql` - SQLite3 database schema (optional)
- `README.md` - This file

## Setup Instructions for example.org

### 1. Upload Files
Upload all files in this `api/` directory to `https://api.kfmcashhunt.site/` on your web server.

### 2. Database Setup (SQLite3)
The API uses SQLite3 and will automatically create the database file and tables.

**Option 1: Automatic (Recommended)**
- Set the `KFM_DB_PATH` environment variable to your desired database location
- The API will automatically create the database and tables on first access

**Option 2: Manual Setup**
```bash
# Create database manually (optional)
sqlite3 /path/to/r20_competition.db < database_setup_sqlite.sql
```

### 3. Configuration
1. Set the database path via environment variable:
   ```bash
   export KFM_DB_PATH="/var/lib/kfm/r20_competition.db"
   ```
   Or in your web server configuration (Apache/Nginx)

2. Set appropriate file permissions:
```bash
chmod 644 index.php config.php
chmod 600 config.php  # Keep config secure
chmod 644 database_setup.sql
```

### 4. Test the API
Test the API endpoint:
```bash
curl -X POST https://api.kfmcashhunt.site/ \
  -H "Content-Type: application/json" \
  -d '{"action":"health_check"}'
```

Expected response:
```json
{
    "success": true,
    "timestamp": "2025-10-17 12:00:00",
    "data": {
        "database": true,
        "database_type": "SQLite3",
        "database_path": "/path/to/r20_competition.db",
        "php_version": "8.x.x",
        "server": "api.kfmcashhunt.site"
    },
    "message": "API is healthy"
}
```

## API Endpoints

### POST /
All API calls are made to the root endpoint with different `action` parameters:

#### Health Check
```json
{
    "action": "health_check"
}
```

#### Log Query
```json
{
    "action": "log_query",
    "serial_number": "AH28519618B",
    "is_winner": 1
}
```

#### Get Statistics
```json
{
    "action": "get_stats"
}
```

## CORS Configuration

The API is configured to accept requests from:
- GitHub Pages (*.github.io)
- Local development servers

## Security Features

- Rate limiting (100 requests per IP per hour)
- Input validation
- SQL injection protection
- CORS headers for cross-origin requests
- IP address logging

## Environment Variables

Set these environment variables on your web server:

```bash
# Database path (required)
KFM_DB_PATH="/var/lib/kfm/r20_competition.db"

# Example for Apache (.htaccess or virtual host)
SetEnv KFM_DB_PATH "/var/lib/kfm/r20_competition.db"

# Example for Nginx (in server block)
fastcgi_param KFM_DB_PATH "/var/lib/kfm/r20_competition.db";
```

## Troubleshooting

1. **Database Connection Issues**
   - Check if SQLite3 PHP extension is installed: `php -m | grep sqlite`
   - Verify the database directory is writable by the web server
   - Check the `KFM_DB_PATH` environment variable is set correctly
   - Ensure file permissions allow read/write access

2. **CORS Errors**
   - Verify `Access-Control-Allow-Origin` headers are being sent
   - Check browser console for specific CORS error messages

3. **Rate Limiting**
   - Rate limit files are stored in system temp directory
   - Clear temp files if needed: `rm /tmp/r20_rate_*`

## Monitoring

Monitor the API by checking:
- Server access logs
- PHP error logs
- Database query logs
- Rate limiting temp files