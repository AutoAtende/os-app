const yup = require('yup');

module.exports = schema => async (req, res, next) => {
  try {
    await schema.validate(req.body, { abortEarly: false });
    return next();
  } catch (err) {
    return res.status(400).json({
      error: 'Erro de validação',
      messages: err.inner.map(error => ({
        field: error.path,
        message: error.message,
      })),
    });
  }
};