const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function fixDuplicateDisplay() {
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
        console.log('=== FIXING DUPLICATE SESSION DISPLAY ===\n');

        // Check for duplicate parameters
        console.log('1. Checking for duplicate shooting_parameters...');
        const [paramDuplicates] = await connection.execute(`
            SELECT session_id, COUNT(*) as count
            FROM shooting_parameters
            GROUP BY session_id
            HAVING COUNT(*) > 1
        `);

        if (paramDuplicates.length > 0) {
            console.log(`Found ${paramDuplicates.length} sessions with duplicate parameters:`);
            for (const dup of paramDuplicates) {
                console.log(`  Session ${dup.session_id}: ${dup.count} parameter records`);
                
                // Get all parameters for this session
                const [params] = await connection.execute(`
                    SELECT id, created_at
                    FROM shooting_parameters
                    WHERE session_id = ?
                    ORDER BY created_at DESC
                `, [dup.session_id]);
                
                // Keep the most recent one, delete the rest
                const toKeep = params[0].id;
                const toDelete = params.slice(1).map(p => p.id);
                
                if (toDelete.length > 0) {
                    console.log(`  Keeping parameter ID ${toKeep}, deleting ${toDelete.length} duplicates`);
                    await connection.execute(
                        `DELETE FROM shooting_parameters WHERE id IN (${toDelete.map(() => '?').join(',')})`,
                        toDelete
                    );
                }
            }
            console.log('✅ Duplicate parameters cleaned up\n');
        } else {
            console.log('✅ No duplicate parameters found\n');
        }

        // Check for duplicate final reports
        console.log('2. Checking for duplicate final_reports...');
        const [reportDuplicates] = await connection.execute(`
            SELECT session_id, COUNT(*) as count
            FROM final_reports
            GROUP BY session_id
            HAVING COUNT(*) > 1
        `);

        if (reportDuplicates.length > 0) {
            console.log(`Found ${reportDuplicates.length} sessions with duplicate final reports:`);
            for (const dup of reportDuplicates) {
                console.log(`  Session ${dup.session_id}: ${dup.count} report records`);
                
                // Get all reports for this session
                const [reports] = await connection.execute(`
                    SELECT id, generated_at
                    FROM final_reports
                    WHERE session_id = ?
                    ORDER BY generated_at DESC
                `, [dup.session_id]);
                
                // Keep the most recent one, delete the rest
                const toKeep = reports[0].id;
                const toDelete = reports.slice(1).map(r => r.id);
                
                if (toDelete.length > 0) {
                    console.log(`  Keeping report ID ${toKeep}, deleting ${toDelete.length} duplicates`);
                    await connection.execute(
                        `DELETE FROM final_reports WHERE id IN (${toDelete.map(() => '?').join(',')})`,
                        toDelete
                    );
                }
            }
            console.log('✅ Duplicate final reports cleaned up\n');
        } else {
            console.log('✅ No duplicate final reports found\n');
        }

        // Check for duplicate performance analytics
        console.log('3. Checking for duplicate performance_analytics...');
        const [analyticsDuplicates] = await connection.execute(`
            SELECT session_id, COUNT(*) as count
            FROM performance_analytics
            GROUP BY session_id
            HAVING COUNT(*) > 1
        `);

        if (analyticsDuplicates.length > 0) {
            console.log(`Found ${analyticsDuplicates.length} sessions with duplicate analytics:`);
            for (const dup of analyticsDuplicates) {
                console.log(`  Session ${dup.session_id}: ${dup.count} analytics records`);

                // Get all analytics for this session (performance_analytics doesn't have created_at, use id)
                const [analytics] = await connection.execute(`
                    SELECT id
                    FROM performance_analytics
                    WHERE session_id = ?
                    ORDER BY id DESC
                `, [dup.session_id]);

                // Keep the most recent one (highest ID), delete the rest
                const toKeep = analytics[0].id;
                const toDelete = analytics.slice(1).map(a => a.id);

                if (toDelete.length > 0) {
                    console.log(`  Keeping analytics ID ${toKeep}, deleting ${toDelete.length} duplicates`);
                    await connection.execute(
                        `DELETE FROM performance_analytics WHERE id IN (${toDelete.map(() => '?').join(',')})`,
                        toDelete
                    );
                }
            }
            console.log('✅ Duplicate analytics cleaned up\n');
        } else {
            console.log('✅ No duplicate analytics found\n');
        }

        // Now test the query that the frontend uses
        console.log('4. Testing shooter sessions query...');
        const [sessions] = await connection.execute(`
            SELECT ss.*,
                   sp.firing_mode, sp.target_distance, sp.template_name, sp.session_type,
                   pa.accuracy_percentage
            FROM shooting_sessions ss
            LEFT JOIN shooting_parameters sp ON ss.id = sp.session_id
            LEFT JOIN performance_analytics pa ON ss.id = pa.session_id
            ORDER BY ss.started_at DESC
            LIMIT 5
        `);

        console.log(`Found ${sessions.length} sessions (should match actual session count):`);
        sessions.forEach(session => {
            console.log(`  Session ${session.id}: ${session.session_name}`);
        });

        console.log('\n✅ All done! Refresh your browser to see the fix.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

fixDuplicateDisplay();

