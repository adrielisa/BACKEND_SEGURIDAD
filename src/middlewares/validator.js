const { body, param, validationResult } = require('express-validator');
const { AppError } = require('../utils/errors');

// Middleware para manejar errores de validación
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    return next(new AppError(errorMessages.join(', '), 400));
  }
  next();
};

// Validaciones para registro
exports.validateRegister = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('El email es demasiado largo'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'),
  
  body('edad')
    .optional()
    .isInt({ min: 1, max: 150 })
    .withMessage('La edad debe ser un número entre 1 y 150'),
  
  exports.handleValidationErrors
];

// Validaciones para login
exports.validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
  
  exports.handleValidationErrors
];

// Validaciones para actualización de usuario
exports.validateUpdate = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  
  body('edad')
    .optional()
    .isInt({ min: 1, max: 150 })
    .withMessage('La edad debe ser un número entre 1 y 150'),
  
  exports.handleValidationErrors
];

// Validación de ID UUID
exports.validateId = [
  param('id')
    .isUUID()
    .withMessage('ID inválido'),
  
  exports.handleValidationErrors
];

// Validación de role
exports.validateRole = [
  body('role')
    .isIn(['user', 'admin'])
    .withMessage('El rol debe ser user o admin'),
  
  exports.handleValidationErrors
];
