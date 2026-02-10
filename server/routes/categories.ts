import express from 'express';
import { CategoryRepository } from '../repositories/CategoryRepository.js';

const router = express.Router();
const categoryRepo = new CategoryRepository();

// GET /api/categories - Get all active categories
router.get('/', async (req, res) => {
  try {
    const categories = await categoryRepo.getAllActive();
    res.json(categories);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/categories/:id - Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await categoryRepo.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error: any) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/categories - Create new category
router.post('/', async (req, res) => {
  try {
    const { name, description, status } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const category = await categoryRepo.create({
      name,
      description,
      status,
    });
    
    res.status(201).json(category);
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/categories/:id - Update category
router.put('/:id', async (req, res) => {
  try {
    const { name, description, status } = req.body;
    
    const category = await categoryRepo.updateCategory(req.params.id, {
      name,
      description,
      status,
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error: any) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/categories/:id - Soft delete category
router.delete('/:id', async (req, res) => {
  try {
    const success = await categoryRepo.deleteCategory(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
