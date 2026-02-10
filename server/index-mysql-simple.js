// ===== server/index-mysql-simple.js =====
// High-performance MySQL server - Simplified version

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { mysqlDB } from './database/mysqlAdapter.js';
import pool from './database/mysqlPool.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT) || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Helper
const paginate = (data, total, page, limit) => ({
  data,
  pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page < Math.ceil(total / limit), hasPrev: page > 1 }
});

// ===== ENDPOINTS =====

// Root
app.get('/', (req, res) => {
  res.json({
    name: 'High-Performance MySQL API',
    version: '2.0.0',
    database: 'MySQL 9.6.0',
    optimizations: ['Connection Pooling', 'LRU Caching', 'Query Optimization', 'Batch Operations'],
    endpoints: { health: '/health', products: '/products' }
  });
});

// Health check
app.get('/health', async (req, res) => {
  const health = await mysqlDB.healthCheck();
  const stats = await mysqlDB.getStats();
  res.json({ ...health, stats });
});

// Products LIST (cached, paginated)
app.get('/api/products', async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let products, total;
    
    if (search) {
      products = await mysqlDB.search('products', 'name', search, { limit: parseInt(limit), offset });
      total = products.length;
    } else {
      [products, total] = await Promise.all([
        mysqlDB.findAll('products', { limit: parseInt(limit), offset, cacheTTL: 60 }),
        mysqlDB.count('products', {}, 60)
      ]);
    }
    
    res.json(paginate(products, total, parseInt(page), parseInt(limit)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Product GET by ID (cached)
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await mysqlDB.findById('products', req.params.id, 300);
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Product CREATE
app.post('/api/products', async (req, res) => {
  try {
    const product = await mysqlDB.insert('products', req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Product UPDATE
app.put('/api/products/:id', async (req, res) => {
  try {
    const success = await mysqlDB.update('products', req.params.id, req.body);
    if (!success) return res.status(404).json({ error: 'Not found' });
    const updated = await mysqlDB.findById('products', req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Product DELETE
app.delete('/api/products/:id', async (req, res) => {
  try {
    const success = await mysqlDB.delete('products', req.params.id);
    if (!success) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== START SERVER =====

const server = app.listen(PORT, async () => {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 HIGH-PERFORMANCE MySQL SERVER');
  console.log('='.repeat(70));
  console.log(`\n📍 URL: http://localhost:${PORT}`);
  console.log(`🗄️  Database: MySQL 9.6.0\n`);
  
  const health = await mysqlDB.healthCheck();
  if (health.healthy) {
    console.log('✅ MySQL: CONNECTED');
    const stats = await mysqlDB.getStats();
    console.log(`\n📊 Records:`);
    Object.entries(stats.records).forEach(([t, c]) => console.log(`   ${t}: ${c}`));
    console.log(`\n💾 Cache: ${stats.cacheStats.size} entries`);
  }
  
  console.log(`\n⚡ Optimizations:`);
  console.log('   ✅ Connection Pooling (10 connections)');
  console.log('   ✅ LRU Cache (TTL-based)');
  console.log('   ✅ Query Optimization');
  console.log('   ✅ Batch Operations');
  console.log('   ✅ Transaction Support');
  
  console.log(`\n📡 Endpoints:`);
  console.log('   GET  /              - API info');
  console.log('   GET  /health        - Health check');
  console.log('   GET  /products      - List (cached)');
  console.log('   GET  /products/:id  - Get (cached)');
  console.log('   POST /products      - Create');
  console.log('   PUT  /products/:id  - Update');
  console.log('   DELETE /products/:id - Delete');
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ SERVER READY - HIGH PERFORMANCE MODE');
  console.log('='.repeat(70) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down...');
  server.close(async () => {
    await pool.end();
    console.log('✅ Closed');
    process.exit(0);
  });
});
