// Authentication routes with JWT
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'ff39606b94d7914c1d4a247951b3cad696041ff8eb026bdbe17d630d35f77c70';

// Login endpoint
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await userModel.findUserByUsername(username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password with hash
    const isPasswordValid = await userModel.comparePassword(password, user.password_hash);

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
    res.status(200).json({
      id: user.id,
      username: user.username,
      token,
    });
  } catch (error) {
    next(error);
  }
});

// Register endpoint
router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await userModel.findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Hash the password
    const passwordHash = await userModel.hashPassword(password);

    // Create user
    const result = await userModel.createUser({ username, passwordHash });

    // Generate JWT token
    const token = jwt.sign(
      { id: result.id, username: result.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      id: result.id,
      username: result.username,
      token,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
