// Quick script to check COM port availability
const { SerialPort } = require('serialport');

async function checkCOMPorts() {
    console.log('🔍 Checking COM Port Availability');
    console.log('=================================');
    
    try {
        // List all available ports
        const ports = await SerialPort.list();
        console.log('\n📋 All Available Ports:');
        
        ports.forEach(port => {
            console.log(`   ${port.path} - ${port.manufacturer || 'Unknown'} - ${port.serialNumber || 'No S/N'}`);
            if (port.vendorId) console.log(`      Vendor ID: ${port.vendorId}, Product ID: ${port.productId}`);
        });
        
        // Check specific COM ports
        const testPorts = ['COM14', 'COM15'];
        
        console.log('\n🧪 Testing ESP32 COM Ports:');
        
        for (const portPath of testPorts) {
            console.log(`\n📡 Testing ${portPath}...`);
            
            // Check if port exists in the list
            const portExists = ports.find(p => p.path === portPath);
            if (!portExists) {
                console.log(`❌ ${portPath} not found in system port list`);
                continue;
            }
            
            console.log(`✅ ${portPath} found in system`);
            
            // Try to open the port
            try {
                const port = new SerialPort({
                    path: portPath,
                    baudRate: 115200,
                    autoOpen: false
                });
                
                await new Promise((resolve, reject) => {
                    port.open((err) => {
                        if (err) {
                            console.log(`❌ ${portPath} cannot be opened: ${err.message}`);
                            reject(err);
                        } else {
                            console.log(`✅ ${portPath} opened successfully`);
                            port.close();
                            resolve();
                        }
                    });
                });
                
            } catch (error) {
                console.log(`❌ ${portPath} error: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error checking ports:', error);
    }
}

checkCOMPorts();
