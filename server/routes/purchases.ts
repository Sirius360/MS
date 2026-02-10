import express from 'express';
import purchasesRepository from '../repositories/PurchasesRepository.js';

const router = express.Router();

// Get all purchase receipts
router.get('/', async (req, res) => {
  try {
    const receipts = await purchasesRepository.getAll();
    res.json(receipts);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: 'Failed to fetch purchase receipts' });
  }
});

// Get purchase receipt by ID
router.get('/:id', async (req, res) => {
  try {
    const receipt = await purchasesRepository.getById(req.params.id);
    
    if (!receipt) {
      return res.status(404).json({ error: 'Purchase receipt not found' });
    }
    
    res.json(receipt);
  } catch (error) {
    console.error('Error fetching purchase:', error);
    res.status(500).json({ error: 'Failed to fetch purchase receipt' });
  }
});

// Generate purchase code
router.get('/generate/code', async (req, res) => {
  try {
    const code = await purchasesRepository.generatePurchaseCode();
    res.json({ code });
  } catch (error) {
    console.error('Error generating code:', error);
    res.status(500).json({ error: 'Failed to generate purchase code' });
  }
});

// Create purchase receipt
router.post('/', async (req, res) => {
  try {
    const { supplier_id, items, discount_type, discount_value, other_fee, note } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Purchase must have at least one item' });
    }

    // Calculate total
    const itemsTotal = items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price - (item.discount || 0));
    }, 0);

    const discountAmount = discount_type === 'percent' 
      ? (itemsTotal * (discount_value || 0)) / 100 
      : (discount_value || 0);

    const totalAmount = itemsTotal - discountAmount + (other_fee || 0);

    const receipt = await purchasesRepository.create({
      supplier_id,
      items: items.map(item => ({
        ...item,
        total_amount: item.quantity * item.unit_price - (item.discount || 0),
      })),
      total_amount: totalAmount,
      discount_type: discount_type || 'amount',
      discount_value: discount_value || 0,
      other_fee: other_fee || 0,
      note,
    });

    res.status(201).json(receipt);
  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(500).json({ error: error.message || 'Failed to create purchase receipt' });
  }
});

// Update purchase receipt
router.put('/:id', async (req, res) => {
  try {
    const { supplier_id, items, discount_type, discount_value, other_fee, note } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Purchase must have at least one item' });
    }

    // Calculate total
    const itemsTotal = items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price - (item.discount || 0));
    }, 0);

    const discountAmount = discount_type === 'percent' 
      ? (itemsTotal * (discount_value || 0)) / 100 
      : (discount_value || 0);

    const totalAmount = itemsTotal - discountAmount + (other_fee || 0);

    const receipt = await purchasesRepository.update(req.params.id, {
      supplier_id,
      items: items.map(item => ({
        ...item,
        total_amount: item.quantity * item.unit_price - (item.discount || 0),
      })),
      total_amount: totalAmount,
      discount_type: discount_type || 'amount',
      discount_value: discount_value || 0,
      other_fee: other_fee || 0,
      note,
    });

    res.json(receipt);
  } catch (error) {
    console.error('Error updating purchase:', error);
    
    if (error.message === 'Purchase receipt not found') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message || 'Failed to update purchase receipt' });
  }
});

// Delete purchase receipt
router.delete('/:id', async (req, res) => {
  try {
    await purchasesRepository.delete(req.params.id);
    res.json({ message: 'Purchase receipt deleted successfully' });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    
    if (error.message === 'Purchase receipt not found') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message || 'Failed to delete purchase receipt' });
  }
});

export default router;
