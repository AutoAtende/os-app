const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

class AuthMiddleware {
  async authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
  
      if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }
  
      const [, token] = authHeader.split(' ');
  
      if (!token) {
        return res.status(401).json({ error: 'Token mal formatado' });
      }
  
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findOne({ 
          where: { 
            id: decoded.id,
            active: true 
          }
        });
        
        if (!user) {
          return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
        }
  
        req.userId = user.id;
        req.userRole = user.role;
        
        return next();
      } catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  hasRole(roles) {
    return (req, res, next) => {
      if (!roles.includes(req.userRole)) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }
      next();
    };
  }

  isAdmin(req, res, next) {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Acesso restrito a administradores' });
    }
    next();
  }

  // Middleware para verificar se o usuário tem acesso ao departamento
  async hasDepartmentAccess(req, res, next) {
    try {
      if (req.userRole === 'admin') {
        return next();
      }

      const user = await User.findByPk(req.userId);
      const requestedDepartment = req.body.department || req.query.department;

      if (!requestedDepartment || user.department === requestedDepartment) {
        return next();
      }

      return res.status(403).json({ error: 'Acesso não autorizado ao departamento' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthMiddleware();