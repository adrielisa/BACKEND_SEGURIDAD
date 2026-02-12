const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/errors');
const { catchAsync } = require('../utils/errors');

// Middleware para proteger rutas
exports.protect = catchAsync(async (req, res, next) => {
  // 1. Obtener token del header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('No estás autenticado. Por favor inicia sesión.', 401));
  }

  // 2. Verificar token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expirado. Por favor inicia sesión nuevamente.', 401));
    }
    return next(new AppError('Token inválido.', 401));
  }

  // 3. Verificar que el usuario aún existe
  const user = await User.findByPk(decoded.id);
  if (!user) {
    return next(new AppError('El usuario ya no existe.', 401));
  }

  // 4. Verificar que el usuario está activo
  if (!user.isActive) {
    return next(new AppError('Usuario desactivado. Contacta al administrador.', 403));
  }

  // 5. Agregar usuario a la request
  req.user = user;
  next();
});

// Middleware para restringir por roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('No tienes permisos para realizar esta acción', 403)
      );
    }
    next();
  };
};

// Middleware para verificar que el usuario es el propietario o admin
exports.isOwner = (req, res, next) => {
  if (req.params.id !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError('Solo puedes acceder a tu propia información', 403)
    );
  }
  next();
};

// Middleware opcional de autenticación (no falla si no hay token)
exports.optionalAuth = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (user && user.isActive) {
      req.user = user;
    }
  } catch (error) {
    // Ignorar errores en autenticación opcional
  }

  next();
});
