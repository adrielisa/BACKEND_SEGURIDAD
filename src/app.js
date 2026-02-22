const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
require('dotenv').config();

const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const corsOptions = require('./config/cors');
const { swaggerUi, specs } = require('./config/swagger');

const app = express();

// Trust proxy (IMPORTANTE para obtener IP real del cliente)
app.set('trust proxy', true);

// Middleware de logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// CORS
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Compresión
app.use(compression());

// Seguridad con Helmet y HPP
app.use(helmet());
app.use(hpp());

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SECURE_LOG API - Documentación',
}));

// Rutas
app.use('/api/v1', routes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: '🔒 SECURE_LOG API v2.0',
    description: 'Sistema público de registros con protección anti-spam y detección de ataques',
    status: 'running',
    features: [
      '✅ Cooldown de 30 segundos entre registros por IP',
      '✅ Detección automática de XSS, SQL Injection y Command Injection',
      '✅ Bloqueo de 15 minutos por intento de ataque',
      '✅ Rate limiting inteligente (5 acciones/10 segundos)',
      '✅ Sanitización automática de contenido',
      '✅ Protección contra Parameter Pollution',
      '✅ Headers de seguridad con Helmet'
    ],
    docs: '/api-docs',
    endpoints: {
      entries: '/api/v1/entries',
      createEntry: 'POST /api/v1/entries',
      updateEntry: 'PUT /api/v1/entries/:id',
      deleteEntry: 'DELETE /api/v1/entries/:id',
      cooldownStatus: 'GET /api/v1/entries/cooldown/status',
      health: 'GET /api/v1/health'
    },
    admins: 'Adriel Rodriguez y Sergio Trujillo'
  });
});

// Manejo de rutas no encontradas
app.all('*', (req, res, next) => {
  const err = new Error(`No se encontró ${req.originalUrl} en este servidor`);
  err.statusCode = 404;
  err.status = 'fail';
  next(err);
});

// Manejo global de errores
app.use(errorHandler);

module.exports = app;
