const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSessionParameters() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'shooting_range_db',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('=== CHECKING SESSION PARAMETERS ===\n');
        
        // Check all sessions for shooter 36
        const [sessions] = await connection.execute(`
            SELECT ss.id, ss.session_name, ss.started_at,
                   sp.firing_mode, sp.target_distance, sp.session_type, sp.time_limit
            FROM shooting_sessions ss
            LEFT JOIN shooting_parameters sp ON ss.id = sp.session_id
            WHERE ss.shooter_id = 36
            ORDER BY ss.started_at DESC
        `);
        
        console.log('Sessions with parameters:');
        sessions.forEach((session, index) => {
            console.log(`\n${index + 1}. Session ${session.id} (${session.session_name})`);
            console.log(`   Started: ${session.started_at}`);
            console.log(`   Firing Mode: ${session.firing_mode || 'NULL'}`);
            console.log(`   Target Distance: ${session.target_distance || 'NULL'}`);
            console.log(`   Session Type: ${session.session_type || 'NULL'}`);
            console.log(`   Time Limit: ${session.time_limit || 'NULL'}`);
        });
        
        // Check which sessions have no parameters
        const [sessionsWithoutParams] = await connection.execute(`
            SELECT ss.id, ss.session_name
            FROM shooting_sessions ss
            LEFT JOIN shooting_parameters sp ON ss.id = sp.session_id
            WHERE ss.shooter_id = 36 AND sp.session_id IS NULL
            ORDER BY ss.started_at DESC
        `);
        
        console.log(`\n=== SESSIONS WITHOUT PARAMETERS (${sessionsWithoutParams.length}) ===`);
        sessionsWithoutParams.forEach(session => {
            console.log(`- Session ${session.id}: ${session.session_name}`);
        });
        
        // Check what's in shooting_parameters table
        const [allParams] = await connection.execute(`
            SELECT * FROM shooting_parameters 
            WHERE session_id IN (SELECT id FROM shooting_sessions WHERE shooter_id = 36)
            ORDER BY created_at DESC
        `);
        
        console.log(`\n=== ALL PARAMETERS IN DB (${allParams.length}) ===`);
        allParams.forEach(param => {
            console.log(`Session ${param.session_id}: ${param.firing_mode} | ${param.session_type} | ${param.target_distance}m`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

checkSessionParameters();
