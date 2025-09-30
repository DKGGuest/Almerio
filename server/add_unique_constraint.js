const mysql = require('mysql2/promise');
require('dotenv').config();

async function addUniqueConstraint() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'shooting_range_db',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('=== ADDING UNIQUE CONSTRAINT TO PREVENT DUPLICATE FINAL REPORTS ===\n');
        
        // Check if constraint already exists
        console.log('1. Checking existing constraints...');
        const [constraints] = await connection.execute(`
            SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'final_reports' 
            AND CONSTRAINT_TYPE = 'UNIQUE'
        `, [process.env.DB_NAME || 'shooting_range_db']);
        
        const hasUniqueConstraint = constraints.some(c => c.CONSTRAINT_NAME.includes('session_id'));
        
        if (hasUniqueConstraint) {
            console.log('✅ Unique constraint on session_id already exists');
        } else {
            console.log('2. Adding unique constraint on session_id...');
            await connection.execute(`
                ALTER TABLE final_reports 
                ADD CONSTRAINT uk_final_reports_session_id 
                UNIQUE (session_id)
            `);
            console.log('✅ Unique constraint added successfully');
        }
        
        console.log('\n3. Verification - checking constraint...');
        const [newConstraints] = await connection.execute(`
            SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'final_reports' 
            AND CONSTRAINT_TYPE = 'UNIQUE'
        `, [process.env.DB_NAME || 'shooting_range_db']);
        
        console.log('Unique constraints on final_reports:');
        newConstraints.forEach(c => console.log(`- ${c.CONSTRAINT_NAME}`));
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

addUniqueConstraint();
