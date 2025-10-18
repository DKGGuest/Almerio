// IR Grid Connection Test Script
// This script will help diagnose connection issues with your IR Grid device

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

console.log('🔍 IR Grid Connection Diagnostic Tool');
console.log('=====================================');

// Configuration
const PORT_PATH = 'COM13';
const BAUD_RATE = 9600;

console.log(`📡 Testing connection to: ${PORT_PATH} at ${BAUD_RATE} baud`);

// List all available ports first
SerialPort.list().then(ports => {
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
    
    // Try to connect
    console.log('\n🔌 Attempting to connect...');
    
    const port = new SerialPort({
        path: PORT_PATH,
        baudRate: BAUD_RATE,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
    });
    
    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
    
    port.on('open', () => {
        console.log('✅ Serial port opened successfully!');
        console.log('👂 Listening for data from IR Grid...');
        console.log('🎯 Fire through your IR Grid to test data reception');
        console.log('⏹️  Press Ctrl+C to stop\n');
    });
    
    port.on('error', (err) => {
        console.log(`❌ Serial port error: ${err.message}`);
        
        if (err.message.includes('Access is denied')) {
            console.log('💡 Port may be in use by another application');
            console.log('💡 Close any serial monitor tools and try again');
        } else if (err.message.includes('cannot open')) {
            console.log('💡 Check if device is properly connected');
            console.log('💡 Try unplugging and reconnecting the USB cable');
        }
        
        process.exit(1);
    });
    
    let dataReceived = false;
    let dataCount = 0;
    
    parser.on('data', (data) => {
        dataReceived = true;
        dataCount++;
        
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] 📨 Raw data received: "${data.trim()}"`);
        
        // Try to parse the data
        const trimmed = data.trim();
        const patterns = [
            { name: 'Comma', regex: /^(\d+),(\d+)$/ },
            { name: 'Colon', regex: /^(\d+):(\d+)$/ },
            { name: 'Semicolon', regex: /^(\d+);(\d+)$/ },
            { name: 'Pipe', regex: /^(\d+)\|(\d+)$/ },
            { name: 'Space', regex: /^(\d+)\s+(\d+)$/ }
        ];
        
        let parsed = false;
        for (const pattern of patterns) {
            const match = trimmed.match(pattern.regex);
            if (match) {
                console.log(`   ✅ Parsed as ${pattern.name} format: X=${match[1]}, Y=${match[2]}`);
                parsed = true;
                break;
            }
        }
        
        if (!parsed) {
            console.log(`   ⚠️  Unknown format - please check your IR Grid data format`);
        }
        
        console.log(`   📊 Total shots received: ${dataCount}\n`);
    });
    
    // Timeout check
    setTimeout(() => {
        if (!dataReceived) {
            console.log('⏰ No data received after 30 seconds');
            console.log('\n🔧 Troubleshooting suggestions:');
            console.log('1. Check if your IR Grid device is powered on');
            console.log('2. Verify the baud rate (try 9600, 38400, or 115200)');
            console.log('3. Check if device requires specific initialization commands');
            console.log('4. Try firing through the IR Grid to trigger data transmission');
            console.log('5. Consult your IR Grid device manual for data format');
        }
    }, 30000);
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n\n🛑 Stopping diagnostic tool...');
        if (dataReceived) {
            console.log(`✅ Successfully received ${dataCount} data packets`);
            console.log('🎯 Your IR Grid is working correctly!');
        } else {
            console.log('❌ No data was received from IR Grid');
        }
        port.close();
        process.exit(0);
    });
    
}).catch(err => {
    console.log(`❌ Error listing serial ports: ${err.message}`);
    process.exit(1);
});
