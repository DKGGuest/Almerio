/**
 * WebSocket Client Service for Real-Time Communication
 * Handles real-time communication with the server for IR grid shots and other events
 */

class WebSocketClientService {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.eventHandlers = new Map();
        this.subscriptions = new Set();
        this.sessionId = null;
        this.laneId = null;
        this.clientId = null;
    }

    /**
     * Connect to WebSocket server
     * @param {string} url - WebSocket server URL
     */
    connect(url = null) {
        try {
            // Determine WebSocket URL
            if (!url) {
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                // Connect to backend server on port 3001, not frontend port
                url = `${protocol}//localhost:3001/ws`;
            }

            console.log('🔌 Connecting to WebSocket:', url);
            
            this.ws = new WebSocket(url);
            this.setupEventHandlers();
            
            return true;
        } catch (error) {
            console.error('❌ Failed to connect to WebSocket:', error);
            return false;
        }
    }

    /**
     * Set up WebSocket event handlers
     */
    setupEventHandlers() {
        this.ws.onopen = () => {
            console.log('✅ WebSocket connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.emit('connected');
        };

        this.ws.onclose = (event) => {
            console.log('🔌 WebSocket disconnected:', event.code, event.reason);
            this.isConnected = false;
            this.emit('disconnected', event);
            
            // Attempt to reconnect
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.scheduleReconnect();
            }
        };

        this.ws.onerror = (error) => {
            console.error('❌ WebSocket error:', error);
            this.emit('error', error);
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleMessage(message);
            } catch (error) {
                console.error('❌ Error parsing WebSocket message:', error);
            }
        };
    }

    /**
     * Handle incoming WebSocket messages
     * @param {Object} message - Parsed message object
     */
    handleMessage(message) {
        console.log('📨 WebSocket message received:', message);

        switch (message.type) {
            case 'connected':
                this.clientId = message.clientId;
                console.log(`🆔 Client ID assigned: ${this.clientId}`);
                break;
            
            case 'irShot':
                this.emit('irShot', message.shot);
                break;
            
            case 'sessionShot':
                this.emit('sessionShot', message.sessionId, message.shot);
                break;
            
            case 'irGridStatus':
                this.emit('irGridStatus', message.status, message);
                break;
            
            case 'ping':
                this.send({ type: 'pong', timestamp: Date.now() });
                break;
            
            case 'pong':
                // Handle pong response
                break;
            
            default:
                this.emit('message', message);
        }
    }

    /**
     * Send message to server
     * @param {Object} message - Message to send
     */
    send(message) {
        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(JSON.stringify(message));
                return true;
            } catch (error) {
                console.error('❌ Error sending WebSocket message:', error);
                return false;
            }
        }
        console.warn('⚠️ WebSocket not connected, message not sent:', message);
        return false;
    }

    /**
     * Subscribe to specific events
     * @param {Array} events - Array of event names to subscribe to
     */
    subscribe(events) {
        events.forEach(event => this.subscriptions.add(event));
        
        this.send({
            type: 'subscribe',
            events: events
        });
    }

    /**
     * Unsubscribe from specific events
     * @param {Array} events - Array of event names to unsubscribe from
     */
    unsubscribe(events) {
        events.forEach(event => this.subscriptions.delete(event));
        
        this.send({
            type: 'unsubscribe',
            events: events
        });
    }

    /**
     * Join a shooting session
     * @param {string} sessionId - Session ID
     * @param {string} laneId - Lane ID
     */
    joinSession(sessionId, laneId = null) {
        this.sessionId = sessionId;
        this.laneId = laneId;
        
        this.send({
            type: 'joinSession',
            sessionId: sessionId,
            laneId: laneId
        });
    }

    /**
     * Leave current session
     */
    leaveSession() {
        if (this.sessionId) {
            this.send({
                type: 'leaveSession',
                sessionId: this.sessionId,
                laneId: this.laneId
            });
            
            this.sessionId = null;
            this.laneId = null;
        }
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} handler - Event handler function
     */
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} handler - Event handler function to remove
     */
    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    /**
     * Emit event to registered handlers
     * @param {string} event - Event name
     * @param {...any} args - Arguments to pass to handlers
     */
    emit(event, ...args) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(...args);
                } catch (error) {
                    console.error(`❌ Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Schedule reconnection attempt
     */
    scheduleReconnect() {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        
        console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
        
        setTimeout(() => {
            if (!this.isConnected) {
                console.log(`🔄 Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
                this.connect();
            }
        }, delay);
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        if (this.ws) {
            console.log('🔌 Disconnecting WebSocket...');
            this.ws.close();
            this.ws = null;
            this.isConnected = false;
            this.clientId = null;
            this.sessionId = null;
            this.laneId = null;
        }
    }

    /**
     * Get connection status
     * @returns {boolean} Connection status
     */
    getConnectionStatus() {
        return this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    /**
     * Get client information
     * @returns {Object} Client information
     */
    getClientInfo() {
        return {
            clientId: this.clientId,
            isConnected: this.isConnected,
            sessionId: this.sessionId,
            laneId: this.laneId,
            subscriptions: Array.from(this.subscriptions),
            reconnectAttempts: this.reconnectAttempts
        };
    }
}

// Export singleton instance
const websocketClientService = new WebSocketClientService();
export default websocketClientService;
