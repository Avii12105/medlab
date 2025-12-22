import express, { Router, Request, Response, NextFunction } from 'express';
import * as testModel from '../models/testModel';
import { CreateTestRequest } from '../types/index';

const router: Router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tests = await testModel.getTests();
    res.status(200).json(tests);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
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

router.get('/category/:categoryId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tests = await testModel.getTestsByCategory(parseInt(req.params.categoryId));
    res.status(200).json(tests);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, name, normalMin, normalMax, unit } = req.body as CreateTestRequest;

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

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, name, normalMin, normalMax, unit } = req.body as Partial<CreateTestRequest>;

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

export default router;
