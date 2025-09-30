const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSessionData() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'shooting_range_db',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('=== CHECKING SESSION DATA FOR SHOOTER 36 ===\n');
        
        // Get all sessions for shooter 36 (ordered by most recent first)
        const [sessions] = await connection.execute(`
            SELECT ss.id, ss.session_name, ss.started_at,
                   pa.accuracy_percentage, pa.mpi_distance, pa.shots_analyzed, pa.group_size, pa.max_distance
            FROM shooting_sessions ss
            LEFT JOIN performance_analytics pa ON ss.id = pa.session_id
            WHERE ss.shooter_id = 36
            ORDER BY ss.started_at DESC
        `);
        
        console.log('Sessions data:');
        sessions.forEach((session, index) => {
            console.log(`\n${index + 1}. Session ${session.id} (${session.session_name})`);
            console.log(`   Started: ${session.started_at}`);
            console.log(`   Accuracy: ${session.accuracy_percentage}%`);
            console.log(`   MPI Distance: ${session.mpi_distance}mm`);
            console.log(`   Shots Analyzed: ${session.shots_analyzed}`);
            console.log(`   Group Size: ${session.group_size}mm`);
            console.log(`   Max Distance: ${session.max_distance}mm`);
        });
        
        // Check if Session #1 (most recent) has any shot data
        if (sessions.length > 0) {
            const firstSession = sessions[0];
            console.log(`\n=== DETAILED CHECK FOR SESSION ${firstSession.id} ===`);
            
            const [shots] = await connection.execute(`
                SELECT COUNT(*) as shot_count
                FROM shot_data 
                WHERE session_id = ?
            `, [firstSession.id]);
            
            console.log(`Actual shots in database: ${shots[0].shot_count}`);
            
            const [analytics] = await connection.execute(`
                SELECT * FROM performance_analytics WHERE session_id = ?
            `, [firstSession.id]);
            
            if (analytics.length > 0) {
                console.log('Analytics record exists:', analytics[0]);
            } else {
                console.log('No analytics record found');
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

checkSessionData();
