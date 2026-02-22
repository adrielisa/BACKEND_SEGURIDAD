const express = require('express');
const entryRoutes = require('./entryRoutes');

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
    message: 'SECURE_LOG API v2.0.0 - Sistema Público de Registros',
    description: 'API pública con protección anti-spam y detección de ataques',
    features: [
      'Cooldown de 30 segundos entre registros',
      'Detección de XSS, SQL Injection y Command Injection',
      'Bloqueo automático de 15 minutos por intento de ataque',
      'Rate limiting por IP',
      'Sanitización automática de contenido'
    ],
    endpoints: {
      entries: '/api/v1/entries',
      cooldownStatus: '/api/v1/entries/cooldown/status',
      docs: '/api-docs',
      health: '/api/v1/health'
    }
  });
});

// Rutas principales
router.use('/entries', entryRoutes);

module.exports = router;
