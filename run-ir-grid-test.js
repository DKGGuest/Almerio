/**
 * Simple IR Grid Test Runner
 * Uses built-in Node.js modules only - no external dependencies
 */

const http = require('http');
const { URL } = require('url');

class SimpleTestRunner {
    constructor() {
        this.baseUrl = 'http://localhost:3001';
        this.testData = {
            shooterId: null,
            sessionId: null
        };
    }

    /**
     * Make HTTP request using built-in modules
     */
    async makeRequest(method, path, data = null) {
        return new Promise((resolve, reject) => {
            const url = new URL(path, this.baseUrl);
            const options = {
                hostname: url.hostname,
                port: url.port,
                path: url.pathname + url.search,
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const req = http.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    try {
                        const result = JSON.parse(body);
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(result);
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${result.error || body}`));
                        }
                    } catch (e) {
                        reject(new Error(`Invalid JSON response: ${body}`));
                    }
                });
            });

            req.on('error', reject);

            if (data) {
                req.write(JSON.stringify(data));
            }
            req.end();
        });
    }

    /**
     * Run the complete test
     */
    async runTest() {
        console.log('🎯 IR Grid Complete Test Starting...');
        console.log('====================================\n');

        try {
            // Step 1: Create shooter
            console.log('👤 Creating test shooter...');
            const shooterData = {
                name: 'IR Grid Demo User',
                email: 'demo@irtest.com',
                phone: '555-DEMO',
                rank: 'Demo Shooter',
                unit: 'IR Grid Demo Unit'
            };

            const shooterResult = await this.makeRequest('POST', '/api/shooters', shooterData);
            this.testData.shooterId = shooterResult.id;
            console.log(`   ✅ Shooter created: ID ${this.testData.shooterId}`);

            // Step 2: Create session
            console.log('\n🎯 Creating IR Grid session...');
            const sessionData = {
                shooter_id: this.testData.shooterId,
                lane_number: 1,
                created_at: new Date().toISOString()
            };

            const sessionResult = await this.makeRequest('POST', '/api/sessions', sessionData);
            this.testData.sessionId = sessionResult.id;
            console.log(`   ✅ Session created: ID ${this.testData.sessionId}`);

            // Step 3: Add IR Grid parameters
            console.log('\n⚙️  Configuring IR Grid parameters...');
            const parametersData = {
                session_id: this.testData.sessionId,
                firingMode: 'ir-grid',
                sessionType: 'practice',
                targetDistance: 25,
                rounds: 8,
                weaponType: '7.62mm',
                targetType: 'fig11-combat',
                shootingPosition: 'ls',
                shotType: 'single'
            };

            await this.makeRequest('POST', `/api/sessions/${this.testData.sessionId}/parameters`, parametersData);
            console.log(`   ✅ IR Grid parameters configured`);

            // Step 4: Start simulation
            console.log('\n🚀 Starting IR Grid simulation...');
            const simulationOptions = {
                shotInterval: 1000 // 1 second between shots for demo
            };

            const simResult = await this.makeRequest(
                'POST', 
                `/api/ir-grid/simulate-session/${this.testData.sessionId}`,
                simulationOptions
            );

            console.log(`   ✅ Simulation started!`);
            console.log(`   📊 Pattern: ${simResult.pattern}`);
            console.log(`   🎯 Total shots: ${simResult.totalShots}`);
            console.log(`   ⏱️  Interval: ${simResult.interval}ms`);

            // Step 5: Monitor progress
            console.log('\n⏳ Monitoring simulation progress...');
            await this.monitorSimulation();

            // Step 6: Verify results
            console.log('\n🔍 Verifying results...');
            await this.verifyResults();

            // Step 7: Show instructions
            this.showInstructions();

            console.log('\n✅ IR Grid Test Completed Successfully! 🎯');

        } catch (error) {
            console.error('\n❌ Test failed:', error.message);
            console.log('\n💡 Make sure the server is running on localhost:3001');
        }
    }

    /**
     * Monitor simulation progress
     */
    async monitorSimulation() {
        const maxChecks = 20; // Maximum 20 checks
        let checks = 0;

        while (checks < maxChecks) {
            try {
                const status = await this.makeRequest('GET', '/api/ir-grid/simulate-status');
                
                if (!status.simulation.isRunning) {
                    console.log(`   ✅ Simulation completed!`);
                    console.log(`   📊 Final shot count: ${status.simulation.shotCount || 0}`);
                    break;
                }

                console.log(`   ⏳ Running... (${status.simulation.shotCount || 0} shots sent)`);
                
                // Wait 2 seconds before next check
                await new Promise(resolve => setTimeout(resolve, 2000));
                checks++;

            } catch (error) {
                console.log(`   ⚠️  Status check failed: ${error.message}`);
                break;
            }
        }
    }

    /**
     * Verify the results
     */
    async verifyResults() {
        try {
            // Get session shots
            const shots = await this.makeRequest('GET', `/api/sessions/${this.testData.sessionId}/shots`);
            const irShots = shots.filter(shot => shot.time_phase === 'IR_GRID');

            console.log(`   ✅ Total shots stored: ${shots.length}`);
            console.log(`   🔌 IR Grid shots: ${irShots.length}`);

            if (irShots.length > 0) {
                const sample = irShots[0];
                console.log(`   📊 Sample shot: (${sample.x_coordinate}, ${sample.y_coordinate})`);
            }

            // Get shooter sessions
            const shooterSessions = await this.makeRequest('GET', `/api/shooters/${this.testData.shooterId}/sessions`);
            const irSessions = shooterSessions.filter(s => s.firing_mode === 'ir-grid');

            console.log(`   👤 IR Grid sessions in profile: ${irSessions.length}`);

        } catch (error) {
            console.log(`   ⚠️  Verification failed: ${error.message}`);
        }
    }

    /**
     * Show instructions for frontend verification
     */
    showInstructions() {
        console.log('\n📋 Frontend Verification Instructions');
        console.log('====================================');
        console.log('1. Open your browser to: http://localhost:5173');
        console.log('2. Navigate to the Shooter Profile page');
        console.log('3. Look for shooter: "IR Grid Demo User"');
        console.log('4. Verify you see:');
        console.log('   - 🔌 Icon next to the session');
        console.log('   - Red "IR GRID" badge');
        console.log('   - Session shows as "Practice" type');
        console.log('');
        console.log('5. Click on the IR Grid session to view details');
        console.log('6. In Session Details page, verify:');
        console.log('   - Red "IR GRID" badge next to firing mode');
        console.log('   - IR Grid Parameters section');
        console.log('   - Shots table with red highlighting');
        console.log('   - 🔌 Icons in shot numbers');
        console.log('   - "IR GRID" badges in Data Source column');
        console.log('');
        console.log('🔗 Direct Links:');
        console.log(`   Shooter Profile: http://localhost:5173/shooter-profile/${this.testData.shooterId}`);
        console.log(`   Session Details: http://localhost:5173/session-details/${this.testData.sessionId}`);
    }

    /**
     * Run a quick batch test
     */
    async runBatchTest() {
        console.log('🚀 Running Quick Batch Test...');
        console.log('==============================\n');

        try {
            // Create shooter and session
            const shooterResult = await this.makeRequest('POST', '/api/shooters', {
                name: 'Batch Test User',
                email: 'batch@test.com',
                phone: '555-BATCH',
                rank: 'Batch Tester',
                unit: 'Batch Test Unit'
            });

            const sessionResult = await this.makeRequest('POST', '/api/sessions', {
                shooter_id: shooterResult.id,
                lane_number: 2,
                created_at: new Date().toISOString()
            });

            await this.makeRequest('POST', `/api/sessions/${sessionResult.id}/parameters`, {
                session_id: sessionResult.id,
                firingMode: 'ir-grid',
                sessionType: 'test',
                targetDistance: 50,
                rounds: 5,
                weaponType: '9mm',
                targetType: '120cm-combat',
                shootingPosition: 'bc',
                shotType: 'single'
            });

            console.log(`✅ Setup complete - Shooter: ${shooterResult.id}, Session: ${sessionResult.id}`);

            // Send batch shots
            console.log('\n📦 Sending batch of 5 shots...');
            const batchResult = await this.makeRequest('POST', `/api/ir-grid/simulate-batch/${sessionResult.id}`, {
                count: 5
            });

            console.log(`✅ Batch completed: ${batchResult.shotsSent} shots sent`);

            // Verify
            const shots = await this.makeRequest('GET', `/api/sessions/${sessionResult.id}/shots`);
            console.log(`📊 Shots verified: ${shots.length} shots stored`);

            console.log(`\n🔗 View results: http://localhost:5173/session-details/${sessionResult.id}`);

        } catch (error) {
            console.error('❌ Batch test failed:', error.message);
        }
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const testType = args[0] || 'complete';

    const runner = new SimpleTestRunner();

    console.log('🎯 IR Grid End-to-End Testing System');
    console.log('====================================');
    console.log('This will test the complete IR Grid workflow without hardware\n');

    if (testType === 'batch') {
        await runner.runBatchTest();
    } else {
        await runner.runTest();
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = SimpleTestRunner;
