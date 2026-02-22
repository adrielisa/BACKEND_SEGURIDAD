const Entry = require('../models/Entry');
const { validationResult } = require('express-validator');
const DOMPurify = require('isomorphic-dompurify');
const { getClientIP, blockIP } = require('../middlewares/advancedSecurity');

/**
 * @desc    Obtener todas las entradas
 * @route   GET /api/v1/entries
 * @access  Public
 */
const getAllEntries = async (req, res, next) => {
  try {
    const entries = await Entry.findAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'contenido', 'createdAt', 'updatedAt']
    });

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener una entrada por ID
 * @route   GET /api/v1/entries/:id
 * @access  Public
 */
const getEntryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const entry = await Entry.findByPk(id, {
      attributes: ['id', 'contenido', 'createdAt', 'updatedAt']
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Entrada no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crear nueva entrada
 * @route   POST /api/v1/entries
 * @access  Public (con rate limiting y detección de ataques)
 */
const createEntry = async (req, res, next) => {
  try {
    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let { contenido } = req.body;

    // Sanitizar contenido con DOMPurify
    contenido = DOMPurify.sanitize(contenido, {
      ALLOWED_TAGS: [], // No permitir ningún tag HTML
      ALLOWED_ATTR: []
    });

    // Trim y validar longitud después de sanitización
    contenido = contenido.trim();
    
    if (contenido.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El contenido no puede estar vacío después de la sanitización'
      });
    }

    if (contenido.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'El contenido debe tener al menos 10 caracteres'
      });
    }

    if (contenido.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'El contenido no puede exceder 50 caracteres'
      });
    }

    // Obtener IP del cliente
    const clientIP = getClientIP(req);

    // Crear entrada
    const entry = await Entry.create({
      contenido,
      ipAddress: clientIP
    });

    res.status(201).json({
      success: true,
      message: 'Entrada creada exitosamente',
      data: {
        id: entry.id,
        contenido: entry.contenido,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar entrada
 * @route   PUT /api/v1/entries/:id
 * @access  Public (con rate limiting y detección de ataques)
 */
const updateEntry = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Buscar entrada
    const entry = await Entry.findByPk(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Entrada no encontrada'
      });
    }

    let { contenido } = req.body;

    // Sanitizar contenido con DOMPurify
    contenido = DOMPurify.sanitize(contenido, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });

    // Trim y validar longitud después de sanitización
    contenido = contenido.trim();
    
    if (contenido.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El contenido no puede estar vacío después de la sanitización'
      });
    }

    if (contenido.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'El contenido debe tener al menos 10 caracteres'
      });
    }

    if (contenido.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'El contenido no puede exceder 50 caracteres'
      });
    }

    // Actualizar entrada
    entry.contenido = contenido;
    await entry.save();

    res.status(200).json({
      success: true,
      message: 'Entrada actualizada exitosamente',
      data: {
        id: entry.id,
        contenido: entry.contenido,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar entrada
 * @route   DELETE /api/v1/entries/:id
 * @access  Public
 */
const deleteEntry = async (req, res, next) => {
  try {
    const { id } = req.params;

    const entry = await Entry.findByPk(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Entrada no encontrada'
      });
    }

    await entry.destroy();

    res.status(200).json({
      success: true,
      message: 'Entrada eliminada exitosamente',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener estado de cooldown del cliente
 * @route   GET /api/v1/entries/cooldown/status
 * @access  Public
 */
const getCooldownStatus = async (req, res, next) => {
  try {
    const { getCooldownStatus: getStatus } = require('../middlewares/advancedSecurity');
    const status = getStatus(req);

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reportar intento de ataque detectado por el frontend
 * @route   POST /api/v1/entries/report-attack
 * @access  Public
 */
const reportAttack = async (req, res, next) => {
  try {
    const { attackType } = req.body;
    const clientIP = getClientIP(req);
    
    // Bloquear IP por 5 minutos
    const blockUntil = blockIP(clientIP, attackType || 'XSS detectado por frontend', 5);
    
    res.status(403).json({
      success: false,
      error: 'Intento de ataque detectado',
      message: 'Intento de ataque detectado, serás baneado por 5 min :)',
      attackType: attackType,
      blockedUntil: new Date(blockUntil).toISOString(),
      remainingSeconds: 300,
      cooldown: {
        active: true,
        type: 'blocked',
        remainingSeconds: 300,
        reason: attackType
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  getCooldownStatus,
  reportAttack
};
