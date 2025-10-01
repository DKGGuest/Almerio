// =====================================================
// SERVERLESS DATABASE CONFIGURATION
// MySQL database setup optimized for serverless functions
// =====================================================

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// SSL Configuration for Aiven and other cloud databases
function getSSLConfig() {
    // If SSL is explicitly disabled, return false
    if (process.env.DB_SSL === 'false') {
        return false;
    }

    // For Aiven or other cloud databases requiring SSL
    if (process.env.DB_SSL === 'true' || process.env.DB_CA_CERT) {
        const sslConfig = {
            rejectUnauthorized: true
        };

        // If CA certificate is provided as a file path
        if (process.env.DB_CA_CERT_PATH) {
            try {
                const certPath = path.resolve(process.cwd(), process.env.DB_CA_CERT_PATH);
                if (fs.existsSync(certPath)) {
                    sslConfig.ca = fs.readFileSync(certPath);
                    console.log('✅ SSL certificate loaded from file');
                }
            } catch (error) {
                console.error('❌ Error loading SSL certificate from file:', error.message);
            }
        }

        // If CA certificate is provided as base64 encoded string (for Vercel)
        if (process.env.DB_CA_CERT && !sslConfig.ca) {
            try {
                // Decode base64 certificate
                sslConfig.ca = Buffer.from(process.env.DB_CA_CERT, 'base64').toString('utf-8');
                console.log('✅ SSL certificate loaded from environment variable');
            } catch (error) {
                console.error('❌ Error decoding SSL certificate:', error.message);
            }
        }

        return sslConfig;
    }

    // Default: no SSL for local development
    return false;
}

// Database configuration for serverless
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'shooting_range_db',
    port: parseInt(process.env.DB_PORT) || 3306,
    // Serverless optimizations
    acquireTimeout: 60000,
    timeout: 60000,
    connectTimeout: 60000,
    // SSL configuration
    ssl: getSSLConfig()
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
