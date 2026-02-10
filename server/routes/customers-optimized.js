// ===== server/routes/customers-optimized.js =====
// OPTIMIZED Customers routes with caching, pagination, and performance improvements

import express from 'express';
import { optimizedDB } from '../database/optimizedJsonDB.js';
import { cache } from '../config/memoryCache.js';
import { PaginationHelper } from '../utils/pagination.js';
import { generateUUID } from '../utils/helpers.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Cache TTL configuration
const CACHE_TTL = {
  CUSTOMERS_LIST: 300,      // 5 minutes
  CUSTOMER_DETAIL: 600,     // 10 minutes
};

/**
 * GET /api/customers
 * OPTIMIZED: List customers with caching and pagination
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, type, page = 1, limit = 50 } = req.query;
    
    // Create cache key based on query params
    const cacheKey = `customers:list:${search || ''}:${type || ''}:${page}:${limit}`;

    const result = await cache.getOrSet(
      cacheKey,
      async () => {
        // Fetch all customers (from memory cache in optimizedDB)
        let customers = await optimizedDB.findAll('customers', { isDeleted: false });

        // Apply filters
        if (search) {
          const searchLower = search.toLowerCase();
          customers = customers.filter(c =>
            (c.name && c.name.toLowerCase().includes(searchLower)) ||
            (c.phone && c.phone.includes(search)) ||
            (c.email && c.email.toLowerCase().includes(searchLower))
          );
        }

        if (type) {
          customers = customers.filter(c => c.type === type);
        }

        // Sort by name
        customers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        // Apply pagination
        return PaginationHelper.paginate(customers, page, limit);
      },
      CACHE_TTL.CUSTOMERS_LIST
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/customers/search
 * OPTIMIZED: Search customers with caching
 */
router.get('/search', authenticate, async (req, res) => {
  try {
    const { query } = req.query;
    const cacheKey = `customers:search:${query || 'all'}`;

    const customers = await cache.getOrSet(
      cacheKey,
      async () => {
        let customers = await optimizedDB.findAll('customers', { isDeleted: false });

        if (query) {
          const searchLower = query.toLowerCase();
          customers = customers.filter(c =>
            (c.name && c.name.toLowerCase().includes(searchLower)) ||
            (c.phone && c.phone.includes(query)) ||
            (c.email && c.email.toLowerCase().includes(searchLower))
          );
        }

        return customers;
      },
      CACHE_TTL.CUSTOMERS_LIST
    );

    res.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error('Search customers error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/customers/:id
 * OPTIMIZED: Get single customer with caching and indexed lookup
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `customer:${id}`;

    const customer = await cache.getOrSet(
      cacheKey,
      async () => {
        // Use indexed lookup (O(1) instead of O(n))
        const c = await optimizedDB.findById('customers', id);
        
        if (!c || c.isDeleted) {
          return null;
        }

        return c;
      },
      CACHE_TTL.CUSTOMER_DETAIL
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/customers
 * OPTIMIZED: Create customer with cache invalidation
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      name,
      type = 'retail',
      phone,
      email,
      address,
      taxCode,
      notes,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required',
      });
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const existing = await optimizedDB.findOne('customers', { phone, isDeleted: false });
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Phone number already exists',
        });
      }
    }

    // Create customer
    const customerId = generateUUID();

    const newCustomer = await optimizedDB.insert('customers', {
      id: customerId,
      name,
      type,
      phone,
      email,
      address,
      taxCode,
      notes,
      totalPurchases: 0,
      totalDebt: 0,
      isDeleted: false,
    });

    // Invalidate related caches
    cache.delPattern('customers:list:*');
    cache.delPattern('customers:search:*');

    res.status(201).json({
      success: true,
      data: newCustomer,
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * PUT /api/customers/:id
 * OPTIMIZED: Update customer with cache invalidation
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if customer exists
    const customer = await optimizedDB.findById('customers', id);

    if (!customer || customer.isDeleted) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    // Check phone uniqueness if updating
    if (updates.phone && updates.phone !== customer.phone) {
      const existing = await optimizedDB.findOne('customers', { phone: updates.phone, isDeleted: false });
      if (existing && existing.id !== id) {
        return res.status(400).json({
          success: false,
          error: 'Phone number already exists',
        });
      }
    }

    // Update customer
    const updatedCustomer = await optimizedDB.update('customers', id, updates);

    // Invalidate caches
    cache.del(`customer:${id}`);
    cache.delPattern('customers:list:*');
    cache.delPattern('customers:search:*');

    res.json({
      success: true,
      data: updatedCustomer,
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * DELETE /api/customers/:id
 * OPTIMIZED: Soft delete with cache invalidation
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await optimizedDB.softDelete('customers', id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    // Invalidate caches
    cache.del(`customer:${id}`);
    cache.delPattern('customers:list:*');
    cache.delPattern('customers:search:*');

    res.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
