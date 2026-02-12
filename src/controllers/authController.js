const authService = require('../services/authService');
const { catchAsync } = require('../utils/errors');
const { AppError } = require('../utils/errors');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               edad:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos inválidos
 */
exports.register = catchAsync(async (req, res) => {
  const { nombre, email, password, edad } = req.body;
  
  const result = await authService.register({ nombre, email, password, edad });

  // Enviar refresh token como httpOnly cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días
  });

  res.status(201).json({
    status: 'success',
    data: {
      user: result.user,
      token: result.token
    }
  });
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

  // Enviar refresh token como httpOnly cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: result.user,
      token: result.token
    }
  });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 */
exports.logout = catchAsync(async (req, res) => {
  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success',
    message: 'Sesión cerrada correctamente'
  });
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refrescar access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refrescado
 *       401:
 *         description: Refresh token inválido
 */
exports.refreshToken = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError('No refresh token provided', 401);
  }

  const result = await authService.refreshAccessToken(refreshToken);

  res.status(200).json({
    status: 'success',
    data: {
      token: result.token
    }
  });
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener información del usuario actual
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       401:
 *         description: No autenticado
 */
exports.getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

/**
 * @swagger
 * /auth/change-password:
 *   patch:
 *     summary: Cambiar contraseña
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       401:
 *         description: Contraseña actual incorrecta
 */
exports.changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Debes proporcionar la contraseña actual y la nueva', 400);
  }

  await authService.changePassword(req.user.id, currentPassword, newPassword);

  res.status(200).json({
    status: 'success',
    message: 'Contraseña actualizada correctamente'
  });
});
