# Shooting Range Dashboard - Backend Server

## Overview

This is the backend server for the Shooting Range Dashboard system. It provides a complete MySQL database solution for storing all shooting range data including:

- **Shooter Management**: Store shooter names, skill levels, and profiles
- **Session Tracking**: Track individual shooting sessions with lane assignments
- **Parameters Storage**: Store shooting parameters (firing mode, time limits, distances, templates)
- **Shot Coordinates**: Record precise shot coordinates with timestamps
- **Performance Analytics**: Calculate and store MPI, accuracy, group size, and other metrics
- **Final Reports**: Generate comprehensive session reports with scores and ratings

## Features

✅ **Complete Database Schema** - 8 optimized tables with proper relationships  
✅ **RESTful API** - Full CRUD operations for all data types  
✅ **Data Association** - All data linked to shooter names for historical tracking  
✅ **Performance Analytics** - Automatic calculation and storage of shooting metrics  
✅ **Final Reports** - Complete session reports with scores and performance ratings  
✅ **Security** - Rate limiting, CORS, helmet security headers  
✅ **Error Handling** - Comprehensive error handling and logging  
✅ **Database Pooling** - Optimized MySQL connection pooling  
✅ **Environment Configuration** - Flexible configuration via environment variables  

## Quick Start

### 1. Prerequisites
- MySQL Server 8.0+
- Node.js 16.0+
- npm 8.0+

### 2. Installation
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Database Setup
```bash
# Test database connection
npm run test-connection

# Initialize database schema
npm run init-db

# Run tests to verify setup
npm run test
```

### 4. Start Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 5. Verify Installation
Visit: `http://localhost:3001/api/health`

## Database Schema

### Core Tables
- **shooters** - Shooter profiles and information
- **shooting_sessions** - Individual shooting sessions
- **shooting_parameters** - Session parameters (firing mode, distances, etc.)
- **shot_coordinates** - Individual shot coordinates and scores
- **performance_analytics** - Calculated performance metrics
- **final_reports** - Complete session reports

### Data Flow
1. Admin assigns shooter name → Creates/finds shooter record
2. Admin sets parameters → Stores in shooting_parameters
3. Shots fired → Coordinates stored in shot_coordinates
4. Analytics calculated → Stored in performance_analytics
5. Final report generated → Stored in final_reports

## API Endpoints

### Health & Setup
- `GET /api/health` - Server and database status
- `POST /api/init-database` - Initialize database schema

### Shooter Management
- `GET /api/shooters` - List all shooters with session counts
- `GET /api/shooters/:id` - Get shooter details with complete history
- `POST /api/shooters` - Create new shooter
- `GET /api/shooters/:name/history` - Get shooter session history

### Session Management
- `POST /api/sessions` - Create new shooting session
- `GET /api/sessions/:id` - Get complete session details
- `POST /api/sessions/:id/parameters` - Save shooting parameters
- `POST /api/sessions/:id/bullseye` - Save bullseye position
- `POST /api/sessions/:id/shots` - Save shot coordinates
- `POST /api/sessions/:id/analytics` - Save performance analytics
- `POST /api/sessions/:id/final-report` - Save final report

## Data Examples

### Create Session
```javascript
POST /api/sessions
{
  "shooter_name": "John Doe",
  "lane_id": "lane1",
  "session_name": "Practice Session"
}
```

### Save Parameters
```javascript
POST /api/sessions/1/parameters
{
  "firingMode": "timed",
  "timeLimit": 60,
  "targetDistance": 25,
  "templateId": "pistol-25m-precision",
  "windDirection": 0,
  "windSpeed": 0
}
```

### Save Shot Coordinates
```javascript
POST /api/sessions/1/shots
[
  {
    "x": 195.5,
    "y": 203.2,
    "timestamp": 1640995200000,
    "score": 10,
    "shotNumber": 1
  }
]
```

### Save Performance Analytics
```javascript
POST /api/sessions/1/analytics
{
  "mpiDistance": 15.2,
  "accuracyPercentage": 87.5,
  "maxDistance": 18.9,
  "groupSize": 25.8,
  "shotsAnalyzed": 5,
  "referencePointType": "custom bullseye"
}
```

### Save Final Report
```javascript
POST /api/sessions/1/final-report
{
  "totalScore": 45,
  "accuracyPercentage": 87.5,
  "mpiDistance": 15.2,
  "performanceRating": "SKILLED SHOOTER",
  "performanceEmoji": "🥇"
}
```

## Configuration

### Environment Variables (.env)
```env
# Database
DB_HOST=localhost
DB_USER=shooting_range_user
DB_PASSWORD=your_password
DB_NAME=shooting_range_db
DB_PORT=3306

# Server
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run test` - Run database tests
- `npm run init-db` - Initialize database schema
- `npm run test-connection` - Test database connection
- `npm run reset-db` - Reset database (⚠️ Destructive)

## Workflow Integration

### Frontend Integration
The server is designed to work seamlessly with your existing AdminDashboard component:

1. **Shooter Assignment** → `POST /api/sessions` with shooter name
2. **Parameter Setting** → `POST /api/sessions/:id/parameters`
3. **Bullseye Setting** → `POST /api/sessions/:id/bullseye`
4. **Shot Firing** → `POST /api/sessions/:id/shots` for each shot
5. **Analytics Calculation** → `POST /api/sessions/:id/analytics`
6. **Final Report** → `POST /api/sessions/:id/final-report`

### Data Retrieval
- **Shooter History** → `GET /api/shooters/:name/history`
- **Session Details** → `GET /api/sessions/:id`
- **All Shooters** → `GET /api/shooters`

## Security Features

- **Rate Limiting** - Prevents API abuse
- **CORS Protection** - Configurable cross-origin requests
- **Helmet Security** - Security headers
- **Input Validation** - Parameter validation
- **SQL Injection Protection** - Parameterized queries
- **Connection Pooling** - Secure database connections

## Performance Optimizations

- **Database Indexes** - Optimized for common queries
- **Connection Pooling** - Efficient database connections
- **Compression** - Response compression
- **Query Optimization** - Efficient SQL queries

## Monitoring & Logging

- **Health Endpoint** - `/api/health` for monitoring
- **Request Logging** - All API requests logged
- **Error Handling** - Comprehensive error responses
- **Database Status** - Connection status monitoring

## Files Structure

```
server/
├── server.js              # Main server file
├── database_config.js     # Database configuration and schema
├── test_database.js       # Database tests
├── package.json           # Dependencies and scripts
├── .env.example          # Environment template
├── DATABASE_SCHEMA.md    # Complete schema documentation
├── SETUP_GUIDE.md        # Detailed setup instructions
└── README.md             # This file
```

## Support

For detailed setup instructions, see `SETUP_GUIDE.md`  
For database schema details, see `DATABASE_SCHEMA.md`  
For testing, run `npm run test`

## Next Steps

1. **Setup Database** - Follow SETUP_GUIDE.md
2. **Configure Environment** - Update .env file
3. **Test Connection** - Run `npm run test-connection`
4. **Initialize Schema** - Run `npm run init-db`
5. **Start Server** - Run `npm run dev`
6. **Integrate Frontend** - Connect your AdminDashboard component

The database is now ready to store all your shooting range data with complete shooter history tracking! 🎯
