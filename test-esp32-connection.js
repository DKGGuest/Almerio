// Quick test to check ESP32 connection
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

console.log('🔍 Testing ESP32 Connection');
console.log('==========================');

// Test both COM ports
const testPorts = ['COM14', 'COM15'];

async function testPort(portPath) {
    return new Promise((resolve) => {
        console.log(`\n📡 Testing ${portPath}...`);
        
        try {
            const port = new SerialPort({
                path: portPath,
                baudRate: 9600,
                dataBits: 8,
                stopBits: 1,
                parity: 'none'
            });

            const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
            let dataReceived = false;

            port.on('open', () => {
                console.log(`✅ ${portPath} opened successfully`);
                console.log(`⏰ Listening for 10 seconds...`);
                
                // Close after 10 seconds
                setTimeout(() => {
                    if (!dataReceived) {
                        console.log(`⏰ ${portPath} - No data received in 10 seconds`);
                    }
                    port.close();
                }, 10000);
            });

            parser.on('data', (data) => {
                dataReceived = true;
                const trimmed = data.trim();
                console.log(`📨 ${portPath} received: "${trimmed}"`);
                
                if (trimmed.includes('Bullet Hit Coordinate')) {
                    console.log(`🎯 ESP32 DATA FOUND ON ${portPath}!`);
                }
            });

            port.on('error', (error) => {
                console.log(`❌ ${portPath} error: ${error.message}`);
                resolve(false);
            });

            port.on('close', () => {
                console.log(`🔌 ${portPath} closed`);
                resolve(dataReceived);
            });

        } catch (error) {
            console.log(`❌ ${portPath} failed: ${error.message}`);
            resolve(false);
        }
    });
}

async function testAllPorts() {
    for (const port of testPorts) {
        const result = await testPort(port);
        if (result) {
            console.log(`\n🎯 SUCCESS! ESP32 is working on ${port}`);
            console.log(`📝 Your .env should use: IR_GRID_PORT=${port}`);
            return;
        }
        
        // Wait 2 seconds between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n❌ No ESP32 data found on any port');
    console.log('🔧 Try:');
    console.log('   1. Reconnect ESP32 Bluetooth');
    console.log('   2. Restart ESP32 device');
    console.log('   3. Check if ESP32 is sending data');
}

testAllPorts();
