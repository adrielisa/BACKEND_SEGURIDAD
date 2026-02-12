const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { validateRegister, validateLogin } = require('../middlewares/validator');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Rutas públicas con rate limiting estricto
router.post('/register', authLimiter, validateRegister, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);

// Rutas protegidas
router.use(protect);
router.get('/me', authController.getMe);
router.patch('/change-password', authController.changePassword);

module.exports = router;
