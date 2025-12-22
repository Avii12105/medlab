import express, { Router, Request, Response, NextFunction } from 'express';
import * as reportModel from '../models/reportModel';
import * as reportItemModel from '../models/reportItemModel';
import { CreateReportRequest, CreateReportItemRequest } from '../types/index';

const router: Router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reports = await reportModel.getReports();
    res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
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

router.get('/patient/:patientId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reports = await reportModel.getReportsByPatientId(req.params.patientId);
    res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { patientId } = req.body as CreateReportRequest;

    if (!patientId) {
      return res.status(400).json({ error: 'patientId is required' });
    }

    const result = await reportModel.createReport({ patientId });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await reportModel.deleteReport(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/:reportId/items', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { testId, resultValue, status } = req.body as CreateReportItemRequest;
    const reportId = req.params.reportId;

    if (!testId || resultValue === undefined || !status) {
      return res.status(400).json({ error: 'testId, resultValue, and status are required' });
    }

    const result = await reportItemModel.createReportItem(reportId, {
      testId,
      resultValue,
      status,
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/items/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await reportItemModel.getReportItemById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ error: 'Report item not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});

router.put('/items/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { testId, resultValue, status } = req.body as Partial<CreateReportItemRequest>;

    const result = await reportItemModel.updateReportItem(req.params.itemId, {
      testId,
      resultValue,
      status,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.delete('/items/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await reportItemModel.deleteReportItem(req.params.itemId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
