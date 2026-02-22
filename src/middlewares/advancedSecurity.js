const rateLimit = require('express-rate-limit');

// Almacenamiento en memoria para IPs bloqueadas y cooldowns
const blockedIPs = new Map(); // { ip: { until: timestamp, reason: string } }
const cooldowns = new Map(); // { ip: timestamp }

/**
 * Patrones de ataque detectables
 */
const ATTACK_PATTERNS = {
  xss: [
    /<script[^>]*>.*?<\/script>/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /javascript:/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /onerror\s*=/gi,
    /onload\s*=/gi,
    /onclick\s*=/gi,
    /alert\s*\(/gi,
    /eval\s*\(/gi,
    /document\.cookie/gi,
    /<img[^>]+src[^>]*>/gi
  ],
  sqlInjection: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION)\b)/gi,
    /(\bOR\b\s+\d+\s*=\s*\d+)/gi,
    /(\bAND\b\s+\d+\s*=\s*\d+)/gi,
    /'.*--/gi,
    /';.*--/gi,
    /"\s*(OR|AND)\s*"/gi,
    /'\s*(OR|AND)\s*'/gi,
    /UNION\s+SELECT/gi,
    /1=1/gi,
    /1'\s*OR\s*'1'\s*=\s*'1/gi
  ],
  commandInjection: [
    /[;&|`$()]/g,
    /\.\.\//g,
    /~\//g
  ]
};

/**
 * Detecta si el contenido contiene patrones de ataque
 */
function detectAttack(content) {
  if (!content || typeof content !== 'string') return false;

  // Verificar XSS
  for (const pattern of ATTACK_PATTERNS.xss) {
    if (pattern.test(content)) {
      return { type: 'XSS', pattern: pattern.toString() };
    }
  }

  // Verificar SQL Injection
  for (const pattern of ATTACK_PATTERNS.sqlInjection) {
    if (pattern.test(content)) {
      return { type: 'SQL Injection', pattern: pattern.toString() };
    }
  }

  // Verificar Command Injection
  for (const pattern of ATTACK_PATTERNS.commandInjection) {
    if (pattern.test(content)) {
      return { type: 'Command Injection', pattern: pattern.toString() };
    }
  }

  return false;
}

/**
 * Obtiene la IP real del cliente (considerando proxies)
 */
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip
  );
}

/**
 * Middleware para verificar si la IP está bloqueada (debe ejecutarse PRIMERO)
 */
const checkBlockedIP = (req, res, next) => {
  const clientIP = getClientIP(req);
  const now = Date.now();

  // Limpiar bloqueos expirados
  for (const [ip, data] of blockedIPs.entries()) {
    if (now > data.until) {
      blockedIPs.delete(ip);
    }
  }

  // Verificar si la IP está bloqueada
  const blocked = blockedIPs.get(clientIP);
  if (blocked && now < blocked.until) {
    const remainingTime = Math.ceil((blocked.until - now) / 1000);
    return res.status(403).json({
      success: false,
      error: 'IP bloqueada temporalmente',
      message: `Tu IP ha sido bloqueada por intento de ataque (${blocked.reason}). Intenta nuevamente en ${remainingTime} segundos.`,
      blockedUntil: new Date(blocked.until).toISOString(),
      remainingSeconds: remainingTime,
      cooldown: {
        active: true,
        type: 'blocked',
        remainingSeconds: remainingTime,
        reason: blocked.reason
      }
    });
  }

  next();
};

/**
 * Middleware de detección de ataques
 * Bloquea IPs por 15 minutos si detecta intentos de ataque
 */
const attackDetectionMiddleware = (req, res, next) => {
  const clientIP = getClientIP(req);
  const now = Date.now();

  // Verificar contenido en body
  if (req.body && req.body.contenido) {
    const attack = detectAttack(req.body.contenido);
    
    if (attack) {
      // Bloquear IP por 15 minutos
      const blockUntil = now + (15 * 60 * 1000); // 15 minutos
      blockedIPs.set(clientIP, {
        until: blockUntil,
        reason: attack.type,
        detectedAt: new Date().toISOString()
      });

      console.warn(`⚠️  ATAQUE DETECTADO - IP: ${clientIP}, Tipo: ${attack.type}`);

      return res.status(403).json({
        success: false,
        error: 'Intento de ataque detectado',
        message: `Se ha detectado un intento de ${attack.type}. Tu IP ha sido bloqueada por 15 minutos.`,
        attackType: attack.type,
        blockedUntil: new Date(blockUntil).toISOString()
      });
    }
  }

  next();
};

/**
 * Middleware de cooldown por IP (30 segundos entre registros)
 */
const cooldownMiddleware = (req, res, next) => {
  const clientIP = getClientIP(req);
  const now = Date.now();
  const COOLDOWN_TIME = 30 * 1000; // 30 segundos

  const lastRequest = cooldowns.get(clientIP);

  if (lastRequest) {
    const timeSinceLastRequest = now - lastRequest;
    
    if (timeSinceLastRequest < COOLDOWN_TIME) {
      const remainingTime = Math.ceil((COOLDOWN_TIME - timeSinceLastRequest) / 1000);
      
      return res.status(429).json({
        success: false,
        error: 'Cooldown activo',
        message: `Debes esperar ${remainingTime} segundos antes de realizar otro registro.`,
        remainingSeconds: remainingTime,
        cooldownEndsAt: new Date(lastRequest + COOLDOWN_TIME).toISOString()
      });
    }
  }

  // Actualizar timestamp del último request
  cooldowns.set(clientIP, now);

  // Limpiar cooldowns antiguos (más de 5 minutos)
  for (const [ip, timestamp] of cooldowns.entries()) {
    if (now - timestamp > 5 * 60 * 1000) {
      cooldowns.delete(ip);
    }
  }

  next();
};

/**
 * Rate limiter general - 5 acciones cada 10 segundos por IP
 */
const generalLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 segundos
  max: 5, // 5 requests por ventana
  message: {
    success: false,
    error: 'Demasiadas solicitudes',
    message: 'Has excedido el límite de 5 acciones cada 10 segundos. Por favor, espera un momento.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIP
});

/**
 * Obtener estado de cooldown para una IP específica
 */
function getCooldownStatus(req) {
  const clientIP = getClientIP(req);
  const now = Date.now();
  const COOLDOWN_TIME = 30 * 1000;

  const lastRequest = cooldowns.get(clientIP);
  const blocked = blockedIPs.get(clientIP);

  if (blocked && now < blocked.until) {
    return {
      active: true,
      type: 'blocked',
      remainingSeconds: Math.ceil((blocked.until - now) / 1000),
      reason: blocked.reason
    };
  }

  if (lastRequest) {
    const timeSinceLastRequest = now - lastRequest;
    if (timeSinceLastRequest < COOLDOWN_TIME) {
      return {
        active: true,
        type: 'cooldown',
        remainingSeconds: Math.ceil((COOLDOWN_TIME - timeSinceLastRequest) / 1000)
      };
    }
  }

  return {
    active: false,
    remainingSeconds: 0
  };
}

/**
 * Bloquear IP manualmente (usada cuando el frontend detecta ataque)
 */
function blockIP(ip, reason = 'Intento de ataque', minutes = 5) {
  const blockUntil = Date.now() + (minutes * 60 * 1000);
  blockedIPs.set(ip, {
    until: blockUntil,
    reason: reason,
    detectedAt: new Date().toISOString()
  });
  console.warn(`⚠️  IP BLOQUEADA - IP: ${ip}, Razón: ${reason}, Duración: ${minutes} min`);
  return blockUntil;
}

module.exports = {
  checkBlockedIP,
  attackDetectionMiddleware,
  cooldownMiddleware,
  generalLimiter,
  getCooldownStatus,
  getClientIP,
  blockIP
};
