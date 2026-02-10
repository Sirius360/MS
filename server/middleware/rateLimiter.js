// ===== server/middleware/rateLimiter.js =====
// Rate limiting middleware to prevent abuse and DDoS attacks

import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * Applies to all API endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests in some cases
  skipSuccessfulRequests: false,
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: {
    success: false,
    error: 'Too many login attempts from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * Looser rate limiter for read operations
 * Allows more frequent reads
 */
export const readLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    success: false,
    error: 'Too many requests, please slow down',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter rate limiter for write operations
 * Prevents rapid creation/updates
 */
export const writeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 write requests per minute
  message: {
    success: false,
    error: 'Too many write operations, please slow down',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Very strict limiter for batch operations
 */
export const batchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 batch operations per 5 minutes
  message: {
    success: false,
    error: 'Too many batch operations, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default {
  apiLimiter,
  authLimiter,
  readLimiter,
  writeLimiter,
  batchLimiter,
};
