// Test script to find the correct ESP32 Bluetooth COM port
// Run this while your ESP32 is sending data via Bluetooth

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

console.log('🔍 ESP32 Bluetooth COM Port Finder');
console.log('===================================');

// Function to test a specific COM port
async function testCOMPort(portPath) {
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
            let timeout;

            port.on('open', () => {
                console.log(`✅ ${portPath} opened successfully`);
                
                // Set timeout to close port after 5 seconds
                timeout = setTimeout(() => {
                    if (!dataReceived) {
                        console.log(`⏰ ${portPath} - No data received in 5 seconds`);
                    }
                    port.close();
                }, 5000);
            });

            parser.on('data', (data) => {
                dataReceived = true;
                const trimmed = data.trim();
                console.log(`📨 ${portPath} received: "${trimmed}"`);
                
                // Check if this looks like ESP32 data
                if (trimmed.includes('Bullet Hit Coordinate')) {
                    console.log(`🎯 FOUND ESP32 DATA ON ${portPath}!`);
                    console.log(`🎯 This is your ESP32 Bluetooth COM port!`);
                    clearTimeout(timeout);
                    port.close();
                    resolve(portPath);
                    return;
                }
            });

            port.on('error', (error) => {
                console.log(`❌ ${portPath} error: ${error.message}`);
                clearTimeout(timeout);
                resolve(null);
            });

            port.on('close', () => {
                console.log(`🔌 ${portPath} closed`);
                if (!dataReceived) {
                    resolve(null);
                } else if (!trimmed?.includes('Bullet Hit Coordinate')) {
                    resolve(null);
                }
            });

        } catch (error) {
            console.log(`❌ ${portPath} failed to open: ${error.message}`);
            resolve(null);
        }
    });
}

// Function to get available COM ports
async function getAvailablePorts() {
    try {
        const ports = await SerialPort.list();
        const comPorts = ports
            .filter(port => port.path.startsWith('COM'))
            .map(port => ({
                path: port.path,
                manufacturer: port.manufacturer || 'Unknown',
                serialNumber: port.serialNumber || 'Unknown'
            }));
        
        console.log('\n📋 Available COM Ports:');
        comPorts.forEach(port => {
            console.log(`   ${port.path} - ${port.manufacturer} (${port.serialNumber})`);
        });
        
        return comPorts.map(port => port.path);
    } catch (error) {
        console.error('❌ Error listing ports:', error);
        return [];
    }
}

// Main function to test all COM ports
async function findESP32Port() {
    console.log('🔍 Searching for ESP32 Bluetooth COM port...');
    console.log('📡 Make sure your ESP32 is connected and sending data!');
    
    const availablePorts = await getAvailablePorts();
    
    if (availablePorts.length === 0) {
        console.log('❌ No COM ports found!');
        return;
    }

    console.log(`\n🧪 Testing ${availablePorts.length} COM ports...`);
    console.log('⏰ Each port will be tested for 5 seconds');
    
    for (const portPath of availablePorts) {
        const result = await testCOMPort(portPath);
        if (result) {
            console.log(`\n🎯 SUCCESS! ESP32 found on ${result}`);
            console.log(`\n📝 Update your .env file with:`);
            console.log(`IR_GRID_ENABLED=true`);
            console.log(`IR_GRID_PORT=${result}`);
            console.log(`IR_GRID_BAUD_RATE=9600`);
            return;
        }
        
        // Wait 1 second between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n❌ ESP32 not found on any COM port');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Ensure ESP32 is connected via Bluetooth');
    console.log('   2. Ensure ESP32 is sending data');
    console.log('   3. Close any other apps using the COM port');
    console.log('   4. Try reconnecting ESP32 Bluetooth');
}

// Run the test
findESP32Port().catch(console.error);
