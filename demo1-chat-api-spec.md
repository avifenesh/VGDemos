# Demo 1: Chat Room API Specification

**Project Location**: `/home/ubuntu/VGDemos/pubsub-chat/`

## Overview

This document defines the API interface for the Resilient & Scalable Chat Rooms demo, showcasing the differences between standard Redis clients (node-redis) and valkey-glide for Pub/Sub resilience and scalability.

## Project Structure

```
/home/ubuntu/VGDemos/pubsub-chat/
├── backend/          # NestJS backend application
├── frontend/         # React/Vue frontend application  
├── docker/           # Docker configuration for Valkey cluster
└── README.md         # Setup and demo instructions
```

## REST API Endpoints

### Chat Room Management

#### Get All Rooms

```
GET /api/rooms
Response: ChatRoom[]
```

#### Create Room

```
POST /api/rooms
Body: { name: string, description?: string }
Response: ChatRoom
```

#### Get Room Message History

```
GET /api/rooms/:roomId/messages?limit=50
Response: ChatMessage[]
```

#### Send Message to Room

```
POST /api/rooms/:roomId/messages
Body: { content: string, username: string }
Response: ChatMessage
```

### Demo Control

#### Switch Client Implementation

```
POST /api/demo/switch-client
Body: { clientType: 'node-redis' | 'valkey-glide' }
Response: { success: boolean, newClientType: string }
```

#### Simulate Connection Failure

```
POST /api/demo/simulate-failure
Response: { success: boolean, message: string }
```

#### Get Demo Status

```
GET /api/demo/status
Response: DemoStatus
```

## WebSocket Events

### Client to Server Events

#### Join Room

```typescript
event: 'join-room'
payload: { roomId: string, username: string }
```

#### Leave Room

```typescript
event: 'leave-room'
payload: { roomId: string }
```

#### Send Message

```typescript
event: 'send-message'
payload: { roomId: string, message: string, username: string }
```

### Server to Client Events

#### Room Joined Successfully

```typescript
event: 'room-joined'
payload: { roomId: string, users: string[] }
```

#### Room Left

```typescript
event: 'room-left'
payload: { roomId: string }
```

#### New Message Received

```typescript
event: 'new-message'
payload: { roomId: string, message: ChatMessage, timestamp: number }
```

#### User Activity

```typescript
event: 'user-joined'
payload: { roomId: string, username: string }

event: 'user-left'
payload: { roomId: string, username: string }
```

#### Connection Status Updates

```typescript
event: 'connection-status'
payload: { 
  status: 'connected' | 'reconnecting' | 'disconnected',
  client: 'node-redis' | 'valkey-glide'
}
```

#### Demo Events

```typescript
event: 'demo-failure-simulated'
payload: { message: string, timestamp: number }
```

## Data Models

### ChatMessage

```typescript
interface ChatMessage {
  id: string;
  roomId: string;
  username: string;
  content: string;
  timestamp: number;
}
```

### ChatRoom

```typescript
interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  userCount: number;
  createdAt: number;
}
```

### DemoStatus

```typescript
interface DemoStatus {
  clientType: 'node-redis' | 'valkey-glide';
  connectionStatus: 'connected' | 'reconnecting' | 'disconnected';
  subscriptions: string[];
  lastFailureTime?: number;
  reconnectionAttempts?: number;
}
```

## Service Architecture

### Abstract Base Service

```typescript
export abstract class ChatServiceBase {
  abstract getRooms(): Promise<ChatRoom[]>;
  abstract createRoom(name: string, description?: string): Promise<ChatRoom>;
  abstract getRecentMessages(roomId: string, limit?: number): Promise<ChatMessage[]>;
  abstract publishMessage(message: ChatMessage): Promise<void>;
  abstract subscribeToRoom(roomId: string, callback: (message: ChatMessage) => void): Promise<void>;
  abstract unsubscribeFromRoom(roomId: string): Promise<void>;
  abstract simulateFailure(): Promise<void>;
  abstract getStatus(): DemoStatus;
}
```

### Implementation Classes

- `node-redisService extends ChatServiceBase` - Standard Redis client implementation
- `ValkeyGlideService extends ChatServiceBase` - valkey-glide implementation with resilience

## Demo Flow

### Part 1: Demonstrating the Problem (node-redis)

1. Switch to node-redis client: `POST /api/demo/switch-client`
2. Join rooms and send messages normally via WebSocket
3. Simulate failure: `POST /api/demo/simulate-failure`
4. Show that subscriptions are lost after reconnection
5. New messages fail to be delivered to existing clients

### Part 2: The valkey-glide Solution

1. Switch to valkey-glide: `POST /api/demo/switch-client`
2. Same messaging flow
3. Simulate the same failure scenario
4. Demonstrate automatic subscription restoration
5. Show sharded pub/sub scalability benefits

## Key Talking Points for API

### Resilience Configuration

```typescript
// valkey-glide declarative state management
const client = await GlideClusterClient.createClient({
  addresses: [...],
  pubsubSubscriptions: {
    channelsAndPatterns: {
      [PubSubChannelModes.Sharded]: new Set(['room-1'])
    },
    callback: (message, context) => {
      // Automatic state restoration
    }
  }
});
```

### Scalability with Sharded Pub/Sub

```typescript
// Standard pub/sub floods all nodes
await client.publish("message", "room-1", false);

// Sharded pub/sub routes to specific shard
await client.publish("message", "room-1", true);
```

## Error Handling

### Connection States

- `connected`: Normal operation
- `reconnecting`: Client is attempting to reconnect
- `disconnected`: No connection available

### Failure Scenarios

- Network interruption
- Server restart
- Client termination (`CLIENT KILL`)
- Subscription state loss

## Security Considerations

- Rate limiting on message endpoints
- Room access validation
- Username sanitization
- WebSocket authentication

## Performance Metrics

- Message delivery latency
- Reconnection time
- Subscription restoration speed
- Pub/sub scalability (messages/second)
