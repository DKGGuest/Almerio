#!/usr/bin/env node

/**
 * Test Aiven Database Connection
 * 
 * This script tests the connection to your Aiven MySQL database
 * and displays detailed connection information.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function testAivenConnection() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║         Aiven MySQL Connection Test                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Display configuration (hide password)
    console.log('📋 Configuration:');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Port: ${process.env.DB_PORT}`);
    console.log(`   User: ${process.env.DB_USER}`);
    console.log(`   Password: ${'*'.repeat(process.env.DB_PASSWORD?.length || 0)}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   SSL: ${process.env.DB_SSL}`);
    
    if (process.env.DB_CA_CERT_PATH) {
        console.log(`   CA Cert Path: ${process.env.DB_CA_CERT_PATH}`);
        const certPath = path.resolve(process.cwd(), process.env.DB_CA_CERT_PATH);
        const certExists = fs.existsSync(certPath);
        console.log(`   CA Cert Exists: ${certExists ? '✅ Yes' : '❌ No'}`);
        if (!certExists) {
            console.log(`   ⚠️  Certificate not found at: ${certPath}`);
        }
    } else if (process.env.DB_CA_CERT) {
        console.log(`   CA Cert: Provided as base64 (${process.env.DB_CA_CERT.length} chars)`);
    } else {
        console.log(`   ⚠️  No CA certificate configured`);
    }
    console.log('');

    // Prepare SSL configuration
    let sslConfig = false;
    if (process.env.DB_SSL === 'true') {
        sslConfig = { rejectUnauthorized: true };
        
        if (process.env.DB_CA_CERT_PATH) {
            const certPath = path.resolve(process.cwd(), process.env.DB_CA_CERT_PATH);
            if (fs.existsSync(certPath)) {
                sslConfig.ca = fs.readFileSync(certPath);
                console.log('✅ SSL certificate loaded from file\n');
            } else {
                console.log('❌ SSL certificate file not found\n');
                console.log('Please ensure your ca.pem file is at:', certPath);
                console.log('\nTo fix this:');
                console.log('1. Download ca.pem from Aiven dashboard');
                console.log('2. Save it to:', certPath);
                console.log('3. Run this test again\n');
                process.exit(1);
            }
        } else if (process.env.DB_CA_CERT) {
            sslConfig.ca = Buffer.from(process.env.DB_CA_CERT, 'base64').toString('utf-8');
            console.log('✅ SSL certificate loaded from environment variable\n');
        }
    }

    // Test connection
    console.log('🔌 Testing connection...\n');
    
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: sslConfig,
            connectTimeout: 10000
        });

        console.log('✅ Connection established successfully!\n');

        // Test ping
        console.log('🏓 Testing ping...');
        await connection.ping();
        console.log('✅ Ping successful!\n');

        // Get server version
        console.log('📊 Server Information:');
        const [rows] = await connection.query('SELECT VERSION() as version, DATABASE() as current_db, USER() as current_user');
        console.log(`   MySQL Version: ${rows[0].version}`);
        console.log(`   Current Database: ${rows[0].current_db}`);
        console.log(`   Current User: ${rows[0].current_user}\n`);

        // List tables
        console.log('📋 Existing Tables:');
        const [tables] = await connection.query('SHOW TABLES');
        if (tables.length > 0) {
            tables.forEach(table => {
                const tableName = Object.values(table)[0];
                console.log(`   - ${tableName}`);
            });
        } else {
            console.log('   (No tables found - database is empty)');
            console.log('   Run "node test_database.js" to initialize the schema');
        }
        console.log('');

        // Test write permission
        console.log('✍️  Testing write permissions...');
        try {
            await connection.query('CREATE TABLE IF NOT EXISTS _connection_test (id INT PRIMARY KEY)');
            await connection.query('DROP TABLE IF EXISTS _connection_test');
            console.log('✅ Write permissions OK!\n');
        } catch (error) {
            console.log('❌ Write permission test failed:', error.message);
            console.log('   You may not have write permissions on this database\n');
        }

        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║  🎉 SUCCESS! Your Aiven database is ready to use!        ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        console.log('Next steps:');
        if (tables.length === 0) {
            console.log('1. Initialize the database schema:');
            console.log('   node test_database.js\n');
            console.log('2. Start the development server:');
            console.log('   npm start\n');
        } else {
            console.log('1. Start the development server:');
            console.log('   npm start\n');
        }

    } catch (error) {
        console.log('❌ Connection failed!\n');
        console.log('Error:', error.message);
        console.log('');
        
        console.log('🔍 Troubleshooting:');
        
        if (error.code === 'ENOTFOUND') {
            console.log('   - Check that the DB_HOST is correct');
            console.log('   - Verify your internet connection');
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
            console.log('   - Check that the DB_PORT is correct');
            console.log('   - Verify your IP is allowed in Aiven firewall settings');
            console.log('   - Check your internet connection');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('   - Verify DB_USER and DB_PASSWORD are correct');
            console.log('   - Check that the user has access to the database');
        } else if (error.message.includes('SSL')) {
            console.log('   - Ensure DB_SSL=true in your .env file');
            console.log('   - Verify the CA certificate is valid');
            console.log('   - Try downloading the certificate again from Aiven');
        } else {
            console.log('   - Check all database credentials in .env file');
            console.log('   - Verify the database exists in Aiven');
            console.log('   - See server/AIVEN_SETUP_GUIDE.md for more help');
        }
        console.log('');
        
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the test
testAivenConnection().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
});

