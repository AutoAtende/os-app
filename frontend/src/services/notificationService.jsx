import { toast } from 'react-toastify';

class NotificationService {
  constructor() {
    this.permission = null;
    this.registration = null;
    this.publicVapidKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
  }

  async init() {
    try {
      // Solicita permissão para notificações Push
      if ('Notification' in window) {
        this.permission = await Notification.requestPermission();
      }

      // Registra o service worker
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        this.registration = await navigator.serviceWorker.register('/service-worker.js');
        
        if (this.permission === 'granted') {
          await this.subscribeToPush();
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar notificações:', error);
    }
  }

  async subscribeToPush() {
    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.publicVapidKey)
      });

      // Envia a subscription para o backend
      await api.post('/notifications/subscribe', subscription);
    } catch (error) {
      console.error('Erro ao se inscrever nas notificações push:', error);
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Exibe mensagem de sucesso
  showSuccess(message) {
    toast.success(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  }

  // Exibe mensagem de erro
  showError(message) {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  }

  // Exibe mensagem de aviso
  showWarning(message) {
    toast.warning(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  }

  // Exibe mensagem de informação
  showInfo(message) {
    toast.info(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  }
}

export default new NotificationService();