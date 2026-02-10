// ===== server/routes/batch.js =====
// Batch operations endpoints for bulk create/update

import express from 'express';
import { optimizedDB } from '../database/optimizedJsonDB.js';
import { cache } from '../config/memoryCache.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate, schemas } from '../middleware/validation.js';
import { batchLimiter } from '../middleware/rateLimiter.js';
import { generateUUID } from '../utils/helpers.js';

const router = express.Router();

/**
 * POST /api/batch/products
 * Bulk create products
 */
router.post(
  '/products',
  authenticate,
  batchLimiter,
  validate(schemas.batchProducts),
  async (req, res) => {
    try {
      const { products } = req.body;

      // Add IDs and timestamps to products
      const timestamp = new Date().toISOString();
      const productsToCreate = products.map(p => ({
        id: p.id || generateUUID(),
        ...p,
        isDeleted: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      }));

      // Batch insert
      const createdProducts = await optimizedDB.batchInsert('products', productsToCreate);

      // Invalidate caches
      cache.delPattern('products:*');

      res.status(201).json({
        success: true,
        data: createdProducts,
        count: createdProducts.length,
        message: `Successfully created ${createdProducts.length} products`,
      });
    } catch (error) {
      console.error('Batch create products error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

/**
 * PUT /api/batch/products
 * Bulk update products
 */
router.put(
  '/products',
  authenticate,
  batchLimiter,
  validate(schemas.batchProducts),
  async (req, res) => {
    try {
      const { products } = req.body;

      // Validate all products have IDs
      const hasIds = products.every(p => p.id);
      if (!hasIds) {
        return res.status(400).json({
          success: false,
          error: 'All products must have an ID for batch update',
        });
      }

      // Batch update
      const updatedProducts = await optimizedDB.batchUpdate('products', products);

      // Invalidate caches
      cache.delPattern('products:*');
      products.forEach(p => cache.del(`product:${p.id}`));

      res.json({
        success: true,
        data: updatedProducts,
        count: updatedProducts.length,
        message: `Successfully updated ${updatedProducts.length} products`,
      });
    } catch (error) {
      console.error('Batch update products error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

/**
 * POST /api/batch/customers
 * Bulk create customers
 */
router.post(
  '/customers',
  authenticate,
  batchLimiter,
  async (req, res) => {
    try {
      const { customers } = req.body;

      if (!Array.isArray(customers) || customers.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Customers array is required',
        });
      }

      if (customers.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'Maximum 100 customers per batch',
        });
      }

      const timestamp = new Date().toISOString();
      const customersToCreate = customers.map(c => ({
        id: c.id || generateUUID(),
        ...c,
        totalPurchases: 0,
        totalDebt: 0,
        isDeleted: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      }));

      const createdCustomers = await optimizedDB.batchInsert('customers', customersToCreate);

      cache.delPattern('customers:*');

      res.status(201).json({
        success: true,
        data: createdCustomers,
        count: createdCustomers.length,
        message: `Successfully created ${createdCustomers.length} customers`,
      });
    } catch (error) {
      console.error('Batch create customers error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

/**
 * POST /api/batch/suppliers
 * Bulk create suppliers
 */
router.post(
  '/suppliers',
  authenticate,
  batchLimiter,
  async (req, res) => {
    try {
      const { suppliers } = req.body;

      if (!Array.isArray(suppliers) || suppliers.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Suppliers array is required',
        });
      }

      if (suppliers.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'Maximum 100 suppliers per batch',
        });
      }

      const timestamp = new Date().toISOString();
      const suppliersToCreate = suppliers.map(s => ({
        id: s.id || generateUUID(),
        ...s,
        totalPurchases: 0,
        totalDebt: 0,
        isDeleted: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      }));

      const createdSuppliers = await optimizedDB.batchInsert('suppliers', suppliersToCreate);

      cache.delPattern('suppliers:*');

      res.status(201).json({
        success: true,
        data: createdSuppliers,
        count: createdSuppliers.length,
        message: `Successfully created ${createdSuppliers.length} suppliers`,
      });
    } catch (error) {
      console.error('Batch create suppliers error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

export default router;
