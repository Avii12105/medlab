// Test routes
const express = require('express');
const router = express.Router();
const testModel = require('../models/testModel');

// Get all tests
router.get('/', async (req, res, next) => {
  try {
    const tests = await testModel.getTests();
    res.status(200).json(tests);
  } catch (error) {
    next(error);
  }
});

// Get test by ID
router.get('/:id', async (req, res, next) => {
  try {
    const test = await testModel.getTestById(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    res.status(200).json(test);
  } catch (error) {
    next(error);
  }
});

// Get tests by category
router.get('/category/:categoryId', async (req, res, next) => {
  try {
    const tests = await testModel.getTestsByCategory(req.params.categoryId);
    res.status(200).json(tests);
  } catch (error) {
    next(error);
  }
});

// Create test
router.post('/', async (req, res, next) => {
  try {
    const { categoryId, name, normalMin, normalMax, unit } = req.body;

    if (!categoryId || !name || normalMin === undefined || normalMax === undefined || !unit) {
      return res.status(400).json({
        error: 'categoryId, name, normalMin, normalMax, and unit are required',
      });
    }

    const result = await testModel.createTest({
      categoryId,
      name,
      normalMin,
      normalMax,
      unit,
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Update test
router.put('/:id', async (req, res, next) => {
  try {
    const { categoryId, name, normalMin, normalMax, unit } = req.body;

    if (!categoryId || !name || normalMin === undefined || normalMax === undefined || !unit) {
      return res.status(400).json({
        error: 'categoryId, name, normalMin, normalMax, and unit are required',
      });
    }

    await testModel.updateTest(req.params.id, {
      categoryId,
      name,
      normalMin,
      normalMax,
      unit,
    });
    res.status(200).json({ id: req.params.id, categoryId, name, normalMin, normalMax, unit });
  } catch (error) {
    next(error);
  }
});

// Delete test
// Delete endpoint removed - tests are now read-only via API

module.exports = router;
