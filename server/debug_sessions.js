// const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugSessions() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'shooting_range_db',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('=== DEBUGGING SESSION DUPLICATION ===\n');

        // Check shooter 36
        console.log('1. Shooter details:');
        const [shooters] = await connection.execute('SELECT * FROM shooters WHERE id = 36');
        console.log(shooters);

        console.log('\n2. Sessions for shooter 36:');
        const [sessions] = await connection.execute('SELECT * FROM shooting_sessions WHERE shooter_id = 36');
        console.log(sessions);

        console.log('\n3. Parameters for sessions:');
        const [params] = await connection.execute(`
            SELECT sp.*, ss.id as session_id 
            FROM shooting_parameters sp 
            JOIN shooting_sessions ss ON sp.session_id = ss.id 
            WHERE ss.shooter_id = 36
        `);
        console.log(params);

        console.log('\n4. Analytics for sessions:');
        const [analytics] = await connection.execute(`
            SELECT pa.*, ss.id as session_id 
            FROM performance_analytics pa 
            JOIN shooting_sessions ss ON pa.session_id = ss.id 
            WHERE ss.shooter_id = 36
        `);
        console.log(analytics);

        console.log('\n5. Final reports for sessions:');
        const [reports] = await connection.execute(`
            SELECT fr.*, ss.id as session_id 
            FROM final_reports fr 
            JOIN shooting_sessions ss ON fr.session_id = ss.id 
            WHERE ss.shooter_id = 36
        `);
        console.log(reports);

        console.log('\n6. Full JOIN query (same as API):');
        const [fullQuery] = await connection.execute(`
            SELECT ss.*, sp.firing_mode, sp.target_distance, sp.template_name,
                   pa.accuracy_percentage, pa.mpi_distance, pa.shots_analyzed,
                   fr.total_score, fr.performance_rating
            FROM shooting_sessions ss
            LEFT JOIN shooting_parameters sp ON ss.id = sp.session_id
            LEFT JOIN performance_analytics pa ON ss.id = pa.session_id
            LEFT JOIN final_reports fr ON ss.id = fr.session_id
            WHERE ss.shooter_id = 36
            ORDER BY ss.started_at DESC
        `);
        console.log('Results count:', fullQuery.length);
        console.log(fullQuery);

        console.log('\n7. Removing duplicate final report...');
        // Remove the duplicate final report (keep the first one, remove the second)
        const [deleteResult] = await connection.execute('DELETE FROM final_reports WHERE id = 1025');
        console.log('Deleted rows:', deleteResult.affectedRows);

        console.log('\n8. Testing query after cleanup:');
        const [cleanQuery] = await connection.execute(`
            SELECT ss.*, sp.firing_mode, sp.target_distance, sp.template_name,
                   pa.accuracy_percentage, pa.mpi_distance, pa.shots_analyzed,
                   fr.total_score, fr.performance_rating
            FROM shooting_sessions ss
            LEFT JOIN shooting_parameters sp ON ss.id = sp.session_id
            LEFT JOIN performance_analytics pa ON ss.id = pa.session_id
            LEFT JOIN final_reports fr ON ss.id = fr.session_id
            WHERE ss.shooter_id = 36
            ORDER BY ss.started_at DESC
        `);
        console.log('Results count after cleanup:', cleanQuery.length);
        console.log(cleanQuery);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

debugSessions();
