#!/usr/bin/env node

/**
 * Convert CA Certificate to Base64 for Vercel Environment Variables
 * 
 * Usage:
 *   node convert_cert_to_base64.js <path-to-ca.pem>
 * 
 * Example:
 *   node convert_cert_to_base64.js certs/ca.pem
 */

const fs = require('fs');
const path = require('path');

// Get certificate file path from command line argument
const certPath = process.argv[2];

if (!certPath) {
    console.error('❌ Error: Please provide the path to your CA certificate file');
    console.log('\nUsage:');
    console.log('  node convert_cert_to_base64.js <path-to-ca.pem>');
    console.log('\nExample:');
    console.log('  node convert_cert_to_base64.js certs/ca.pem');
    console.log('  node convert_cert_to_base64.js ../ca.pem');
    process.exit(1);
}

// Resolve the full path
const fullPath = path.resolve(certPath);

// Check if file exists
if (!fs.existsSync(fullPath)) {
    console.error(`❌ Error: Certificate file not found at: ${fullPath}`);
    process.exit(1);
}

try {
    // Read the certificate file
    const certContent = fs.readFileSync(fullPath, 'utf-8');
    
    // Convert to base64
    const base64Cert = Buffer.from(certContent, 'utf-8').toString('base64');
    
    console.log('✅ Certificate successfully converted to base64!\n');
    console.log('📋 Copy the following value and paste it as the DB_CA_CERT environment variable in Vercel:\n');
    console.log('─'.repeat(80));
    console.log(base64Cert);
    console.log('─'.repeat(80));
    console.log('\n📝 Steps to add to Vercel:');
    console.log('1. Go to your Vercel project dashboard');
    console.log('2. Navigate to Settings → Environment Variables');
    console.log('3. Add a new variable:');
    console.log('   - Name: DB_CA_CERT');
    console.log('   - Value: <paste the base64 string above>');
    console.log('   - Environment: Production, Preview, Development (select all)');
    console.log('4. Click "Save"\n');
    
    // Also save to a file for reference
    const outputFile = path.join(path.dirname(fullPath), 'ca_base64.txt');
    fs.writeFileSync(outputFile, base64Cert);
    console.log(`💾 Base64 certificate also saved to: ${outputFile}\n`);
    
} catch (error) {
    console.error('❌ Error converting certificate:', error.message);
    process.exit(1);
}

