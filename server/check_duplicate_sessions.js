const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDuplicateSessions() {
    const fs = require('fs');
    const path = require('path');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        ssl: process.env.DB_SSL === 'true' ? {
            ca: fs.readFileSync(path.resolve(__dirname, process.env.DB_CA_CERT_PATH))
        } : false
    });

    try {
        console.log('=== CHECKING FOR DUPLICATE SESSIONS ===\n');

        // Get all sessions
        const [sessions] = await connection.execute(`
            SELECT ss.id, ss.shooter_id, ss.session_name, ss.started_at, ss.session_status,
                   s.shooter_name,
                   sp.firing_mode, sp.target_distance, sp.session_type,
                   pa.accuracy_percentage
            FROM shooting_sessions ss
            JOIN shooters s ON ss.shooter_id = s.id
            LEFT JOIN shooting_parameters sp ON ss.id = sp.session_id
            LEFT JOIN performance_analytics pa ON ss.id = pa.session_id
            ORDER BY ss.started_at DESC
            LIMIT 10
        `);

        console.log(`Found ${sessions.length} recent sessions:\n`);
        sessions.forEach(session => {
            console.log(`Session ID: ${session.id}`);
            console.log(`  Shooter: ${session.shooter_name} (ID: ${session.shooter_id})`);
            console.log(`  Name: ${session.session_name}`);
            console.log(`  Started: ${session.started_at}`);
            console.log(`  Status: ${session.session_status}`);
            console.log(`  Firing Mode: ${session.firing_mode || 'N/A'}`);
            console.log(`  Distance: ${session.target_distance || 'N/A'}m`);
            console.log(`  Accuracy: ${session.accuracy_percentage || 'N/A'}%`);
            console.log('');
        });

        // Check for sessions with same shooter and similar timestamps
        const [duplicates] = await connection.execute(`
            SELECT shooter_id, COUNT(*) as count, 
                   MIN(started_at) as first_session,
                   MAX(started_at) as last_session,
                   TIMESTAMPDIFF(SECOND, MIN(started_at), MAX(started_at)) as time_diff_seconds
            FROM shooting_sessions
            GROUP BY shooter_id, DATE(started_at)
            HAVING COUNT(*) > 1
            ORDER BY last_session DESC
        `);

        if (duplicates.length > 0) {
            console.log('\n=== POTENTIAL DUPLICATE SESSIONS ===\n');
            for (const dup of duplicates) {
                console.log(`Shooter ID ${dup.shooter_id}: ${dup.count} sessions on same day`);
                console.log(`  Time difference: ${dup.time_diff_seconds} seconds`);
                console.log(`  First: ${dup.first_session}`);
                console.log(`  Last: ${dup.last_session}`);
                console.log('');
            }
        } else {
            console.log('\nNo duplicate sessions found.');
        }

        // Check for sessions with no parameters
        const [noParams] = await connection.execute(`
            SELECT ss.id, ss.session_name, ss.started_at
            FROM shooting_sessions ss
            LEFT JOIN shooting_parameters sp ON ss.id = sp.session_id
            WHERE sp.id IS NULL
            ORDER BY ss.started_at DESC
            LIMIT 5
        `);

        if (noParams.length > 0) {
            console.log('\n=== SESSIONS WITHOUT PARAMETERS ===\n');
            noParams.forEach(session => {
                console.log(`Session ID ${session.id}: ${session.session_name} (${session.started_at})`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

checkDuplicateSessions();

