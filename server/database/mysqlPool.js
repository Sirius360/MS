// ===== server/database/mysqlPool.js =====
// MySQL connection pool with optimizations

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'quanlybanhang',
  
  // Pool configuration for performance
  waitForConnections: true,
  connectionLimit: 10,          // Max 10 concurrent connections
  maxIdle: 10,                  // Max idle connections
  idleTimeout: 60000,           // 60 seconds
  queueLimit: 0,                // No limit on queue
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  
  // Character set
  charset: 'utf8mb4',
  
  // Timezone
  timezone: '+07:00',
});

// Test connection on startup
pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL connection pool created successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection pool creation failed:', err.message);
  });

// Handle pool errors
pool.on('connection', (connection) => {
  console.log('New MySQL connection established');
});

pool.on('error', (err) => {
  console.error('MySQL pool error:', err.message);
});

export default pool;
