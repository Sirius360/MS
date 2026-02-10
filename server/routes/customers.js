// ===== server/routes/customers.js =====
import express from 'express';
import * as jsonDB from '../database/jsonDB.js';
import { generateUUID } from '../utils/helpers.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all customers
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;

    let customers = await jsonDB.findAll('customers');

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      customers = customers.filter(c =>
        (c.name && c.name.toLowerCase().includes(searchLower)) ||
        (c.phone && c.phone.includes(search))
      );
    }

    // Sort by createdAt DESC
    customers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// CREATE customer
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, phone, address, notes } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    const id = generateUUID();

    const newCustomer = await jsonDB.insert('customers', {
      id,
      name,
      phone,
      address,
      notes
    });

    res.status(201).json({
      success: true,
      data: newCustomer
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
