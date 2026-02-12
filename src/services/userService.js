const User = require('../models/User');
const { AppError } = require('../utils/errors');
const { Op } = require('sequelize');

class UserService {
  /**
   * Obtener todos los usuarios con paginación y búsqueda
   * @param {object} options - Opciones de paginación y búsqueda
   * @returns {object} Usuarios y datos de paginación
   */
  async getAllUsers({ page = 1, limit = 10, sort = '-createdAt', search = '' }) {
    const offset = (page - 1) * limit;
    
    // Construir query de búsqueda
    const where = {};
    if (search) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Determinar orden
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortDirection = sort.startsWith('-') ? 'DESC' : 'ASC';

    // Ejecutar query
    const { count, rows } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, sortDirection]],
      attributes: { exclude: ['password'] }
    });

    return {
      users: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Obtener usuario por ID
   * @param {string} id - ID del usuario
   * @returns {object} Usuario
   */
  async getUserById(id) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return user;
  }

  /**
   * Actualizar usuario
   * @param {string} id - ID del usuario
   * @param {object} data - Datos a actualizar
   * @returns {object} Usuario actualizado
   */
  async updateUser(id, data) {
    const user = await User.findByPk(id);
    
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Campos permitidos para actualizar
    const allowedFields = ['nombre', 'email', 'edad'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    });

    // Si se intenta cambiar el email, verificar que no exista
    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: updates.email } });
      if (existingUser) {
        throw new AppError('El email ya está en uso', 400);
      }
    }

    await user.update(updates);
    
    // Retornar sin password
    const updatedUser = user.toJSON();
    return updatedUser;
  }

  /**
   * Eliminar usuario (soft delete)
   * @param {string} id - ID del usuario
   */
  async deleteUser(id) {
    const user = await User.findByPk(id);
    
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Soft delete - desactivar en lugar de eliminar
    await user.update({ isActive: false });
    
    // O hard delete:
    // await user.destroy();
    
    return true;
  }

  /**
   * Actualizar rol de usuario
   * @param {string} id - ID del usuario
   * @param {string} newRole - Nuevo rol
   * @returns {object} Usuario actualizado
   */
  async updateUserRole(id, newRole) {
    const user = await User.findByPk(id);
    
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (!['user', 'admin'].includes(newRole)) {
      throw new AppError('Rol inválido. Debe ser "user" o "admin"', 400);
    }

    await user.update({ role: newRole });
    return user.toJSON();
  }

  /**
   * Activar/Desactivar usuario
   * @param {string} id - ID del usuario
   * @param {boolean} isActive - Estado activo
   * @returns {object} Usuario actualizado
   */
  async toggleUserStatus(id, isActive) {
    const user = await User.findByPk(id);
    
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    await user.update({ isActive });
    return user.toJSON();
  }

  /**
   * Obtener estadísticas de usuarios
   * @returns {object} Estadísticas
   */
  async getUserStats() {
    const total = await User.count();
    const active = await User.count({ where: { isActive: true } });
    const inactive = await User.count({ where: { isActive: false } });
    const admins = await User.count({ where: { role: 'admin' } });
    const users = await User.count({ where: { role: 'user' } });

    return {
      total,
      active,
      inactive,
      admins,
      users
    };
  }
}

module.exports = new UserService();
