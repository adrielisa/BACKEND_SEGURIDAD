const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const { JSDOM } = require('jsdom');
const DOMPurify = require('dompurify');

const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Headers de seguridad
exports.securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Prevenir HTTP Parameter Pollution
exports.preventParameterPollution = hpp({
  whitelist: ['nombre', 'email', 'edad', 'role', 'page', 'limit', 'sort', 'search']
});

// Sanitizar datos contra NoSQL injection
exports.sanitizeNoSQL = mongoSanitize();

// Middleware para sanitizar body
exports.sanitizeBody = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = purify.sanitize(req.body[key]);
      }
    });
  }
  next();
};
