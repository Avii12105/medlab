// Test Category routes
const express = require('express');
const router = express.Router();
const testCategoryModel = require('../models/testCategoryModel');

// Get all categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await testCategoryModel.getTestCategories();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
});

// Get category by ID
router.get('/:id', async (req, res, next) => {
  try {
    const category = await testCategoryModel.getTestCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
});

// Create category
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const result = await testCategoryModel.createTestCategory({ name });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Update category
router.put('/:id', async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    await testCategoryModel.updateTestCategory(req.params.id, { name });
    res.status(200).json({ id: req.params.id, name });
  } catch (error) {
    next(error);
  }
});

// Delete category
router.delete('/:id', async (req, res, next) => {
  try {
    await testCategoryModel.deleteTestCategory(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
