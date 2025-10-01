const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function checkSessionShots() {
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
        console.log('=== CHECKING SESSION SHOTS ===\n');

        // Get the most recent session
        const [sessions] = await connection.execute(`
            SELECT id, session_name, started_at
            FROM shooting_sessions
            ORDER BY started_at DESC
            LIMIT 1
        `);

        if (sessions.length === 0) {
            console.log('No sessions found in database.');
            return;
        }

        const session = sessions[0];
        console.log(`Most recent session:`);
        console.log(`  ID: ${session.id}`);
        console.log(`  Name: ${session.session_name}`);
        console.log(`  Started: ${session.started_at}\n`);

        // Check for shots
        const [shots] = await connection.execute(`
            SELECT *
            FROM shot_coordinates
            WHERE session_id = ?
            ORDER BY shot_number ASC
        `, [session.id]);

        console.log(`Shots found: ${shots.length}\n`);

        if (shots.length > 0) {
            console.log('Shot details:');
            shots.forEach(shot => {
                console.log(`  Shot #${shot.shot_number}:`);
                console.log(`    Coordinates: (${shot.x_coordinate}, ${shot.y_coordinate})`);
                console.log(`    Score: ${shot.score_points} pts`);
                console.log(`    Timestamp: ${shot.timestamp_fired}`);
                console.log('');
            });
        } else {
            console.log('❌ No shots found for this session!');
            console.log('\nPossible reasons:');
            console.log('1. Shots were not saved during the session');
            console.log('2. Session was completed without firing any shots');
            console.log('3. There was an error saving shots to the database');
        }

        // Check parameters
        const [params] = await connection.execute(`
            SELECT *
            FROM shooting_parameters
            WHERE session_id = ?
        `, [session.id]);

        console.log(`\nParameters found: ${params.length > 0 ? 'Yes ✅' : 'No ❌'}`);
        if (params.length > 0) {
            console.log(`  Firing mode: ${params[0].firing_mode}`);
            console.log(`  Target distance: ${params[0].target_distance}m`);
            console.log(`  Session type: ${params[0].session_type}`);
        }

        // Check analytics
        const [analytics] = await connection.execute(`
            SELECT *
            FROM performance_analytics
            WHERE session_id = ?
        `, [session.id]);

        console.log(`\nAnalytics found: ${analytics.length > 0 ? 'Yes ✅' : 'No ❌'}`);
        if (analytics.length > 0) {
            console.log(`  Accuracy: ${analytics[0].accuracy_percentage}%`);
            console.log(`  Shots analyzed: ${analytics[0].shots_analyzed}`);
        }

        // Check final report
        const [reports] = await connection.execute(`
            SELECT *
            FROM final_reports
            WHERE session_id = ?
        `, [session.id]);

        console.log(`\nFinal report found: ${reports.length > 0 ? 'Yes ✅' : 'No ❌'}`);
        if (reports.length > 0) {
            console.log(`  Total score: ${reports[0].total_score}`);
            console.log(`  Performance rating: ${reports[0].performance_rating}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

checkSessionShots();

