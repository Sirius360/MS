// ===== server/index-phase2.js =====
// SERVER with Phase 1 + Phase 2 optimizations

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { optimizedDB } from './database/optimizedJsonDB.js';
import { cache } from './config/memoryCache.js';
import { compressionMiddleware } from './middleware/compression.js';
import { PerformanceMonitor } from './middleware/performanceMonitoring.js';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';
import { fieldSelection } from './middleware/fieldSelection.js';

// Import routes
import authRoutes from './routes/auth.js';
import productsOptimizedRoutes from './routes/products-optimized.js';
import productGroupsOptimizedRoutes from './routes/productGroups-optimized.js';
import brandsOptimizedRoutes from './routes/brands-optimized.js';
import customersOptimizedRoutes from './routes/customers-optimized.js';
import suppliersOptimizedRoutes from './routes/suppliers-optimized.js';
import importsRoutes from './routes/imports.js';
import invoicesRoutes from './routes/invoices.js';
import dashboardRoutes from './routes/dashboard.js';
import stockCardRoutes from './routes/stockCard.js';
import healthRoutes from './routes/health.js';
import batchRoutes from './routes/batch.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ===== MIDDLEWARE =====

// Compression (must be early in the chain)
app.use(compressionMiddleware);

// CORS
app.use(cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Performance monitoring
app.use(PerformanceMonitor.track);

// Field selection (sparse fieldsets)
app.use(fieldSelection);

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ===== ROUTES =====

// Health checks (no auth, no rate limit)
app.use('/health', healthRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Quản lý bán hàng API - Phase 2',
    version: '2.1.0',
    storage: 'Optimized JSON (in-memory + file)',
    features: [
      'Phase 1: In-memory caching',
      'Phase 1: Indexed lookups (O(1))',
      'Phase 1: Response compression',
      'Phase 1: Pagination support',
      'Phase 1: Performance monitoring',
      'Phase 2: Rate limiting',
      'Phase 2: Request validation',
      'Phase 2: Field selection',
      'Phase 2: Batch operations',
    ],
    endpoints: {
      health: '/health',
      metrics: '/health/metrics',
      auth: '/api/auth (rate limited: 5/15min)',
      products: '/api/products (rate limited: 100/15min)',
      batch: '/api/batch/* (rate limited: 10/5min)',
      customers: '/api/customers',
      suppliers: '/api/suppliers',
    },
  });
});

// API Routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes); // Strict limit for auth
app.use('/api/products', apiLimiter, productsOptimizedRoutes); // General API limit
app.use('/api/products', apiLimiter, stockCardRoutes);
app.use('/api/product-groups', apiLimiter, productGroupsOptimizedRoutes);
app.use('/api/brands', apiLimiter, brandsOptimizedRoutes);
app.use('/api/customers', apiLimiter, customersOptimizedRoutes);
app.use('/api/suppliers', apiLimiter, suppliersOptimizedRoutes);
app.use('/api/imports', apiLimiter, importsRoutes);
app.use('/api/invoices', apiLimiter, invoicesRoutes);
app.use('/api/dashboard', apiLimiter, dashboardRoutes);
app.use('/api/batch', batchRoutes); // Batch has its own stricter limiter

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ===== SERVER STARTUP =====

async function startServer() {
  try {
    console.log('');
    console.log('='.repeat(70));
    console.log('🚀 Starting Phase 2 Server...');
    console.log('='.repeat(70));

    // Initialize optimized database
    console.log('📂 Initializing optimized database...');
    await optimizedDB.initialize();
    
    const dbStats = optimizedDB.getStats();
    console.log(`   ✅ Database ready: ${dbStats.tables} tables, ${dbStats.totalRecords} records`);
    console.log(`   📊 Memory usage: ${dbStats.memoryUsageMB}MB`);

    // Initialize cache
    console.log('🗄️  Initializing cache...');
    const cacheStats = cache.getStats();
    console.log(`   ✅ Cache ready: ${cacheStats.size}/${cacheStats.maxSize} entries`);

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('='.repeat(70));
      console.log('✅ Server RUNNING with Phase 1 + Phase 2!');
      console.log('='.repeat(70));
      console.log(`📡 API Server: http://localhost:${PORT}`);
      console.log(`🔍 Health: http://localhost:${PORT}/health`);
      console.log(`📊 Metrics: http://localhost:${PORT}/health/metrics`);
      console.log('');
      console.log('🎯 Phase 1 Features:');
      console.log('   ✓ In-memory caching with TTL');
      console.log('   ✓ O(1) indexed lookups');
      console.log('   ✓ Response compression (gzip)');
      console.log('   ✓ Pagination support');
      console.log('   ✓ Performance monitoring');
      console.log('');
      console.log('🛡️  Phase 2 Features:');
      console.log('   ✓ Rate limiting (100/15min general, 5/15min auth)');
      console.log('   ✓ Request validation (Joi schemas)');
      console.log('   ✓ Field selection (?fields=id,name,price)');
      console.log('   ✓ Batch operations (create/update bulk)');
      console.log('');
      console.log('📚 New endpoints:');
      console.log('   POST   /api/batch/products       - Bulk create products');
      console.log('   PUT    /api/batch/products       - Bulk update products');
      console.log('   POST   /api/batch/customers      - Bulk create customers');
      console.log('   POST   /api/batch/suppliers      - Bulk create suppliers');
      console.log('');
      console.log('🔒 Rate Limits:');
      console.log('   Auth:    5 requests per 15 minutes');
      console.log('   API:     100 requests per 15 minutes');
      console.log('   Read:    60 requests per minute');
      console.log('   Write:   20 requests per minute');
      console.log('   Batch:   10 requests per 5 minutes');
      console.log('='.repeat(70));
      console.log('');
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('\n🛑 SIGTERM received, shutting down gracefully...');
      await optimizedDB.flushPendingWrites();
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('\n🛑 SIGINT received, shutting down gracefully...');
      await optimizedDB.flushPendingWrites();
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
