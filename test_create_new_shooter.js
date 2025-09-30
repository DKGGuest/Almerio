// Test script to verify "Create New Shooter" functionality
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testCreateNewShooter() {
    console.log('🧪 Testing Create New Shooter functionality...\n');
    
    try {
        // Test 1: Create session with force_new_shooter = true
        console.log('📝 Test 1: Creating session with force_new_shooter = true');
        const response1 = await fetch(`${API_BASE}/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                shooter_name: 'test',
                shooter_id: null,
                force_new_shooter: true,
                lane_id: 'lane1',
                session_name: 'Test Session - Force New'
            })
        });
        
        const session1 = await response1.json();
        console.log('✅ Session created:', session1);
        
        // Test 2: Create session with force_new_shooter = false (should use existing)
        console.log('\n📝 Test 2: Creating session with force_new_shooter = false');
        const response2 = await fetch(`${API_BASE}/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                shooter_name: 'test',
                shooter_id: null,
                force_new_shooter: false,
                lane_id: 'lane1',
                session_name: 'Test Session - Use Existing'
            })
        });
        
        const session2 = await response2.json();
        console.log('✅ Session created:', session2);
        
        // Check if different shooters were used
        if (session1.shooter_id !== session2.shooter_id) {
            console.log('\n🎉 SUCCESS: Different shooters were created/used!');
            console.log(`   - New shooter ID: ${session1.shooter_id}`);
            console.log(`   - Existing shooter ID: ${session2.shooter_id}`);
        } else {
            console.log('\n❌ FAILED: Same shooter was used for both sessions');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testCreateNewShooter();
