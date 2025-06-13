/**
 * Valkey GLIDE Demo Configuration
 * Customize demo behavior without modifying core files
 */

window.VALKEY_DEMO_CONFIG = {
  // WebSocket Configuration
  websocket: {
    nodeRedisUrl: 'ws://localhost:3000/node-redis',
    valkeyGlideUrl: 'ws://localhost:3000/valkey-glide',
    reconnectDelay: 3000,
    maxReconnectAttempts: 5
  },

  // Demo Settings
  demo: {
    defaultRoom: 'demo-chat',
    availableRooms: ['demo-chat', 'tech', 'general'],
    maxChatMessages: 100,
    maxLogEntries: 100,
    autoScrollEnabled: true
  },

  // Auto-Publisher Configuration
  publishers: {
    alice: {
      enabled: true,
      interval: 3000, // milliseconds
      messages: [
        'Hello everyone!',
        'Great demo today!',
        'Love the tech!',
        'This is working perfectly!',
        'Automatic recovery is amazing!',
        'Valkey GLIDE rocks!',
        'Zero downtime chat!',
        'Production ready!'
      ]
    },
    bob: {
      enabled: true,
      interval: 4000, // milliseconds
      messages: [
        'Hey there!',
        'How\'s everyone doing?',
        'This technology is impressive!',
        'Messages flowing smoothly!',
        'Zero downtime, love it!',
        'Resilient connections!',
        'Scalable architecture!',
        'Enterprise ready!'
      ]
    },
    carol: {
      enabled: false, // Manual only
      messages: [
        'Manual message from Carol!',
        'How\'s the demo going?',
        'Still working perfectly here!',
        'Manual messages work great too!',
        'Interactive demo mode!',
        'On-demand messaging!'
      ]
    }
  },

  // UI Configuration
  ui: {
    theme: 'dark', // 'light' or 'dark'
    animations: true,
    compactMode: false,
    showTimestamps: true,
    enableKeyboardShortcuts: true,
    autoCollapseSetup: true
  },

  // Logging Configuration
  logging: {
    enableConsoleLogging: true,
    logLevels: ['error', 'warn', 'info', 'debug'],
    defaultLogFilter: 'all',
    exportFormat: 'json', // 'json' or 'csv'
    timestampFormat: 'HH:mm:ss' // or 'full' for full timestamp
  },

  // Demo Flow Configuration
  demoFlow: {
    setupPhaseSteps: [
      'Configure auto-publishers',
      'Join chat rooms',
      'Setup backend monitoring',
      'Save and collapse panels'
    ],
    mainDemoSteps: [
      'Show normal operation',
      'Trigger failure simulation',
      'Demonstrate resilience difference',
      'Show backend logs evidence'
    ],
    failureSimulation: {
      triggerDelay: 1000, // delay before showing effects
      recoveryDelay: 2000, // delay for valkey-glide auto-recovery
      showRecoveryActions: true // show manual recovery buttons for node-redis
    }
  },

  // Scaling Explanation Content
  scalingExplanation: {
    title: '◉ Scaling with Sharded Pub/Sub',
    sections: [
      {
        title: 'The Cluster Flooding Problem',
        content: 'In standard cluster Pub/Sub, publishing a message floods it to every single primary node, creating unnecessary network traffic and processing load.'
      },
      {
        title: 'Sharded Pub/Sub Solution',
        content: 'With Sharded Pub/Sub (Valkey 7.2+), messages are intelligently routed to just one node in the shard that owns the channel.'
      },
      {
        title: 'Benefits',
        benefits: [
          'Reduced network traffic',
          'Lower processing overhead',
          'Better cluster performance',
          'Declarative configuration',
          'Automatic shard selection',
          'Improved scalability'
        ]
      }
    ],
    codeExample: {
      language: 'typescript',
      code: `const client = await GlideClusterClient.createClient({
  addresses: [...],
  pubsubSubscriptions: {
    channelsAndPatterns: {
      [PubSubChannelModes.Sharded]: new Set(['room-1'])
    },
    callback: (message, context) => {
      // Handle messages with automatic recovery
    }
  }
});

// Publishing with sharded mode
await client.publish('room-1', 'Hello, scalable world!', true);`
    }
  },

  // Ultrawide Screen Optimizations
  ultrawide: {
    desktop: 1200,
    ultrawide: 1920
  },

  // Performance Settings
  performance: {
    messageRenderBatchSize: 10,
    logRenderBatchSize: 20,
    scrollThrottleMs: 100,
    resizeThrottleMs: 250
  },

  // Development Settings
  development: {
    enableDebugMode: false,
    mockWebSocket: false,
    simulateLatency: 0,
    enablePerformanceMetrics: false
  }
};

// Merge with any custom configuration
if (window.VALKEY_DEMO_CUSTOM_CONFIG) {
  window.VALKEY_DEMO_CONFIG = {
    ...window.VALKEY_DEMO_CONFIG,
    ...window.VALKEY_DEMO_CUSTOM_CONFIG
  };
}

console.log('Valkey GLIDE Demo configuration loaded:', window.VALKEY_DEMO_CONFIG);
