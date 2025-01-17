const { ValidationError } = require('sequelize');

module.exports = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: 'Erro de validação',
      messages: err.errors.map(error => error.message),
    });
  }

  console.error(err);

  return res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};