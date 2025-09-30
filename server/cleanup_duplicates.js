const mysql = require('mysql2/promise');
require('dotenv').config();

async function cleanupDuplicates() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'shooting_range_db',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('=== CLEANING UP DUPLICATE RECORDS ===\n');

        // Find all duplicate final reports
        console.log('1. Finding duplicate final reports...');
        const [duplicates] = await connection.execute(`
            SELECT session_id, COUNT(*) as count
            FROM final_reports
            GROUP BY session_id
            HAVING COUNT(*) > 1
        `);

        // Find all duplicate shooting parameters
        console.log('2. Finding duplicate shooting parameters...');
        const [paramDuplicates] = await connection.execute(`
            SELECT session_id, COUNT(*) as count
            FROM shooting_parameters
            GROUP BY session_id
            HAVING COUNT(*) > 1
        `);
        
        console.log(`Found ${duplicates.length} sessions with duplicate final reports:`);
        duplicates.forEach(dup => {
            console.log(`- Session ${dup.session_id}: ${dup.count} reports`);
        });

        console.log(`Found ${paramDuplicates.length} sessions with duplicate shooting parameters:`);
        paramDuplicates.forEach(dup => {
            console.log(`- Session ${dup.session_id}: ${dup.count} parameters`);
        });
        
        // For each session with duplicates, keep only the most recent one
        for (const dup of duplicates) {
            console.log(`\n2. Cleaning up session ${dup.session_id}...`);
            
            // Get all final reports for this session, ordered by generated_at DESC
            const [reports] = await connection.execute(`
                SELECT id, generated_at
                FROM final_reports
                WHERE session_id = ?
                ORDER BY generated_at DESC
            `, [dup.session_id]);
            
            console.log(`Found ${reports.length} reports for session ${dup.session_id}`);
            
            // Keep the first one (most recent), delete the rest
            const toKeep = reports[0].id;
            const toDelete = reports.slice(1).map(r => r.id);
            
            console.log(`Keeping report ID ${toKeep}, deleting IDs: ${toDelete.join(', ')}`);
            
            if (toDelete.length > 0) {
                const placeholders = toDelete.map(() => '?').join(',');
                const [deleteResult] = await connection.execute(
                    `DELETE FROM final_reports WHERE id IN (${placeholders})`,
                    toDelete
                );
                console.log(`Deleted ${deleteResult.affectedRows} duplicate reports`);
            }
        }

        // Clean up duplicate shooting parameters
        for (const dup of paramDuplicates) {
            console.log(`\n3. Cleaning up shooting parameters for session ${dup.session_id}...`);

            // Get all shooting parameters for this session, ordered by created_at DESC
            const [params] = await connection.execute(`
                SELECT id, created_at
                FROM shooting_parameters
                WHERE session_id = ?
                ORDER BY created_at DESC
            `, [dup.session_id]);

            console.log(`Found ${params.length} parameters for session ${dup.session_id}`);

            // Keep the first one (most recent), delete the rest
            const toKeep = params[0].id;
            const toDelete = params.slice(1).map(p => p.id);

            console.log(`Keeping parameter ID ${toKeep}, deleting IDs: ${toDelete.join(', ')}`);

            if (toDelete.length > 0) {
                const placeholders = toDelete.map(() => '?').join(',');
                const [deleteResult] = await connection.execute(
                    `DELETE FROM shooting_parameters WHERE id IN (${placeholders})`,
                    toDelete
                );
                console.log(`Deleted ${deleteResult.affectedRows} duplicate parameters`);
            }
        }

        console.log('\n4. Verification - checking for remaining duplicates...');
        const [remainingDuplicates] = await connection.execute(`
            SELECT session_id, COUNT(*) as count
            FROM final_reports
            GROUP BY session_id
            HAVING COUNT(*) > 1
        `);

        const [remainingParamDuplicates] = await connection.execute(`
            SELECT session_id, COUNT(*) as count
            FROM shooting_parameters
            GROUP BY session_id
            HAVING COUNT(*) > 1
        `);

        if (remainingDuplicates.length === 0 && remainingParamDuplicates.length === 0) {
            console.log('✅ All duplicates cleaned up successfully!');
        } else {
            console.log(`❌ Still have ${remainingDuplicates.length} final report duplicates and ${remainingParamDuplicates.length} parameter duplicates`);
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

cleanupDuplicates();
