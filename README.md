# Valkey GLIDE Demo: Pub/Sub Resilience

**Target**: Technical builders experiencing Redis Pub/Sub subscription loss issues  
**Objective**: Show `valkey-glide` eliminating reconnection boilerplate via declarative configuration

## Demo Story

**Part 1 - The Problem**:
- `node-redis` chat works normally
- `CLIENT KILL` simulates production failure  
- Connection restores, subscriptions lost
- Highlight manual state management complexity

**Part 2 - The Solution**:
- Switch to `valkey-glide` with declarative `pubsubSubscriptions`
- Same failure scenario, automatic subscription restoration
- Bonus: Sharded Pub/Sub cluster efficiency

## Technology Stack
- **Backend**: NestJS with WebSocket Gateway
- **Frontend**: Alpine.js + Pico CSS (dual chat interface)
- **Problem Client**: `node-redis` (demonstrates subscription loss)
- **Solution Client**: `valkey-glide` (automatic subscription restoration)
- **Infrastructure**: Valkey cluster with sharded Pub/Sub

## Frontend Architecture
- **Framework**: Alpine.js (~15KB) for reactive UI
- **Styling**: Pico CSS (~10KB) for professional appearance  
- **Layout**: Dual chat windows for side-by-side comparison
- **Features**: Real-time status indicators, message delivery visualization
- **No build step**: Open index.html in browser

## Success Metrics
1. "I've experienced this exact problem" (Recognition)
2. "No more reconnection boilerplate" (Efficiency)  
3. "This scales in production" (Reliability)
4. "I want to try this" (Adoption)
