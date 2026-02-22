const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  getCooldownStatus,
  reportAttack
} = require('../controllers/entryController');
const {
  checkBlockedIP,
  attackDetectionMiddleware,
  cooldownMiddleware,
  generalLimiter
} = require('../middlewares/advancedSecurity');

// Validaciones para contenido
const contentValidation = [
  body('contenido')
    .trim()
    .notEmpty()
    .withMessage('El contenido es obligatorio')
    .isLength({ min: 10, max: 50 })
    .withMessage('El contenido debe tener entre 10 y 50 caracteres')
];

/**
 * @swagger
 * /api/v1/entries:
 *   get:
 *     summary: Obtener todas las entradas
 *     tags: [Entries]
 *     responses:
 *       200:
 *         description: Lista de entradas
 */
router.get('/', generalLimiter, getAllEntries);

/**
 * @swagger
 * /api/v1/entries/cooldown/status:
 *   get:
 *     summary: Obtener estado de cooldown del cliente
 *     tags: [Entries]
 *     responses:
 *       200:
 *         description: Estado del cooldown
 */
router.get('/cooldown/status', getCooldownStatus);

/**
 * @swagger
 * /api/v1/entries/report-attack:
 *   post:
 *     summary: Reportar intento de ataque detectado por el frontend
 *     tags: [Entries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attackType:
 *                 type: string
 *     responses:
 *       403:
 *         description: Ataque reportado, IP bloqueada por 5 minutos
 */
router.post('/report-attack', generalLimiter, reportAttack);

/**
 * @swagger
 * /api/v1/entries/{id}:
 *   get:
 *     summary: Obtener entrada por ID
 *     tags: [Entries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entrada encontrada
 *       404:
 *         description: Entrada no encontrada
 */
router.get('/:id', generalLimiter, getEntryById);

/**
 * @swagger
 * /api/v1/entries:
 *   post:
 *     summary: Crear nueva entrada
 *     tags: [Entries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contenido
 *             properties:
 *               contenido:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 50
 *     responses:
 *       201:
 *         description: Entrada creada
 *       400:
 *         description: Validación fallida
 *       403:
 *         description: Intento de ataque detectado
 *       429:
 *         description: Cooldown activo o IP bloqueada
 */
router.post(
  '/',
  generalLimiter,
  checkBlockedIP,
  attackDetectionMiddleware,
  cooldownMiddleware,
  contentValidation,
  createEntry
);

/**
 * @swagger
 * /api/v1/entries/{id}:
 *   put:
 *     summary: Actualizar entrada
 *     tags: [Entries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contenido
 *             properties:
 *               contenido:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 50
 *     responses:
 *       200:
 *         description: Entrada actualizada
 *       400:
 *         description: Validación fallida
 *       403:
 *         description: Intento de ataque detectado
 *       404:
 *         description: Entrada no encontrada
 *       429:
 *         description: Cooldown activo o IP bloqueada
 */
router.put(
  '/:id',
  generalLimiter,
  checkBlockedIP,
  attackDetectionMiddleware,
  cooldownMiddleware,
  contentValidation,
  updateEntry
);

/**
 * @swagger
 * /api/v1/entries/{id}:
 *   delete:
 *     summary: Eliminar entrada
 *     tags: [Entries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entrada eliminada
 *       403:
 *         description: IP bloqueada por intento de ataque
 *       404:
 *         description: Entrada no encontrada
 */
router.delete('/:id', generalLimiter, checkBlockedIP, deleteEntry);

module.exports = router;
