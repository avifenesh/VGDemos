# ElastiCache Configuration for Demo 1: Pub/Sub Chat

## Environment Variables Template

Copy this to your `.env` file in the backend directory:

```bash
# ElastiCache Cluster Configuration
ELASTICACHE_HOST=your-elasticache-cluster.cache.amazonaws.com
ELASTICACHE_PORT=6379

# For Redis Cluster mode (if using cluster-enabled ElastiCache)
ELASTICACHE_CLUSTER_MODE=true
ELASTICACHE_CLUSTER_ENDPOINTS=endpoint1:6379,endpoint2:6379,endpoint3:6379

# Demo Configuration
DEMO_MODE=development
LOG_LEVEL=debug

# WebSocket Configuration
WEBSOCKET_PORT=3001
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## ElastiCache Setup Notes

### For Demo Part 1 (node-redis)

- Can use either single-node or cluster-mode ElastiCache
- Standard Redis Pub/Sub will work on both configurations

### For Demo Part 2 (valkey-glide)

- Requires cluster-mode enabled ElastiCache for sharded pub/sub
- Must be Valkey 7.0+ or Redis 7.0+ for sharded pub/sub support
- Cluster should have multiple shards to demonstrate scalability

### Required ElastiCache Configuration

- **Engine**: Valkey 7.2+ or Redis 7.0+
- **Node Type**: cache.t3.micro or larger
- **Parameter Group**: Default or custom with pub/sub enabled
- **Security Group**: Allow inbound traffic on port 6379 from your demo environment
- **Subnet Group**: Ensure your demo environment can reach the cluster

### Demo Talking Points

1. **Single-node vs Cluster**: Explain why cluster mode is needed for sharded pub/sub
2. **AWS Managed**: Highlight that ElastiCache handles the infrastructure
3. **Scalability**: Show how easy it is to scale with more shards
4. **Reliability**: Built-in failover and automated backups
