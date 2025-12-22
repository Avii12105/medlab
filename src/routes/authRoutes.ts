import express, { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as userModel from '../models/userModel';
import { LoginRequest, LoginResponse, User } from '../types/index';

const router: Router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'ff39606b94d7914c1d4a247951b3cad696041ff8eb026bdbe17d630d35f77c70';

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body as LoginRequest;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await userModel.findUserByUsername(username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password with hash
    const isPasswordValid = await userModel.comparePassword(password, user.password_hash || '');

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user info and token (without password)
    const response: LoginResponse = {
      id: user.id,
      username: user.username,
      token,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body as LoginRequest;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await userModel.findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const passwordHash = await userModel.hashPassword(password);

    const result = await userModel.createUser({ username, passwordHash });

    const token = jwt.sign(
      { id: result.id, username: result.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response: LoginResponse = {
      id: result.id,
      username: result.username,
      token,
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
