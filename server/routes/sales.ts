import express from 'express';
import salesRepository from '../repositories/SalesRepository.js';

const router = express.Router();

// Get all sales invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await salesRepository.getAll();
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales invoices' });
  }
});

// Get sales invoice by ID
router.get('/:id', async (req, res) => {
  try {
    const invoice = await salesRepository.getById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ error: 'Sales invoice not found' });
    }
    
    res.json(invoice);
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({ error: 'Failed to fetch sales invoice' });
  }
});

// Generate sales code
router.get('/generate/code', async (req, res) => {
  try {
    const code = await salesRepository.generateSalesCode();
    res.json({ code });
  } catch (error) {
    console.error('Error generating code:', error);
    res.status(500).json({ error: 'Failed to generate sales code' });
  }
});

// Create sales invoice
router.post('/', async (req, res) => {
  try {
    const { customer_id, items, discount_type, discount_value, payment_method, paid_amount, note } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Sale must have at least one item' });
    }

    // Calculate total
    const itemsTotal = items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price - (item.discount || 0));
    }, 0);

    const discountAmount = discount_type === 'percent' 
      ? (itemsTotal * (discount_value || 0)) / 100 
      : (discount_value || 0);

    const totalAmount = itemsTotal - discountAmount;

    const invoice = await salesRepository.create({
      customer_id,
      items: items.map(item => ({
        ...item,
        total_amount: item.quantity * item.unit_price - (item.discount || 0),
      })),
      total_amount: totalAmount,
      discount_type: discount_type || 'amount',
      discount_value: discount_value || 0,
      payment_method: payment_method || 'cash',
      paid_amount: paid_amount || totalAmount,
      note,
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ error: error.message || 'Failed to create sales invoice' });
  }
});

// Update sales invoice
router.put('/:id', async (req, res) => {
  try {
    const { customer_id, items, discount_type, discount_value, payment_method, paid_amount, note } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Sale must have at least one item' });
    }

    // Calculate total
    const itemsTotal = items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price - (item.discount || 0));
    }, 0);

    const discountAmount = discount_type === 'percent' 
      ? (itemsTotal * (discount_value || 0)) / 100 
      : (discount_value || 0);

    const totalAmount = itemsTotal - discountAmount;

    const invoice = await salesRepository.update(req.params.id, {
      customer_id,
      items: items.map(item => ({
        ...item,
        total_amount: item.quantity * item.unit_price - (item.discount || 0),
      })),
      total_amount: totalAmount,
      discount_type: discount_type || 'amount',
      discount_value: discount_value || 0,
      payment_method: payment_method || 'cash',
      paid_amount: paid_amount || totalAmount,
      note,
    });

    res.json(invoice);
  } catch (error) {
    console.error('Error updating sale:', error);
    
    if (error.message === 'Sales invoice not found') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message || 'Failed to update sales invoice' });
  }
});

// Delete sales invoice
router.delete('/:id', async (req, res) => {
  try {
    await salesRepository.delete(req.params.id);
    res.json({ message: 'Sales invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting sale:', error);
    
    if (error.message === 'Sales invoice not found') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message || 'Failed to delete sales invoice' });
  }
});

export default router;
