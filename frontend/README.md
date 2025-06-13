# Frontend

Clean, modern chat interface built with Alpine.js and Pico CSS.

## Architecture

- **Alpine.js**: Reactive UI with minimal JavaScript
- **Pico CSS**: Professional styling with semantic HTML
- **WebSocket**: Real-time communication with backend
- **Dual Chat Windows**: Side-by-side comparison of client behaviors

## Files

- `index.html` - Main HTML interface with embedded styles
- `chat-app.js` - Alpine.js components and WebSocket logic

## Features

### Visual Components
- **Dual chat windows** for User A and User B
- **Real-time status indicators** (connection, subscription status)
- **Client type badges** (node-redis vs valkey-glide)
- **Message delivery visualization** (✓ delivered, ✗ failed)
- **System messages** for connection events

### Demo Controls
- **Per-user controls**: Switch client type, simulate failures
- **Global controls**: Clear all messages, reset demo, network issues
- **Guided explanations**: Problem vs solution scenarios

### Responsive Design
- **Desktop**: Side-by-side chat windows
- **Mobile**: Stacked layout
- **Auto-scroll**: Messages container
- **Accessible**: Semantic HTML structure

## Demo Flow

1. **Normal Operation**: Both users chat normally
2. **Demonstrate Problem**: Simulate failure on node-redis client
3. **Show Solution**: Switch to valkey-glide, observe auto-recovery
4. **Compare Benefits**: Highlight subscription resilience and sharded pub/sub

## Bundle Size

- **Alpine.js**: ~15KB
- **Pico CSS**: ~10KB  
- **Total**: ~25KB (vs React ~100KB+)

## Development

No build step required - open `index.html` in browser.

## WebSocket Protocol

Expects backend WebSocket server on `ws://localhost:3000` with:
- Query params: `?userId={userA|userB}&clientType={node-redis|valkey-glide}`
- Message types: `send-message`, `switch-client`, `simulate-failure`
- Response types: `chat-message`, `connection-status`, `client-switched`
