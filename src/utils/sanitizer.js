const { JSDOM } = require('jsdom');
const DOMPurify = require('dompurify');

const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * Sanitiza un string para prevenir XSS
 * @param {string} dirty - String a sanitizar
 * @returns {string} String limpio
 */
const sanitizeString = (dirty) => {
  if (typeof dirty !== 'string') return dirty;
  return purify.sanitize(dirty);
};

/**
 * Sanitiza un objeto recursivamente
 * @param {object} obj - Objeto a sanitizar
 * @returns {object} Objeto limpio
 */
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }
  return sanitized;
};

module.exports = {
  sanitizeString,
  sanitizeObject
};
