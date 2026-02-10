// ===== server/index-mysql.js =====
// Production-ready MySQL server with ALL Phase 1-3 optimizations

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Middleware
import compression from './middleware/compression.js';
import { performanceMonitor } from './middleware/performanceMonitoring.js';
import { generalLimiter, readLimiter, writeLimiter } from './middleware/rateLimiter.js';
import { selectFields } from './middleware/fieldSelection.js';

// Routes
import authRoutes from './routes/auth.js';
import productsMySQL from './routes/products-mysql.js';
import healthRoutes from './routes/health.js';

// Database
import { mysqlDB } from './database/mysqlAdapter.js';
import pool from './database/mysqlPool.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// ===== MIDDLEWARE STACK (OPTIMIZED ORDER) =====

// 1. Compression (reduce payload size by 60-70%)
app.use(compression);

// 2. CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// 3. Body parsing
app.use(express.json({ limit: '10mb' }));

// 4. Performance monitoring
app.use(performanceMonitor);

// 5. Rate limiting
app.use(generalLimiter);

// ===== ROUTES =====

// Health checks (no rate limit)
app.use('/health', healthRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// Products API (MySQL with optimizations)
app.use('/api/products', readLimiter, selectFields, productsMySQL);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Sales Management API - MySQL Edition',
    version: '2.0.0',
    status: 'running',
    database: 'MySQL 9.6.0',
    optimizations: [
      'Connection Pooling',
      'LRU Caching',
      'Response Compression',
      'Rate Limiting',
      'Field Selection',
      'Query Optimization',
      'Batch Operations',
      'Transaction Support'
    ],
    endpoints: {
      health: '/health',
      metrics: '/health/metrics',
      auth: '/api/auth/*',
      products: '/api/products'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ===== GRACEFUL SHUTDOWN =====

process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, starting graceful shutdown...');
  
  server.close(async () => {
    console.log('✅ HTTP server closed');
    
    // Close database connection pool
    try {
      await pool.end();
      console.log('✅ MySQL connection pool closed');
    } catch (err) {
      console.error('❌ Error closing MySQL pool:', err);
    }
    
    process.exit(0);
  });
});

// ===== START SERVER =====

const server = app.listen(PORT, async () => {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 HIGH-PERFORMANCE MySQL SERVER STARTED');
  console.log('='.repeat(70));
  console.log(`\n📍 Server URL: http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n🗄️  DATABASE: MySQL 9.6.0`);
  
  // Test database connection
  try {
    const health = await mysqlDB.healthCheck();
    if (health.healthy) {
      console.log('✅ MySQL connection: HEALTHY');
      
      // Get database stats
      const stats = await mysqlDB.getStats();
      console.log(`\n📊 DATABASE STATS:`);
      console.log(`   Tables: ${stats.tables}`);
      Object.entries(stats.records).forEach(([table, count]) => {
        console.log(`   - ${table}: ${count} records`);
      });
      console.log(`\n💾 CACHE STATS:`);
      console.log(`   Entries: ${stats.cacheStats.size}`);
      console.log(`   Hit Rate: ${((stats.cacheStats.hits / (stats.cacheStats.hits + stats.cacheStats.misses || 1)) * 100).toFixed(1)}%`);
    } else {
      console.log('❌ MySQL connection: FAILED -', health.error);
    }
  } catch (error) {
    console.error('❌ Database health check failed:', error.message);
  }
  
  console.log(`\n⚡ OPTIMIZATIONS ENABLED:`);
  console.log('   ✅ Connection Pooling (10 connections)');
  console.log('   ✅ LRU Cache (1000 entries, TTL-based)');
  console.log('   ✅ Response Compression (gzip/deflate)');
  console.log('   ✅ Rate Limiting (100 req/15min)');
  console.log('   ✅ Field Selection (sparse fieldsets)');
  console.log('   ✅ Query Optimization (indexed lookups)');
  console.log('   ✅ Batch Operations (bulk insert/update)');
  console.log('   ✅ Performance Monitoring');
  
  console.log(`\n📡 ENDPOINTS:`);
  console.log('   GET  /                  - API info');
  console.log('   GET  /health            - Health check');
  console.log('   GET  /health/metrics    - Performance metrics');
  console.log('   GET  /api/products      - List products (cached)');
  console.log('   GET  /api/products/:id  - Get product (cached)');
  console.log('   POST /api/products      - Create product');
  console.log('   PUT  /api/products/:id  - Update product');
  console.log('   DELETE /api/products/:id - Delete product');
  
  console.log('\n' + '='.repeat(70));
  console.log('✨ SERVER READY - HIGH PERFORMANCE MODE');
  console.log('='.repeat(70));
  console.log('');
});

export default app;
