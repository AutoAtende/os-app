const { User } = require('../models');
const { generateToken } = require('../utils/auth');

class UserController {
  async store(req, res) {
    try {
      const { email } = req.body;

      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: 'Usuário já existe' });
      }

      const user = await User.create(req.body);

      // Remove o password do retorno
      const { password, ...userData } = user.get();

      return res.status(201).json({
        user: userData,
        token: generateToken({ id: user.id }),
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req, res) {
    const { email, oldPassword } = req.body;
    const user = await User.findByPk(req.userId);

    if (email && email !== user.email) {
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    await user.update(req.body);

    user.password = undefined;

    return res.json(user);
  }

  async index(req, res) {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
    });

    return res.json(users);
  }
}

module.exports = new UserController();