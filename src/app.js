const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const corsOptions = require('./config/cors');
const { 
  securityHeaders, 
  preventParameterPollution, 
  sanitizeNoSQL, 
  sanitizeBody 
} = require('./middlewares/security');
const { generalLimiter } = require('./middlewares/rateLimiter');
const logger = require('./utils/logger');
const { swaggerUi, specs } = require('./config/swagger');
const { AppError } = require('./utils/errors');

const app = express();

// Trust proxy (para Heroku, Railway, etc.)
app.set('trust proxy', 1);

// Middleware de logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

// CORS
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Compresión
app.use(compression());

// Seguridad
app.use(securityHeaders);
app.use(preventParameterPollution);
app.use(sanitizeNoSQL);
app.use(sanitizeBody);

// Rate limiting
app.use('/api/', generalLimiter);

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'CRUD API - Documentación',
}));

// Rutas
app.use('/api', routes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: 'API CRUD Seguro',
    version: '1.0.0',
    status: 'running',
    docs: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      health: '/api/health'
    }
  });
});

// Manejo de rutas no encontradas
app.all('*', (req, res, next) => {
  next(new AppError(`No se encontró ${req.originalUrl} en este servidor`, 404));
});

// Manejo global de errores
app.use(errorHandler);

module.exports = app;
