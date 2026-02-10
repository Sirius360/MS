// ===== server/routes/products.js =====
import express from 'express';
import * as jsonDB from '../database/jsonDB.js';
import { generateUUID, calculatePriceWithVAT } from '../utils/helpers.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/products/search
 * Search products for sales (specific filtering and sorting)
 */
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;

    let products = await jsonDB.findAll('products', { isDeleted: false });

    // Filter by search query
    if (query) {
      const searchLower = query.toLowerCase();
      products = products.filter(p =>
        (p.sku && p.sku.toLowerCase().includes(searchLower)) ||
        (p.name && p.name.toLowerCase().includes(searchLower))
      );
    }

    // Get groups and brands for join
    const groups = await jsonDB.findAll('product_groups');
    const brands = await jsonDB.findAll('brands');

    // Add group and brand names
    const productsWithDetails = products.map(p => ({
      ...p,
      groupName: groups.find(g => g.id === p.groupId)?.name || null,
      brandName: brands.find(b => b.id === p.brandId)?.name || null
    }));

    res.json({
      success: true,
      data: productsWithDetails
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/products
 * Get all products with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const { search, groupId, brandId, status } = req.query;

    let products = await jsonDB.findAll('products', { isDeleted: false });

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

    // Get groups and brands for join
    const groups = await jsonDB.findAll('product_groups');
    const brands = await jsonDB.findAll('brands');

    // Add group and brand names
    const productsWithDetails = products.map(p => ({
      ...p,
      groupName: groups.find(g => g.id === p.groupId)?.name || null,
      brandName: brands.find(b => b.id === p.brandId)?.name || null
    }));

    res.json({
      success: true,
      data: productsWithDetails
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/products/:id
 * Get product details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await jsonDB.findById('products', id);

    if (!product || product.isDeleted) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Get group and brand names
    if (product.groupId) {
      const group = await jsonDB.findById('product_groups', product.groupId);
      product.groupName = group?.name || null;
    }

    if (product.brandId) {
      const brand = await jsonDB.findById('brands', product.brandId);
      product.brandName = brand?.name || null;
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/products
 * Create new product
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
      loyaltyPoints = false
    } = req.body;

    if (!sku || !name) {
      return res.status(400).json({
        success: false,
        error: 'SKU and name are required'
      });
    }

    // Check if SKU already exists
    const existingProduct = await jsonDB.findOne('products', { sku, isDeleted: false });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        error: 'SKU already exists'
      });
    }

    // Calculate sale price
    const salePrice = calculatePriceWithVAT(salePriceBeforeTax, vatSale);

    // Create product
    const productId = generateUUID();

    const newProduct = await jsonDB.insert('products', {
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
      isDeleted: false
    });

    res.status(201).json({
      success: true,
      data: newProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/products/:id
 * Update product
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if product exists
    const product = await jsonDB.findById('products', id);

    if (!product || product.isDeleted) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
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
    const updatedProduct = await jsonDB.update('products', id, updates);

    res.json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/products/:id/set-sale-price
 * Set sale price for product (from import form)
 * Only updates salePriceBeforeTax, vatSale, and calculated salePrice
 * Does NOT modify cost price or import records
 */
router.put('/:id/set-sale-price', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { salePriceBeforeTax, vatSale } = req.body;

    if (salePriceBeforeTax === undefined || vatSale === undefined) {
      return res.status(400).json({
        success: false,
        error: 'salePriceBeforeTax and vatSale are required'
      });
    }

    // Check if product exists
    const product = await jsonDB.findById('products', id);

    if (!product || product.isDeleted) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Calculate sale price with VAT
    const salePrice = calculatePriceWithVAT(salePriceBeforeTax, vatSale);

    // Update only sale price related fields
    const updatedProduct = await jsonDB.update('products', id, {
      salePriceBeforeTax,
      vatSale,
      salePrice
    });

    res.json({
      success: true,
      data: updatedProduct,
      message: 'Sale price updated successfully'
    });
  } catch (error) {
    console.error('Set sale price error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/products/:id
 * Soft delete product
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await jsonDB.softDelete('products', id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
