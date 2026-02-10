import express from 'express';
import { SupplierRepository } from '../repositories/SupplierRepository.js';

const router = express.Router();
const supplierRepo = new SupplierRepository();

// GET /api/suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await supplierRepo.getAllActive();
    res.json(suppliers);
  } catch (error: any) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/suppliers/:id
router.get('/:id', async (req, res) => {
  try {
    const supplier = await supplierRepo.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error: any) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/suppliers
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const supplier = await supplierRepo.create(req.body);
    res.status(201).json(supplier);
  } catch (error: any) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/suppliers/:id
router.put('/:id', async (req, res) => {
  try {
    const supplier = await supplierRepo.updateSupplier(req.params.id, req.body);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error: any) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/suppliers/:id
router.delete('/:id', async (req, res) => {
  try {
    const success = await supplierRepo.deleteSupplier(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
