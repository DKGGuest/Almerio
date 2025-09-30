# Shooting Range Dashboard - Database Setup Guide

## Prerequisites

1. **MySQL Server** (version 8.0 or higher recommended)
2. **Node.js** (version 16.0 or higher)
3. **npm** (version 8.0 or higher)

## Installation Steps

### 1. Install MySQL Server

#### Windows:
- Download MySQL Installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
- Run installer and choose "Developer Default" setup
- Set root password during installation
- Start MySQL service

#### macOS:
```bash
# Using Homebrew
brew install mysql
brew services start mysql

# Set root password
mysql_secure_installation
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

### 2. Create Database User (Optional but Recommended)

```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create dedicated user for the application
CREATE USER 'shooting_range_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON shooting_range_db.* TO 'shooting_range_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Install Server Dependencies

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install
```

### 4. Configure Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your database credentials
nano .env  # or use your preferred editor
```

**Example .env configuration:**
```env
# Database Configuration
DB_HOST=localhost
DB_USER=shooting_range_user
DB_PASSWORD=your_secure_password
DB_NAME=shooting_range_db
DB_PORT=3306

# Server Configuration
PORT=3001
NODE_ENV=development

# Security (generate secure random strings)
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_here
```

### 5. Initialize Database

```bash
# Test database connection
npm run test-connection

# Initialize database schema
npm run init-db

# Run database tests (optional)
npm run test
```

### 6. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## Verification

### 1. Check Server Status
Visit: `http://localhost:3001/api/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

### 2. Verify Database Tables
```sql
-- Connect to MySQL
mysql -u shooting_range_user -p shooting_range_db

-- List all tables
SHOW TABLES;

-- Check table structure
DESCRIBE shooters;
DESCRIBE shooting_sessions;
DESCRIBE performance_analytics;
DESCRIBE final_reports;
```

Expected tables:
- shooters
- shooting_sessions
- target_templates
- shooting_parameters
- bullseye_positions
- shot_coordinates
- performance_analytics
- final_reports

## API Endpoints

### Health Check
- `GET /api/health` - Server and database status

### Shooter Management
- `GET /api/shooters` - List all shooters
- `GET /api/shooters/:id` - Get shooter details
- `POST /api/shooters` - Create new shooter
- `GET /api/shooters/:name/history` - Get shooter session history

### Session Management
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session details
- `POST /api/sessions/:id/parameters` - Save shooting parameters
- `POST /api/sessions/:id/bullseye` - Save bullseye position
- `POST /api/sessions/:id/shots` - Save shot coordinates
- `POST /api/sessions/:id/analytics` - Save performance analytics
- `POST /api/sessions/:id/final-report` - Save final report

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```
Error: ER_ACCESS_DENIED_ERROR: Access denied for user
```
**Solution:**
- Check username/password in .env file
- Verify user has correct permissions
- Ensure MySQL service is running

#### 2. Database Does Not Exist
```
Error: ER_BAD_DB_ERROR: Unknown database 'shooting_range_db'
```
**Solution:**
- Run `npm run init-db` to create database
- Check database name in .env file

#### 3. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Solution:**
- Change PORT in .env file
- Kill process using the port: `lsof -ti:3001 | xargs kill`

#### 4. Permission Denied
```
Error: ER_ACCESS_DENIED_ERROR: Access denied for user 'shooting_range_user'@'localhost'
```
**Solution:**
```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON shooting_range_db.* TO 'shooting_range_user'@'localhost';
FLUSH PRIVILEGES;
```

### Database Reset
If you need to reset the database:
```bash
npm run reset-db
```

### Logs
Check server logs for detailed error information:
```bash
# View real-time logs
npm run dev

# Check MySQL error logs
sudo tail -f /var/log/mysql/error.log  # Linux
tail -f /usr/local/var/mysql/*.err     # macOS
```

## Security Considerations

1. **Change Default Passwords**: Never use default passwords in production
2. **Use Environment Variables**: Keep sensitive data in .env files
3. **Database User Permissions**: Create dedicated database users with minimal required permissions
4. **Firewall**: Configure firewall to restrict database access
5. **SSL/TLS**: Enable SSL for database connections in production
6. **Regular Backups**: Set up automated database backups

## Performance Optimization

1. **Indexes**: Database includes optimized indexes for common queries
2. **Connection Pooling**: Server uses MySQL connection pooling
3. **Query Optimization**: Use EXPLAIN to analyze slow queries
4. **Regular Maintenance**: Run MySQL maintenance commands periodically

```sql
-- Optimize tables
OPTIMIZE TABLE shooters, shooting_sessions, shot_coordinates, performance_analytics, final_reports;

-- Analyze tables
ANALYZE TABLE shooters, shooting_sessions, shot_coordinates, performance_analytics, final_reports;
```

## Backup and Recovery

### Create Backup
```bash
# Full database backup
mysqldump -u shooting_range_user -p shooting_range_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup specific tables
mysqldump -u shooting_range_user -p shooting_range_db shooters shooting_sessions > shooters_backup.sql
```

### Restore Backup
```bash
# Restore full database
mysql -u shooting_range_user -p shooting_range_db < backup_20240101_120000.sql

# Restore specific tables
mysql -u shooting_range_user -p shooting_range_db < shooters_backup.sql
```

## Support

For additional support:
1. Check the database schema documentation: `DATABASE_SCHEMA.md`
2. Review the test file: `test_database.js`
3. Check server logs for detailed error messages
4. Verify all environment variables are correctly set
