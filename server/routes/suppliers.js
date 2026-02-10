// ===== server/routes/suppliers.js =====
import express from 'express';
import * as jsonDB from '../database/jsonDB.js';
import { generateUUID } from '../utils/helpers.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all suppliers
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;

    let suppliers = await jsonDB.findAll('suppliers');

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      suppliers = suppliers.filter(s =>
        (s.code && s.code.toLowerCase().includes(searchLower)) ||
        (s.name && s.name.toLowerCase().includes(searchLower)) ||
        (s.phone && s.phone.includes(search))
      );
    }

    // Sort by createdAt DESC
    suppliers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// CREATE supplier
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, phone, email, address, notes } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    // Auto-generate supplier code
    const code = await jsonDB.getNextCode('NCC', 'suppliers');
    const id = generateUUID();

    const newSupplier = await jsonDB.insert('suppliers', {
      id,
      code,
      name,
      phone,
      email,
      address,
      notes
    });

    res.status(201).json({
      success: true,
      data: newSupplier
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
