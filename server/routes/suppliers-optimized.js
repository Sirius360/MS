// ===== server/routes/suppliers-optimized.js =====
// OPTIMIZED Suppliers routes with caching, pagination, and performance improvements

import express from 'express';
import { optimizedDB } from '../database/optimizedJsonDB.js';
import { cache } from '../config/memoryCache.js';
import { PaginationHelper } from '../utils/pagination.js';
import { generateUUID } from '../utils/helpers.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Cache TTL configuration
const CACHE_TTL = {
  SUPPLIERS_LIST: 300,      // 5 minutes
  SUPPLIER_DETAIL: 600,     // 10 minutes
};

/**
 * GET /api/suppliers
 * OPTIMIZED: List suppliers with caching and pagination
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    
    // Create cache key based on query params
    const cacheKey = `suppliers:list:${search || ''}:${page}:${limit}`;

    const result = await cache.getOrSet(
      cacheKey,
      async () => {
        // Fetch all suppliers (from memory cache in optimizedDB)
        let suppliers = await optimizedDB.findAll('suppliers', { isDeleted: false });

        // Apply filters
        if (search) {
          const searchLower = search.toLowerCase();
          suppliers = suppliers.filter(s =>
            (s.name && s.name.toLowerCase().includes(searchLower)) ||
            (s.phone && s.phone.includes(search)) ||
            (s.email && s.email.toLowerCase().includes(searchLower))
          );
        }

        // Sort by name
        suppliers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        // Apply pagination
        return PaginationHelper.paginate(suppliers, page, limit);
      },
      CACHE_TTL.SUPPLIERS_LIST
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/suppliers/search
 * OPTIMIZED: Search suppliers with caching
 */
router.get('/search', authenticate, async (req, res) => {
  try {
    const { query } = req.query;
    const cacheKey = `suppliers:search:${query || 'all'}`;

    const suppliers = await cache.getOrSet(
      cacheKey,
      async () => {
        let suppliers = await optimizedDB.findAll('suppliers', { isDeleted: false });

        if (query) {
          const searchLower = query.toLowerCase();
          suppliers = suppliers.filter(s =>
            (s.name && s.name.toLowerCase().includes(searchLower)) ||
            (s.phone && s.phone.includes(query)) ||
            (s.email && s.email.toLowerCase().includes(searchLower))
          );
        }

        return suppliers;
      },
      CACHE_TTL.SUPPLIERS_LIST
    );

    res.json({
      success: true,
      data: suppliers,
    });
  } catch (error) {
    console.error('Search suppliers error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/suppliers/:id
 * OPTIMIZED: Get single supplier with caching and indexed lookup
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `supplier:${id}`;

    const supplier = await cache.getOrSet(
      cacheKey,
      async () => {
        // Use indexed lookup (O(1) instead of O(n))
        const s = await optimizedDB.findById('suppliers', id);
        
        if (!s || s.isDeleted) {
          return null;
        }

        return s;
      },
      CACHE_TTL.SUPPLIER_DETAIL
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found',
      });
    }

    res.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/suppliers
 * OPTIMIZED: Create supplier with cache invalidation
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      taxCode,
      contactPerson,
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
      const existing = await optimizedDB.findOne('suppliers', { phone, isDeleted: false });
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Phone number already exists',
        });
      }
    }

    // Create supplier
    const supplierId = generateUUID();

    const newSupplier = await optimizedDB.insert('suppliers', {
      id: supplierId,
      name,
      phone,
      email,
      address,
      taxCode,
      contactPerson,
      notes,
      totalPurchases: 0,
      totalDebt: 0,
      isDeleted: false,
    });

    // Invalidate related caches
    cache.delPattern('suppliers:list:*');
    cache.delPattern('suppliers:search:*');

    res.status(201).json({
      success: true,
      data: newSupplier,
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * PUT /api/suppliers/:id
 * OPTIMIZED: Update supplier with cache invalidation
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if supplier exists
    const supplier = await optimizedDB.findById('suppliers', id);

    if (!supplier || supplier.isDeleted) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found',
      });
    }

    // Check phone uniqueness if updating
    if (updates.phone && updates.phone !== supplier.phone) {
      const existing = await optimizedDB.findOne('suppliers', { phone: updates.phone, isDeleted: false });
      if (existing && existing.id !== id) {
        return res.status(400).json({
          success: false,
          error: 'Phone number already exists',
        });
      }
    }

    // Update supplier
    const updatedSupplier = await optimizedDB.update('suppliers', id, updates);

    // Invalidate caches
    cache.del(`supplier:${id}`);
    cache.delPattern('suppliers:list:*');
    cache.delPattern('suppliers:search:*');

    res.json({
      success: true,
      data: updatedSupplier,
    });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * DELETE /api/suppliers/:id
 * OPTIMIZED: Soft delete with cache invalidation
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await optimizedDB.softDelete('suppliers', id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found',
      });
    }

    // Invalidate caches
    cache.del(`supplier:${id}`);
    cache.delPattern('suppliers:list:*');
    cache.delPattern('suppliers:search:*');

    res.json({
      success: true,
      message: 'Supplier deleted successfully',
    });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
