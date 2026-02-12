const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

// Manejo de errores de desarrollo
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Manejo de errores de producción
const sendErrorProd = (err, res) => {
  // Error operacional confiable: enviar mensaje al cliente
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Error de programación: no filtrar detalles
    logger.error('ERROR 💥', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Algo salió muy mal!'
    });
  }
};

// Middleware global de manejo de errores
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log del error
  logger.error({
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Errores específicos de Sequelize
    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors.map(e => e.message);
      error = new AppError(messages.join(', '), 400);
    }
    
    if (err.name === 'SequelizeUniqueConstraintError') {
      error = new AppError('Ya existe un registro con esos datos', 400);
    }

    if (err.name === 'SequelizeDatabaseError') {
      error = new AppError('Error en la base de datos', 500);
    }

    // Errores de JWT
    if (err.name === 'JsonWebTokenError') {
      error = new AppError('Token inválido', 401);
    }
    
    if (err.name === 'TokenExpiredError') {
      error = new AppError('Token expirado', 401);
    }

    // Errores de validación
    if (err.name === 'ValidationError') {
      error = new AppError(err.message, 400);
    }

    sendErrorProd(error, res);
  }
};

module.exports = errorHandler;
