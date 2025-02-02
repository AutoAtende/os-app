const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class WebSocketManager {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map();
    this.rooms = new Map();
    
    this.initialize();
  }

  initialize() {
    this.wss.on('connection', async (ws, req) => {
      try {
        // Autenticação
        const token = this.extractToken(req);
        if (!token) {
          ws.close(4001, 'Token não fornecido');
          return;
        }

        const user = await this.verifyToken(token);
        if (!user) {
          ws.close(4001, 'Token inválido');
          return;
        }

        // Registra o cliente
        const clientId = user.id;
        this.clients.set(clientId, { ws, user });

        // Setup de heartbeat
        ws.isAlive = true;
        ws.on('pong', () => { ws.isAlive = true; });

        // Manipuladores de eventos
        ws.on('message', async (message) => {
          try {
            const data = JSON.parse(message);
            await this.handleMessage(clientId, data);
          } catch (error) {
            logger.error('Erro ao processar mensagem:', error);
            this.sendError(ws, error.message);
          }
        });

        ws.on('close', () => {
          this.handleDisconnect(clientId);
        });

        // Notifica conexão bem-sucedida
        this.sendToClient(clientId, {
          type: 'CONNECTED',
          data: { userId: clientId }
        });

      } catch (error) {
        logger.error('Erro na conexão WebSocket:', error);
        ws.close(4000, 'Erro interno');
      }
    });

    // Heartbeat interval
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  async handleMessage(clientId, message) {
    const { type, data } = message;

    switch (type) {
      case 'JOIN_ROOM':
        await this.handleJoinRoom(clientId, data.roomId);
        break;

      case 'LEAVE_ROOM':
        await this.handleLeaveRoom(clientId, data.roomId);
        break;

      case 'EQUIPMENT_UPDATE':
        await this.handleEquipmentUpdate(clientId, data);
        break;

      case 'MAINTENANCE_STATUS':
        await this.handleMaintenanceStatus(clientId, data);
        break;

      default:
        logger.warn('Tipo de mensagem desconhecido:', type);
        break;
    }
  }

  async handleJoinRoom(clientId, roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(clientId);
  }

  async handleLeaveRoom(clientId, roomId) {
    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId).delete(clientId);
    }
  }

  async handleEquipmentUpdate(clientId, data) {
    const { equipmentId, status, changes } = data;
    
    // Notifica todos na sala do equipamento
    this.broadcastToRoom(`equipment_${equipmentId}`, {
      type: 'EQUIPMENT_UPDATED',
      data: {
        equipmentId,
        status,
        changes,
        updatedBy: clientId,
        timestamp: new Date()
      }
    });
  }

  async handleMaintenanceStatus(clientId, data) {
    const { maintenanceId, status, notes } = data;

    // Notifica interessados sobre atualização da manutenção
    this.broadcastToRoom(`maintenance_${maintenanceId}`, {
      type: 'MAINTENANCE_UPDATED',
      data: {
        maintenanceId,
        status,
        notes,
        updatedBy: clientId,
        timestamp: new Date()
      }
    });
  }

  handleDisconnect(clientId) {
    // Remove cliente de todas as salas
    this.rooms.forEach((clients, roomId) => {
      clients.delete(clientId);
    });

    // Remove cliente da lista
    this.clients.delete(clientId);
  }

  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  broadcastToRoom(roomId, message) {
    const clients = this.rooms.get(roomId);
    if (clients) {
      clients.forEach(clientId => {
        this.sendToClient(clientId, message);
      });
    }
  }

  broadcastToAll(message) {
    this.clients.forEach((client, clientId) => {
      this.sendToClient(clientId, message);
    });
  }

  sendError(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        data: { message }
      }));
    }
  }

  extractToken(req) {
    const auth = req.headers.authorization;
    return auth ? auth.replace('Bearer ', '') : null;
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return await User.findByPk(decoded.id);
    } catch (error) {
      return null;
    }
  }
}

module.exports = WebSocketManager;