const mysql = require('mysql2/promise');
require('dotenv').config();

async function testSessionFixes() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'shooting_range_db',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('=== TESTING SESSION FIXES ===\n');
        
        // Test 1: Check if sessions have complete parameter data
        console.log('1️⃣ Testing complete parameter retrieval...');
        const [sessionsWithParams] = await connection.execute(`
            SELECT ss.id, ss.session_name, ss.started_at, ss.session_status,
                   sp.firing_mode, sp.target_distance, sp.session_type, sp.weapon_type, 
                   sp.target_type, sp.shooting_position, sp.shot_type, sp.number_of_rounds, sp.esa,
                   sp.time_limit, sp.rounds, sp.zeroing_distance, sp.template_name
            FROM shooting_sessions ss
            LEFT JOIN shooting_parameters sp ON ss.id = sp.session_id
            WHERE ss.shooter_id = (SELECT id FROM shooters LIMIT 1)
            ORDER BY ss.started_at DESC
            LIMIT 5
        `);
        
        console.log(`Found ${sessionsWithParams.length} recent sessions with parameters:`);
        sessionsWithParams.forEach(session => {
            console.log(`- Session ${session.id}: ${session.session_name}`);
            console.log(`  Status: ${session.session_status}, Type: ${session.session_type || 'N/A'}`);
            console.log(`  Weapon: ${session.weapon_type || 'N/A'}, Target: ${session.target_type || 'N/A'}`);
            console.log(`  Position: ${session.shooting_position || 'N/A'}, Distance: ${session.target_distance || 'N/A'}m`);
            console.log(`  Rounds: ${session.number_of_rounds || 'N/A'}, ESA: ${session.esa || 'N/A'}`);
            console.log('');
        });
        
        // Test 2: Check shot numbering for sessions
        console.log('2️⃣ Testing shot numbering integrity...');
        const [shotData] = await connection.execute(`
            SELECT ss.id as session_id, ss.session_name, 
                   COUNT(sc.id) as total_shots,
                   MIN(sc.shot_number) as min_shot_num,
                   MAX(sc.shot_number) as max_shot_num,
                   COUNT(DISTINCT sc.shot_number) as unique_shot_numbers
            FROM shooting_sessions ss
            LEFT JOIN shot_coordinates sc ON ss.id = sc.session_id
            WHERE ss.shooter_id = (SELECT id FROM shooters LIMIT 1)
            GROUP BY ss.id, ss.session_name
            HAVING total_shots > 0
            ORDER BY ss.started_at DESC
            LIMIT 5
        `);
        
        console.log(`Shot numbering analysis for recent sessions:`);
        shotData.forEach(session => {
            const hasDuplicates = session.total_shots !== session.unique_shot_numbers;
            console.log(`- Session ${session.session_id}: ${session.session_name}`);
            console.log(`  Total shots: ${session.total_shots}, Range: ${session.min_shot_num}-${session.max_shot_num}`);
            console.log(`  Unique numbers: ${session.unique_shot_numbers} ${hasDuplicates ? '⚠️ HAS DUPLICATES!' : '✅ OK'}`);
            console.log('');
        });
        
        // Test 3: Check for duplicate shot numbers across sessions
        console.log('3️⃣ Testing for cross-session shot number conflicts...');
        const [duplicateShots] = await connection.execute(`
            SELECT sc1.session_id as session1, sc2.session_id as session2, 
                   sc1.shot_number, COUNT(*) as conflict_count
            FROM shot_coordinates sc1
            JOIN shot_coordinates sc2 ON sc1.shot_number = sc2.shot_number 
                                     AND sc1.session_id != sc2.session_id
                                     AND sc1.id != sc2.id
            WHERE sc1.session_id IN (
                SELECT id FROM shooting_sessions 
                WHERE shooter_id = (SELECT id FROM shooters LIMIT 1)
                ORDER BY started_at DESC LIMIT 10
            )
            GROUP BY sc1.session_id, sc2.session_id, sc1.shot_number
            ORDER BY conflict_count DESC
            LIMIT 10
        `);
        
        if (duplicateShots.length > 0) {
            console.log(`⚠️ Found ${duplicateShots.length} cross-session shot number conflicts:`);
            duplicateShots.forEach(conflict => {
                console.log(`- Sessions ${conflict.session1} & ${conflict.session2} both have shot #${conflict.shot_number}`);
            });
        } else {
            console.log('✅ No cross-session shot number conflicts found');
        }
        
        console.log('\n=== TEST COMPLETE ===');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await connection.end();
    }
}

// Run the test
testSessionFixes().catch(console.error);
