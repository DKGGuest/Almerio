const mysql = require('mysql2/promise');
require('dotenv').config();

async function investigateTargetDistance() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'shooting_range_db',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('=== INVESTIGATING TARGET DISTANCE ISSUE ===\n');
        
        // Check Session 43 specifically
        console.log('1. Session 43 Details:');
        const [session] = await connection.execute(`
            SELECT * FROM shooting_sessions WHERE id = 43
        `);
        console.log('Session record:', session[0]);
        
        console.log('\n2. Session 43 Parameters:');
        const [params] = await connection.execute(`
            SELECT * FROM shooting_parameters WHERE session_id = 43
        `);
        console.log('Parameters record:', params[0]);
        
        console.log('\n3. Template Information:');
        if (params[0]?.template_id) {
            console.log(`Template ID: ${params[0].template_id}`);
            // The template_id is "air-pistol-10m" which suggests 10m distance
            console.log('Template suggests 10m distance, but target_distance is 25m');
        }
        
        console.log('\n4. Recent Sessions for Shooter 36:');
        const [recentSessions] = await connection.execute(`
            SELECT ss.id, ss.session_name, ss.started_at,
                   sp.target_distance, sp.template_id, sp.firing_mode, sp.session_type
            FROM shooting_sessions ss
            LEFT JOIN shooting_parameters sp ON ss.id = sp.session_id
            WHERE ss.shooter_id = 36
            ORDER BY ss.started_at DESC
            LIMIT 5
        `);
        
        recentSessions.forEach((session, index) => {
            console.log(`${index + 1}. Session ${session.id}: ${session.target_distance}m (Template: ${session.template_id || 'None'})`);
        });
        
        console.log('\n5. Checking Parameter Creation Timeline:');
        const [paramHistory] = await connection.execute(`
            SELECT session_id, target_distance, template_id, created_at
            FROM shooting_parameters 
            WHERE session_id = 43
            ORDER BY created_at ASC
        `);
        
        paramHistory.forEach((param, index) => {
            console.log(`${index + 1}. Created: ${param.created_at}, Distance: ${param.target_distance}m, Template: ${param.template_id}`);
        });
        
        console.log('\n=== ANALYSIS ===');
        console.log('Issue: Template ID "air-pistol-10m" suggests 10m distance');
        console.log('But target_distance field shows 25m');
        console.log('This indicates the parameter saving logic may have a bug');
        console.log('where template selection doesn\'t properly update target_distance');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

investigateTargetDistance();
