const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User } = require('../models');
const { Op } = require('sequelize');
const EmailService = require('../services/EmailService');
const logger = require('../utils/logger');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({
        where: { 
          email,
          active: true
        }
      });

      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      if (!(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: 'Senha incorreta' });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Remove senha do retorno
      const { password_hash, ...userData } = user.toJSON();

      return res.json({
        user: userData,
        token
      });

    } catch (error) {
      logger.error('Erro no login:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Gera token de reset
      const resetToken = crypto.randomBytes(20).toString('hex');
      const resetTokenExpires = new Date();
      resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // Token válido por 1 hora

      await user.update({
        password_reset_token: resetToken,
        password_reset_expires: resetTokenExpires
      });

      // Envia email
      await EmailService.sendPasswordReset({
        name: user.name,
        email: user.email,
        token: resetToken,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
      });

      return res.json({ message: 'Email de recuperação enviado com sucesso' });

    } catch (error) {
      logger.error('Erro no forgot password:', error);
      return res.status(500).json({ error: 'Erro ao recuperar senha' });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, token, password } = req.body;

      const user = await User.findOne({
        where: {
          email,
          password_reset_token: token,
          password_reset_expires: {
            [Op.gt]: new Date()
          }
        }
      });

      if (!user) {
        return res.status(400).json({ error: 'Token inválido ou expirado' });
      }

      // Atualiza senha
      const password_hash = await bcrypt.hash(password, 8);

      await user.update({
        password_hash,
        password_reset_token: null,
        password_reset_expires: null
      });

      // Envia email de confirmação
      await EmailService.sendPasswordResetConfirmation({
        name: user.name,
        email: user.email
      });

      return res.json({ message: 'Senha alterada com sucesso' });

    } catch (error) {
      logger.error('Erro no reset password:', error);
      return res.status(500).json({ error: 'Erro ao resetar senha' });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token não fornecido' });
      }

      // Verifica refresh token
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      // Gera novo token
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Gera novo refresh token
      const newRefreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '30d' }
      );

      return res.json({
        token,
        refreshToken: newRefreshToken
      });

    } catch (error) {
      logger.error('Erro no refresh token:', error);
      return res.status(401).json({ error: 'Refresh token inválido' });
    }
  }

  async validateToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      return res.json({ valid: true });

    } catch (error) {
      return res.json({ valid: false });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findByPk(req.userId);

      if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
        return res.status(401).json({ error: 'Senha atual incorreta' });
      }

      const password_hash = await bcrypt.hash(newPassword, 8);
      await user.update({ password_hash });

      // Envia email de notificação
      await EmailService.sendPasswordChangeNotification({
        name: user.name,
        email: user.email
      });

      return res.json({ message: 'Senha alterada com sucesso' });

    } catch (error) {
      logger.error('Erro na mudança de senha:', error);
      return res.status(500).json({ error: 'Erro ao alterar senha' });
    }
  }

  async logout(req, res) {
    try {
      // Aqui você pode implementar lógica adicional de logout
      // como invalidar refresh tokens, etc.
      
      return res.json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      logger.error('Erro no logout:', error);
      return res.status(500).json({ error: 'Erro ao realizar logout' });
    }
  }
}

module.exports = new AuthController();