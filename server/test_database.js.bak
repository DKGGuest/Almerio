// =====================================================
// DATABASE TEST SCRIPT
// Test all database operations for shooting range dashboard
// =====================================================

const { db, testConnection, initializeDatabase } = require('./database_config');

async function runDatabaseTests() {
    console.log('🧪 Starting Database Tests...\n');

    try {
        // Test 1: Database Connection
        console.log('1️⃣ Testing database connection...');
        const connected = await testConnection();
        if (!connected) {
            throw new Error('Database connection failed');
        }
        console.log('✅ Database connection successful\n');

        // Test 2: Initialize Schema
        console.log('2️⃣ Initializing database schema...');
        await initializeDatabase();
        console.log('✅ Database schema initialized\n');

        // Test 3: Create Shooter
        console.log('3️⃣ Testing shooter creation...');
        const shooterId = await db.insert('shooters', {
            shooter_name: 'Test Shooter',
            skill_level: 'beginner'
        });
        console.log(`✅ Shooter created with ID: ${shooterId}\n`);

        // Test 4: Create Session
        console.log('4️⃣ Testing session creation...');
        const sessionId = await db.insert('shooting_sessions', {
            shooter_id: shooterId,
            lane_id: 'lane1',
            session_name: 'Test Session'
        });
        console.log(`✅ Session created with ID: ${sessionId}\n`);

        // Test 5: Save Parameters
        console.log('5️⃣ Testing parameter saving...');
        await db.insert('shooting_parameters', {
            session_id: sessionId,
            firing_mode: 'snap',
            target_distance: 25,
            zeroing_distance: 25,
            template_id: 'pistol-25m-precision',
            template_name: '25m Pistol Precision',
            template_diameter: 50.0,
            wind_direction: 0,
            wind_speed: 0.0
        });
        console.log('✅ Parameters saved successfully\n');

        // Test 6: Add Bullseye
        console.log('6️⃣ Testing bullseye position...');
        await db.insert('bullseye_positions', {
            session_id: sessionId,
            x_coordinate: 200.0,
            y_coordinate: 200.0
        });
        console.log('✅ Bullseye position saved\n');

        // Test 7: Add Shot Coordinates
        console.log('7️⃣ Testing shot coordinates...');
        const testShots = [
            { x: 195.5, y: 203.2, score: 10 },
            { x: 198.1, y: 199.8, score: 10 },
            { x: 202.3, y: 201.5, score: 5 },
            { x: 196.7, y: 204.1, score: 10 },
            { x: 199.9, y: 198.3, score: 10 }
        ];

        for (let i = 0; i < testShots.length; i++) {
            const shot = testShots[i];
            await db.insert('shot_coordinates', {
                session_id: sessionId,
                shot_number: i + 1,
                x_coordinate: shot.x,
                y_coordinate: shot.y,
                timestamp_fired: Date.now() + i * 1000,
                distance_from_center: Math.sqrt(
                    Math.pow(shot.x - 200, 2) + Math.pow(shot.y - 200, 2)
                ) * (133 / 400),
                score_points: shot.score
            });
        }
        console.log(`✅ Added ${testShots.length} shot coordinates\n`);

        // Test 8: Save Analytics
        console.log('8️⃣ Testing performance analytics...');
        await db.insert('performance_analytics', {
            session_id: sessionId,
            mpi_distance: 15.2,
            mpi_x_coordinate: 198.5,
            mpi_y_coordinate: 201.4,
            mpi_coords_x: -1,
            mpi_coords_y: 1,
            accuracy_percentage: 87.5,
            avg_distance: 12.8,
            max_distance: 18.9,
            group_size: 25.8,
            reference_point_type: 'custom bullseye',
            reference_x_coordinate: 200.0,
            reference_y_coordinate: 200.0,
            shots_analyzed: 5,
            bullets_count: 6,
            show_results: true,
            shooting_phase: 'DONE'
        });
        console.log('✅ Performance analytics saved\n');

        // Test 9: Generate Final Report
        console.log('9️⃣ Testing final report generation...');
        await db.insert('final_reports', {
            session_id: sessionId,
            shooter_id: shooterId,
            shooter_name: 'Test Shooter',
            total_score: 45,
            accuracy_percentage: 87.5,
            mpi_distance: 15.2,
            group_size: 25.8,
            max_distance: 18.9,
            avg_distance: 12.8,
            true_mpi_x: -1,
            true_mpi_y: 1,
            reference_point: 'custom bullseye',
            shots_analyzed: 5,
            shots_fired: 6,
            performance_rating: 'SKILLED SHOOTER',
            performance_emoji: '🥇',
            template_name: '25m Pistol Precision',
            template_diameter: 50.0,
            firing_mode: 'snap',
            target_distance: 25,
            zeroing_distance: 25,
            lane_id: 'lane1'
        });
        console.log('✅ Final report generated\n');

        // Test 10: Query Data
        console.log('🔟 Testing data retrieval...');
        
        const sessionData = await db.findOne(`
            SELECT s.*, sh.shooter_name, sp.firing_mode, pa.accuracy_percentage
            FROM shooting_sessions s
            JOIN shooters sh ON s.shooter_id = sh.id
            LEFT JOIN shooting_parameters sp ON s.id = sp.session_id
            LEFT JOIN performance_analytics pa ON s.id = pa.session_id
            WHERE s.id = ?
        `, [sessionId]);

        console.log('📊 Session Data:', {
            session_id: sessionData.id,
            shooter: sessionData.shooter_name,
            lane: sessionData.lane_id,
            firing_mode: sessionData.firing_mode,
            accuracy: sessionData.accuracy_percentage + '%'
        });

        const shotCount = await db.findOne(
            'SELECT COUNT(*) as count FROM shot_coordinates WHERE session_id = ?',
            [sessionId]
        );
        console.log(`🎯 Total shots recorded: ${shotCount.count}`);

        const templates = await db.query(
            'SELECT COUNT(*) as count FROM target_templates WHERE is_active = TRUE'
        );
        console.log(`📋 Active templates: ${templates[0].count}\n`);

        // Test 11: Cleanup
        console.log('1️⃣1️⃣ Cleaning up test data...');
        await db.delete('shooting_sessions', 'id = ?', [sessionId]);
        await db.delete('shooters', 'id = ?', [shooterId]);
        console.log('✅ Test data cleaned up\n');

        console.log('🎉 All database tests passed successfully!');
        console.log('✅ Database is ready for the shooting range dashboard');

    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runDatabaseTests()
        .then(() => {
            console.log('\n🏁 Database tests completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Database tests failed:', error.message);
            process.exit(1);
        });
}

module.exports = { runDatabaseTests };
