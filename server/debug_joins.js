const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugJoins() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'shooting_range_db',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('=== DEBUGGING JOIN DUPLICATES FOR SESSION 40 ===\n');

        // Check base session
        console.log('1. Base session:');
        const [sessions] = await connection.execute('SELECT * FROM shooting_sessions WHERE id = 40');
        console.log(sessions);
        
        // Check shooting_parameters
        console.log('\n2. Shooting parameters:');
        const [params] = await connection.execute('SELECT * FROM shooting_parameters WHERE session_id = 40');
        console.log(params);

        // Check performance_analytics
        console.log('\n3. Performance analytics:');
        const [analytics] = await connection.execute('SELECT * FROM performance_analytics WHERE session_id = 40');
        console.log(analytics);

        // Check final_reports
        console.log('\n4. Final reports:');
        const [reports] = await connection.execute('SELECT * FROM final_reports WHERE session_id = 40');
        console.log(reports);
        
        // Run the actual problematic query
        console.log('\n5. Full JOIN query result:');
        const [fullQuery] = await connection.execute(`
            SELECT ss.*, sp.firing_mode, sp.target_distance, sp.template_name,
                   pa.accuracy_percentage, pa.mpi_distance, pa.shots_analyzed,
                   fr.total_score, fr.performance_rating
            FROM shooting_sessions ss
            LEFT JOIN shooting_parameters sp ON ss.id = sp.session_id
            LEFT JOIN performance_analytics pa ON ss.id = pa.session_id
            LEFT JOIN final_reports fr ON ss.id = fr.session_id
            WHERE ss.id = 40
        `);
        console.log('Results count:', fullQuery.length);
        console.log(fullQuery);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

debugJoins();
