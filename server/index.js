// ===== server/index.js =====
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as jsonDB from './database/jsonDB.js';

// Import routes
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import productGroupsRoutes from './routes/productGroups.js';
import brandsRoutes from './routes/brands.js';
import customersRoutes from './routes/customers.js';
import suppliersRoutes from './routes/suppliers.js';
import importsRoutes from './routes/imports.js';
import invoicesRoutes from './routes/invoices.js';
import dashboardRoutes from './routes/dashboard.js';
import stockCardRoutes from './routes/stockCard.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Quản lý bán hàng API',
    version: '1.0.0',
    storage: 'JSON files',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      products: '/api/products',
      imports: '/api/imports',
      invoices: '/api/invoices',
      dashboard: '/api/dashboard'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    storage: 'JSON files'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/products', stockCardRoutes); // Stock card and COGS routes
app.use('/api/product-groups', productGroupsRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/imports', importsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
async function startServer() {
  try {
    // Initialize JSON database (ensure data directory exists)
    console.log('📂 Initializing JSON database...');
    await jsonDB.readData('users'); // This will create the data directory if needed
    console.log('✅ JSON database initialized');

    app.listen(PORT, () => {
      console.log('');
      console.log('='.repeat(60));
      console.log('🚀 Server is running with JSON-based storage!');
      console.log('='.repeat(60));
      console.log(`📡 API Server: http://localhost:${PORT}`);
      console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
      console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
      console.log(`💾 Storage: JSON files in ./server/data/`);
      console.log('='.repeat(60));
      console.log('');
      console.log('Available endpoints:');
      console.log('  POST   /api/auth/login');
      console.log('  POST   /api/auth/register');
      console.log('  GET    /api/auth/me');
      console.log('  GET    /api/products');
      console.log('  GET    /api/products/search?query=...');
      console.log('  PUT    /api/products/:id/set-sale-price');
      console.log('  GET    /api/imports');
      console.log('  POST   /api/imports');
      console.log('  GET    /api/imports/:id/print');
      console.log('  GET    /api/invoices');
      console.log('  POST   /api/invoices');
      console.log('  GET    /api/dashboard/stats');
      console.log('='.repeat(60));
      console.log('');
      console.log('📝 Default admin credentials:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('='.repeat(60));
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

startServer();
