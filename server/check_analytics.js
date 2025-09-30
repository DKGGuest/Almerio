const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAnalytics() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'shooting_range_db',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('=== CHECKING ANALYTICS FOR SESSIONS 38, 39, 40 ===\n');
        
        const [analytics] = await connection.execute(`
            SELECT session_id, group_size, max_distance, accuracy_percentage, mpi_distance
            FROM performance_analytics 
            WHERE session_id IN (38, 39, 40)
            ORDER BY session_id
        `);
        
        console.log('Analytics data:');
        analytics.forEach(a => {
            console.log(`Session ${a.session_id}: group_size=${a.group_size}, max_distance=${a.max_distance}`);
        });
        
        // Test the actual query used in the API
        console.log('\n=== TESTING API QUERY ===');
        const [sessions] = await connection.execute(`
            SELECT ss.*, 
                   sp.firing_mode, sp.target_distance, sp.template_name,
                   pa.accuracy_percentage, pa.mpi_distance, pa.shots_analyzed, pa.group_size, pa.max_distance,
                   fr_ranked.total_score, fr_ranked.performance_rating
            FROM shooting_sessions ss
            LEFT JOIN (
                SELECT session_id, firing_mode, target_distance, template_name,
                       ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at DESC) as rn
                FROM shooting_parameters
            ) sp ON ss.id = sp.session_id AND sp.rn = 1
            LEFT JOIN performance_analytics pa ON ss.id = pa.session_id
            LEFT JOIN (
                SELECT session_id, total_score, performance_rating,
                       ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY generated_at DESC) as rn
                FROM final_reports
            ) fr_ranked ON ss.id = fr_ranked.session_id AND fr_ranked.rn = 1
            WHERE ss.shooter_id = 36
            ORDER BY ss.started_at DESC
        `);
        
        console.log('\nAPI Query Results:');
        sessions.forEach(s => {
            console.log(`Session ${s.id}: group_size=${s.group_size}, max_distance=${s.max_distance}`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

checkAnalytics();
