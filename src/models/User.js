const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - nombre
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único del usuario
 *         nombre:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Nombre completo del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         edad:
 *           type: integer
 *           minimum: 1
 *           maximum: 150
 *           description: Edad del usuario
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: Rol del usuario
 *         isActive:
 *           type: boolean
 *           description: Estado del usuario
 *         lastLogin:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: {
        args: [2, 100],
        msg: 'El nombre debe tener entre 2 y 100 caracteres'
      },
      is: {
        args: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        msg: 'El nombre solo puede contener letras y espacios'
      }
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      args: true,
      msg: 'El email ya está registrado'
    },
    validate: {
      isEmail: {
        msg: 'Debe ser un email válido'
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [8, 100],
        msg: 'La contraseña debe tener al menos 8 caracteres'
      }
    }
  },
  edad: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: 1,
        msg: 'La edad debe ser mayor a 0'
      },
      max: {
        args: 150,
        msg: 'La edad debe ser menor a 150'
      }
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'usuarios',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

// Método de instancia para comparar contraseñas
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para ocultar el password en las respuestas JSON
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;
