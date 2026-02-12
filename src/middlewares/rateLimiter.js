const rateLimit = require('express-rate-limit');

// Rate limiter general
exports.generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    status: 'error',
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para autenticación (más estricto)
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Solo 5 intentos
  skipSuccessfulRequests: true,
  message: {
    status: 'error',
    message: 'Demasiados intentos de inicio de sesión, intenta de nuevo en 15 minutos.'
  }
});

// Rate limiter para creación/actualización
exports.writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    status: 'error',
    message: 'Demasiadas operaciones de escritura, intenta de nuevo más tarde.'
  }
});
