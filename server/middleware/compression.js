// ===== server/middleware/compression.js =====
// Response compression middleware for reducing payload size

import compression from 'compression';

/**
 * Compression middleware configuration
 * Compresses responses to reduce bandwidth and improve load times
 */
export const compressionMiddleware = compression({
  // Compression filter
  filter: (req, res) => {
    // Don't compress if client sends x-no-compression header
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Use compression for all responses by default
    return compression.filter(req, res);
  },
  
  // Compression level (0-9)
  // 6 is a good balance between compression ratio and speed
  level: 6,
  
  // Only compress responses larger than 1KB
  threshold: 1024,
  
  // Memory level (1-9)
  // Higher = better compression but more memory
  memLevel: 8,
});

export default compressionMiddleware;
