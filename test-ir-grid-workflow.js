#!/usr/bin/env node

/**
 * IR Grid Workflow Test Script
 * Tests the complete IR Grid functionality from API perspective
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test data
const TEST_SHOOTER = {
  name: 'IR Grid Test Shooter',
  rank: 'Private',
  unit: 'Test Unit'
};

const TEST_PARAMETERS = {
  sessionType: 'practice',
  firingMode: 'ir-grid',
  weapon: '7.62mm-rifle-slr',
  target: 'FIG 11-Combat',
  position: 'LS',
  shotType: 'single',
  rounds: 10,
  targetDistance: 25
};

const TEST_COORDINATES = [
  { x: 200, y: 200, timestamp: Date.now() },
  { x: 195, y: 205, timestamp: Date.now() + 1000 },
  { x: 205, y: 195, timestamp: Date.now() + 2000 },
  { x: 198, y: 202, timestamp: Date.now() + 3000 },
  { x: 202, y: 198, timestamp: Date.now() + 4000 }
];

async function testWorkflow() {
  console.log('🎯 Starting IR Grid Workflow Test...\n');

  try {
    // 1. Test server health
    console.log('1️⃣ Testing server health...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Server is healthy:', healthResponse.data);

    // 2. Create test shooter
    console.log('\n2️⃣ Creating test shooter...');
    const shooterResponse = await axios.post(`${BASE_URL}/api/shooters`, TEST_SHOOTER);
    const shooterId = shooterResponse.data.id;
    console.log('✅ Shooter created:', { id: shooterId, name: TEST_SHOOTER.name });

    // 3. Create session
    console.log('\n3️⃣ Creating shooting session...');
    const sessionResponse = await axios.post(`${BASE_URL}/api/sessions`, {
      shooterId: shooterId,
      sessionType: TEST_PARAMETERS.sessionType
    });
    const sessionId = sessionResponse.data.id;
    console.log('✅ Session created:', { id: sessionId, type: TEST_PARAMETERS.sessionType });

    // 4. Save parameters with IR Grid mode
    console.log('\n4️⃣ Saving IR Grid parameters...');
    const paramsResponse = await axios.post(`${BASE_URL}/api/sessions/${sessionId}/parameters`, TEST_PARAMETERS);
    console.log('✅ Parameters saved:', { firingMode: TEST_PARAMETERS.firingMode });

    // 5. Save IR Grid shots
    console.log('\n5️⃣ Saving IR Grid shots...');
    for (let i = 0; i < TEST_COORDINATES.length; i++) {
      const coord = TEST_COORDINATES[i];
      const shotResponse = await axios.post(`${BASE_URL}/api/sessions/${sessionId}/shots`, {
        x: coord.x,
        y: coord.y,
        score: calculateScore(coord.x, coord.y),
        timestamp: coord.timestamp,
        shotNumber: i + 1,
        isIrGrid: true
      });
      console.log(`   Shot ${i + 1}: (${coord.x}, ${coord.y}) -> Score: ${calculateScore(coord.x, coord.y)}`);
    }
    console.log('✅ All shots saved successfully');

    // 6. Calculate and save analytics
    console.log('\n6️⃣ Calculating analytics...');
    const analytics = calculateAnalytics(TEST_COORDINATES);
    const analyticsResponse = await axios.post(`${BASE_URL}/api/sessions/${sessionId}/analytics`, analytics);
    console.log('✅ Analytics saved:', {
      mpi: analytics.mpiDistance.toFixed(2),
      accuracy: analytics.accuracyPercentage.toFixed(1) + '%',
      shots: analytics.shotsAnalyzed
    });

    // 7. Generate final report
    console.log('\n7️⃣ Generating final report...');
    const totalScore = TEST_COORDINATES.reduce((sum, coord) => sum + calculateScore(coord.x, coord.y), 0);
    const maxScore = TEST_COORDINATES.length * 3;
    const accuracy = (totalScore / maxScore) * 100;
    
    const reportResponse = await axios.post(`${BASE_URL}/api/sessions/${sessionId}/final-report`, {
      totalScore: totalScore,
      maxPossibleScore: maxScore,
      accuracyPercentage: accuracy,
      performanceRating: getPerformanceRating(accuracy, TEST_PARAMETERS.sessionType),
      mpiDistance: analytics.mpiDistance,
      groupSize: analytics.groupSize,
      shotsAnalyzed: TEST_COORDINATES.length
    });
    console.log('✅ Final report generated:', {
      score: `${totalScore}/${maxScore}`,
      accuracy: accuracy.toFixed(1) + '%',
      rating: getPerformanceRating(accuracy, TEST_PARAMETERS.sessionType)
    });

    // 8. Verify session data
    console.log('\n8️⃣ Verifying session data...');
    const sessionDataResponse = await axios.get(`${BASE_URL}/api/sessions/${sessionId}`);
    const sessionData = sessionDataResponse.data;
    console.log('✅ Session verification:', {
      id: sessionData.id,
      firingMode: sessionData.parameters?.firing_mode,
      shotsCount: sessionData.shots?.length,
      hasAnalytics: !!sessionData.analytics,
      hasFinalReport: !!sessionData.finalReport
    });

    console.log('\n🎉 IR Grid Workflow Test COMPLETED SUCCESSFULLY!');
    console.log('\n📋 Test Summary:');
    console.log(`   Shooter ID: ${shooterId}`);
    console.log(`   Session ID: ${sessionId}`);
    console.log(`   Firing Mode: ${TEST_PARAMETERS.firingMode}`);
    console.log(`   Shots Processed: ${TEST_COORDINATES.length}`);
    console.log(`   Final Score: ${totalScore}/${maxScore} (${accuracy.toFixed(1)}%)`);
    console.log(`   Performance: ${getPerformanceRating(accuracy, TEST_PARAMETERS.sessionType)}`);
    
    console.log('\n🌐 Frontend URLs to verify:');
    console.log(`   Admin Dashboard: http://localhost:5173/admin`);
    console.log(`   Shooter Profile: http://localhost:5173/shooter-profile`);
    console.log(`   Session Details: http://localhost:5173/session-details/${sessionId}`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Helper functions
function calculateScore(x, y) {
  // Simple scoring based on distance from center (200, 200)
  const distance = Math.sqrt((x - 200) ** 2 + (y - 200) ** 2);
  if (distance <= 20) return 3; // Inner circle
  if (distance <= 50) return 2; // Middle circle
  if (distance <= 100) return 1; // Outer circle
  return 0; // Outside target
}

function calculateAnalytics(coordinates) {
  // Calculate MPI (Mean Point of Impact)
  const avgX = coordinates.reduce((sum, coord) => sum + coord.x, 0) / coordinates.length;
  const avgY = coordinates.reduce((sum, coord) => sum + coord.y, 0) / coordinates.length;
  
  // Calculate MPI distance from center
  const mpiDistance = Math.sqrt((avgX - 200) ** 2 + (avgY - 200) ** 2);
  
  // Calculate group size (max distance between any two shots)
  let maxDistance = 0;
  for (let i = 0; i < coordinates.length; i++) {
    for (let j = i + 1; j < coordinates.length; j++) {
      const dist = Math.sqrt(
        (coordinates[i].x - coordinates[j].x) ** 2 + 
        (coordinates[i].y - coordinates[j].y) ** 2
      );
      maxDistance = Math.max(maxDistance, dist);
    }
  }
  
  // Calculate accuracy
  const totalScore = coordinates.reduce((sum, coord) => sum + calculateScore(coord.x, coord.y), 0);
  const maxScore = coordinates.length * 3;
  const accuracy = (totalScore / maxScore) * 100;
  
  return {
    mpiDistance: mpiDistance,
    mpiXCoordinate: avgX,
    mpiYCoordinate: avgY,
    mpiCoordsX: avgX - 200,
    mpiCoordsY: 200 - avgY,
    accuracyPercentage: accuracy,
    avgDistance: mpiDistance,
    maxDistance: maxDistance,
    groupSize: maxDistance,
    referencePointType: 'center',
    referenceXCoordinate: 200,
    referenceYCoordinate: 200,
    shotsAnalyzed: coordinates.length
  };
}

function getPerformanceRating(accuracy, sessionType) {
  if (sessionType === 'test') {
    if (accuracy > 70) return 'MARKSMAN';
    if (accuracy >= 60) return 'FIRST CLASS';
    if (accuracy >= 40) return 'SECOND CLASS';
    return 'FAILED';
  } else {
    if (accuracy >= 90) return 'EXPERT MARKSMAN';
    if (accuracy >= 75) return 'SKILLED SHOOTER';
    if (accuracy >= 50) return 'IMPROVING SHOOTER';
    return 'BEGINNER LEVEL';
  }
}

// Run the test
if (require.main === module) {
  testWorkflow();
}

module.exports = { testWorkflow };
