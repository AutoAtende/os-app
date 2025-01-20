const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const cors = require('cors');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite por IP
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos'
});

// Limiter específico para autenticação
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // 5 tentativas
  message: 'Muitas tentativas de login, tente novamente em 1 hora'
});

const security = {
  // Configurações básicas de segurança
  basic: [
    helmet(), // Segurança básica de headers
    xss(), // Prevenção XSS
    hpp(), // Proteção contra poluição de parâmetros
    mongoSanitize(), // Sanitização de dados
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  ],

  // Rate limiting
  rateLimit: {
    all: limiter,
    auth: authLimiter
  },

  // Validação de uploads
  validateUpload: (req, res, next) => {
    const file = req.file;
    
    if (!file) {
      return next();
    }

    // Verifica tamanho máximo (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({
        error: 'Arquivo muito grande. Tamanho máximo: 5MB'
      });
    }

    // Verifica tipos permitidos
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: 'Tipo de arquivo não permitido'
      });
    }

    next();
  },

  // Sanitização de dados
  sanitizeData: (req, res, next) => {
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key].trim();
        }
      });
    }
    next();
  },

  // Validação de tokens JWT
  validateJWT: (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido' });
    }
  },

  // Controle de acesso baseado em roles
  checkRole: (roles) => {
    return async (req, res, next) => {
      try {
        const user = await User.findByPk(req.userId);
        
        if (!user) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        if (!roles.includes(user.role)) {
          return res.status(403).json({ error: 'Acesso não autorizado' });
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }
};

module.exports = security;