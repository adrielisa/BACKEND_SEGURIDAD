const userService = require('../services/userService');
const { catchAsync } = require('../utils/errors');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints de gestión de usuarios
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados por página
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Campo de ordenamiento (ej. -createdAt)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre o email
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       401:
 *         description: No autenticado
 */
exports.getAllUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, sort = '-createdAt', search } = req.query;
  
  const result = await userService.getAllUsers({
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
    search
  });

  res.status(200).json({
    status: 'success',
    results: result.users.length,
    pagination: result.pagination,
    data: {
      users: result.users
    }
  });
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       404:
 *         description: Usuario no encontrado
 */
exports.getUserById = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Actualizar usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               edad:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Usuario no encontrado
 */
exports.updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Usuario eliminado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Usuario no encontrado
 */
exports.deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUser(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Actualizar rol de usuario (solo admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: Rol actualizado
 *       403:
 *         description: Sin permisos de admin
 */
exports.updateUserRole = catchAsync(async (req, res) => {
  const user = await userService.updateUserRole(req.params.id, req.body.role);

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

/**
 * @swagger
 * /users/{id}/activate:
 *   patch:
 *     summary: Activar usuario (solo admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Usuario activado
 */
exports.activateUser = catchAsync(async (req, res) => {
  const user = await userService.toggleUserStatus(req.params.id, true);

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

/**
 * @swagger
 * /users/{id}/deactivate:
 *   patch:
 *     summary: Desactivar usuario (solo admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Usuario desactivado
 */
exports.deactivateUser = catchAsync(async (req, res) => {
  const user = await userService.toggleUserStatus(req.params.id, false);

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

/**
 * @swagger
 * /users/stats:
 *   get:
 *     summary: Obtener estadísticas de usuarios (solo admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de usuarios
 */
exports.getUserStats = catchAsync(async (req, res) => {
  const stats = await userService.getUserStats();

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});
