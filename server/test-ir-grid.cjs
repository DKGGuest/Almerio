// IR Grid Connection Test Script
// This script will help diagnose connection issues with your IR Grid device

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

console.log('🔍 IR Grid Connection Diagnostic Tool');
console.log('=====================================');

// Configuration
const PORT_PATH = 'COM13';
const BAUD_RATES = [9600, 115200, 38400, 19200, 57600]; // Try multiple baud rates

console.log(`📡 Testing connection to: ${PORT_PATH} with multiple baud rates`);

// Function to test a specific baud rate
async function testBaudRate(baudRate) {
    return new Promise((resolve) => {
        console.log(`\n🔍 Testing baud rate: ${baudRate}`);

        const port = new SerialPort({
            path: PORT_PATH,
            baudRate: baudRate,
            dataBits: 8,
            stopBits: 1,
            parity: 'none'
        });

        const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
        let dataReceived = false;

        port.on('open', () => {
            console.log(`   ✅ Port opened at ${baudRate} baud`);
        });

        port.on('error', (err) => {
            console.log(`   ❌ Error at ${baudRate} baud: ${err.message}`);
            resolve({ baudRate, success: false, error: err.message });
        });

        parser.on('data', (data) => {
            dataReceived = true;
            console.log(`   🎯 DATA FOUND at ${baudRate} baud: "${data.trim()}"`);
            port.close();
            resolve({ baudRate, success: true, data: data.trim() });
        });

        // Test for 5 seconds
        setTimeout(() => {
            if (!dataReceived) {
                console.log(`   ⏸️  No data at ${baudRate} baud`);
            }
            port.close();
            resolve({ baudRate, success: dataReceived, data: null });
        }, 5000);
    });
}

// List all available ports first
SerialPort.list().then(async ports => {
    console.log('\n📋 Available Serial Ports:');
    ports.forEach(port => {
        console.log(`  - ${port.path}: ${port.manufacturer || 'Unknown'} (${port.productId || 'N/A'})`);
    });
    
    // Check if our target port exists
    const targetPort = ports.find(port => port.path === PORT_PATH);
    if (!targetPort) {
        console.log(`\n❌ ERROR: Port ${PORT_PATH} not found!`);
        console.log('💡 Make sure your IR Grid device is connected and drivers are installed.');
        process.exit(1);
    }
    
    console.log(`\n✅ Target port ${PORT_PATH} found: ${targetPort.manufacturer || 'Unknown Device'}`);

    // Test all baud rates
    console.log('\n🔍 Testing multiple baud rates...');
    console.log('🎯 Please fire through your IR Grid during this test!\n');

    for (const baudRate of BAUD_RATES) {
        const result = await testBaudRate(baudRate);
        if (result.success && result.data) {
            console.log(`\n🎉 SUCCESS! Found working baud rate: ${result.baudRate}`);
            console.log(`📨 Data format: "${result.data}"`);
            console.log(`\n💡 Update your .env file with:`);
            console.log(`IR_GRID_BAUD_RATE=${result.baudRate}`);
            process.exit(0);
        }
    }

    console.log('\n❌ No data received at any baud rate');
    console.log('\n🔧 Possible issues:');
    console.log('1. IR Grid device is not powered on');
    console.log('2. Device requires initialization commands');
    console.log('3. Device only sends data when triggered (fire through it)');
    console.log('4. Different data format or protocol');
    console.log('5. Hardware malfunction');

    console.log('\n💡 Next steps:');
    console.log('1. Check device manual for initialization commands');
    console.log('2. Try firing through the IR Grid while running this test');
    console.log('3. Contact device manufacturer for support');
    
}).catch(err => {
    console.log(`❌ Error listing serial ports: ${err.message}`);
    process.exit(1);
});
