// ===== server/routes/brands.js =====
import express from 'express';
import * as jsonDB from '../database/jsonDB.js';
import { generateUUID } from '../utils/helpers.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all brands
router.get('/', async (req, res) => {
  try {
    const brands = await jsonDB.findAll('brands');
    const products = await jsonDB.findAll('products', { isDeleted: false });

    // Add product count for each brand
    const brandsWithCount = brands.map(brand => ({
      ...brand,
      productCount: products.filter(p => p.brandId === brand.id).length
    }));

    // Sort by name
    brandsWithCount.sort((a, b) => a.name.localeCompare(b.name));

    res.json({
      success: true,
      data: brandsWithCount
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// CREATE brand
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, status = 'active' } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    const id = generateUUID();

    const newBrand = await jsonDB.insert('brands', {
      id,
      name,
      description,
      status
    });

    res.status(201).json({
      success: true,
      data: newBrand
    });
  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
