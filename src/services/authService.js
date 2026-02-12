const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/errors');

class AuthService {
  /**
   * Generar token JWT
   * @param {string} userId - ID del usuario
   * @returns {string} Token JWT
   */
  generateToken(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        issuer: 'crud-backend',
        audience: 'crud-frontend'
      }
    );
  }

  /**
   * Generar refresh token
   * @param {string} userId - ID del usuario
   * @returns {string} Refresh token
   */
  generateRefreshToken(userId) {
    return jwt.sign(
      { id: userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );
  }

  /**
   * Registro de usuario
   * @param {object} userData - Datos del usuario
   * @returns {object} Usuario y tokens
   */
  async register({ nombre, email, password, edad }) {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('El email ya está registrado', 400);
    }

    // Crear usuario
    const user = await User.create({
      nombre,
      email,
      password,
      edad
    });

    // Generar tokens
    const token = this.generateToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user,
      token,
      refreshToken
    };
  }

  /**
   * Login de usuario
   * @param {object} credentials - Credenciales del usuario
   * @returns {object} Usuario y tokens
   */
  async login({ email, password }) {
    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Email o contraseña incorrectos', 401);
    }

    if (!user.isActive) {
      throw new AppError('Usuario desactivado. Contacta al administrador.', 403);
    }

    // Actualizar último login
    await user.update({ lastLogin: new Date() });

    // Generar tokens
    const token = this.generateToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user,
      token,
      refreshToken
    };
  }

  /**
   * Verificar token
   * @param {string} token - Token JWT
   * @returns {object} Usuario
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      
      if (!user || !user.isActive) {
        throw new AppError('Usuario no válido', 401);
      }

      return user;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Token expirado', 401);
      }
      throw new AppError('Token inválido', 401);
    }
  }

  /**
   * Refrescar access token
   * @param {string} refreshToken - Refresh token
   * @returns {object} Nuevo access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      if (decoded.type !== 'refresh') {
        throw new AppError('Token inválido', 401);
      }

      const user = await User.findByPk(decoded.id);
      if (!user || !user.isActive) {
        throw new AppError('Usuario no válido', 401);
      }

      const newToken = this.generateToken(user.id);
      return { token: newToken };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Refresh token expirado. Por favor inicia sesión nuevamente.', 401);
      }
      throw new AppError('Refresh token inválido', 401);
    }
  }

  /**
   * Cambiar contraseña
   * @param {string} userId - ID del usuario
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {boolean} Éxito
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Verificar contraseña actual
    if (!(await user.comparePassword(currentPassword))) {
      throw new AppError('Contraseña actual incorrecta', 401);
    }

    // Actualizar contraseña
    await user.update({ password: newPassword });
    return true;
  }
}

module.exports = new AuthService();
