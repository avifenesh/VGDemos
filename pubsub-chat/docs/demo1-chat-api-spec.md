# Demo 1: Chat API Specification

## Overview

This document defines the API specification for the Pub/Sub Chat demo, which showcases the resilience and scalability benefits of `valkey-glide` over standard Redis clients for a technical "builders" audience.

## Target Audience: Builders
- **Software Developers**: Value elegant APIs and minimal boilerplate
- **Solutions Architects**: Focus on scalability and production readiness  
- **DevOps Engineers**: Prioritize fault tolerance and observability

## Demo Objectives

### Part 1: Demonstrate the Relatable Problem
- Use `node-redis` to show subscription state loss after connection failure
- Show a problem most builders have personally experienced
- Highlight the complex boilerplate required for proper state management

### Part 2: Showcase the Elegant Solution  
- Switch to `valkey-glide` with declarative `pubsubSubscriptions` configuration
- Demonstrate automatic subscription restoration with zero custom code
- Show sharded Pub/Sub scalability for production workloads

---

## Service Architecture

### Abstract Base Service
```typescript
export abstract class ChatServiceBase {
  abstract readonly clientType: 'node-redis' | 'valkey-glide';
  abstract readonly isConnected: boolean;
  abstract readonly subscriptionStatus: Map<string, boolean>;
  
  // Core operations
  abstract subscribeToRoom(roomId: string): Promise<void>;
  abstract publishMessage(roomId: string, message: ChatMessage): Promise<void>;
  abstract unsubscribeFromRoom(roomId: string): Promise<void>;
  
  // Demo operations
  abstract simulateFailure(): Promise<void>;
  abstract getConnectionHealth(): Promise<ConnectionHealth>;
}
```

### Implementation Classes
- **NodeRedisChatService**: Demonstrates subscription state loss problem
- **GlideChatService**: Shows automatic state restoration and sharded Pub/Sub

---

## REST API Endpoints

### Demo Control
```typescript
POST /api/demo/switch-client
Content-Type: application/json
{
  "clientType": "node-redis" | "valkey-glide"
}
Response: { "success": boolean, "currentClient": string }

POST /api/demo/simulate-failure  
Response: { "success": boolean, "message": string }

GET /api/demo/status
Response: {
  "clientType": "node-redis" | "valkey-glide",
  "isConnected": boolean,
  "subscriptions": string[],
  "connectionHealth": ConnectionHealth
}
```

### Chat Operations
```typescript
GET /api/rooms
Response: Room[]

POST /api/rooms
Content-Type: application/json
{
  "name": string,
  "description"?: string
}
Response: Room

GET /api/rooms/:roomId/messages?limit=50&offset=0
Response: {
  "messages": ChatMessage[],
  "total": number,
  "hasMore": boolean
}

POST /api/rooms/:roomId/join
Response: { "success": boolean, "users": User[] }

DELETE /api/rooms/:roomId/leave  
Response: { "success": boolean }
```

---

## WebSocket Events

### Client to Server
```typescript
// Room management
'join-room' { roomId: string, userId: string, username: string }
'leave-room' { roomId: string, userId: string }

// Messaging  
'send-message' {
  roomId: string,
  content: string,
  author: {
    id: string,
    username: string
  }
}

// Demo controls
'switch-client' { clientType: 'node-redis' | 'valkey-glide' }
'simulate-failure' {}
```

### Server to Client
```typescript
// Room events
'room-joined' {
  roomId: string,
  user: User,
  users: User[],
  timestamp: string
}

'room-left' {
  roomId: string, 
  user: User,
  users: User[],
  timestamp: string
}

// Message events
'new-message' {
  roomId: string,
  message: ChatMessage,
  timestamp: string
}

'message-failed' {
  roomId: string,
  error: string,
  originalMessage: ChatMessage
}

// Connection status (critical for demo)
'connection-status' {
  status: 'connected' | 'disconnected' | 'reconnecting',
  clientType: 'node-redis' | 'valkey-glide',
  timestamp: string
}

'subscription-status' {
  roomId: string,
  subscribed: boolean,
  clientType: string,
  timestamp: string
}

// Demo events  
'demo-event' {
  type: 'client-switched' | 'failure-simulated' | 'recovery-completed',
  data: any,
  timestamp: string
}

'client-switched' {
  from: 'node-redis' | 'valkey-glide',
  to: 'node-redis' | 'valkey-glide',
  timestamp: string
}
```

---

## Data Models

### Core Types
```typescript
interface Room {
  id: string;
  name: string;
  description?: string;
  users: User[];
  createdAt: string;
  messageCount: number;
}

interface User {
  id: string;
  username: string;
  joinedAt: string;
  isOnline: boolean;
}

interface ChatMessage {
  id: string;
  roomId: string;
  content: string;
  author: User;
  timestamp: string;
  type: 'message' | 'system' | 'error';
}

interface ConnectionHealth {
  isConnected: boolean;
  lastSeen: string;
  reconnectAttempts: number;
  subscriptions: {
    [roomId: string]: {
      active: boolean;
      lastActivity: string;
    }
  };
}
```

### Demo-Specific Types
```typescript
interface DemoStatus {
  currentClient: 'node-redis' | 'valkey-glide';
  connectionState: 'connected' | 'disconnected' | 'reconnecting';
  subscriptionHealth: Map<string, boolean>;
  lastFailureSimulation?: string;
  autoRecoveryEnabled: boolean;
}

interface FailureSimulation {
  type: 'CLIENT_KILL' | 'NETWORK_PARTITION' | 'TIMEOUT';
  timestamp: string;
  duration?: number; // For temporary failures
  affectedSubscriptions: string[];
}
```

---

## Demo Flow Requirements

### Visual Feedback (Critical for Builders)
1. **Connection Status Indicator**: Real-time TCP connection state
2. **Subscription Status Per Room**: Individual room subscription health  
3. **Client Type Badge**: Prominent display of active client library
4. **Message Delivery Confirmation**: Visual proof of successful/failed delivery
5. **Recovery Timeline**: Progress indicator during reconnection

### Demo Control Interface
1. **Client Toggle**: Easy switching between `node-redis` and `valkey-glide`
2. **Failure Simulator**: One-click `CLIENT KILL` triggering
3. **Status Dashboard**: Technical metrics display
4. **Log Viewer**: Real-time connection and subscription events

### Authentication & Security
- Simple username-based authentication (no passwords for demo)
- CORS enabled for frontend development
- Rate limiting on message sending
- Basic input sanitization

---

## Error Handling Strategy

### Node-Redis Error Scenarios (The Problem)
```typescript
// Connection lost -> subscriptions lost
client.on('error', (err) => {
  // Manual error handling required
  logger.error('Redis connection lost:', err);
});

client.on('ready', () => {
  // Developer must manually re-subscribe
  activeRooms.forEach(roomId => {
    client.subscribe(roomId); // Easy to forget!
  });
});
```

### Valkey-Glide Error Scenarios (The Solution)  
```typescript
// Declarative configuration handles everything
const client = await GlideClusterClient.createClient({
  // Connection resilience built-in
  connectionBackoff: { numOfRetries: 5, factor: 2, minDelay: 100 },
  
  // Subscription state managed automatically
  pubsubSubscriptions: {
    channelsAndPatterns: {
      [PubSubChannelModes.Sharded]: activeRooms
    },
    callback: handleMessage // Never loses subscriptions
  }
});
```

---

## Performance Considerations

### Node-Redis Limitations
- Manual subscription management overhead
- No built-in cluster sharding for Pub/Sub
- Subscription state loss requires recovery logic
- Network inefficiency in cluster mode

### Valkey-Glide Advantages  
- Automatic subscription restoration
- Sharded Pub/Sub prevents message flooding
- Built-in connection resilience
- Zero boilerplate for state management

### Metrics to Highlight
- **Reconnection Time**: How fast each client recovers
- **Message Delivery Success Rate**: Before/after failure simulation
- **Network Efficiency**: Standard vs Sharded Pub/Sub traffic
- **Code Complexity**: Lines of resilience logic required

---

## Demo Success Criteria

### Technical Validation
- [ ] `node-redis` loses subscriptions after `CLIENT KILL`
- [ ] `valkey-glide` automatically restores subscriptions  
- [ ] Sharded mode routing works correctly
- [ ] WebSocket status reflects backend state accurately
- [ ] Demo controls work reliably under failure conditions

### Audience Engagement (Builders)
- [ ] "I've hit this exact problem" recognition
- [ ] Code simplicity appreciation ("So much less boilerplate!")
- [ ] Production scalability questions about sharded mode
- [ ] Interest in trying the library
- [ ] Understanding of resilience mechanisms

The demo succeeds when builders see `valkey-glide` solving real problems they face, with production-grade solutions they can immediately apply.