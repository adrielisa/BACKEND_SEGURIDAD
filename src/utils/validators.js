/**
 * Validadores personalizados para campos específicos
 */

/**
 * Valida que un string solo contenga letras y espacios
 * @param {string} str - String a validar
 * @returns {boolean}
 */
const isValidName = (str) => {
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  return regex.test(str);
};

/**
 * Valida que una contraseña cumpla con los requisitos de seguridad
 * @param {string} password - Contraseña a validar
 * @returns {boolean}
 */
const isStrongPassword = (password) => {
  // Al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

/**
 * Valida que un UUID sea válido
 * @param {string} uuid - UUID a validar
 * @returns {boolean}
 */
const isValidUUID = (uuid) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
};

module.exports = {
  isValidName,
  isStrongPassword,
  isValidUUID
};
