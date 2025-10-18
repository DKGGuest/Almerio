/**
 * IR Grid End-to-End Test Simulator
 * 
 * This script simulates a complete IR Grid shooting session with realistic data
 * including multiple shots with timestamps, real-time display, and database storage.
 */

const irGridService = require('./services/irGridService');
const websocketService = require('./services/websocketService');
const { db } = require('./database_config');

class IRGridSimulator {
    constructor() {
        this.isRunning = false;
        this.currentSessionId = null;
        this.shotCount = 0;
        this.simulationInterval = null;
    }

    /**
     * Generate realistic shooting patterns
     */
    generateShootingPattern() {
        const patterns = [
            // Bullseye grouping (tight center shots)
            { name: 'Bullseye Group', shots: [
                { x: 200, y: 200 }, { x: 195, y: 205 }, { x: 205, y: 195 },
                { x: 198, y: 202 }, { x: 202, y: 198 }, { x: 200, y: 203 }
            ]},
            
            // Vertical line (sight adjustment)
            { name: 'Vertical Line', shots: [
                { x: 200, y: 150 }, { x: 200, y: 170 }, { x: 200, y: 190 },
                { x: 200, y: 210 }, { x: 200, y: 230 }, { x: 200, y: 250 }
            ]},
            
            // Horizontal spread
            { name: 'Horizontal Spread', shots: [
                { x: 150, y: 200 }, { x: 170, y: 200 }, { x: 190, y: 200 },
                { x: 210, y: 200 }, { x: 230, y: 200 }, { x: 250, y: 200 }
            ]},
            
            // Corner shots (testing range)
            { name: 'Corner Test', shots: [
                { x: 100, y: 100 }, { x: 300, y: 100 }, { x: 100, y: 300 },
                { x: 300, y: 300 }, { x: 200, y: 200 }, { x: 150, y: 250 }
            ]},
            
            // Random grouping (realistic shooting)
            { name: 'Random Group', shots: [
                { x: 180, y: 190 }, { x: 220, y: 210 }, { x: 195, y: 225 },
                { x: 205, y: 185 }, { x: 215, y: 205 }, { x: 185, y: 215 },
                { x: 200, y: 200 }, { x: 190, y: 195 }
            ]}
        ];

        return patterns[Math.floor(Math.random() * patterns.length)];
    }

    /**
     * Start a complete IR Grid simulation session
     */
    async startSimulation(sessionId, options = {}) {
        try {
            console.log(`🎯 Starting IR Grid simulation for session ${sessionId}`);
            
            this.currentSessionId = sessionId;
            this.shotCount = 0;
            this.isRunning = true;

            // Get shooting pattern
            const pattern = this.generateShootingPattern();
            console.log(`📊 Using pattern: ${pattern.name} (${pattern.shots.length} shots)`);

            // Initialize IR Grid service for this session
            await irGridService.startSession(sessionId, {
                firingMode: 'ir-grid',
                sessionType: 'practice',
                startedAt: Date.now()
            });

            // Send shots with realistic timing
            const shotInterval = options.shotInterval || 2000; // 2 seconds between shots
            let shotIndex = 0;

            this.simulationInterval = setInterval(async () => {
                if (shotIndex >= pattern.shots.length || !this.isRunning) {
                    await this.completeSimulation();
                    return;
                }

                const shot = pattern.shots[shotIndex];
                await this.sendSimulatedShot(shot.x, shot.y);
                shotIndex++;

            }, shotInterval);

            console.log(`⏱️  Simulation started - shots will be sent every ${shotInterval}ms`);
            console.log(`🎯 Total shots to send: ${pattern.shots.length}`);
            
            return {
                success: true,
                sessionId: sessionId,
                pattern: pattern.name,
                totalShots: pattern.shots.length,
                interval: shotInterval
            };

        } catch (error) {
            console.error('❌ Error starting IR Grid simulation:', error);
            this.isRunning = false;
            throw error;
        }
    }

    /**
     * Send a simulated shot with realistic data
     */
    async sendSimulatedShot(x, y) {
        try {
            this.shotCount++;
            const timestamp = Date.now();
            
            // Create realistic shot data
            const shotData = {
                x: x,
                y: y,
                timestamp: timestamp,
                sessionId: this.currentSessionId,
                rawData: `${x},${y},${timestamp}`,
                shotNumber: this.shotCount
            };

            console.log(`🎯 Shot ${this.shotCount}: X=${x}, Y=${y} at ${new Date(timestamp).toLocaleTimeString()}`);

            // Emit shot through IR Grid service (simulates hardware detection)
            irGridService.emit('sessionShot', this.currentSessionId, shotData);

            // Also emit general shot event for WebSocket broadcasting
            irGridService.emit('shot', shotData);

            return shotData;

        } catch (error) {
            console.error('❌ Error sending simulated shot:', error);
            throw error;
        }
    }

    /**
     * Complete the simulation session
     */
    async completeSimulation() {
        try {
            if (!this.isRunning) return;

            console.log(`🏁 Completing IR Grid simulation for session ${this.currentSessionId}`);
            console.log(`📊 Total shots sent: ${this.shotCount}`);

            // Clear interval
            if (this.simulationInterval) {
                clearInterval(this.simulationInterval);
                this.simulationInterval = null;
            }

            // Stop IR Grid session
            const sessionData = await irGridService.stopSession(this.currentSessionId);

            // Broadcast completion
            websocketService.broadcast({
                type: 'irGridSimulationComplete',
                sessionId: this.currentSessionId,
                totalShots: this.shotCount,
                timestamp: Date.now()
            });

            this.isRunning = false;
            this.currentSessionId = null;

            console.log(`✅ IR Grid simulation completed successfully`);
            console.log(`💾 Session data saved with ${this.shotCount} shots`);

            return {
                success: true,
                totalShots: this.shotCount,
                sessionData: sessionData
            };

        } catch (error) {
            console.error('❌ Error completing simulation:', error);
            this.isRunning = false;
            throw error;
        }
    }

    /**
     * Stop simulation manually
     */
    async stopSimulation() {
        if (this.isRunning) {
            console.log('🛑 Manually stopping IR Grid simulation...');
            await this.completeSimulation();
        }
    }

    /**
     * Get simulation status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            currentSessionId: this.currentSessionId,
            shotCount: this.shotCount,
            hasInterval: !!this.simulationInterval
        };
    }

    /**
     * Send a batch of shots quickly (for testing)
     */
    async sendBatchShots(sessionId, count = 5) {
        try {
            console.log(`🚀 Sending batch of ${count} shots for session ${sessionId}`);
            
            this.currentSessionId = sessionId;
            this.shotCount = 0;

            // Initialize session
            await irGridService.startSession(sessionId, {
                firingMode: 'ir-grid',
                sessionType: 'practice',
                startedAt: Date.now()
            });

            // Send shots rapidly
            for (let i = 0; i < count; i++) {
                const x = 150 + Math.random() * 100; // Random around center
                const y = 150 + Math.random() * 100;
                
                await this.sendSimulatedShot(Math.round(x), Math.round(y));
                
                // Small delay between shots
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Complete session
            await this.completeSimulation();

            return {
                success: true,
                sessionId: sessionId,
                shotsSent: count
            };

        } catch (error) {
            console.error('❌ Error sending batch shots:', error);
            throw error;
        }
    }
}

// Export singleton instance
const irGridSimulator = new IRGridSimulator();
module.exports = irGridSimulator;
