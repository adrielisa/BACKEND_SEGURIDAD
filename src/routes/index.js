const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API está funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API info
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API CRUD Seguro v1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      docs: '/api-docs',
      health: '/api/health'
    }
  });
});

// Rutas principales
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router;
