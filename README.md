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
- **Problem Clients**: `node-redis` (primary), `ioredis` (stretch)
- **Solution**: `valkey-glide` + `GlideClusterClient`  
- **Backend**: NestJS with service abstraction
- **Frontend**: React with diagnostic status indicators

## Success Metrics
1. "I've experienced this exact problem" (Recognition)
2. "No more reconnection boilerplate" (Efficiency)  
3. "This scales in production" (Reliability)
4. "I want to try this" (Adoption)
