const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cors = require('cors');

// Rate limiter para rotas gerais
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite por IP
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos'
});

// Rate limiter específico para autenticação
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // 5 tentativas
  message: 'Muitas tentativas de login, tente novamente em 1 hora'
});

const security = {
  // Middlewares básicos de segurança
  basic: [
    helmet(),
    mongoSanitize(),
    hpp(),
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
  }
};

module.exports = security;