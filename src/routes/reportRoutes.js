// Report routes
const express = require('express');
const router = express.Router();
const reportModel = require('../models/reportModel');
const reportItemModel = require('../models/reportItemModel');

// Get all reports
router.get('/', async (req, res, next) => {
  try {
    const reports = await reportModel.getReports();
    res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
});

// Get report by ID with items
router.get('/:id', async (req, res, next) => {
  try {
    const report = await reportModel.getReportWithItems(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.status(200).json(report);
  } catch (error) {
    next(error);
  }
});

// Get reports by patient ID
router.get('/patient/:patientId', async (req, res, next) => {
  try {
    const reports = await reportModel.getReportsByPatientId(req.params.patientId);
    res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
});

// Create report
router.post('/', async (req, res, next) => {
  try {
    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: 'patientId is required' });
    }

    const result = await reportModel.createReport({ patientId });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Delete report
router.delete('/:id', async (req, res, next) => {
  try {
    await reportModel.deleteReport(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Report Items endpoints

// Add report item
router.post('/:reportId/items', async (req, res, next) => {
  try {
    const { testId, resultValue, status } = req.body;
    const reportId = req.params.reportId;

    if (!testId || resultValue === undefined || !status) {
      return res.status(400).json({ error: 'testId, resultValue, and status are required' });
    }

    const result = await reportItemModel.createReportItem({
      reportId,
      testId,
      resultValue,
      status,
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Get report items
router.get('/:reportId/items', async (req, res, next) => {
  try {
    const items = await reportItemModel.getReportItemsByReportId(req.params.reportId);
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
});

// Update report item
router.put('/:reportId/items/:itemId', async (req, res, next) => {
  try {
    const { resultValue, status } = req.body;

    if (resultValue === undefined || !status) {
      return res.status(400).json({ error: 'resultValue and status are required' });
    }

    await reportItemModel.updateReportItem(req.params.itemId, { resultValue, status });
    res.status(200).json({ id: req.params.itemId, resultValue, status });
  } catch (error) {
    next(error);
  }
});

// Delete report item
router.delete('/:reportId/items/:itemId', async (req, res, next) => {
  try {
    await reportItemModel.deleteReportItem(req.params.itemId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
