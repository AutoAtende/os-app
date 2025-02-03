import { toast } from '@/components/ui/use-toast';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.messageHandlers = new Map();
    this.connectionPromise = null;
    this.isConnecting = false;
  }

  async connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    if (this.isConnecting) return this.connectionPromise;

    this.isConnecting = true;
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const token = localStorage.getItem('@EquipmentManagement:token');
        if (!token) {
          throw new Error('Token não encontrado');
        }

        const wsUrl = `${import.meta.env.VITE_WS_URL}?token=${token}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          resolve();

          // Enviar ping a cada 30 segundos para manter a conexão
          this.pingInterval = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
              this.ws.send(JSON.stringify({ type: 'ping' }));
            }
          }, 30000);
        };

        this.ws.onclose = () => {
          this.handleDisconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.handleDisconnect();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  handleDisconnect() {
    this.isConnecting = false;
    clearInterval(this.pingInterval);

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, timeout);
    } else {
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: "Não foi possível reconectar ao servidor"
      });
    }
  }

  handleMessage(message) {
    const { type, data } = message;

    // Resposta do ping
    if (type === 'pong') return;

    // Notificações do sistema
    if (type === 'NOTIFICATION') {
      toast({
        title: data.title,
        description: data.message,
        variant: data.priority === 'high' ? 'destructive' : 'default'
      });
    }

    // Executar handlers registrados para o tipo de mensagem
    const handlers = this.messageHandlers.get(type) || [];
    handlers.forEach(handler => handler(data));
  }

  subscribe(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type).push(handler);

    // Retorna uma função para cancelar a inscrição
    return () => {
      const handlers = this.messageHandlers.get(type);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  send(type, data) {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket não está conectado');
    }

    this.ws.send(JSON.stringify({ type, data }));
  }

  async joinRoom(roomId) {
    await this.connect();
    this.send('JOIN_ROOM', { roomId });
  }

  async leaveRoom(roomId) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send('LEAVE_ROOM', { roomId });
    }
  }

  disconnect() {
    clearTimeout(this.reconnectTimeout);
    clearInterval(this.pingInterval);
    
    if (this.ws) {
      this.ws.onclose = null; // Prevenir tentativa de reconexão
      this.ws.close();
      this.ws = null;
    }

    this.messageHandlers.clear();
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }
}

export const wsService = new WebSocketService();

// Hooks para usar o WebSocket em componentes React
export const useWebSocket = (type, handler) => {
  React.useEffect(() => {
    wsService.connect();
    const unsubscribe = wsService.subscribe(type, handler);
    return () => unsubscribe();
  }, [type, handler]);
};

export const useEquipmentUpdates = (equipmentId, handler) => {
  React.useEffect(() => {
    const roomId = `equipment_${equipmentId}`;
    wsService.joinRoom(roomId);
    const unsubscribe = wsService.subscribe('EQUIPMENT_UPDATED', handler);
    
    return () => {
      unsubscribe();
      wsService.leaveRoom(roomId);
    };
  }, [equipmentId, handler]);
};

export default wsService;