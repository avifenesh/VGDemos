// Valkey GLIDE Demo - Main Application Logic
// Professional Alpine.js implementation

function valkeyDemo() {
    return {
        // Demo State
        wsConnected: false,
        showPublisherSetup: true,
        showLogsSetup: true,
        showNodeRedisRooms: false,
        showValkeyGlideRooms: false,
        logsVisible: true,
        autoScrollLogs: true,
        logFilter: 'all',
        showScalingModal: false,
        activeLogTab: 'node-redis', // New variable for tab navigation

        // Available rooms
        availableRooms: ['demo-chat', 'tech', 'general'],

        // Publisher Configuration
        publishers: {
            alice: {
                auto: true,
                interval: 3,
                status: 'inactive'
            },
            bob: {
                auto: true,
                interval: 4,
                status: 'inactive'
            },
            carol: {
                auto: false,
                status: 'ready'
            }
        },

        // Node-Redis Client State
        nodeRedisCurrentRoom: null,
        nodeRedisConnection: {
            status: 'disconnected',
            statusText: 'DISCONNECTED',
            canSend: false,
            actionRequired: 'Connect to room'
        },
        nodeRedisSubscription: {
            status: 'inactive',
            statusText: 'NOT SUBSCRIBED'
        },
        nodeRedisMessages: [],
        nodeRedisMessageInput: '',

        // Valkey-GLIDE Client State
        valkeyGlideCurrentRoom: null,
        valkeyGlideConnection: {
            status: 'disconnected',
            statusText: 'DISCONNECTED',
            canSend: false,
            actionRequired: 'Connect to room'
        },
        valkeyGlideSubscription: {
            status: 'inactive',
            statusText: 'NOT SUBSCRIBED'
        },
        valkeyGlideMessages: [],
        valkeyGlideMessageInput: '',

        // Backend Logs
        nodeRedisLogs: [],
        valkeyGlideLogs: [],

        // WebSocket connections
        nodeRedisWs: null,
        valkeyGlideWs: null,

        // Publisher intervals
        publisherIntervals: {},

        // Initialize the demo
        init() {
            console.log('Initializing Valkey GLIDE Demo...');
            this.initializeWebSockets();
            this.addInitialLogEntries();
        },

        // Computed Properties
        get filteredLogs() {
            let logs = [];
            
            switch (this.activeLogTab) {
                case 'node-redis':
                    logs = this.nodeRedisLogs;
                    break;
                case 'valkey-glide':
                    logs = this.valkeyGlideLogs;
                    break;
                case 'system':
                    logs = [...this.nodeRedisLogs, ...this.valkeyGlideLogs]
                        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                    break;
                default:
                    logs = this.nodeRedisLogs;
            }

            // Apply filter
            if (this.logFilter === 'all') {
                return logs;
            }
            
            const levelPriority = {
                'debug': 0,
                'info': 1,
                'warn': 2,
                'error': 3
            };
            
            const filterLevel = levelPriority[this.logFilter];
            return logs.filter(log => levelPriority[log.level] >= filterLevel);
        },

        // WebSocket Management
        initializeWebSockets() {
            // Initialize node-redis WebSocket
            this.nodeRedisWs = new WebSocket('ws://localhost:3000/node-redis');
            this.setupWebSocketEventHandlers(this.nodeRedisWs, 'node-redis');

            // Initialize valkey-glide WebSocket
            this.valkeyGlideWs = new WebSocket('ws://localhost:3000/valkey-glide');
            this.setupWebSocketEventHandlers(this.valkeyGlideWs, 'valkey-glide');
        },

        setupWebSocketEventHandlers(ws, clientType) {
            ws.onopen = () => {
                console.log(`${clientType} WebSocket connected`);
                this.wsConnected = true;
                this.addLogEntry(clientType, 'info', 'WebSocket connection established');
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(clientType, data);
            };

            ws.onclose = () => {
                console.log(`${clientType} WebSocket disconnected`);
                this.wsConnected = false;
                this.addLogEntry(clientType, 'warn', 'WebSocket connection closed');
                
                // Attempt reconnection after 3 seconds
                setTimeout(() => {
                    this.initializeWebSockets();
                }, 3000);
            };

            ws.onerror = (error) => {
                console.error(`${clientType} WebSocket error:`, error);
                this.addLogEntry(clientType, 'error', 'WebSocket connection error');
            };
        },

        handleWebSocketMessage(clientType, data) {
            switch (data.type) {
                case 'chat_message':
                    this.addChatMessage(clientType, data);
                    break;
                case 'connection_status':
                    this.updateConnectionStatus(clientType, data);
                    break;
                case 'subscription_status':
                    this.updateSubscriptionStatus(clientType, data);
                    break;
                case 'system_event':
                    this.addSystemMessage(clientType, data);
                    break;
                case 'log_entry':
                    this.addLogEntry(clientType, data.level, data.message);
                    break;
                default:
                    console.log(`Unknown message type: ${data.type}`);
            }
        },

        // Publisher Management
        savePublisherSettings() {
            // Start auto-publishers
            if (this.publishers.alice.auto) {
                this.startAutoPublisher('alice');
            }
            if (this.publishers.bob.auto) {
                this.startAutoPublisher('bob');
            }

            // Close the setup panel
            this.showPublisherSetup = false;
            
            this.addLogEntry('system', 'info', 'Publisher settings saved and applied');
        },

        startAutoPublisher(publisherName) {
            if (this.publisherIntervals[publisherName]) {
                clearInterval(this.publisherIntervals[publisherName]);
            }

            const publisher = this.publishers[publisherName];
            publisher.status = 'active';

            const messages = {
                alice: [
                    'Hello everyone!',
                    'Great demo today!',
                    'Love the tech!',
                    'This is working perfectly!',
                    'Automatic recovery is amazing!'
                ],
                bob: [
                    'Hey there!',
                    'How\'s everyone doing?',
                    'This technology is impressive!',
                    'Messages flowing smoothly!',
                    'Zero downtime, love it!'
                ]
            };

            let messageIndex = 0;
            this.publisherIntervals[publisherName] = setInterval(() => {
                const message = messages[publisherName][messageIndex % messages[publisherName].length];
                this.publishMessage(publisherName, message);
                messageIndex++;
            }, publisher.interval * 1000);

            this.addLogEntry('system', 'info', `Auto-publisher ${publisherName} started (${publisher.interval}s interval)`);
        },

        sendManualMessage(publisherName) {
            const messages = [
                'Manual message from Carol!',
                'How\'s the demo going?',
                'Still working perfectly here!',
                'Manual messages work great too!'
            ];
            const message = messages[Math.floor(Math.random() * messages.length)];
            this.publishMessage(publisherName, message);
        },

        publishMessage(author, content) {
            const message = {
                type: 'publish_message',
                author: author,
                content: content,
                room: this.nodeRedisCurrentRoom || this.valkeyGlideCurrentRoom || 'demo-chat',
                timestamp: this.getCurrentTimestamp()
            };

            // Send to both WebSockets if connected
            if (this.nodeRedisWs && this.nodeRedisWs.readyState === WebSocket.OPEN) {
                this.nodeRedisWs.send(JSON.stringify(message));
            }
            if (this.valkeyGlideWs && this.valkeyGlideWs.readyState === WebSocket.OPEN) {
                this.valkeyGlideWs.send(JSON.stringify(message));
            }

            this.addLogEntry('system', 'debug', `Message published by ${author}: ${content}`);
        },

        // Room Management
        joinRoom(clientType, room) {
            const message = {
                type: 'join_room',
                room: room
            };

            if (clientType === 'node-redis') {
                this.nodeRedisCurrentRoom = room;
                this.nodeRedisMessages = [];
                if (this.nodeRedisWs && this.nodeRedisWs.readyState === WebSocket.OPEN) {
                    this.nodeRedisWs.send(JSON.stringify(message));
                }
                this.addLogEntry('node-redis', 'info', `Joined room: ${room}`);
            } else {
                this.valkeyGlideCurrentRoom = room;
                this.valkeyGlideMessages = [];
                if (this.valkeyGlideWs && this.valkeyGlideWs.readyState === WebSocket.OPEN) {
                    this.valkeyGlideWs.send(JSON.stringify(message));
                }
                this.addLogEntry('valkey-glide', 'info', `Joined room: ${room}`);
            }
        },

        leaveRoom(clientType) {
            const message = {
                type: 'leave_room'
            };

            if (clientType === 'node-redis') {
                const oldRoom = this.nodeRedisCurrentRoom;
                this.nodeRedisCurrentRoom = null;
                if (this.nodeRedisWs && this.nodeRedisWs.readyState === WebSocket.OPEN) {
                    this.nodeRedisWs.send(JSON.stringify(message));
                }
                this.addLogEntry('node-redis', 'info', `Left room: ${oldRoom}`);
            } else {
                const oldRoom = this.valkeyGlideCurrentRoom;
                this.valkeyGlideCurrentRoom = null;
                if (this.valkeyGlideWs && this.valkeyGlideWs.readyState === WebSocket.OPEN) {
                    this.valkeyGlideWs.send(JSON.stringify(message));
                }
                this.addLogEntry('valkey-glide', 'info', `Left room: ${oldRoom}`);
            }
        },

        rejoinRoom(clientType) {
            if (clientType === 'node-redis' && this.nodeRedisCurrentRoom) {
                this.joinRoom('node-redis', this.nodeRedisCurrentRoom);
            } else if (clientType === 'valkey-glide' && this.valkeyGlideCurrentRoom) {
                this.joinRoom('valkey-glide', this.valkeyGlideCurrentRoom);
            }
        },

        resubscribe(clientType) {
            const message = {
                type: 'resubscribe'
            };

            if (clientType === 'node-redis' && this.nodeRedisWs) {
                this.nodeRedisWs.send(JSON.stringify(message));
                this.addLogEntry('node-redis', 'info', 'Manual resubscribe requested');
            }
        },

        // Message Handling
        sendMessage(clientType) {
            let messageInput, currentRoom, ws;

            if (clientType === 'node-redis') {
                messageInput = this.nodeRedisMessageInput;
                currentRoom = this.nodeRedisCurrentRoom;
                ws = this.nodeRedisWs;
            } else {
                messageInput = this.valkeyGlideMessageInput;
                currentRoom = this.valkeyGlideCurrentRoom;
                ws = this.valkeyGlideWs;
            }

            if (!messageInput.trim() || !currentRoom || !ws) return;

            const message = {
                type: 'send_message',
                content: messageInput.trim(),
                room: currentRoom,
                timestamp: this.getCurrentTimestamp()
            };

            ws.send(JSON.stringify(message));

            // Clear input
            if (clientType === 'node-redis') {
                this.nodeRedisMessageInput = '';
            } else {
                this.valkeyGlideMessageInput = '';
            }
        },

        addChatMessage(clientType, data) {
            const message = {
                type: 'chat',
                timestamp: data.timestamp || this.getCurrentTimestamp(),
                author: data.author,
                content: data.content
            };

            if (clientType === 'node-redis') {
                this.nodeRedisMessages.push(message);
                // Auto-scroll to bottom
                this.$nextTick(() => {
                    const container = document.getElementById('node-redis-messages');
                    if (container) container.scrollTop = container.scrollHeight;
                });
            } else {
                this.valkeyGlideMessages.push(message);
                // Auto-scroll to bottom
                this.$nextTick(() => {
                    const container = document.getElementById('valkey-glide-messages');
                    if (container) container.scrollTop = container.scrollHeight;
                });
            }
        },

        addSystemMessage(clientType, data) {
            const message = {
                type: 'system',
                content: data.message,
                timestamp: this.getCurrentTimestamp()
            };

            if (clientType === 'node-redis') {
                this.nodeRedisMessages.push(message);
            } else {
                this.valkeyGlideMessages.push(message);
            }
        },

        // Connection Status Management
        updateConnectionStatus(clientType, data) {
            if (clientType === 'node-redis') {
                this.nodeRedisConnection.status = data.status;
                this.nodeRedisConnection.statusText = data.statusText;
                this.nodeRedisConnection.canSend = data.canSend;
                this.nodeRedisConnection.actionRequired = data.actionRequired || '';
            } else {
                this.valkeyGlideConnection.status = data.status;
                this.valkeyGlideConnection.statusText = data.statusText;
                this.valkeyGlideConnection.canSend = data.canSend;
                this.valkeyGlideConnection.actionRequired = data.actionRequired || '';
            }

            this.addLogEntry(clientType, 'info', `Connection status: ${data.statusText}`);
        },

        updateSubscriptionStatus(clientType, data) {
            if (clientType === 'node-redis') {
                this.nodeRedisSubscription.status = data.status;
                this.nodeRedisSubscription.statusText = data.statusText;
            } else {
                this.valkeyGlideSubscription.status = data.status;
                this.valkeyGlideSubscription.statusText = data.statusText;
            }

            this.addLogEntry(clientType, 'info', `Subscription status: ${data.statusText}`);
        },

        // Demo Controls
        simulateFailure() {
            const message = {
                type: 'simulate_failure'
            };

            // Send to both clients
            if (this.nodeRedisWs && this.nodeRedisWs.readyState === WebSocket.OPEN) {
                this.nodeRedisWs.send(JSON.stringify(message));
            }
            if (this.valkeyGlideWs && this.valkeyGlideWs.readyState === WebSocket.OPEN) {
                this.valkeyGlideWs.send(JSON.stringify(message));
            }

            this.addLogEntry('system', 'warn', '⟡ FAILURE SIMULATION TRIGGERED');
            
            // Add system messages to both clients
            this.addSystemMessage('node-redis', { message: '⟡ [CLIENT KILL TRIGGERED]' });
            this.addSystemMessage('valkey-glide', { message: '⟡ [CLIENT KILL TRIGGERED]' });
        },

        resetDemo() {
            // Clear all messages
            this.nodeRedisMessages = [];
            this.valkeyGlideMessages = [];
            
            // Reset connection states
            this.nodeRedisConnection = {
                status: 'disconnected',
                statusText: 'DISCONNECTED',
                canSend: false,
                actionRequired: 'Connect to room'
            };
            this.valkeyGlideConnection = {
                status: 'disconnected',
                statusText: 'DISCONNECTED',
                canSend: false,
                actionRequired: 'Connect to room'
            };
            
            // Reset subscription states
            this.nodeRedisSubscription = {
                status: 'inactive',
                statusText: 'NOT SUBSCRIBED'
            };
            this.valkeyGlideSubscription = {
                status: 'inactive',
                statusText: 'NOT SUBSCRIBED'
            };

            // Clear rooms
            this.nodeRedisCurrentRoom = null;
            this.valkeyGlideCurrentRoom = null;

            // Stop all publishers
            Object.keys(this.publisherIntervals).forEach(key => {
                clearInterval(this.publisherIntervals[key]);
                delete this.publisherIntervals[key];
            });

            // Reset publisher states
            Object.keys(this.publishers).forEach(key => {
                if (key !== 'carol') {
                    this.publishers[key].status = 'inactive';
                }
            });

            // Clear logs
            this.nodeRedisLogs = [];
            this.valkeyGlideLogs = [];

            // Send reset message to backend
            const message = { type: 'reset_demo' };
            if (this.nodeRedisWs) this.nodeRedisWs.send(JSON.stringify(message));
            if (this.valkeyGlideWs) this.valkeyGlideWs.send(JSON.stringify(message));

            this.addLogEntry('system', 'info', '↻ Demo reset completed');
        },

        showStats() {
            const stats = {
                nodeRedisMessages: this.nodeRedisMessages.length,
                valkeyGlideMessages: this.valkeyGlideMessages.length,
                nodeRedisLogs: this.nodeRedisLogs.length,
                valkeyGlideLogs: this.valkeyGlideLogs.length,
                connectionStatus: {
                    nodeRedis: this.nodeRedisConnection.status,
                    valkeyGlide: this.valkeyGlideConnection.status
                },
                subscriptionStatus: {
                    nodeRedis: this.nodeRedisSubscription.status,
                    valkeyGlide: this.valkeyGlideSubscription.status
                }
            };

            console.log('Demo Statistics:', stats);
            alert(`Demo Statistics:\n\nMessages:\n- node-redis: ${stats.nodeRedisMessages}\n- valkey-glide: ${stats.valkeyGlideMessages}\n\nLogs:\n- node-redis: ${stats.nodeRedisLogs}\n- valkey-glide: ${stats.valkeyGlideLogs}\n\nConnection Status:\n- node-redis: ${stats.connectionStatus.nodeRedis}\n- valkey-glide: ${stats.connectionStatus.valkeyGlide}`);
        },

        explainScaling() {
            this.showScalingModal = true;
        },

        closeScalingModal() {
            this.showScalingModal = false;
        },

        // Logs Management
        toggleLogsVisibility() {
            this.logsVisible = !this.logsVisible;
        },

        minimizeLogs() {
            this.logsVisible = false;
        },

        exportLogs() {
            const allLogs = {
                nodeRedis: this.nodeRedisLogs,
                valkeyGlide: this.valkeyGlideLogs,
                exportedAt: new Date().toISOString()
            };

            const dataStr = JSON.stringify(allLogs, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `valkey-demo-logs-${new Date().toISOString().slice(0, 19)}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            this.addLogEntry('system', 'info', 'Logs exported successfully');
        },

        addLogEntry(clientType, level, message) {
            const logEntry = {
                timestamp: this.getCurrentTimestamp(),
                level: level,
                message: message
            };

            if (clientType === 'node-redis') {
                this.nodeRedisLogs.push(logEntry);
                // Keep only last 100 entries
                if (this.nodeRedisLogs.length > 100) {
                    this.nodeRedisLogs = this.nodeRedisLogs.slice(-100);
                }
            } else if (clientType === 'valkey-glide') {
                this.valkeyGlideLogs.push(logEntry);
                // Keep only last 100 entries
                if (this.valkeyGlideLogs.length > 100) {
                    this.valkeyGlideLogs = this.valkeyGlideLogs.slice(-100);
                }
            } else if (clientType === 'system') {
                // System logs go to both arrays for now (until we have a separate system log array)
                this.nodeRedisLogs.push({...logEntry, message: `[SYSTEM] ${message}`});
                this.valkeyGlideLogs.push({...logEntry, message: `[SYSTEM] ${message}`});
                
                // Keep arrays trimmed
                if (this.nodeRedisLogs.length > 100) {
                    this.nodeRedisLogs = this.nodeRedisLogs.slice(-100);
                }
                if (this.valkeyGlideLogs.length > 100) {
                    this.valkeyGlideLogs = this.valkeyGlideLogs.slice(-100);
                }
            }

            // Auto-scroll logs if enabled
            if (this.autoScrollLogs) {
                this.$nextTick(() => {
                    const logContainer = document.querySelector('.log-container');
                    if (logContainer) {
                        logContainer.scrollTop = logContainer.scrollHeight;
                    }
                });
            }
        },

        addInitialLogEntries() {
            this.addLogEntry('system', 'info', 'Valkey GLIDE Demo initialized');
            this.addLogEntry('node-redis', 'info', 'node-redis client ready');
            this.addLogEntry('valkey-glide', 'info', 'valkey-glide client ready');
        },

        // Computed Properties
        get filteredNodeRedisLogs() {
            if (this.logFilter === 'all') {
                return this.nodeRedisLogs;
            }
            return this.nodeRedisLogs.filter(log => log.level === this.logFilter);
        },

        get filteredValkeyGlideLogs() {
            if (this.logFilter === 'all') {
                return this.valkeyGlideLogs;
            }
            return this.valkeyGlideLogs.filter(log => log.level === this.logFilter);
        },

        // Utility Functions
        getCurrentTimestamp() {
            const now = new Date();
            return now.toTimeString().slice(0, 8);
        },

        // Cleanup
        destroy() {
            // Clear all intervals
            Object.values(this.publisherIntervals).forEach(interval => {
                clearInterval(interval);
            });

            // Close WebSocket connections
            if (this.nodeRedisWs) {
                this.nodeRedisWs.close();
            }
            if (this.valkeyGlideWs) {
                this.valkeyGlideWs.close();
            }
        }
    };
}

// Alpine.js magic helpers for enhanced functionality
document.addEventListener('alpine:init', () => {
    Alpine.magic('scrollToBottom', () => (element) => {
        if (element) {
            element.scrollTop = element.scrollHeight;
        }
    });

    Alpine.magic('formatTimestamp', () => (timestamp) => {
        return new Date(timestamp).toLocaleTimeString();
    });
});

// Global event listeners for demo behavior
document.addEventListener('DOMContentLoaded', () => {
    // Handle browser refresh/close
    window.addEventListener('beforeunload', (event) => {
        // Cleanup will be handled by Alpine.js destroy
        console.log('Demo shutting down...');
    });

    // Keyboard shortcuts for demo control
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'f':
                    event.preventDefault();
                    // Trigger failure simulation
                    const app = Alpine.$data(document.querySelector('[x-data]'));
                    if (app) app.simulateFailure();
                    break;
                case 'r':
                    event.preventDefault();
                    // Reset demo
                    const appReset = Alpine.$data(document.querySelector('[x-data]'));
                    if (appReset) appReset.resetDemo();
                    break;
            }
        }
    });
});

console.log('Valkey GLIDE Demo JavaScript loaded successfully');
