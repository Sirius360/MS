// ===== server/routes/health.js =====
// Health check and system status endpoints

import express from 'express';
import { optimizedDB } from '../database/optimizedJsonDB.js';
import { cache } from '../config/memoryCache.js';
import { PerformanceMonitor } from '../middleware/performanceMonitoring.js';

const router = express.Router();

/**
 * GET /health
 * Basic health check endpoint
 */
router.get('/', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {},
  };

  // Check database
  try {
    const stats = optimizedDB.getStats();
    health.services.database = {
      status: 'up',
      tables: stats.tables,
      records: stats.totalRecords,
      memoryMB: stats.memoryUsageMB,
    };
  } catch (error) {
    health.services.database = {
      status: 'down',
      error: error.message,
    };
    health.status = 'degraded';
  }

  // Check cache
  try {
    const cacheStats = cache.getStats();
    health.services.cache = {
      status: 'up',
      size: cacheStats.size,
      maxSize: cacheStats.maxSize,
      sizeKB: cacheStats.totalSizeKB,
    };
  } catch (error) {
    health.services.cache = {
      status: 'down',
      error: error.message,
    };
  }

  // Set appropriate status code
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * GET /health/metrics
 * Detailed system metrics
 */
router.get('/metrics', (req, res) => {
  try {
    const metrics = PerformanceMonitor.getMetrics();
    const dbStats = optimizedDB.getStats();
    const cacheStats = cache.getStats();

    res.json({
      success: true,
      data: {
        system: metrics,
        database: dbStats,
        cache: cacheStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get metrics',
    });
  }
});

/**
 * GET /health/ready
 * Readiness probe for load balancers
 */
router.get('/ready', async (req, res) => {
  try {
    // Check if database is ready
    await optimizedDB.readData('users');
    
    res.json({
      ready: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      error: error.message,
    });
  }
});

/**
 * GET /health/live
 * Liveness probe for container orchestration
 */
router.get('/live', (req, res) => {
  res.json({
    alive: true,
    timestamp: new Date().toISOString(),
  });
});

export default router;
