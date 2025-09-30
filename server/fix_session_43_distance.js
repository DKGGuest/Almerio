const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixSession43Distance() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'shooting_range_db',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('=== FIXING SESSION 43 TARGET DISTANCE ===\n');
        
        // Check current state
        const [currentParams] = await connection.execute(`
            SELECT target_distance, template_id FROM shooting_parameters WHERE session_id = 43
        `);
        
        console.log('Current state:');
        console.log(`Target Distance: ${currentParams[0].target_distance}m`);
        console.log(`Template ID: ${currentParams[0].template_id}`);
        
        // Extract correct distance from template
        const templateId = currentParams[0].template_id;
        const distanceMatch = templateId.match(/(\d+)m/);
        
        if (distanceMatch) {
            const correctDistance = parseInt(distanceMatch[1]);
            console.log(`\nExtracted correct distance: ${correctDistance}m`);
            
            // Update the database
            await connection.execute(`
                UPDATE shooting_parameters 
                SET target_distance = ?, zeroing_distance = ?
                WHERE session_id = 43
            `, [correctDistance, correctDistance]);
            
            console.log(`✅ Updated Session 43 target_distance to ${correctDistance}m`);
            
            // Verify the update
            const [updatedParams] = await connection.execute(`
                SELECT target_distance, zeroing_distance, template_id FROM shooting_parameters WHERE session_id = 43
            `);
            
            console.log('\nVerification:');
            console.log(`New Target Distance: ${updatedParams[0].target_distance}m`);
            console.log(`New Zeroing Distance: ${updatedParams[0].zeroing_distance}m`);
            console.log(`Template ID: ${updatedParams[0].template_id}`);
            
        } else {
            console.log('❌ Could not extract distance from template ID');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

fixSession43Distance();
