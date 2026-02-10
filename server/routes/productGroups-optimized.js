// ===== server/routes/productGroups-optimized.js =====
// OPTIMIZED Product Groups routes with caching

import express from 'express';
import { optimizedDB } from '../database/optimizedJsonDB.js';
import { cache } from '../config/memoryCache.js';
import { generateUUID } from '../utils/helpers.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

const CACHE_TTL = {
  GROUPS_LIST: 3600,        // 1 hour (rarely changes)
  GROUP_DETAIL: 3600,
};

/**
 * GET /api/product-groups
 * OPTIMIZED: List all product groups with caching
 */
router.get('/', async (req, res) => {
  try {
    const cacheKey = 'product_groups:all';

    const groups = await cache.getOrSet(
      cacheKey,
      async () => {
        const groups = await optimizedDB.findAll('product_groups');
        return groups.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      },
      CACHE_TTL.GROUPS_LIST
    );

    res.json({
      success: true,
      data: groups,
    });
  } catch (error) {
    console.error('Get product groups error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/product-groups/:id
 * OPTIMIZED: Get single product group with caching
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `product_group:${id}`;

    const group = await cache.getOrSet(
      cacheKey,
      async () => {
        return await optimizedDB.findById('product_groups', id);
      },
      CACHE_TTL.GROUP_DETAIL
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Product group not found',
      });
    }

    res.json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error('Get product group error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/product-groups
 * OPTIMIZED: Create product group with cache invalidation
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, minPrice, maxPrice, description, configTemplate, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required',
      });
    }

    const groupId = generateUUID();

    const newGroup = await optimizedDB.insert('product_groups', {
      id: groupId,
      name,
      minPrice: minPrice || 0,
      maxPrice: maxPrice || 0,
      description,
      configTemplate,
      status: status || 'active',
    });

    // Invalidate caches
    cache.delPattern('product_groups:*');
    cache.delPattern('products:list:*');

    res.status(201).json({
      success: true,
      data: newGroup,
    });
  } catch (error) {
    console.error('Create product group error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * PUT /api/product-groups/:id
 * OPTIMIZED: Update product group with cache invalidation
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const group = await optimizedDB.findById('product_groups', id);

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Product group not found',
      });
    }

    const updatedGroup = await optimizedDB.update('product_groups', id, updates);

    // Invalidate caches
    cache.del(`product_group:${id}`);
    cache.delPattern('product_groups:*');
    cache.delPattern('products:list:*');

    res.json({
      success: true,
      data: updatedGroup,
    });
  } catch (error) {
    console.error('Update product group error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * DELETE /api/product-groups/:id
 * OPTIMIZED: Delete product group with cache invalidation
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await optimizedDB.hardDelete('product_groups', id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Product group not found',
      });
    }

    // Invalidate caches
    cache.del(`product_group:${id}`);
    cache.delPattern('product_groups:*');
    cache.delPattern('products:list:*');

    res.json({
      success: true,
      message: 'Product group deleted successfully',
    });
  } catch (error) {
    console.error('Delete product group error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
