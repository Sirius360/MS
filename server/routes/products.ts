import express from 'express';
import pool from '../config/database.js';
import { ProductRepository } from '../repositories/ProductRepository.js';

const router = express.Router();
const productRepo = new ProductRepository();

// GET /api/products - Get all active products
router.get('/', async (req, res) => {
  try {
    const products = await productRepo.getAllActive();
    res.json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await productRepo.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error: any) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:id/stock - Get product stock
router.get('/:id/stock', async (req, res) => {
  try {
    const stock = await productRepo.getProductStock(req.params.id);
    res.json({ productId: req.params.id, stock });
  } catch (error: any) {
    console.error('Error fetching product stock:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products - Create new product
router.post('/', async (req, res) => {
  try {
    const productData = req.body;
    
    if (!productData.code || !productData.name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }

    const product = await productRepo.create(productData);
    res.status(201).json(product);
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', async (req, res) => {
  try {
    const product = await productRepo.updateProduct(req.params.id, req.body);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/products/:id - Soft delete product
router.delete('/:id', async (req, res) => {
  try {
    const success = await productRepo.deleteProduct(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get product inventory transactions (for stock ledger)
router.get('/:id/transactions', async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Get inventory transactions with partner info
    const [transactions] = await pool.query(
      `SELECT 
        it.*,
        CASE 
          WHEN it.reference_type = 'PURCHASE' THEN pr.code
          WHEN it.reference_type = 'SALE' THEN si.code
          ELSE SUBSTRING(it.reference_id, 1, 8)
        END as documentCode,
        CASE 
          WHEN it.reference_type = 'PURCHASE' THEN s.name
          WHEN it.reference_type = 'SALE' THEN c.name
          ELSE '-'
        END as partnerName
       FROM inventory_transactions it
       LEFT JOIN purchase_receipts pr ON it.reference_type = 'PURCHASE' AND it.reference_id = pr.id
       LEFT JOIN suppliers s ON pr.supplier_id = s.id
       LEFT JOIN sales_invoices si ON it.reference_type = 'SALE' AND it.reference_id = si.id
       LEFT JOIN customers c ON si.customer_id = c.id
       WHERE it.product_id = ?
       ORDER BY it.created_at DESC`,
      [productId]
    );
    
    // Calculate running balance
    const reversed = [...transactions].reverse();
    let runningBalance = 0;
    const withBalance = reversed.map((tx) => {
      runningBalance += tx.quantity;
      return { ...tx, endingStock: runningBalance };
    });
    
    res.json(withBalance.reverse());
  } catch (error) {
    console.error('Error fetching product transactions:', error);
    res.status(500).json({ error: 'Failed to fetch product inventory transactions' });
  }
});

export default router;

