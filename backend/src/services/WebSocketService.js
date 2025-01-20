const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const http = require('http');

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // Map para armazenar conexões de clientes
    this.initialize();
  }

  initialize() {
    this.wss.on('connection', async (ws, req) => {
      try {
        // Autenticação do WebSocket
        const token = this.extractToken(req);
        if (!token) {
          ws.close(4001, 'Unauthorized');
          return;
        }

        const user = await this.authenticateToken(token);
        if (!user) {
          ws.close(4001, 'Invalid token');
          return;
        }

        // Armazena a conexão do cliente
        this.clients.set(user.id, {
          ws,
          user
        });

        // Setup de heartbeat
        ws.isAlive = true;
        ws.on('pong', () => {
          ws.isAlive = true;
        });

        // Listener de mensagens
        ws.on('message', async (message) => {
          try {
            await this.handleMessage(user.id, JSON.parse(message));
          } catch (error) {
            console.error('Erro ao processar mensagem:', error);
            this.sendError(ws, error.message);
          }
        });

        // Listener de fechamento
        ws.on('close', () => {
          this.clients.delete(user.id);
        });

        // Envia confirmação de conexão
        this.sendToClient(user.id, {
          type: 'CONNECTION_ESTABLISHED',
          data: {
            userId: user.id,
            timestamp: new Date()
          }
        });

      } catch (error) {
        console.error('Erro na conexão WebSocket:', error);
        ws.close(4000, 'Internal server error');
      }
    });

    // Configuração do heartbeat
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping(() => {});
      });
    }, 30000);
  }

  async handleMessage(userId, message) {
    const { type, data } = message;

    switch (type) {
      case 'MAINTENANCE_UPDATE':
        await this.handleMaintenanceUpdate(userId, data);
        break;

      case 'EQUIPMENT_STATUS_CHANGE':
        await this.handleEquipmentStatusChange(userId, data);
        break;

      case 'JOIN_EQUIPMENT_ROOM':
        await this.handleJoinEquipmentRoom(userId, data);
        break;

      default:
        throw new Error('Tipo de mensagem não suportado');
    }
  }

  async handleMaintenanceUpdate(userId, data) {
    // Notifica todos os admins e o técnico responsável
    const notification = {
      type: 'MAINTENANCE_UPDATED',
      data: {
        maintenanceId: data.maintenanceId,
        status: data.status,
        updatedBy: userId,
        timestamp: new Date()
      }
    };

    await this.notifyAdmins(notification);
    if (data.technicianId) {
      this.sendToClient(data.technicianId, notification);
    }
  }

  async handleEquipmentStatusChange(userId, data) {
    const notification = {
      type: 'EQUIPMENT_STATUS_CHANGED',
      data: {
        equipmentId: data.equipmentId,
        status: data.status,
        changedBy: userId,
        timestamp: new Date()
      }
    };

    await this.notifyDepartment(data.departmentId, notification);
  }

  async handleJoinEquipmentRoom(userId, data) {
    const client = this.clients.get(userId);
    if (client) {
      client.equipmentRooms = client.equipmentRooms || new Set();
      client.equipmentRooms.add(data.equipmentId);
    }
  }

  // Envia mensagem para um cliente específico
  sendToClient(userId, message) {
    const client = this.clients.get(userId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  // Envia mensagem para todos os admins
  async notifyAdmins(message) {
    this.clients.forEach((client) => {
      if (client.user.role === 'admin' && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  // Envia mensagem para todos os usuários de um departamento
  async notifyDepartment(departmentId, message) {
    this.clients.forEach((client) => {
      if (client.user.departmentId === departmentId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  // Envia mensagem de erro para um cliente
  sendError(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        data: { message }
      }));
    }
  }

  // Extrai token do request
  extractToken(req) {
    const auth = req.headers.authorization;
    if (!auth) return null;
    return auth.replace('Bearer ', '');
  }

  // Autentica o token
  async authenticateToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      return user;
    } catch (error) {
      return null;
    }
  }

  // Broadcast para todos os clientes conectados
  broadcast(message) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

module.exports = WebSocketService;