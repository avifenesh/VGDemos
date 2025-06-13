// Dual Chat Demo Application

// Main demo app controller
function demoApp() {
    return {
        init() {
            console.log('Demo app initialized');
        },

        clearAllMessages() {
            // Broadcast clear message to all chat windows
            window.dispatchEvent(new CustomEvent('demo-clear-all'));
        },

        resetDemo() {
            // Reset entire demo to initial state
            window.dispatchEvent(new CustomEvent('demo-reset'));
        },

        simulateNetworkIssue() {
            // Simulate network issue affecting all connections
            window.dispatchEvent(new CustomEvent('demo-network-issue'));
        }
    };
}

// Individual chat window component
function chatWindow(userId, initialClientType) {
    return {
        // State
        userId: userId,
        clientType: initialClientType,
        connected: false,
        subscribed: false,
        messages: [],
        newMessage: '',
        switching: false,
        ws: null,
        reconnectAttempts: 0,
        maxReconnectAttempts: 3,

        // Computed properties
        get nextClientType() {
            return this.clientType === 'node-redis' ? 'valkey-glide' : 'node-redis';
        },

        // Initialization
        initChat() {
            console.log(`Initializing chat for ${this.userId} with ${this.clientType}`);
            this.connectWebSocket();
            this.setupEventListeners();
        },

        setupEventListeners() {
            // Listen for global demo events
            window.addEventListener('demo-clear-all', () => {
                this.clearMessages();
            });

            window.addEventListener('demo-reset', () => {
                this.resetToInitialState();
            });

            window.addEventListener('demo-network-issue', () => {
                this.simulateFailure();
            });
        },

        // WebSocket connection management
        connectWebSocket() {
            const wsUrl = `ws://localhost:3000?userId=${this.userId}&clientType=${this.clientType}`;
            console.log(`[${this.userId}] Connecting to WebSocket: ${wsUrl}`);
            
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log(`[${this.userId}] WebSocket connected`);
                this.connected = true;
                this.subscribed = true; // Initially assume subscribed
                this.reconnectAttempts = 0;
                this.addSystemMessage('Connected to server');
            };
            
            this.ws.onclose = (event) => {
                console.log(`[${this.userId}] WebSocket disconnected`, event);
                this.connected = false;
                this.subscribed = false;
                this.addSystemMessage('Disconnected from server');
                
                // Auto-reconnect logic
                if (this.reconnectAttempts < this.maxReconnectAttempts && !event.wasClean) {
                    this.reconnectAttempts++;
                    this.addSystemMessage(`Reconnecting... (attempt ${this.reconnectAttempts})`);
                    setTimeout(() => this.connectWebSocket(), 2000);
                }
            };
            
            this.ws.onerror = (error) => {
                console.error(`[${this.userId}] WebSocket error:`, error);
                this.addSystemMessage('Connection error occurred');
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error(`[${this.userId}] Error parsing message:`, error);
                }
            };
        },

        // Message handling
        handleMessage(data) {
            console.log(`[${this.userId}] Received message:`, data);
            
            switch(data.type) {
                case 'chat-message':
                    this.addChatMessage(data.content, data.fromUser, data.timestamp, true);
                    break;
                case 'message-failed':
                    this.addChatMessage(data.content, data.fromUser, data.timestamp, false);
                    break;
                case 'connection-status':
                    this.connected = data.connected;
                    this.subscribed = data.subscribed;
                    break;
                case 'client-switched':
                    this.clientType = data.clientType;
                    this.switching = false;
                    this.addSystemMessage(`Switched to ${data.clientType}`);
                    break;
                case 'subscription-lost':
                    this.subscribed = false;
                    this.addSystemMessage('Subscription lost - messages may be missed');
                    break;
                case 'subscription-restored':
                    this.subscribed = true;
                    this.addSystemMessage('Subscription restored automatically');
                    break;
                case 'system':
                    this.addSystemMessage(data.message);
                    break;
                default:
                    console.warn(`[${this.userId}] Unknown message type:`, data.type);
            }
        },

        // Message management
        addChatMessage(content, fromUser, timestamp, delivered = true) {
            const message = {
                id: Date.now() + Math.random(),
                type: 'chat',
                content: content,
                fromUser: fromUser,
                time: this.formatTime(timestamp),
                delivered: delivered
            };
            
            this.messages.push(message);
            this.scrollToBottom();
        },

        addSystemMessage(content) {
            const message = {
                id: Date.now() + Math.random(),
                type: 'system',
                content: content,
                time: this.formatTime(new Date().toISOString()),
                delivered: true
            };
            
            this.messages.push(message);
            this.scrollToBottom();
        },

        formatTime(timestamp) {
            return new Date(timestamp).toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        scrollToBottom() {
            this.$nextTick(() => {
                const container = this.$refs[`messages${this.userId.charAt(this.userId.length - 1).toUpperCase()}`];
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            });
        },

        // User actions
        sendMessage() {
            if (this.ws && this.newMessage.trim() && this.connected) {
                const message = {
                    type: 'send-message',
                    content: this.newMessage,
                    fromUser: this.userId,
                    timestamp: new Date().toISOString()
                };
                
                console.log(`[${this.userId}] Sending message:`, message);
                this.ws.send(JSON.stringify(message));
                
                // Add to local messages immediately (optimistic update)
                this.addChatMessage(this.newMessage, this.userId, message.timestamp, this.connected && this.subscribed);
                this.newMessage = '';
            }
        },

        switchClient() {
            if (this.switching) return;
            
            this.switching = true;
            console.log(`[${this.userId}] Switching client from ${this.clientType} to ${this.nextClientType}`);
            
            if (this.ws && this.connected) {
                this.ws.send(JSON.stringify({
                    type: 'switch-client',
                    newClientType: this.nextClientType
                }));
            } else {
                // If not connected, switch immediately
                this.clientType = this.nextClientType;
                this.switching = false;
                this.addSystemMessage(`Switched to ${this.clientType}`);
            }
        },

        simulateFailure() {
            if (!this.connected) return;
            
            console.log(`[${this.userId}] Simulating failure for ${this.clientType}`);
            this.addSystemMessage(`Simulating ${this.clientType} connection failure...`);
            
            if (this.ws && this.connected) {
                this.ws.send(JSON.stringify({
                    type: 'simulate-failure'
                }));
            }
        },

        clearMessages() {
            console.log(`[${this.userId}] Clearing messages`);
            this.messages = [];
        },

        resetToInitialState() {
            console.log(`[${this.userId}] Resetting to initial state`);
            this.clearMessages();
            this.switching = false;
            this.reconnectAttempts = 0;
            
            // Reset client type to initial
            const initialType = this.userId === 'userA' ? 'node-redis' : 'valkey-glide';
            if (this.clientType !== initialType) {
                this.clientType = initialType;
                this.addSystemMessage(`Reset to ${this.clientType}`);
            }
            
            // Reconnect if needed
            if (!this.connected) {
                this.connectWebSocket();
            }
        }
    };
}

// Global demo utilities
window.demoApp = demoApp;
window.chatWindow = chatWindow;

// Demo initialization message
console.log('Valkey GLIDE Demo - Chat frontend loaded');
console.log('Architecture: Alpine.js + Pico CSS + WebSocket');
console.log('Demonstrates: node-redis vs valkey-glide resilience');
