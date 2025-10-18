/**
 * Complete End-to-End IR Grid Test Script
 * 
 * This script demonstrates the full IR Grid workflow:
 * 1. Creates a shooter and session
 * 2. Starts IR Grid simulation with realistic shot patterns
 * 3. Verifies data storage and display
 * 4. Shows complete session results
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:5173';

class IRGridEndToEndTest {
    constructor() {
        this.testResults = {
            shooterId: null,
            sessionId: null,
            shots: [],
            errors: []
        };
    }

    /**
     * Run the complete end-to-end test
     */
    async runCompleteTest() {
        console.log('🎯 IR Grid End-to-End Test Starting...');
        console.log('=====================================\n');

        try {
            // Step 1: Create test shooter
            await this.createTestShooter();
            
            // Step 2: Create IR Grid session
            await this.createIRGridSession();
            
            // Step 3: Start IR Grid simulation
            await this.startIRGridSimulation();
            
            // Step 4: Wait for simulation to complete
            await this.waitForSimulationComplete();
            
            // Step 5: Verify data storage
            await this.verifyDataStorage();
            
            // Step 6: Display results and instructions
            await this.displayResults();
            
            console.log('\n✅ End-to-End Test Completed Successfully!');
            console.log('🎯 Check the frontend to see the results in action');
            
        } catch (error) {
            console.error('\n❌ Test failed:', error.message);
            this.testResults.errors.push(error.message);
        }
    }

    /**
     * Create a test shooter
     */
    async createTestShooter() {
        console.log('👤 Step 1: Creating test shooter...');
        
        try {
            const shooterData = {
                name: 'IR Grid Test User',
                email: 'irtest@example.com',
                phone: '555-0123',
                rank: 'Test Shooter',
                unit: 'IR Grid Testing Unit'
            };

            const response = await axios.post(`${BASE_URL}/shooters`, shooterData);
            this.testResults.shooterId = response.data.id;
            
            console.log(`   ✅ Shooter created with ID: ${this.testResults.shooterId}`);
            console.log(`   📝 Name: ${shooterData.name}`);
            
        } catch (error) {
            throw new Error(`Failed to create shooter: ${error.message}`);
        }
    }

    /**
     * Create an IR Grid session
     */
    async createIRGridSession() {
        console.log('\n🎯 Step 2: Creating IR Grid session...');
        
        try {
            // First create the session
            const sessionData = {
                shooter_id: this.testResults.shooterId,
                lane_number: 1,
                created_at: new Date().toISOString()
            };

            const sessionResponse = await axios.post(`${BASE_URL}/sessions`, sessionData);
            this.testResults.sessionId = sessionResponse.data.id;
            
            console.log(`   ✅ Session created with ID: ${this.testResults.sessionId}`);

            // Then create IR Grid parameters
            const parametersData = {
                session_id: this.testResults.sessionId,
                firingMode: 'ir-grid',
                sessionType: 'practice',
                targetDistance: 25,
                rounds: 10,
                weaponType: '7.62mm',
                targetType: 'fig11-combat',
                shootingPosition: 'ls',
                shotType: 'single'
            };

            const paramsResponse = await axios.post(`${BASE_URL}/sessions/${this.testResults.sessionId}/parameters`, parametersData);
            
            console.log(`   ✅ IR Grid parameters configured`);
            console.log(`   🔌 Firing Mode: Untimed IR Shots`);
            console.log(`   🎯 Session Type: Practice`);
            
        } catch (error) {
            throw new Error(`Failed to create IR Grid session: ${error.message}`);
        }
    }

    /**
     * Start the IR Grid simulation
     */
    async startIRGridSimulation() {
        console.log('\n🚀 Step 3: Starting IR Grid simulation...');
        
        try {
            const simulationOptions = {
                shotInterval: 1500, // 1.5 seconds between shots
                pattern: 'realistic' // Use realistic shooting pattern
            };

            const response = await axios.post(
                `${BASE_URL}/ir-grid/simulate-session/${this.testResults.sessionId}`,
                simulationOptions
            );

            console.log(`   ✅ Simulation started successfully`);
            console.log(`   📊 Pattern: ${response.data.pattern}`);
            console.log(`   🎯 Total shots: ${response.data.totalShots}`);
            console.log(`   ⏱️  Shot interval: ${response.data.interval}ms`);
            console.log(`   🔴 Watch for red dots appearing on the target display!`);
            
        } catch (error) {
            throw new Error(`Failed to start simulation: ${error.message}`);
        }
    }

    /**
     * Wait for simulation to complete
     */
    async waitForSimulationComplete() {
        console.log('\n⏳ Step 4: Waiting for simulation to complete...');
        
        const maxWaitTime = 30000; // 30 seconds max
        const checkInterval = 2000; // Check every 2 seconds
        let waitTime = 0;

        while (waitTime < maxWaitTime) {
            try {
                const response = await axios.get(`${BASE_URL}/ir-grid/simulate-status`);
                const status = response.data.simulation;

                if (!status.isRunning) {
                    console.log(`   ✅ Simulation completed!`);
                    console.log(`   📊 Total shots sent: ${status.shotCount || 'Unknown'}`);
                    break;
                }

                console.log(`   ⏳ Simulation running... (${status.shotCount || 0} shots sent)`);
                
                await new Promise(resolve => setTimeout(resolve, checkInterval));
                waitTime += checkInterval;
                
            } catch (error) {
                console.log(`   ⚠️  Status check failed: ${error.message}`);
                break;
            }
        }

        if (waitTime >= maxWaitTime) {
            console.log(`   ⚠️  Simulation timeout - continuing with verification`);
        }
    }

    /**
     * Verify data was stored correctly
     */
    async verifyDataStorage() {
        console.log('\n🔍 Step 5: Verifying data storage...');
        
        try {
            // Get session details
            const sessionResponse = await axios.get(`${BASE_URL}/sessions/${this.testResults.sessionId}`);
            const session = sessionResponse.data;

            console.log(`   ✅ Session retrieved successfully`);
            console.log(`   📊 Session ID: ${session.id}`);
            console.log(`   🎯 Lane: ${session.lane_number}`);

            // Get session shots
            const shotsResponse = await axios.get(`${BASE_URL}/sessions/${this.testResults.sessionId}/shots`);
            const shots = shotsResponse.data;

            this.testResults.shots = shots;
            
            console.log(`   ✅ Shots retrieved successfully`);
            console.log(`   🎯 Total shots found: ${shots.length}`);

            // Verify IR Grid shots
            const irShots = shots.filter(shot => shot.time_phase === 'IR_GRID');
            console.log(`   🔌 IR Grid shots: ${irShots.length}`);

            if (irShots.length > 0) {
                console.log(`   📊 Sample IR shot data:`);
                const sample = irShots[0];
                console.log(`      - Coordinates: (${sample.x_coordinate}, ${sample.y_coordinate})`);
                console.log(`      - Time Phase: ${sample.time_phase}`);
                console.log(`      - Notes: ${sample.notes}`);
            }

            // Get shooter profile to verify session appears
            const shooterResponse = await axios.get(`${BASE_URL}/shooters/${this.testResults.shooterId}/sessions`);
            const shooterSessions = shooterResponse.data;

            const irGridSessions = shooterSessions.filter(s => s.firing_mode === 'ir-grid');
            console.log(`   👤 IR Grid sessions in shooter profile: ${irGridSessions.length}`);
            
        } catch (error) {
            throw new Error(`Failed to verify data storage: ${error.message}`);
        }
    }

    /**
     * Display final results and instructions
     */
    async displayResults() {
        console.log('\n📋 Step 6: Test Results Summary');
        console.log('================================');
        
        console.log(`✅ Shooter ID: ${this.testResults.shooterId}`);
        console.log(`✅ Session ID: ${this.testResults.sessionId}`);
        console.log(`✅ Total shots: ${this.testResults.shots.length}`);
        console.log(`✅ IR Grid shots: ${this.testResults.shots.filter(s => s.time_phase === 'IR_GRID').length}`);

        console.log('\n🎯 Frontend Verification Steps:');
        console.log('================================');
        console.log(`1. Open browser: ${FRONTEND_URL}`);
        console.log(`2. Go to Shooter Profile page`);
        console.log(`3. Look for shooter: "IR Grid Test User"`);
        console.log(`4. Verify IR Grid session appears with 🔌 icon and red "IR GRID" badge`);
        console.log(`5. Click on the IR Grid session to view details`);
        console.log(`6. Verify Session Details page shows:`);
        console.log(`   - Red "IR GRID" badge next to firing mode`);
        console.log(`   - IR Grid specific parameters section`);
        console.log(`   - Shots table with red highlighting for IR shots`);
        console.log(`   - 🔌 icons next to shot numbers`);
        console.log(`   - "IR GRID" badges in Data Source column`);

        console.log('\n🔗 Direct Links:');
        console.log('================');
        console.log(`Shooter Profile: ${FRONTEND_URL}/shooter-profile/${this.testResults.shooterId}`);
        console.log(`Session Details: ${FRONTEND_URL}/session-details/${this.testResults.sessionId}`);

        console.log('\n🧪 Additional Tests You Can Run:');
        console.log('=================================');
        console.log('1. Batch simulation (5 quick shots):');
        console.log(`   POST ${BASE_URL}/ir-grid/simulate-batch/${this.testResults.sessionId}`);
        console.log('   Body: {"count": 5}');
        console.log('');
        console.log('2. Single shot simulation:');
        console.log(`   POST ${BASE_URL}/ir-grid/simulate-shot`);
        console.log('   Body: {"x": 200, "y": 200}');
        console.log('');
        console.log('3. Check simulation status:');
        console.log(`   GET ${BASE_URL}/ir-grid/simulate-status`);
    }

    /**
     * Run a quick batch test
     */
    async runQuickBatchTest() {
        console.log('\n🚀 Running Quick Batch Test...');
        
        try {
            await this.createTestShooter();
            await this.createIRGridSession();
            
            console.log('\n📦 Sending batch of 5 shots...');
            const response = await axios.post(
                `${BASE_URL}/ir-grid/simulate-batch/${this.testResults.sessionId}`,
                { count: 5 }
            );

            console.log(`✅ Batch test completed!`);
            console.log(`📊 Shots sent: ${response.data.shotsSent}`);
            
            await this.verifyDataStorage();
            await this.displayResults();
            
        } catch (error) {
            console.error('❌ Batch test failed:', error.message);
        }
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const testType = args[0] || 'complete';

    const tester = new IRGridEndToEndTest();

    if (testType === 'batch') {
        await tester.runQuickBatchTest();
    } else {
        await tester.runCompleteTest();
    }
}

// Handle axios dependency
if (typeof require !== 'undefined') {
    try {
        main().catch(console.error);
    } catch (error) {
        console.error('❌ Error: axios module not found');
        console.log('💡 Install axios: npm install axios');
        console.log('💡 Or run from server directory where axios is available');
    }
} else {
    console.error('❌ This script requires Node.js with CommonJS support');
}

module.exports = IRGridEndToEndTest;
