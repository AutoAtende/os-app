const { User } = require('../models');
const { generateToken } = require('../utils/auth');
const logger = require('../utils/logger');

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
      const { password_hash, ...userData } = user.get();

      return res.status(201).json({
        user: userData,
        token: generateToken({ id: user.id, role: user.role })
      });
    } catch (error) {
      logger.error('Erro ao criar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req, res) {
    try {
      const { email, oldPassword } = req.body;
      const user = await User.findByPk(req.userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

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

      const { password_hash, ...userData } = user.get();

      return res.json(userData);
    } catch (error) {
      logger.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async index(req, res) {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password_hash'] }
      });

      return res.json(users);
    } catch (error) {
      logger.error('Erro ao listar usuários:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password_hash'] }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.json(user);
    } catch (error) {
      logger.error('Erro ao buscar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      await user.destroy();
      return res.status(204).send();
    } catch (error) {
      logger.error('Erro ao deletar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new UserController();