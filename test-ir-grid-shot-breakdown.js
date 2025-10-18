// Test script to verify IR Grid shot breakdown functionality
// Run this in browser console after setting up IR Grid session

console.log('🧪 Testing IR Grid Shot Breakdown...');

// Test function to check shot breakdown data
function testShotBreakdown() {
  console.log('\n=== IR Grid Shot Breakdown Test ===');
  
  // Check if we're on admin dashboard
  const currentUrl = window.location.href;
  if (!currentUrl.includes('/admin')) {
    console.error('❌ Please run this test on the Admin Dashboard page');
    return;
  }
  
  // Check for active lane data
  const adminComponent = document.querySelector('[data-testid="admin-dashboard"]') || document.querySelector('.admin-dashboard');
  if (!adminComponent) {
    console.log('⚠️ Admin dashboard component not found, checking React state...');
  }
  
  // Try to access React state through the window (if available)
  if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    console.log('🔍 Checking React component state...');
  }
  
  // Check for shot breakdown tab
  const breakdownTab = document.querySelector('[data-tab="breakdown"]') || 
                      Array.from(document.querySelectorAll('button')).find(btn => 
                        btn.textContent.includes('Shot Breakdown') || btn.textContent.includes('breakdown')
                      );
  
  if (breakdownTab) {
    console.log('✅ Shot Breakdown tab found');
    
    // Click the tab to activate it
    breakdownTab.click();
    
    setTimeout(() => {
      // Check for shot breakdown content
      const shotBreakdownContent = document.querySelector('.shot-breakdown') ||
                                  document.querySelector('[data-component="shot-breakdown"]') ||
                                  Array.from(document.querySelectorAll('div')).find(div => 
                                    div.textContent.includes('Total Score') || 
                                    div.textContent.includes('Zone Breakdown')
                                  );
      
      if (shotBreakdownContent) {
        console.log('✅ Shot Breakdown content found');
        console.log('📊 Content:', shotBreakdownContent.textContent.substring(0, 200) + '...');
        
        // Look for specific elements
        const totalScore = Array.from(document.querySelectorAll('*')).find(el => 
          el.textContent.includes('Total Score')
        );
        
        const zoneBreakdown = Array.from(document.querySelectorAll('*')).find(el => 
          el.textContent.includes('Zone Breakdown') || el.textContent.includes('Blue Zone')
        );
        
        if (totalScore) {
          console.log('✅ Total Score element found:', totalScore.textContent);
        } else {
          console.log('❌ Total Score element not found');
        }
        
        if (zoneBreakdown) {
          console.log('✅ Zone Breakdown element found');
        } else {
          console.log('❌ Zone Breakdown element not found');
        }
        
      } else {
        console.log('❌ Shot Breakdown content not found');
        console.log('🔍 Available elements:');
        const allDivs = Array.from(document.querySelectorAll('div')).slice(0, 10);
        allDivs.forEach((div, i) => {
          if (div.textContent.length > 10 && div.textContent.length < 100) {
            console.log(`  ${i}: ${div.textContent.trim()}`);
          }
        });
      }
    }, 1000);
    
  } else {
    console.log('❌ Shot Breakdown tab not found');
    console.log('🔍 Available tabs:');
    const allButtons = Array.from(document.querySelectorAll('button'));
    allButtons.forEach((btn, i) => {
      if (btn.textContent.trim().length > 0) {
        console.log(`  ${i}: "${btn.textContent.trim()}"`);
      }
    });
  }
}

// Test function to check console logs
function checkConsoleLogs() {
  console.log('\n=== Console Log Check ===');
  console.log('🔍 Look for these logs in the console:');
  console.log('  - "🎯 AdminDashboard - Adding hit to lane"');
  console.log('  - "🎯 ShotBreakdown Debug"');
  console.log('  - "✅ AdminDashboard - Using pre-calculated IR Grid score"');
  console.log('\nIf you don\'t see these logs, the shots might not be reaching the components.');
}

// Test function to simulate IR Grid input
function simulateIRGridInput() {
  console.log('\n=== IR Grid Input Simulation ===');
  
  // Look for IR Grid input textarea
  const irGridTextarea = document.querySelector('textarea[placeholder*="coordinate"]') ||
                        document.querySelector('textarea[placeholder*="IR"]') ||
                        Array.from(document.querySelectorAll('textarea')).find(ta => 
                          ta.placeholder.toLowerCase().includes('coordinate') ||
                          ta.placeholder.toLowerCase().includes('ir')
                        );
  
  if (irGridTextarea) {
    console.log('✅ IR Grid input found');
    
    // Test coordinates
    const testCoords = `0,0
-10,10
10,-10
-20,20
20,-20`;
    
    console.log('📝 Entering test coordinates:', testCoords);
    
    // Set the value
    irGridTextarea.value = testCoords;
    irGridTextarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Look for process button
    const processButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent.includes('Process') || btn.textContent.includes('🎯')
    );
    
    if (processButton) {
      console.log('✅ Process button found');
      console.log('🚀 Click the process button to test shot processing');
      
      // Highlight the button
      processButton.style.border = '3px solid red';
      processButton.style.backgroundColor = 'yellow';
      
    } else {
      console.log('❌ Process button not found');
    }
    
  } else {
    console.log('❌ IR Grid input not found');
    console.log('🔍 Make sure you have:');
    console.log('  1. Selected "Untimed IR Shots" firing mode');
    console.log('  2. Set other parameters (target distance, ESA, etc.)');
    console.log('  3. Saved the parameters');
  }
}

// Run all tests
function runAllTests() {
  console.log('🧪 Starting IR Grid Shot Breakdown Tests...');
  
  checkConsoleLogs();
  
  setTimeout(() => {
    simulateIRGridInput();
  }, 1000);
  
  setTimeout(() => {
    testShotBreakdown();
  }, 2000);
  
  console.log('\n📋 Test Instructions:');
  console.log('1. Make sure you\'re on Admin Dashboard');
  console.log('2. Set up IR Grid session with "Untimed IR Shots" mode');
  console.log('3. Enter test coordinates and process them');
  console.log('4. Check Shot Breakdown tab for results');
  console.log('5. Look for debug logs in console');
}

// Export functions for manual testing
window.testIRGridBreakdown = {
  runAllTests,
  testShotBreakdown,
  checkConsoleLogs,
  simulateIRGridInput
};

console.log('✅ Test functions loaded. Run: testIRGridBreakdown.runAllTests()');

// Auto-run if not in test mode
if (!window.location.search.includes('test=manual')) {
  runAllTests();
}
