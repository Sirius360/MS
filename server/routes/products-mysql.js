// ===== server/routes/products-mysql.js =====
// High-performance MySQL-based products routes

import express from 'express';
import { mysqlDB } from '../database/mysqlAdapter.js';

const router = express.Router();

// Helper: build paginated response
const buildPaginatedResponse = (data, total, page, limit, req) => {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

// ===== OPTIMIZED ENDPOINTS =====

/**
 * GET /products - List all products with pagination, caching, and filtering
 * Query params: page, limit, groupId, brandId, status, search
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      groupId,
      brandId,
      status,
      search
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let products;
    let total;
    
    // Search by name or SKU
    if (search) {
      products = await mysqlDB.search('products', 'name', search, {
        limit: parseInt(limit),
        offset
      });
      total = products.length; // Approximate
    } else {
      // Build filter
      const filter = {};
      if (groupId) filter.groupId = groupId;
      if (brandId) filter.brandId = brandId;
      if (status) filter.status = status;
      
      // Get products and total count (both cached)
      [products, total] = await Promise.all([
        mysqlDB.findAll('products', {
          filter,
          limit: parseInt(limit),
          offset,
          orderBy: 'createdAt',
          orderDir: 'DESC',
          cacheTTL: 60
        }),
        mysqlDB.count('products', filter, 60)
      ]);
    }
    
    // Paginate response
    const result = buildPaginatedResponse(products, total, parseInt(page), parseInt(limit), req);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /products/:id - Get single product (cached)
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await mysqlDB.findById('products', req.params.id, 300);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /products - Create new product
 */
router.post('/', async (req, res) => {
  try {
    const product = await mysqlDB.insert('products', req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /products/:id - Update product
 */
router.put('/:id', async (req, res) => {
  try {
    const success = await mysqlDB.update('products', req.params.id, req.body);
    
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Return updated product
    const updated = await mysqlDB.findById('products', req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /products/:id - Delete product
 */
router.delete('/:id', async (req, res) => {
  try {
    const success = await mysqlDB.delete('products', req.params.id, true); // Soft delete
    
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /products/stats - Get product statistics (cached)
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await mysqlDB.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'in_stock' THEN 1 ELSE 0 END) as in_stock,
        SUM(CASE WHEN status = 'out_of_stock' THEN 1 ELSE 0 END) as out_of_stock,
        SUM(stockQty) as total_stock
       FROM products
       WHERE isDeleted = FALSE`,
      [],
      'products:stats',
      300
    );
    
    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
