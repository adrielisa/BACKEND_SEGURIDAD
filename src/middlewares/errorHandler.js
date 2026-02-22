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
    console.error('ERROR 💥', err);
    
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
  console.error({
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
      error.message = messages.join(', ');
      error.statusCode = 400;
      error.isOperational = true;
    }
    
    if (err.name === 'SequelizeUniqueConstraintError') {
      error.message = 'Ya existe un registro con esos datos';
      error.statusCode = 400;
      error.isOperational = true;
    }

    if (err.name === 'SequelizeDatabaseError') {
      error.message = 'Error en la base de datos';
      error.statusCode = 500;
    }

    // Errores de JWT
    if (err.name === 'JsonWebTokenError') {
      error.message = 'Token inválido';
      error.statusCode = 401;
      error.isOperational = true;
    }
    
    if (err.name === 'TokenExpiredError') {
      error.message = 'Token expirado';
      error.statusCode = 401;
      error.isOperational = true;
    }

    // Errores de validación
    if (err.name === 'ValidationError') {
      error.message = err.message;
      error.statusCode = 400;
      error.isOperational = true;
    }

    sendErrorProd(error, res);
  }
};

module.exports = errorHandler;
