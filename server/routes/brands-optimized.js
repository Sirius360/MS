// ===== server/routes/brands-optimized.js =====
// OPTIMIZED Brands routes with caching

import express from 'express';
import { optimizedDB } from '../database/optimizedJsonDB.js';
import { cache } from '../config/memoryCache.js';
import { generateUUID } from '../utils/helpers.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

const CACHE_TTL = {
  BRANDS_LIST: 3600,        // 1 hour (rarely changes)
  BRAND_DETAIL: 3600,
};

/**
 * GET /api/brands
 * OPTIMIZED: List all brands with caching
 */
router.get('/', async (req, res) => {
  try {
    const cacheKey = 'brands:all';

    const brands = await cache.getOrSet(
      cacheKey,
      async () => {
        const brands = await optimizedDB.findAll('brands');
        return brands.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      },
      CACHE_TTL.BRANDS_LIST
    );

    res.json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/brands/:id
 * OPTIMIZED: Get single brand with caching
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `brand:${id}`;

    const brand = await cache.getOrSet(
      cacheKey,
      async () => {
        return await optimizedDB.findById('brands', id);
      },
      CACHE_TTL.BRAND_DETAIL
    );

    if (!brand) {
      return res.status(404).json({
        success: false,
        error: 'Brand not found',
      });
    }

    res.json({
      success: true,
      data: brand,
    });
  } catch (error) {
    console.error('Get brand error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/brands
 * OPTIMIZED: Create brand with cache invalidation
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required',
      });
    }

    const brandId = generateUUID();

    const newBrand = await optimizedDB.insert('brands', {
      id: brandId,
      name,
      description,
      status: status || 'active',
    });

    // Invalidate caches
    cache.delPattern('brands:*');
    cache.delPattern('products:list:*');

    res.status(201).json({
      success: true,
      data: newBrand,
    });
  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * PUT /api/brands/:id
 * OPTIMIZED: Update brand with cache invalidation
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const brand = await optimizedDB.findById('brands', id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        error: 'Brand not found',
      });
    }

    const updatedBrand = await optimizedDB.update('brands', id, updates);

    // Invalidate caches
    cache.del(`brand:${id}`);
    cache.delPattern('brands:*');
    cache.delPattern('products:list:*');

    res.json({
      success: true,
      data: updatedBrand,
    });
  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * DELETE /api/brands/:id
 * OPTIMIZED: Delete brand with cache invalidation
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await optimizedDB.hardDelete('brands', id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Brand not found',
      });
    }

    // Invalidate caches
    cache.del(`brand:${id}`);
    cache.delPattern('brands:*');
    cache.delPattern('products:list:*');

    res.json({
      success: true,
      message: 'Brand deleted successfully',
    });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
