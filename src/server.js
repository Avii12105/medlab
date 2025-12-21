// Server bootstrap
require('dotenv').config();
const express = require('express');
const healthCheckRoutes = require('./routes/healthCheckRoutes');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const testCategoryRoutes = require('./routes/testCategoryRoutes');
const testRoutes = require('./routes/testRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Routes
app.use(healthCheckRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/test-categories', testCategoryRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server running on http://0.0.0.0:${PORT}`);
  console.log(`✓ Health check: http://0.0.0.0:${PORT}/health`);
});

server.on('error', (err) => {
  console.error('✗ Server error:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('✗ Unhandled rejection:', err);
  process.exit(1);
});
