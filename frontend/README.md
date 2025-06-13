# Valkey GLIDE Demo Frontend

A professional, production-ready frontend demonstrating chat resilience and scalability differences between node-redis and valkey-glide clients.

## ◉ Demo Purpose

This demo showcases the **subscription resilience** problem that developers face with traditional Redis clients and demonstrates how **valkey-glide** solves it elegantly with declarative configuration and automatic recovery.

### Key Demonstration Points

1. **Subscription Loss Problem**: After connection failures, node-redis requires manual resubscription
2. **Automatic Recovery**: valkey-glide automatically restores subscriptions using declarative configuration
3. **Scalability**: Sharded Pub/Sub reduces cluster flooding and improves performance
4. **Production Readiness**: Professional UI suitable for live streaming and technical presentations

## ⚏ Architecture

### Technology Stack
- **Frontend Framework**: Alpine.js (15KB, zero build step)
- **CSS Framework**: Pico CSS (10KB, semantic HTML styling)
- **Color Theme**: Official Valkey brand colors
- **Real-time Communication**: WebSockets
- **Backend**: NestJS (separate implementation)

### Design Principles
- **Professional Appearance**: Production-grade UI suitable for technical audiences
- **Live Stream Optimized**: Designed for ultrawide screens and presentations
- **Zero Build Complexity**: Open `index.html` in browser, works immediately
- **Maintainable**: Non-CSS experts can modify appearance using semantic HTML
- **Desktop Focused**: Optimized for desktop and ultrawide screens

## ⬢ Visual Design

### Color Palette (Official Valkey Colors)
```css
--valkey-blue-300: #0055A6;      /* Primary brand blue */
--valkey-green-000: #2CD5C4;     /* Success/connection states */
--valkey-red-000: #F65275;       /* Error/disconnection states */
--valkey-yellow-000: #FFB81C;    /* Warning states */
--valkey-purple-300: #4B1E5F;    /* Demo accent colors */
```

### Layout Features
- **Collapsible Setup Panels**: Clean demo state after configuration
- **Dual Client View**: Side-by-side comparison of node-redis vs valkey-glide
- **Professional Backend Logs**: Real-time system logs with filtering
- **Status Indicators**: Clear visual feedback for connection and subscription states
- **Recovery Actions**: Manual intervention buttons for node-redis failure scenarios

## ⬢ File Structure

```
frontend/
├── index.html              # Main demo page
├── styles/
│   └── valkey-theme.css    # Valkey brand styling
├── js/
│   └── demo-app.js        # Alpine.js application logic
└── README.md              # This documentation
```

## ▲ Quick Start

### Development Setup
```bash
# Serve locally (optional, for CORS if needed)
npx http-server frontend/

# Or simply open in browser
open frontend/index.html
```

### Backend Requirements
The frontend expects WebSocket connections to:
- `ws://localhost:3000/node-redis` - node-redis client backend
- `ws://localhost:3000/valkey-glide` - valkey-glide client backend

## ◼ Demo Flow

### 1. Setup Phase (Collapsible panels open)
- Configure auto-publishers (Alice: 3s, Bob: 4s, Carol: manual)
- Join rooms on both clients (typically "demo-chat")
- Configure backend logs monitoring
- Save settings and collapse panels for clean demo view

### 2. Normal Operation
- Both clients receive messages from auto-publishers
- Status indicators show "CONNECTED & SUBSCRIBED"
- Backend logs show normal message flow

### 3. Failure Simulation
- Click **"⟡ SIMULATE FAILURE"** to trigger CLIENT KILL
- **node-redis**: Connection restored, but subscription lost (silence)
- **valkey-glide**: Automatic subscription restoration (continuous flow)

### 4. Manual Recovery (node-redis only)
- Click **"↻ REJOIN ROOM"** or **"⚙ RESUBSCRIBE"** to restore messages
- Demonstrates the manual intervention required

### 5. Technical Deep-Dive (Optional)
- Click **"◉ EXPLAIN SCALING"** for sharded pub/sub explanation
- Shows declarative configuration advantages

## ⚙ WebSocket Message Protocol

### Frontend → Backend Messages
```javascript
// Join a room
{
  type: 'join_room',
  room: 'demo-chat'
}

// Send chat message
{
  type: 'send_message',
  content: 'Hello world!',
  room: 'demo-chat',
  timestamp: '12:34:56'
}

// Publish message (from auto-publishers)
{
  type: 'publish_message',
  author: 'Alice',
  content: 'Hello everyone!',
  room: 'demo-chat',
  timestamp: '12:34:56'
}

// Simulate failure
{
  type: 'simulate_failure'
}

// Manual resubscribe (node-redis only)
{
  type: 'resubscribe'
}

// Reset demo
{
  type: 'reset_demo'
}
```

### Backend → Frontend Messages
```javascript
// Chat message received
{
  type: 'chat_message',
  author: 'Alice',
  content: 'Hello!',
  timestamp: '12:34:56'
}

// Connection status update
{
  type: 'connection_status',
  status: 'connected',
  statusText: 'CONNECTED & SUBSCRIBED',
  canSend: true,
  actionRequired: ''
}

// Subscription status update
{
  type: 'subscription_status',
  status: 'active',
  statusText: 'ACTIVE (AUTO-RESTORED)'
}

// System event
{
  type: 'system_event',
  message: '⚠ [CLIENT KILL TRIGGERED]'
}

// Backend log entry
{
  type: 'log_entry',
  level: 'info',
  message: 'Connection restored'
}
```

## ◉ Key Features

### Professional Status Indicators
- **Connection Status**: Visual badges showing TCP connection state
- **Subscription Status**: Real-time subscription state tracking
- **Client Type Badges**: Clear identification of node-redis vs valkey-glide
- **Action Indicators**: Shows when manual intervention is required

### Real-time Backend Logs
- **Dual Panel**: Separate logs for each client type
- **Professional Formatting**: Timestamp, log level, message
- **Filtering**: Filter by ERROR, WARN, INFO, DEBUG
- **Export**: JSON export of all logs
- **Auto-scroll**: Optional automatic scrolling to latest entries

### Demo Controls
- **Failure Simulation**: Trigger CLIENT KILL events
- **Demo Reset**: Clean slate for repeated demonstrations
- **Statistics**: View message counts and connection status
- **Scaling Explanation**: Modal with technical deep-dive

### Desktop Design
- **Desktop**: Side-by-side client comparison
- **Ultrawide**: Optimized for live streaming setups (49" monitors)

## ⚏ Customization

### Modifying Colors
Edit `styles/valkey-theme.css` and update CSS custom properties:
```css
:root {
  --valkey-blue-300: #0055A6;  /* Change primary blue */
  --valkey-green-000: #2CD5C4; /* Change success color */
  /* ... other colors */
}
```

### Adding New Rooms
Update the `availableRooms` array in `js/demo-app.js`:
```javascript
availableRooms: ['demo-chat', 'tech', 'general', 'new-room'],
```

### Modifying Auto-Publisher Messages
Edit the `messages` object in the `startAutoPublisher` method:
```javascript
const messages = {
  alice: ['New message 1', 'New message 2'],
  bob: ['Bob message 1', 'Bob message 2']
};
```

## ▶ Live Streaming Optimizations

### Ultrawide Screen Support
- Grid layout optimized for 21:9 and 32:9 aspect ratios
- Larger font sizes at 1920px+ width
- Increased chat message height for better visibility
- Professional spacing for camera capture

### Presentation Features
- High contrast color scheme for projectors
- Large, readable fonts
- Clear visual hierarchy
- Collapsible setup for clean demo state

### Keyboard Shortcuts
- `Ctrl/Cmd + F`: Trigger failure simulation
- `Ctrl/Cmd + R`: Reset demo (overrides browser refresh)

## ◇ Testing

### Manual Testing Checklist
- [ ] WebSocket connections establish successfully
- [ ] Auto-publishers start and send messages
- [ ] Room joining/leaving works for both clients
- [ ] Failure simulation shows different behaviors
- [ ] Manual recovery works for node-redis
- [ ] Backend logs update in real-time
- [ ] Log filtering works correctly
- [ ] Export functionality works
- [ ] Modal opens/closes properly
- [ ] Responsive design works on different screen sizes

### Browser Compatibility
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support

## ⬢ Performance Characteristics

### Bundle Size
- **Alpine.js**: ~15KB gzipped
- **Pico CSS**: ~10KB gzipped
- **Custom CSS**: ~8KB gzipped
- **JavaScript**: ~12KB gzipped
- **Total**: ~45KB (vs 200KB+ for typical React apps)

### Memory Usage
- Minimal DOM manipulation
- Efficient WebSocket handling
- Log rotation (max 100 entries per client)
- No memory leaks in long-running demos

### Real-time Performance
- Immediate UI updates via Alpine.js reactivity
- Efficient message rendering with x-for templates
- Auto-scrolling with minimal DOM queries
- Professional 60fps animations

## ◇ Contributing

### Code Style
- Use semantic HTML with Pico CSS classes
- Follow Alpine.js conventions for data binding
- Maintain Valkey color palette consistency
- Write professional, production-ready code

### Adding Features
1. Update `demo-app.js` for new functionality
2. Add corresponding CSS in `valkey-theme.css`
3. Update WebSocket protocol documentation
4. Test across different screen sizes

## ⬢ License

This demo frontend is part of the Valkey GLIDE demonstration project. See the main project license for terms.
