/**
 * Simple IR Grid Test - Manual Step-by-Step Demo
 * This demonstrates the IR Grid functionality step by step
 */

const http = require('http');
const { URL } = require('url');

class SimpleIRTest {
    constructor() {
        this.baseUrl = 'http://localhost:3001';
    }

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

    async testBasicFunctionality() {
        console.log('🎯 IR Grid Basic Functionality Test');
        console.log('===================================\n');

        try {
            // Step 1: Test server health
            console.log('1️⃣ Testing server health...');
            const health = await this.makeRequest('GET', '/api/health');
            console.log(`   ✅ Server: ${health.status}`);
            console.log(`   ✅ Database: ${health.database}`);

            // Step 2: Create a simple shooter
            console.log('\n2️⃣ Creating test shooter...');
            const shooter = await this.makeRequest('POST', '/api/shooters', {
                shooter_name: 'Simple IR Test',
                skill_level: 'beginner',
                notes: 'Simple IR Grid test shooter'
            });
            console.log(`   ✅ Shooter created: ID ${shooter.id}`);

            // Step 3: Create a session
            console.log('\n3️⃣ Creating session...');
            const session = await this.makeRequest('POST', '/api/sessions', {
                shooter_name: 'Simple IR Test',
                shooter_id: shooter.id,
                force_new_shooter: false,
                lane_id: 'lane1',
                session_name: 'Simple IR Test Session'
            });
            console.log(`   ✅ Session created: ID ${session.id}`);

            // Step 4: Try to add parameters with regular firing mode first
            console.log('\n4️⃣ Adding basic parameters...');
            try {
                await this.makeRequest('POST', `/api/sessions/${session.id}/parameters`, {
                    firingMode: 'untimed',
                    sessionType: 'practice',
                    targetDistance: 25,
                    rounds: 5,
                    weaponType: '7.62mm-rifle-slr',
                    targetType: 'fig11-combat',
                    shootingPosition: 'ls',
                    shotType: 'single'
                });
                console.log(`   ✅ Basic parameters saved`);
            } catch (error) {
                console.log(`   ❌ Parameters failed: ${error.message}`);
            }

            // Step 5: Try to send some manual shots
            console.log('\n5️⃣ Adding manual shots...');
            try {
                const shots = [
                    { x: 200, y: 200, timestamp: Date.now(), score: 10, shotNumber: 1 },
                    { x: 195, y: 205, timestamp: Date.now() + 1000, score: 9, shotNumber: 2 },
                    { x: 205, y: 195, timestamp: Date.now() + 2000, score: 10, shotNumber: 3 }
                ];

                await this.makeRequest('POST', `/api/sessions/${session.id}/shots`, shots);
                console.log(`   ✅ Manual shots added: ${shots.length}`);
            } catch (error) {
                console.log(`   ❌ Shots failed: ${error.message}`);
            }

            // Step 6: Verify data
            console.log('\n6️⃣ Verifying session data...');
            try {
                const sessionData = await this.makeRequest('GET', `/api/sessions/${session.id}`);
                console.log(`   ✅ Session retrieved: ${sessionData.session_name}`);

                const shots = await this.makeRequest('GET', `/api/sessions/${session.id}/shots`);
                console.log(`   ✅ Shots retrieved: ${shots.length} shots`);

                if (shots.length > 0) {
                    console.log(`   📊 Sample shot: (${shots[0].x_coordinate}, ${shots[0].y_coordinate})`);
                }
            } catch (error) {
                console.log(`   ❌ Verification failed: ${error.message}`);
            }

            // Step 7: Test IR Grid simulation endpoint
            console.log('\n7️⃣ Testing IR Grid simulation...');
            try {
                const simResult = await this.makeRequest('POST', '/api/ir-grid/simulate-shot', {
                    x: 150,
                    y: 180
                });
                console.log(`   ✅ IR Grid simulation works: ${simResult.message}`);
            } catch (error) {
                console.log(`   ❌ IR Grid simulation failed: ${error.message}`);
                console.log(`   💡 This means IR Grid service is not enabled`);
            }

            console.log('\n📋 Test Results Summary:');
            console.log('========================');
            console.log(`✅ Shooter ID: ${shooter.id}`);
            console.log(`✅ Session ID: ${session.id}`);
            console.log(`🔗 View in browser: http://localhost:5173/session-details/${session.id}`);

            console.log('\n🎯 Manual Testing Steps:');
            console.log('========================');
            console.log('1. Open browser: http://localhost:5173');
            console.log('2. Go to Shooter Profile page');
            console.log('3. Look for "Simple IR Test" shooter');
            console.log('4. Click on the session to view details');
            console.log('5. Verify shots appear in the session details');

        } catch (error) {
            console.error('\n❌ Test failed:', error.message);
        }
    }

    async testIRGridDirectly() {
        console.log('\n🔌 Testing IR Grid Endpoints Directly');
        console.log('=====================================');

        const endpoints = [
            { method: 'GET', path: '/api/ir-grid/status', name: 'Status Check' },
            { method: 'POST', path: '/api/ir-grid/simulate-shot', name: 'Single Shot', data: { x: 200, y: 200 } },
            { method: 'GET', path: '/api/ir-grid/simulate-status', name: 'Simulation Status' }
        ];

        for (const endpoint of endpoints) {
            try {
                console.log(`\n🧪 Testing ${endpoint.name}...`);
                const result = await this.makeRequest(endpoint.method, endpoint.path, endpoint.data);
                console.log(`   ✅ ${endpoint.name} works:`, JSON.stringify(result, null, 2));
            } catch (error) {
                console.log(`   ❌ ${endpoint.name} failed: ${error.message}`);
            }
        }
    }
}

async function main() {
    const tester = new SimpleIRTest();
    
    console.log('🎯 Simple IR Grid Testing');
    console.log('=========================');
    console.log('This will test basic functionality and show you what works\n');

    await tester.testBasicFunctionality();
    await tester.testIRGridDirectly();

    console.log('\n✅ Testing Complete!');
    console.log('\n💡 Next Steps:');
    console.log('1. If basic functionality works, the database and API are fine');
    console.log('2. If IR Grid endpoints fail, the IR Grid service needs to be enabled');
    console.log('3. Check server logs for IR Grid initialization messages');
    console.log('4. Verify .env file has IR_GRID_ENABLED=true');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = SimpleIRTest;
