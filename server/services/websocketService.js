/**
 * WebSocket Service for Real-Time Communication
 * Handles real-time communication between server and clients
 * Used for IR grid shot visualization and other real-time features
 */

const WebSocket = require('ws');
const EventEmitter = require('events');

class WebSocketService extends EventEmitter {
    constructor() {
        super();
        this.wss = null;
        this.clients = new Map(); // Store client connections with metadata
        this.isInitialized = false;
    }

    /**
     * Initialize WebSocket server
     * @param {Object} server - HTTP server instance
     * @param {Object} options - WebSocket server options
     */
    initialize(server, options = {}) {
        try {
            console.log('🔌 Initializing WebSocket service...');
            
            this.wss = new WebSocket.Server({ 
                server,
                path: '/ws',
                ...options 
            });

            this.setupEventHandlers();
            this.isInitialized = true;
            
            console.log('✅ WebSocket service initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize WebSocket service:', error);
            return false;
        }
    }

    /**
     * Set up WebSocket event handlers
     */
    setupEventHandlers() {
        this.wss.on('connection', (ws, request) => {
            const clientId = this.generateClientId();
            console.log(`🔗 New WebSocket client connected: ${clientId}`);
            
            // Store client with metadata
            this.clients.set(clientId, {
                ws: ws,
                id: clientId,
                connectedAt: Date.now(),
                subscriptions: new Set(),
                sessionId: null,
                laneId: null
            });

            // Set up client event handlers
            this.setupClientHandlers(clientId, ws);
            
            // Send welcome message
            this.sendToClient(clientId, {
                type: 'connected',
                clientId: clientId,
                timestamp: Date.now()
            });

            this.emit('clientConnected', clientId);
        });

        this.wss.on('error', (error) => {
            console.error('❌ WebSocket server error:', error);
            this.emit('error', error);
        });
    }

    /**
     * Set up individual client event handlers
     * @param {string} clientId - Client ID
     * @param {WebSocket} ws - WebSocket connection
     */
    setupClientHandlers(clientId, ws) {
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.handleClientMessage(clientId, message);
            } catch (error) {
                console.error(`❌ Error parsing message from client ${clientId}:`, error);
            }
        });

        ws.on('close', () => {
            console.log(`🔌 Client disconnected: ${clientId}`);
            this.clients.delete(clientId);
            this.emit('clientDisconnected', clientId);
        });

        ws.on('error', (error) => {
            console.error(`❌ Client ${clientId} error:`, error);
            this.clients.delete(clientId);
        });

        ws.on('pong', () => {
            // Update last pong time for heartbeat
            const client = this.clients.get(clientId);
            if (client) {
                client.lastPong = Date.now();
            }
        });
    }

    /**
     * Handle incoming messages from clients
     * @param {string} clientId - Client ID
     * @param {Object} message - Parsed message object
     */
    handleClientMessage(clientId, message) {
        const client = this.clients.get(clientId);
        if (!client) return;

        console.log(`📨 Message from client ${clientId}:`, message);

        switch (message.type) {
            case 'subscribe':
                this.handleSubscription(clientId, message);
                break;
            
            case 'unsubscribe':
                this.handleUnsubscription(clientId, message);
                break;
            
            case 'joinSession':
                this.handleJoinSession(clientId, message);
                break;
            
            case 'leaveSession':
                this.handleLeaveSession(clientId, message);
                break;
            
            case 'ping':
                this.sendToClient(clientId, { type: 'pong', timestamp: Date.now() });
                break;
            
            default:
                console.warn(`⚠️ Unknown message type from client ${clientId}:`, message.type);
        }

        this.emit('clientMessage', clientId, message);
    }

    /**
     * Handle client subscription to events
     * @param {string} clientId - Client ID
     * @param {Object} message - Subscription message
     */
    handleSubscription(clientId, message) {
        const client = this.clients.get(clientId);
        if (!client) return;

        const { events = [] } = message;
        events.forEach(event => {
            client.subscriptions.add(event);
            console.log(`📡 Client ${clientId} subscribed to: ${event}`);
        });

        this.sendToClient(clientId, {
            type: 'subscribed',
            events: events,
            timestamp: Date.now()
        });
    }

    /**
     * Handle client unsubscription from events
     * @param {string} clientId - Client ID
     * @param {Object} message - Unsubscription message
     */
    handleUnsubscription(clientId, message) {
        const client = this.clients.get(clientId);
        if (!client) return;

        const { events = [] } = message;
        events.forEach(event => {
            client.subscriptions.delete(event);
            console.log(`📡 Client ${clientId} unsubscribed from: ${event}`);
        });

        this.sendToClient(clientId, {
            type: 'unsubscribed',
            events: events,
            timestamp: Date.now()
        });
    }

    /**
     * Handle client joining a session
     * @param {string} clientId - Client ID
     * @param {Object} message - Join session message
     */
    handleJoinSession(clientId, message) {
        const client = this.clients.get(clientId);
        if (!client) return;

        const { sessionId, laneId } = message;
        client.sessionId = sessionId;
        client.laneId = laneId;

        console.log(`🎯 Client ${clientId} joined session: ${sessionId} (lane: ${laneId})`);

        this.sendToClient(clientId, {
            type: 'sessionJoined',
            sessionId: sessionId,
            laneId: laneId,
            timestamp: Date.now()
        });
    }

    /**
     * Handle client leaving a session
     * @param {string} clientId - Client ID
     * @param {Object} message - Leave session message
     */
    handleLeaveSession(clientId, message) {
        const client = this.clients.get(clientId);
        if (!client) return;

        const oldSessionId = client.sessionId;
        const oldLaneId = client.laneId;
        
        client.sessionId = null;
        client.laneId = null;

        console.log(`🚪 Client ${clientId} left session: ${oldSessionId}`);

        this.sendToClient(clientId, {
            type: 'sessionLeft',
            sessionId: oldSessionId,
            laneId: oldLaneId,
            timestamp: Date.now()
        });
    }

    /**
     * Send message to specific client
     * @param {string} clientId - Client ID
     * @param {Object} message - Message to send
     */
    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            try {
                client.ws.send(JSON.stringify(message));
                return true;
            } catch (error) {
                console.error(`❌ Error sending message to client ${clientId}:`, error);
                return false;
            }
        }
        return false;
    }

    /**
     * Broadcast message to all connected clients
     * @param {Object} message - Message to broadcast
     * @param {Function} filter - Optional filter function to select clients
     */
    broadcast(message, filter = null) {
        let sentCount = 0;
        const totalClients = this.clients.size;
        let filteredClients = 0;

        console.log(`📡 Broadcasting to ${totalClients} total clients...`);

        for (const [clientId, client] of this.clients.entries()) {
            if (filter && !filter(client)) {
                continue;
            }
            filteredClients++;

            console.log(`📡 Attempting to send to client ${clientId}, readyState: ${client.ws.readyState}`);

            if (this.sendToClient(clientId, message)) {
                sentCount++;
                console.log(`✅ Successfully sent to client ${clientId}`);
            } else {
                console.log(`❌ Failed to send to client ${clientId}`);
            }
        }

        console.log(`📡 Broadcast summary: ${totalClients} total, ${filteredClients} passed filter, ${sentCount} sent successfully`);
        return sentCount;
    }

    /**
     * Broadcast to clients subscribed to specific event
     * @param {string} eventType - Event type
     * @param {Object} message - Message to send
     */
    broadcastToSubscribers(eventType, message) {
        return this.broadcast(message, (client) => {
            return client.subscriptions.has(eventType);
        });
    }

    /**
     * Broadcast to clients in specific session
     * @param {string} sessionId - Session ID
     * @param {Object} message - Message to send
     */
    broadcastToSession(sessionId, message) {
        return this.broadcast(message, (client) => {
            return client.sessionId === sessionId;
        });
    }

    /**
     * Broadcast to clients in specific lane
     * @param {string} laneId - Lane ID
     * @param {Object} message - Message to send
     */
    broadcastToLane(laneId, message) {
        return this.broadcast(message, (client) => {
            return client.laneId === laneId;
        });
    }

    /**
     * Send IR shot data to relevant clients
     * @param {string} sessionId - Session ID
     * @param {Object} shotData - Shot data
     */
    sendIRShot(sessionId, shotData) {
        const message = {
            type: 'irShot',
            sessionId: sessionId,
            shot: shotData,
            timestamp: Date.now()
        };

        // Send to session clients and IR shot subscribers
        const sessionCount = this.broadcastToSession(sessionId, message);
        const subscriberCount = this.broadcastToSubscribers('irShots', message);
        
        console.log(`🎯 IR shot sent to ${sessionCount} session clients and ${subscriberCount} subscribers`);
        return sessionCount + subscriberCount;
    }

    /**
     * Generate unique client ID
     * @returns {string} Unique client ID
     */
    generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    /**
     * Get connected client count
     * @returns {number} Number of connected clients
     */
    getClientCount() {
        return this.clients.size;
    }

    /**
     * Get client information
     * @param {string} clientId - Client ID
     * @returns {Object|null} Client information or null if not found
     */
    getClientInfo(clientId) {
        const client = this.clients.get(clientId);
        if (!client) return null;

        return {
            id: client.id,
            connectedAt: client.connectedAt,
            subscriptions: Array.from(client.subscriptions),
            sessionId: client.sessionId,
            laneId: client.laneId,
            isConnected: client.ws.readyState === WebSocket.OPEN
        };
    }

    /**
     * Start heartbeat to keep connections alive
     */
    startHeartbeat(interval = 30000) {
        setInterval(() => {
            this.broadcast({ type: 'ping', timestamp: Date.now() });
        }, interval);
    }

    /**
     * Close WebSocket service
     */
    close() {
        if (this.wss) {
            console.log('🔌 Closing WebSocket service...');
            this.wss.close();
            this.clients.clear();
            this.isInitialized = false;
            console.log('✅ WebSocket service closed');
        }
    }
}

// Export singleton instance
const websocketService = new WebSocketService();
module.exports = websocketService;
