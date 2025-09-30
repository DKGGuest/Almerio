// =====================================================
// SERVERLESS DATABASE CONFIGURATION
// MySQL database setup optimized for serverless functions
// =====================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration for serverless
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'shooting_range_db',
    port: process.env.DB_PORT || 3306,
    // Serverless optimizations
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    // SSL for cloud databases
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Global connection variable for reuse across function calls
let connection = null;

// Database wrapper class optimized for serverless
class ServerlessDatabase {
    constructor() {
        this.connection = null;
    }

    // Get or create connection
    async getConnection() {
        if (!this.connection) {
            try {
                this.connection = await mysql.createConnection(dbConfig);
                console.log('✅ Database connection established');
            } catch (error) {
                console.error('❌ Database connection failed:', error.message);
                throw error;
            }
        }
        return this.connection;
    }

    // Test database connection
    async testConnection() {
        try {
            const conn = await this.getConnection();
            await conn.ping();
            console.log('✅ Database connection successful');
            return true;
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }
    }

    // Execute query
    async query(sql, params = []) {
        try {
            const conn = await this.getConnection();
            const [rows] = await conn.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('Database query error:', error.message);
            console.error('SQL:', sql);
            console.error('Params:', params);
            throw error;
        }
    }

    // Close connection (for cleanup)
    async close() {
        if (this.connection) {
            try {
                await this.connection.end();
                this.connection = null;
                console.log('✅ Database connection closed');
            } catch (error) {
                console.error('❌ Error closing database connection:', error.message);
            }
        }
    }
}

// Create database instance
const db = new ServerlessDatabase();

// Export for use in other modules
module.exports = {
    db,
    testConnection: () => db.testConnection(),
    initializeDatabase: async () => {
        // Database initialization logic would go here
        // For now, just test the connection
        return await db.testConnection();
    }
};
