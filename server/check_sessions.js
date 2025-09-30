const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSessions() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'shooting_range_db',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('=== CHECKING RECENT SESSIONS ===');
        
        // Check all sessions created today
        const [sessions] = await connection.execute(`
            SELECT ss.*, s.shooter_name, 
                   COUNT(sc.id) as shot_count,
                   ss.started_at
            FROM shooting_sessions ss
            JOIN shooters s ON ss.shooter_id = s.id
            LEFT JOIN shot_coordinates sc ON ss.id = sc.session_id
            WHERE DATE(ss.started_at) = CURDATE()
            GROUP BY ss.id
            ORDER BY ss.started_at DESC
        `);
        
        console.log('Sessions created today:', sessions.length);
        sessions.forEach(session => {
            console.log(`- Session ${session.id}: ${session.shooter_name} at ${session.started_at} (${session.shot_count} shots)`);
        });

        // Check for sessions with identical timestamps
        console.log('\n=== CHECKING FOR DUPLICATE TIMESTAMPS ===');
        const [duplicates] = await connection.execute(`
            SELECT started_at, COUNT(*) as count
            FROM shooting_sessions 
            WHERE DATE(started_at) = CURDATE()
            GROUP BY started_at
            HAVING COUNT(*) > 1
            ORDER BY started_at DESC
        `);
        
        if (duplicates.length > 0) {
            console.log('Found sessions with identical timestamps:');
            duplicates.forEach(dup => {
                console.log(`- ${dup.started_at}: ${dup.count} sessions`);
            });
        } else {
            console.log('No duplicate timestamps found.');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

checkSessions();
