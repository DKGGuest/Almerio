const API_BASE = 'http://localhost:3001/api';

async function testShotSaving() {
    console.log('=== TESTING SHOT SAVING ===\n');

    try {
        // 1. Create a test session
        console.log('1. Creating test session...');
        const sessionResponse = await fetch(`${API_BASE}/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                shooter_name: 'Test Shooter',
                lane_id: 'lane1',
                session_name: 'Shot Saving Test'
            })
        });

        const session = await sessionResponse.json();
        console.log(`✅ Session created: ID ${session.id}\n`);

        // 2. Save a test shot
        console.log('2. Saving test shot...');
        const shotResponse = await fetch(`${API_BASE}/sessions/${session.id}/shots`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([{
                shotNumber: 1,
                x: 210,
                y: 195,
                timestamp: Date.now(),
                score: 10,
                isBullseye: false,
                timePhase: null
            }])
        });

        if (!shotResponse.ok) {
            const errorText = await shotResponse.text();
            console.error(`❌ Failed to save shot: ${shotResponse.status} ${errorText}`);
            return;
        }

        const savedShots = await shotResponse.json();
        console.log(`✅ Shot saved successfully:`, savedShots);
        console.log('');

        // 3. Retrieve session details to verify shot was saved
        console.log('3. Retrieving session details...');
        const detailsResponse = await fetch(`${API_BASE}/sessions/${session.id}`);
        const details = await detailsResponse.json();

        console.log(`Session details:`);
        console.log(`  Shots in database: ${details.shots?.length || 0}`);
        if (details.shots && details.shots.length > 0) {
            console.log(`  First shot:`, details.shots[0]);
            console.log('\n✅ Shot saving is working correctly!');
        } else {
            console.log('\n❌ Shot was not found in database!');
        }

        // 4. Clean up
        console.log('\n4. Cleaning up test data...');
        // Note: Session will be deleted via CASCADE when shooter is deleted
        // For now, we'll leave it for manual inspection

    } catch (error) {
        console.error('Error during test:', error.message);
    }
}

testShotSaving();

