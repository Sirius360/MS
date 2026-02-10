// ===== server/middleware/performanceMonitoring.js =====
// Performance monitoring and request tracking

export class PerformanceMonitor {
  /**
   * Middleware to track request performance
   */
  static track(req, res, next) {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    // Capture original send method
    const originalSend = res.send.bind(res);
    
    res.send = function (data) {
      const duration = Date.now() - startTime;
      const endMemory = process.memoryUsage();
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

      // Log slow requests (> 1 second)
      if (duration > 1000) {
        console.warn(`⚠️  SLOW REQUEST: ${req.method} ${req.path} took ${duration}ms`);
      }

      // Log request metrics
      const logData = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
        memoryDelta: `${(memoryDelta / 1024 / 1024).toFixed(2)}MB`,
        statusCode: res.statusCode,
        ip: req.ip,
      };

      // Log at appropriate level based on status code
      if (res.statusCode >= 500) {
        console.error('❌ Server Error:', logData);
      } else if (res.statusCode >= 400) {
        console.warn('⚠️  Client Error:', logData);
      } else if (duration > 500) {
        console.warn('🐌 Slow Response:', logData);
      } else {
        console.log('✅', logData);
      }

      return originalSend(data);
    };

    next();
  }

  /**
   * Get system metrics
   */
  static getMetrics() {
    const mem = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      uptime: Math.floor(process.uptime()),
      uptimeFormatted: this.formatUptime(process.uptime()),
      memory: {
        heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        rss: `${(mem.rss / 1024 / 1024).toFixed(2)}MB`,
        external: `${(mem.external / 1024 / 1024).toFixed(2)}MB`,
      },
      cpu: {
        user: `${(cpuUsage.user / 1000000).toFixed(2)}s`,
        system: `${(cpuUsage.system / 1000000).toFixed(2)}s`,
      },
      process: {
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };
  }

  /**
   * Format uptime to human readable string
   */
  static formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }

  /**
   * Get aggregated performance statistics
   */
  static getStats() {
    return {
      metrics: this.getMetrics(),
      timestamp: new Date().toISOString(),
    };
  }
}

export default PerformanceMonitor;
