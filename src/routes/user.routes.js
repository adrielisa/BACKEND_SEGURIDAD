const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo, isOwner } = require('../middlewares/auth');
const { validateUpdate, validateId, validateRole } = require('../middlewares/validator');
const { writeLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Rutas públicas para usuarios autenticados
router.get('/', userController.getAllUsers);
router.get('/stats', restrictTo('admin'), userController.getUserStats);
router.get('/:id', validateId, userController.getUserById);

// Rutas protegidas - solo el usuario o admin
router.patch(
  '/:id',
  validateId,
  isOwner,
  writeLimiter,
  validateUpdate,
  userController.updateUser
);

router.delete(
  '/:id',
  validateId,
  isOwner,
  userController.deleteUser
);

// Rutas solo para admin
router.patch(
  '/:id/role',
  validateId,
  restrictTo('admin'),
  validateRole,
  userController.updateUserRole
);

router.patch(
  '/:id/activate',
  validateId,
  restrictTo('admin'),
  userController.activateUser
);

router.patch(
  '/:id/deactivate',
  validateId,
  restrictTo('admin'),
  userController.deactivateUser
);

module.exports = router;
