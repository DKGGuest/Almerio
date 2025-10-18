// ESP32 Communication Test Script
// This script will test communication with your ESP32 and help you send test data

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

console.log('🔍 ESP32 Communication Test');
console.log('============================');

// Configuration
const PORT_PATH = 'COM13';
const BAUD_RATE = 9600;

console.log(`📡 Connecting to ESP32 on: ${PORT_PATH} at ${BAUD_RATE} baud`);

// Connect to ESP32
const port = new SerialPort({
    path: PORT_PATH,
    baudRate: BAUD_RATE,
    dataBits: 8,
    stopBits: 1,
    parity: 'none'
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

port.on('open', () => {
    console.log('✅ ESP32 connected successfully!');
    console.log('👂 Listening for data from ESP32...');
    console.log('📤 You can also send test commands\n');
    
    // Send a test command to ESP32
    setTimeout(() => {
        console.log('📤 Sending test command to ESP32...');
        port.write('TEST\n');
    }, 2000);
    
    // Send simulated IR Grid data every 5 seconds
    setInterval(() => {
        const x = Math.floor(Math.random() * 400);
        const y = Math.floor(Math.random() * 400);
        const testData = `${x},${y}`;
        
        console.log(`📤 Sending test shot data: ${testData}`);
        port.write(testData + '\n');
    }, 5000);
});

port.on('error', (err) => {
    console.log(`❌ ESP32 connection error: ${err.message}`);
    
    if (err.message.includes('Access is denied')) {
        console.log('💡 Port may be in use by another application');
        console.log('💡 Close Arduino IDE Serial Monitor or other tools');
    } else if (err.message.includes('cannot open')) {
        console.log('💡 Check if ESP32 is properly connected');
        console.log('💡 Try pressing the RESET button on ESP32');
    }
    
    process.exit(1);
});

let dataCount = 0;

parser.on('data', (data) => {
    dataCount++;
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] 📨 ESP32 says: "${data.trim()}"`);
    
    // Try to parse as coordinate data
    const trimmed = data.trim();
    const coordMatch = trimmed.match(/^(\d+),(\d+)$/);
    
    if (coordMatch) {
        console.log(`   🎯 Shot detected: X=${coordMatch[1]}, Y=${coordMatch[2]}`);
    } else {
        console.log(`   💬 Message from ESP32: ${trimmed}`);
    }
    
    console.log(`   📊 Total messages: ${dataCount}\n`);
});

// Handle user input for sending commands
process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
        const command = chunk.trim();
        if (command) {
            console.log(`📤 Sending to ESP32: ${command}`);
            port.write(command + '\n');
        }
    }
});

console.log('\n💡 Commands you can try:');
console.log('  - Type "SHOT" to request a test shot');
console.log('  - Type "STATUS" to check ESP32 status');
console.log('  - Type "150,200" to send coordinate data');
console.log('  - Press Ctrl+C to exit\n');

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Disconnecting from ESP32...');
    console.log(`📊 Total messages received: ${dataCount}`);
    port.close();
    process.exit(0);
});
