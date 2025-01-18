import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class PushNotificationService {
  constructor() {
    this.configure();
  }

  async configure() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permissão para notificações não concedida!');
        return;
      }

      const token = await this.getDevicePushToken();
      if (token) {
        await this.registerDeviceToken(token);
      }
    }

    // Configuração das notificações
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  async getDevicePushToken() {
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        experienceId: '@your-org/your-app'
      });
      return token.data;
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  }

  async registerDeviceToken(token) {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      await fetch(`${process.env.API_URL}/users/push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
        },
        body: JSON.stringify({
          token,
          device: Platform.OS,
          userId
        })
      });
    } catch (error) {
      console.error('Erro ao registrar token:', error);
    }
  }

  async scheduleLocalNotification(title, body, data = {}, trigger = null) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: 'high',
        },
        trigger: trigger || null,
      });
      return notificationId;
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
    }
  }

  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Erro ao cancelar notificação:', error);
    }
  }

  async setBadgeCount(count) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Erro ao definir badge:', error);
    }
  }

  addNotificationReceivedListener(callback) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  addNotificationResponseReceivedListener(callback) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  removeNotificationSubscription(subscription) {
    subscription.remove();
  }

  // Helpers para tipos específicos de notificações
  async scheduleMaintenance(maintenance) {
    const scheduledDate = new Date(maintenance.scheduled_for);
    
    // Notificação 24h antes
    await this.scheduleLocalNotification(
      'Manutenção Agendada',
      `Manutenção do equipamento ${maintenance.equipment.name} amanhã`,
      { maintenanceId: maintenance.id },
      {
        date: new Date(scheduledDate.getTime() - 24 * 60 * 60 * 1000)
      }
    );

    // Notificação 1h antes
    await this.scheduleLocalNotification(
      'Manutenção em Breve',
      `Manutenção do equipamento ${maintenance.equipment.name} em 1 hora`,
      { maintenanceId: maintenance.id },
      {
        date: new Date(scheduledDate.getTime() - 60 * 60 * 1000)
      }
    );
  }

  async notifyMaintenanceComplete(maintenance) {
    await this.scheduleLocalNotification(
      'Manutenção Concluída',
      `A manutenção do equipamento ${maintenance.equipment.name} foi finalizada`,
      { maintenanceId: maintenance.id }
    );
  }

  async notifyMaintenanceOverdue(maintenance) {
    await this.scheduleLocalNotification(
      'Manutenção Atrasada',
      `A manutenção do equipamento ${maintenance.equipment.name} está atrasada`,
      { maintenanceId: maintenance.id }
    );
  }
}

export default new PushNotificationService();