const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables
try {
    require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
    console.log('📋 Environment loaded:', {
        DB_HOST: process.env.DB_HOST,
        DB_NAME: process.env.DB_NAME,
        DB_SSL: process.env.DB_SSL
    });
} catch (e) {
    console.log('⚠️ Could not load dotenv, using defaults');
}

async function addCustomDistanceFields() {
    let connection;
    
    try {
        // Create database connection
        const connectionConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'defaultdb'
        };

        // Add SSL configuration if needed
        if (process.env.DB_SSL === 'true') {
            connectionConfig.ssl = {
                rejectUnauthorized: true,
                ca: process.env.DB_CA_CERT_PATH ? fs.readFileSync(path.join(__dirname, '..', process.env.DB_CA_CERT_PATH)) : undefined
            };
        }

        connection = await mysql.createConnection(connectionConfig);

        console.log('🔗 Connected to database for migration');

        // Check if columns already exist
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'shooting_parameters' 
            AND COLUMN_NAME IN ('use_custom_distance', 'custom_distance')
        `, [process.env.DB_NAME || 'defaultdb']);

        if (columns.length > 0) {
            console.log('✅ Custom distance columns already exist, skipping migration');
            return;
        }

        // Add the new columns
        console.log('📝 Adding use_custom_distance column...');
        await connection.execute(`
            ALTER TABLE shooting_parameters 
            ADD COLUMN use_custom_distance BOOLEAN DEFAULT FALSE 
            COMMENT 'Whether custom distance is used instead of template'
        `);

        console.log('📝 Adding custom_distance column...');
        await connection.execute(`
            ALTER TABLE shooting_parameters 
            ADD COLUMN custom_distance DECIMAL(10,2) NULL 
            COMMENT 'Custom distance value in meters'
        `);

        console.log('✅ Successfully added custom distance fields to shooting_parameters table');

        // Verify the columns were added
        const [newColumns] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'shooting_parameters' 
            AND COLUMN_NAME IN ('use_custom_distance', 'custom_distance')
            ORDER BY COLUMN_NAME
        `, [process.env.DB_NAME || 'defaultdb']);

        console.log('📋 New columns added:');
        newColumns.forEach(col => {
            console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}) DEFAULT ${col.COLUMN_DEFAULT || 'NULL'}`);
            if (col.COLUMN_COMMENT) {
                console.log(`    Comment: ${col.COLUMN_COMMENT}`);
            }
        });

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run migration if called directly
if (require.main === module) {
    addCustomDistanceFields()
        .then(() => {
            console.log('🎉 Migration completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { addCustomDistanceFields };
