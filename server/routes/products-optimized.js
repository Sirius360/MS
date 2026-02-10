// ===== server/routes/products-optimized.js =====
// OPTIMIZED Products routes with caching, pagination, and performance improvements

import express from 'express';
import { optimizedDB } from '../database/optimizedJsonDB.js';
import { cache } from '../config/memoryCache.js';
import { PaginationHelper } from '../utils/pagination.js';
import { generateUUID, calculatePriceWithVAT } from '../utils/helpers.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Cache TTL configuration
const CACHE_TTL = {
  PRODUCTS_LIST: 300,      // 5 minutes
  PRODUCT_DETAIL: 600,     // 10 minutes
  PRODUCT_GROUPS: 3600,    // 1 hour
  BRANDS: 3600,            // 1 hour
};

/**
 * GET /api/products/search
 * OPTIMIZED: Search products with caching
 */
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const cacheKey = `products:search:${query || 'all'}`;

    const products = await cache.getOrSet(
      cacheKey,
      async () => {
        let products = await optimizedDB.findAll('products', { isDeleted: false });

        // Filter by search query
        if (query) {
          const searchLower = query.toLowerCase();
          products = products.filter(p =>
            (p.sku && p.sku.toLowerCase().includes(searchLower)) ||
            (p.name && p.name.toLowerCase().includes(searchLower))
          );
        }

        // Get groups and brands with caching
        const [groups, brands] = await Promise.all([
          cache.getOrSet(
            'product_groups:all',
            () => optimizedDB.findAll('product_groups'),
            CACHE_TTL.PRODUCT_GROUPS
          ),
          cache.getOrSet(
            'brands:all',
            () => optimizedDB.findAll('brands'),
            CACHE_TTL.BRANDS
          ),
        ]);

        // Create lookup maps for O(1) access
        const groupMap = new Map(groups.map(g => [g.id, g]));
        const brandMap = new Map(brands.map(b => [b.id, b]));

        // Add group and brand names
        const productsWithDetails = products.map(p => ({
          ...p,
          groupName: groupMap.get(p.groupId)?.name || null,
          brandName: brandMap.get(p.brandId)?.name || null,
        }));

        return productsWithDetails;
      },
      CACHE_TTL.PRODUCTS_LIST
    );

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/products
 * OPTIMIZED: List products with caching and pagination
 */
router.get('/', async (req, res) => {
  try {
    const { search, groupId, brandId, status, page = 1, limit = 50 } = req.query;
    
    // Create cache key based on query params
    const cacheKey = `products:list:${search || ''}:${groupId || ''}:${brandId || ''}:${status || ''}:${page}:${limit}`;

    const result = await cache.getOrSet(
      cacheKey,
      async () => {
        // Fetch all products (from memory cache in optimizedDB)
        let products = await optimizedDB.findAll('products', { isDeleted: false });

        // Apply filters
        if (search) {
          const searchLower = search.toLowerCase();
          products = products.filter(p =>
            (p.sku && p.sku.toLowerCase().includes(searchLower)) ||
            (p.name && p.name.toLowerCase().includes(searchLower))
          );
        }

        if (groupId) {
          products = products.filter(p => p.groupId === groupId);
        }

        if (brandId) {
          products = products.filter(p => p.brandId === brandId);
        }

        if (status) {
          products = products.filter(p => p.status === status);
        }

        // Get groups and brands (cached)
        const [groups, brands] = await Promise.all([
          cache.getOrSet(
            'product_groups:all',
            () => optimizedDB.findAll('product_groups'),
            CACHE_TTL.PRODUCT_GROUPS
          ),
          cache.getOrSet(
            'brands:all',
            () => optimizedDB.findAll('brands'),
            CACHE_TTL.BRANDS
          ),
        ]);

        // Create lookup maps for O(1) access instead of O(n)
        const groupMap = new Map(groups.map(g => [g.id, g]));
        const brandMap = new Map(brands.map(b => [b.id, b]));

        // Add group and brand names efficiently
        const productsWithDetails = products.map(p => ({
          ...p,
          groupName: groupMap.get(p.groupId)?.name || null,
          brandName: brandMap.get(p.brandId)?.name || null,
        }));

        // Apply pagination
        return PaginationHelper.paginate(productsWithDetails, page, limit);
      },
      CACHE_TTL.PRODUCTS_LIST
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/products/:id
 * OPTIMIZED: Get single product with caching and indexed lookup
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `product:${id}`;

    const product = await cache.getOrSet(
      cacheKey,
      async () => {
        // Use indexed lookup (O(1) instead of O(n))
        const p = await optimizedDB.findById('products', id);
        
        if (!p || p.isDeleted) {
          return null;
        }

        // Get group and brand names (cached)
        if (p.groupId) {
          const group = await cache.getOrSet(
            `product_group:${p.groupId}`,
            () => optimizedDB.findById('product_groups', p.groupId),
            CACHE_TTL.PRODUCT_GROUPS
          );
          p.groupName = group?.name || null;
        }

        if (p.brandId) {
          const brand = await cache.getOrSet(
            `brand:${p.brandId}`,
            () => optimizedDB.findById('brands', p.brandId),
            CACHE_TTL.BRANDS
          );
          p.brandName = brand?.name || null;
        }

        return p;
      },
      CACHE_TTL.PRODUCT_DETAIL
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/products
 * OPTIMIZED: Create product with cache invalidation
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      sku,
      name,
      type = 'product',
      groupId,
      brandId,
      config,
      costPrice = 0,
      salePriceBeforeTax = 0,
      vatImport = 0,
      vatSale = 0,
      stockQty = 0,
      minStock = 0,
      maxStock = 0,
      unit = 'cái',
      status = 'in_stock',
      imageUrl,
      images,
      notes,
      description,
      warranty,
      directSale = false,
      loyaltyPoints = false,
    } = req.body;

    if (!sku || !name) {
      return res.status(400).json({
        success: false,
        error: 'SKU and name are required',
      });
    }

    // Check if SKU already exists (indexed lookup - O(1))
    const existingProduct = await optimizedDB.findBySKU('products', sku);

    if (existingProduct && !existingProduct.isDeleted) {
      return res.status(400).json({
        success: false,
        error: 'SKU already exists',
      });
    }

    // Calculate sale price
    const salePrice = calculatePriceWithVAT(salePriceBeforeTax, vatSale);

    // Create product
    const productId = generateUUID();

    const newProduct = await optimizedDB.insert('products', {
      id: productId,
      sku,
      name,
      type,
      groupId,
      brandId,
      config,
      costPrice,
      salePriceBeforeTax,
      salePrice,
      vatImport,
      vatSale,
      stockQty,
      minStock,
      maxStock,
      unit,
      status,
      imageUrl,
      images,
      notes,
      description,
      warranty,
      directSale,
      loyaltyPoints,
      isDeleted: false,
    });

    // Invalidate related caches
    cache.delPattern('products:list:*');
    cache.delPattern('products:search:*');

    res.status(201).json({
      success: true,
      data: newProduct,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * PUT /api/products/:id
 * OPTIMIZED: Update product with cache invalidation
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if product exists (indexed lookup)
    const product = await optimizedDB.findById('products', id);

    if (!product || product.isDeleted) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // If updating sale price/VAT, recalculate salePrice
    if (updates.salePriceBeforeTax !== undefined || updates.vatSale !== undefined) {
      const salePriceBeforeTax = updates.salePriceBeforeTax ?? product.salePriceBeforeTax;
      const vatSale = updates.vatSale ?? product.vatSale;
      updates.salePrice = calculatePriceWithVAT(salePriceBeforeTax, vatSale);
    }

    // Warning if sale price is less than cost price
    const costPrice = updates.costPrice ?? product.costPrice;
    const salePrice = updates.salePrice ?? product.salePrice;
    if (salePrice < costPrice) {
      console.warn(`Warning: Sale price (${salePrice}) is less than cost price (${costPrice}) for product ${id}`);
    }

    // Update product
    const updatedProduct = await optimizedDB.update('products', id, updates);

    // Invalidate caches
    cache.del(`product:${id}`);
    cache.delPattern('products:list:*');
    cache.delPattern('products:search:*');

    res.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * PUT /api/products/:id/set-sale-price
 * OPTIMIZED: Set sale price with cache invalidation
 */
router.put('/:id/set-sale-price', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { salePriceBeforeTax, vatSale } = req.body;

    if (salePriceBeforeTax === undefined || vatSale === undefined) {
      return res.status(400).json({
        success: false,
        error: 'salePriceBeforeTax and vatSale are required',
      });
    }

    // Check if product exists
    const product = await optimizedDB.findById('products', id);

    if (!product || product.isDeleted) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Calculate sale price with VAT
    const salePrice = calculatePriceWithVAT(salePriceBeforeTax, vatSale);

    // Update only sale price related fields
    const updatedProduct = await optimizedDB.update('products', id, {
      salePriceBeforeTax,
      vatSale,
      salePrice,
    });

    // Invalidate caches
    cache.del(`product:${id}`);
    cache.delPattern('products:list:*');

    res.json({
      success: true,
      data: updatedProduct,
      message: 'Sale price updated successfully',
    });
  } catch (error) {
    console.error('Set sale price error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * DELETE /api/products/:id
 * OPTIMIZED: Soft delete with cache invalidation
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await optimizedDB.softDelete('products', id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Invalidate caches
    cache.del(`product:${id}`);
    cache.delPattern('products:list:*');
    cache.delPattern('products:search:*');

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
