// ===== server/routes/productGroups.js =====
import express from 'express';
import * as jsonDB from '../database/jsonDB.js';
import { generateUUID } from '../utils/helpers.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all product groups
router.get('/', async (req, res) => {
  try {
    const groups = await jsonDB.findAll('product_groups');
    const products = await jsonDB.findAll('products', { isDeleted: false });

    // Add product count for each group
    const groupsWithCount = groups.map(group => ({
      ...group,
      productCount: products.filter(p => p.groupId === group.id).length
    }));

    // Sort by name
    groupsWithCount.sort((a, b) => a.name.localeCompare(b.name));

    res.json({
      success: true,
      data: groupsWithCount
    });
  } catch (error) {
    console.error('Get product groups error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET product group by ID
router.get('/:id', async (req, res) => {
  try {
    const group = await jsonDB.findById('product_groups', req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Product group not found'
      });
    }

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Get product group error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// CREATE product group
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, minPrice, maxPrice, description, configTemplate, status = 'active' } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    const id = generateUUID();

    const newGroup = await jsonDB.insert('product_groups', {
      id,
      name,
      minPrice: minPrice || 0,
      maxPrice: maxPrice || 0,
      description,
      configTemplate,
      status
    });

    res.status(201).json({
      success: true,
      data: newGroup
    });
  } catch (error) {
    console.error('Create product group error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// UPDATE product group
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, minPrice, maxPrice, description, configTemplate, status } = req.body;

    const updates = {};

    if (name !== undefined) updates.name = name;
    if (minPrice !== undefined) updates.minPrice = minPrice;
    if (maxPrice !== undefined) updates.maxPrice = maxPrice;
    if (description !== undefined) updates.description = description;
    if (configTemplate !== undefined) updates.configTemplate = configTemplate;
    if (status !== undefined) updates.status = status;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    const updatedGroup = await jsonDB.update('product_groups', req.params.id, updates);

    if (!updatedGroup) {
      return res.status(404).json({
        success: false,
        error: 'Product group not found'
      });
    }

    res.json({
      success: true,
      data: updatedGroup
    });
  } catch (error) {
    console.error('Update product group error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE product group
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const deleted = await jsonDB.hardDelete('product_groups', req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Product group not found'
      });
    }

    res.json({
      success: true,
      message: 'Product group deleted successfully'
    });
  } catch (error) {
    console.error('Delete product group error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
