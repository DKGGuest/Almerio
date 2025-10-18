// Test script to verify IR Grid error fix
// Run this in browser console after the error occurs

console.log('🧪 Testing IR Grid Error Fix...');

// Test the calculateZoneScore function directly
function testCalculateZoneScore() {
  console.log('\n=== Testing calculateZoneScore Function ===');
  
  // Check if function is available
  if (typeof window.calculateZoneScore !== 'function') {
    console.error('❌ calculateZoneScore function not available on window');
    return;
  }
  
  // Test parameters
  const testHit = { x: 200, y: 200 };
  const testBullseye = { x: 200, y: 200 };
  const testRingRadii = {
    blueInnerRadius: 10,
    orangeESARadius: 25,
    greenBullseyeRadius: 50
  };
  
  try {
    const score = window.calculateZoneScore(testHit, testBullseye, testRingRadii);
    console.log('✅ calculateZoneScore test passed:', {
      hit: testHit,
      bullseye: testBullseye,
      ringRadii: testRingRadii,
      score: score
    });
  } catch (error) {
    console.error('❌ calculateZoneScore test failed:', error);
  }
}

// Test the calculateRingRadii function
function testCalculateRingRadii() {
  console.log('\n=== Testing calculateRingRadii Function ===');
  
  if (typeof window.calculateRingRadii !== 'function') {
    console.error('❌ calculateRingRadii function not available on window');
    return;
  }
  
  const testTemplate = { diameter: 120 }; // 25M target
  const testESA = 30;
  
  try {
    const ringRadii = window.calculateRingRadii(testTemplate, testESA);
    console.log('✅ calculateRingRadii test passed:', {
      template: testTemplate,
      esa: testESA,
      ringRadii: ringRadii
    });
  } catch (error) {
    console.error('❌ calculateRingRadii test failed:', error);
  }
}

// Test createTemplateFromDistance function
function testCreateTemplateFromDistance() {
  console.log('\n=== Testing createTemplateFromDistance Function ===');
  
  if (typeof window.createTemplateFromDistance !== 'function') {
    console.error('❌ createTemplateFromDistance function not available on window');
    return;
  }
  
  try {
    const template25m = window.createTemplateFromDistance(25);
    console.log('✅ createTemplateFromDistance test passed:', {
      distance: 25,
      template: template25m
    });
  } catch (error) {
    console.error('❌ createTemplateFromDistance test failed:', error);
  }
}

// Test complete IR Grid scoring workflow
function testCompleteWorkflow() {
  console.log('\n=== Testing Complete IR Grid Scoring Workflow ===');
  
  try {
    // Step 1: Create template from distance
    const template = window.createTemplateFromDistance(25);
    if (!template) {
      throw new Error('Failed to create template from distance');
    }
    
    // Step 2: Calculate ring radii
    const ringRadii = window.calculateRingRadii(template, 30);
    if (!ringRadii) {
      throw new Error('Failed to calculate ring radii');
    }
    
    // Step 3: Test scoring for different positions
    const testShots = [
      { x: 200, y: 200, expected: 3 }, // Center - should be 3 points
      { x: 210, y: 210, expected: 2 }, // Medium distance - should be 2 points
      { x: 230, y: 230, expected: 1 }, // Far distance - should be 1 point
      { x: 280, y: 280, expected: 0 }  // Very far - should be 0 points
    ];
    
    const bullseyePosition = { x: 200, y: 200 };
    
    testShots.forEach((shot, index) => {
      const score = window.calculateZoneScore(shot, bullseyePosition, ringRadii);
      const distance = Math.sqrt((shot.x - 200) ** 2 + (shot.y - 200) ** 2);
      
      console.log(`Shot ${index + 1}:`, {
        position: shot,
        distance: distance.toFixed(1),
        expectedScore: shot.expected,
        actualScore: score,
        status: score === shot.expected ? '✅ PASS' : '❌ FAIL'
      });
    });
    
    console.log('✅ Complete workflow test completed');
    
  } catch (error) {
    console.error('❌ Complete workflow test failed:', error);
  }
}

// Check for common issues
function checkCommonIssues() {
  console.log('\n=== Checking Common Issues ===');
  
  // Check if we're on the right page
  if (!window.location.href.includes('/admin')) {
    console.warn('⚠️ Not on admin dashboard page');
  }
  
  // Check if React is available
  if (!window.React) {
    console.warn('⚠️ React not available on window');
  }
  
  // Check for IR Grid input
  const irGridInput = document.querySelector('textarea[placeholder*="coordinate"]');
  if (!irGridInput) {
    console.warn('⚠️ IR Grid input not found - make sure firing mode is set to "Untimed IR Shots"');
  } else {
    console.log('✅ IR Grid input found');
  }
  
  // Check for process button
  const processButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('Process')
  );
  if (!processButton) {
    console.warn('⚠️ Process button not found');
  } else {
    console.log('✅ Process button found');
  }
}

// Manual test function for user to run
function manualTest() {
  console.log('\n=== Manual Test Instructions ===');
  console.log('1. Make sure you have set up IR Grid session with:');
  console.log('   - Firing Mode: "Untimed IR Shots"');
  console.log('   - Target Distance: 25M');
  console.log('   - ESA Parameter: 30');
  console.log('2. Enter these test coordinates:');
  console.log('   0,0');
  console.log('   -10,10');
  console.log('   10,-10');
  console.log('3. Click "Process Shots"');
  console.log('4. Check console for detailed error information');
}

// Run all tests
function runAllTests() {
  console.log('🧪 Starting IR Grid Error Fix Tests...');
  
  checkCommonIssues();
  testCalculateZoneScore();
  testCalculateRingRadii();
  testCreateTemplateFromDistance();
  testCompleteWorkflow();
  manualTest();
  
  console.log('\n✅ All tests completed. Check results above.');
}

// Export functions for manual use
window.testIRGridErrorFix = {
  runAllTests,
  testCalculateZoneScore,
  testCalculateRingRadii,
  testCreateTemplateFromDistance,
  testCompleteWorkflow,
  checkCommonIssues,
  manualTest
};

console.log('✅ Test functions loaded. Run: testIRGridErrorFix.runAllTests()');

// Auto-run tests
runAllTests();
