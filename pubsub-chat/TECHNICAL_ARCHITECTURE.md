# Technical Architecture Decisions

## Backend Service Architecture

### Abstract Base Class

```typescript
export abstract class ChatServiceBase {
  abstract readonly clientType: 'node-redis' | 'valkey-glide';
  abstract readonly isConnected: boolean;
  abstract readonly subscriptionStatus: Map<string, boolean>;
  
  // Core chat operations
  abstract subscribeToRoom(roomId: string): Promise<void>;
  abstract publishMessage(roomId: string, message: ChatMessage): Promise<void>;
  abstract unsubscribeFromRoom(roomId: string): Promise<void>;
  
  // Demo-specific operations
  abstract simulateFailure(): Promise<void>;
  abstract getConnectionHealth(): Promise<ConnectionHealth>;
}
```

### NodeRedis Implementation (The Problem)

- **Connection Management**: Manual reconnection logic
- **Subscription State**: Lost after disconnection
- **Error Handling**: Developer responsibility
- **Demo Failure Point**: Subscriptions not restored after `CLIENT KILL`

### Glide Implementation (The Solution)

- **Declarative Configuration**: `pubsubSubscriptions` in client config
- **Automatic State Recovery**: Library manages subscription restoration
- **Sharded Pub/Sub**: Cluster-efficient message routing
- **Demo Success Point**: Automatic subscription restoration

---

## Frontend Architecture

### Component Hierarchy

```
App
├── DemoControls          // Client switching & failure simulation
├── ConnectionStatus      // Real-time connection/subscription status
├── ChatRoom
│   ├── MessageList       // Scrollable message history
│   ├── MessageInput      // Send new messages
│   └── RoomUsers         // Active participants
└── StatusDashboard       // Technical metrics for demo
```

### State Management Strategy

- **useSocket Hook**: WebSocket connection management
- **useChat Hook**: Message history and room state
- **useDemoControls Hook**: Client switching and failure simulation
- **Global State**: Minimal - prefer local component state

### Visual Feedback Requirements

- **Connection Indicator**: Clear visual of TCP connection status
- **Subscription Indicator**: Per-room subscription state
- **Client Type Badge**: Prominent display of active client
- **Message Delivery Status**: Success/failure indicators
- **Recovery Timeline**: Visual progress of reconnection

---

## API Design

### REST Endpoints

```typescript
// Demo control
POST /api/demo/switch-client    // Toggle between node-redis/valkey-glide
POST /api/demo/simulate-failure // Trigger CLIENT KILL
GET  /api/demo/status          // Current client type and health

// Chat operations  
GET    /api/rooms              // List available rooms
POST   /api/rooms              // Create new room
GET    /api/rooms/:id/messages // Message history
POST   /api/rooms/:id/join     // Join room (REST fallback)
DELETE /api/rooms/:id/leave    // Leave room (REST fallback)
```

### WebSocket Events

```typescript
// Client -> Server
'join-room'     { roomId: string }
'leave-room'    { roomId: string }
'send-message'  { roomId: string, content: string, author: string }

// Server -> Client  
'room-joined'        { roomId: string, users: User[] }
'room-left'          { roomId: string }
'new-message'        { roomId: string, message: ChatMessage }
'connection-status'  { status: 'connected' | 'disconnected' | 'reconnecting' }
'subscription-status' { roomId: string, subscribed: boolean }
'demo-event'         { type: 'failure-simulated' | 'client-switched', data: any }
```

---

## Configuration & Environment

### Development Environment

```typescript
// .env.development
VALKEY_CLUSTER_ENDPOINTS=localhost:7001,localhost:7002,localhost:7003
VALKEY_USERNAME=default
VALKEY_PASSWORD=
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Client Configuration Templates

```typescript
// node-redis config (manual management)
const nodeRedisConfig = {
  socket: {
    host: 'localhost',
    port: 7001,
    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  },
  // Manual subscription tracking required
};

// valkey-glide config (declarative)
const glideConfig: GlideClusterClientConfiguration = {
  addresses: [
    { host: 'localhost', port: 7001 },
    { host: 'localhost', port: 7002 },
    { host: 'localhost', port: 7003 }
  ],
  connectionBackoff: {
    numOfRetries: 5,
    factor: 2,
    minDelay: 100
  },
  pubsubSubscriptions: {
    channelsAndPatterns: {
      [PubSubChannelModes.Sharded]: new Set() // Populated dynamically
    },
    callback: (message, context) => {
      // Automatic message routing to WebSocket clients
    }
  }
};
```

---

## Demo Execution Plan

### Phase 1: Normal Operation

1. Start with `node-redis` client
2. Join multiple rooms, send messages
3. Show everything working perfectly
4. **Talking Point**: "Standard Redis clients work great under normal conditions"

### Phase 2: Failure Simulation

1. Trigger `CLIENT KILL` via demo controls
2. Show connection recovery in logs
3. **Critical Observation**: Messages sent to "active" subscriptions fail to arrive
4. **Talking Point**: "Connection restored, but application state is lost"

### Phase 3: The Switch

1. Toggle to `valkey-glide` client via UI
2. Show the configuration difference in code
3. Re-join same rooms (clean slate)
4. **Talking Point**: "Notice the declarative configuration"

### Phase 4: Resilience Proof

1. Same failure simulation (`CLIENT KILL`)
2. Show automatic subscription restoration
3. Messages flow normally after brief reconnection
4. **Talking Point**: "No custom recovery code needed"

### Phase 5: Scalability Discussion

1. Explain sharded Pub/Sub concept
2. Show network efficiency benefits
3. Highlight production readiness
4. **Talking Point**: "This is how you build chat that scales"

---

## Success Metrics

### Technical Validation

- [ ] `node-redis` loses subscriptions after `CLIENT KILL`
- [ ] `valkey-glide` automatically restores subscriptions
- [ ] Sharded mode routing works correctly
- [ ] WebSocket status updates reflect backend state
- [ ] Demo controls work reliably

### Audience Engagement

- [ ] "I've experienced this exact problem" reactions
- [ ] Code simplicity appreciation
- [ ] Production scalability questions
- [ ] Library adoption interest

### Demo Quality

- [ ] Failure scenario is authentic and relatable
- [ ] Recovery is visibly automatic
- [ ] Configuration differences are clear
- [ ] Performance benefits are explained
- [ ] Overall flow is smooth and professional
