/**
 * IR Grid UART Communication Service
 * Handles communication with IR grid hardware via UART/Serial port
 * Receives X,Y coordinates and timestamps from IR grid system
 */

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

class IRGridService extends EventEmitter {
    constructor() {
        super();
        this.port = null;
        this.parser = null;
        this.isConnected = false;
        this.sessionData = new Map(); // Store session data by sessionId
        this.dataDirectory = path.join(__dirname, '../data/ir-sessions');
        
        // Ensure data directory exists
        this.ensureDataDirectory();
    }

    /**
     * Initialize the IR Grid service with serial port configuration
     * @param {Object} config - Serial port configuration
     * @param {string} config.portPath - Serial port path (e.g., 'COM3', '/dev/ttyUSB0')
     * @param {number} config.baudRate - Baud rate (default: 9600)
     */
    async initialize(config = {}) {
        const { portPath = 'COM13', baudRate = 9600 } = config;
        
        try {
            console.log(`🔌 Initializing IR Grid service on port ${portPath} at ${baudRate} baud`);
            
            // Create serial port connection
            this.port = new SerialPort({
                path: portPath,
                baudRate: baudRate,
                dataBits: 8,
                parity: 'none',
                stopBits: 1,
                flowControl: false
            });

            // Create parser for line-based data
            this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));

            // Set up event handlers
            this.setupEventHandlers();

            console.log('✅ IR Grid service initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize IR Grid service:', error);
            return false;
        }
    }

    /**
     * Set up event handlers for serial port communication
     */
    setupEventHandlers() {
        // Port opened
        this.port.on('open', () => {
            console.log('🔗 IR Grid serial port opened');
            this.isConnected = true;
            this.emit('connected');
        });

        // Port closed
        this.port.on('close', () => {
            console.log('🔌 IR Grid serial port closed');
            this.isConnected = false;
            this.emit('disconnected');
        });

        // Port error
        this.port.on('error', (error) => {
            console.error('❌ IR Grid serial port error:', error);
            this.isConnected = false;
            this.emit('error', error);
        });

        // Data received
        this.parser.on('data', (data) => {
            this.handleIncomingData(data.toString().trim());
        });
    }

    /**
     * Handle incoming data from IR grid
     * Expected format: "X,Y,TIMESTAMP" or "X:Y:TIMESTAMP"
     * @param {string} rawData - Raw data string from UART
     */
    handleIncomingData(rawData) {
        try {
            console.log('📡 IR Grid data received:', rawData);

            // Parse the incoming data
            const shotData = this.parseIRData(rawData);
            
            if (shotData) {
                console.log('🎯 Parsed IR shot:', shotData);
                
                // Emit shot event for real-time processing
                this.emit('shot', shotData);
                
                // Store shot data for active sessions
                this.storeShot(shotData);
            }
        } catch (error) {
            console.error('❌ Error handling IR grid data:', error);
        }
    }

    /**
     * Parse IR grid data string into shot coordinates and timestamp
     * @param {string} data - Raw data string
     * @returns {Object|null} Parsed shot data or null if invalid
     */
    parseIRData(data) {
        try {
            console.log('🔍 Parsing IR data:', data);

            // Handle ESP32 Bluetooth format: "Bullet Hit Coordinate (X, Y) at Time: HH:MM:SS Date: DD/MM/YYYY"
            // More flexible regex to handle various spacing and formats
            if (data.includes('Bullet Hit Coordinate')) {
                console.log('🔍 Attempting to parse ESP32 format...');

                // Extract coordinates using a more flexible approach
                const coordMatch = data.match(/\((\d+),\s*(\d+)\)/);
                if (coordMatch) {
                    const x = parseFloat(coordMatch[1]);
                    const y = parseFloat(coordMatch[2]);

                    console.log('📡 ESP32 Bluetooth format detected:', { x, y, rawData: data });

                    if (!isNaN(x) && !isNaN(y)) {
                        return {
                            x: x,
                            y: y,
                            timestamp: Date.now(), // Use current timestamp for real-time processing
                            rawData: data,
                            source: 'ESP32_Bluetooth',
                            receivedAt: Date.now()
                        };
                    }
                } else {
                    console.log('❌ Could not extract coordinates from ESP32 data');
                }
            }

            // Handle simple coordinate format: "X,Y" or "X,Y,TIMESTAMP"
            const separators = [',', ':', ';', '|'];
            let parts = null;

            for (const sep of separators) {
                if (data.includes(sep)) {
                    parts = data.split(sep);
                    break;
                }
            }

            if (parts && parts.length >= 2) {
                const x = parseFloat(parts[0]);
                const y = parseFloat(parts[1]);
                const timestamp = parts[2] ? parseInt(parts[2]) : Date.now();

                if (!isNaN(x) && !isNaN(y)) {
                    console.log('📡 Simple coordinate format detected:', { x, y, timestamp });
                    return {
                        x: x,
                        y: y,
                        timestamp: timestamp,
                        rawData: data,
                        source: 'Simple_Format',
                        receivedAt: Date.now()
                    };
                }
            }

            console.warn('⚠️ Unrecognized IR data format:', data);
            return null;
        } catch (error) {
            console.error('❌ Error parsing IR data:', error);
            return null;
        }
    }

    /**
     * Store shot data for active sessions
     * @param {Object} shotData - Parsed shot data
     */
    async storeShot(shotData) {
        try {
            // Store shot for all active IR sessions
            for (const [sessionId, sessionInfo] of this.sessionData.entries()) {
                if (sessionInfo.isActive && sessionInfo.firingMode === 'ir-grid') {
                    await this.addShotToSession(sessionId, shotData);
                }
            }
        } catch (error) {
            console.error('❌ Error storing IR shot:', error);
        }
    }

    /**
     * Start IR session for a specific session ID
     * @param {string} sessionId - Session ID
     * @param {Object} sessionInfo - Session information
     */
    async startSession(sessionId, sessionInfo = {}) {
        try {
            console.log(`🎯 Starting IR session: ${sessionId}`);
            
            const sessionData = {
                sessionId: sessionId,
                startTime: Date.now(),
                isActive: true,
                firingMode: sessionInfo.firingMode || 'ir-grid',
                shots: [],
                metadata: sessionInfo
            };

            this.sessionData.set(sessionId, sessionData);
            
            // Create session file
            await this.saveSessionToFile(sessionId, sessionData);
            
            console.log(`✅ IR session started: ${sessionId}`);
            this.emit('sessionStarted', sessionId, sessionData);
            
            return true;
        } catch (error) {
            console.error('❌ Error starting IR session:', error);
            return false;
        }
    }

    /**
     * Stop IR session
     * @param {string} sessionId - Session ID
     */
    async stopSession(sessionId) {
        try {
            const sessionData = this.sessionData.get(sessionId);
            if (sessionData) {
                sessionData.isActive = false;
                sessionData.endTime = Date.now();
                
                // Save final session data
                await this.saveSessionToFile(sessionId, sessionData);
                
                console.log(`🏁 IR session stopped: ${sessionId}`);
                this.emit('sessionStopped', sessionId, sessionData);
                
                return sessionData;
            }
            return null;
        } catch (error) {
            console.error('❌ Error stopping IR session:', error);
            return null;
        }
    }

    /**
     * Add shot to specific session
     * @param {string} sessionId - Session ID
     * @param {Object} shotData - Shot data
     */
    async addShotToSession(sessionId, shotData) {
        try {
            const sessionData = this.sessionData.get(sessionId);
            if (sessionData && sessionData.isActive) {
                const shot = {
                    ...shotData,
                    shotNumber: sessionData.shots.length + 1,
                    sessionId: sessionId
                };
                
                sessionData.shots.push(shot);
                
                // Save updated session data
                await this.saveSessionToFile(sessionId, sessionData);
                
                // Emit shot event with session context
                this.emit('sessionShot', sessionId, shot);
                
                console.log(`📊 Shot added to session ${sessionId}: ${shot.shotNumber}`);
                return shot;
            }
            return null;
        } catch (error) {
            console.error('❌ Error adding shot to session:', error);
            return null;
        }
    }

    /**
     * Get session data
     * @param {string} sessionId - Session ID
     * @returns {Object|null} Session data or null if not found
     */
    getSessionData(sessionId) {
        return this.sessionData.get(sessionId) || null;
    }

    /**
     * Get all active sessions
     * @returns {Array} Array of active session data
     */
    getActiveSessions() {
        return Array.from(this.sessionData.values()).filter(session => session.isActive);
    }

    /**
     * Save session data to JSON file
     * @param {string} sessionId - Session ID
     * @param {Object} sessionData - Session data
     */
    async saveSessionToFile(sessionId, sessionData) {
        try {
            const filename = `ir-session-${sessionId}.json`;
            const filepath = path.join(this.dataDirectory, filename);
            
            await fs.writeFile(filepath, JSON.stringify(sessionData, null, 2));
            console.log(`💾 Session data saved: ${filename}`);
        } catch (error) {
            console.error('❌ Error saving session file:', error);
        }
    }

    /**
     * Load session data from JSON file
     * @param {string} sessionId - Session ID
     * @returns {Object|null} Session data or null if not found
     */
    async loadSessionFromFile(sessionId) {
        try {
            const filename = `ir-session-${sessionId}.json`;
            const filepath = path.join(this.dataDirectory, filename);
            
            const data = await fs.readFile(filepath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.warn(`⚠️ Could not load session file for ${sessionId}:`, error.message);
            return null;
        }
    }

    /**
     * Ensure data directory exists
     */
    async ensureDataDirectory() {
        try {
            await fs.mkdir(this.dataDirectory, { recursive: true });
        } catch (error) {
            console.error('❌ Error creating data directory:', error);
        }
    }

    /**
     * Close the serial port connection
     */
    async close() {
        try {
            if (this.port && this.port.isOpen) {
                await new Promise((resolve) => {
                    this.port.close(resolve);
                });
                console.log('🔌 IR Grid service closed');
            }
        } catch (error) {
            console.error('❌ Error closing IR Grid service:', error);
        }
    }

    /**
     * Check if service is connected
     * @returns {boolean} Connection status
     */
    isServiceConnected() {
        return this.isConnected && this.port && this.port.isOpen;
    }

    /**
     * Send test data (for development/testing)
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    simulateShot(x, y) {
        const testData = `${x},${y},${Date.now()}`;
        console.log('🧪 Simulating IR shot:', testData);
        this.handleIncomingData(testData);
    }
}

// Export singleton instance
const irGridService = new IRGridService();
module.exports = irGridService;
