const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Entry:
 *       type: object
 *       required:
 *         - contenido
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único del registro
 *         contenido:
 *           type: string
 *           minLength: 10
 *           maxLength: 50
 *           description: Contenido del registro
 *         ipAddress:
 *           type: string
 *           description: IP del cliente (solo para tracking de seguridad)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const Entry = sequelize.define('Entry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El contenido no puede estar vacío'
      },
      len: {
        args: [10, 50],
        msg: 'El contenido debe tener entre 10 y 50 caracteres'
      }
    }
  },
  ipAddress: {
    type: DataTypes.STRING(45), // IPv6 max length
    allowNull: true
  }
}, {
  tableName: 'entries',
  timestamps: true
});

module.exports = Entry;
