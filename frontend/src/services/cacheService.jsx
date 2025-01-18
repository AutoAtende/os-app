class CacheService {
    constructor() {
      this.prefix = 'equipment_management_';
      this.defaultTTL = 5 * 60 * 1000; // 5 minutos em milissegundos
    }
  
    async get(key, fetchCallback = null) {
      const fullKey = this.prefix + key;
      const stored = localStorage.getItem(fullKey);
  
      if (stored) {
        const { value, timestamp, ttl } = JSON.parse(stored);
        const now = new Date().getTime();
  
        // Verifica se o cache ainda é válido
        if (timestamp + ttl > now) {
          return value;
        }
        
        // Remove o cache expirado
        this.remove(key);
      }
  
      // Se há um callback para buscar dados, executa e armazena
      if (fetchCallback) {
        const value = await fetchCallback();
        this.set(key, value);
        return value;
      }
  
      return null;
    }
  
    set(key, value, ttl = this.defaultTTL) {
      const fullKey = this.prefix + key;
      const data = {
        value,
        timestamp: new Date().getTime(),
        ttl
      };
  
      try {
        localStorage.setItem(fullKey, JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Erro ao armazenar em cache:', error);
        this.clearOldItems(); // Tenta liberar espaço
        return false;
      }
    }
  
    remove(key) {
      const fullKey = this.prefix + key;
      localStorage.removeItem(fullKey);
    }
  
    clear() {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key));
    }
  
    clearOldItems() {
      const now = new Date().getTime();
  
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => {
          try {
            const stored = JSON.parse(localStorage.getItem(key));
            if (stored.timestamp + stored.ttl < now) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            localStorage.removeItem(key);
          }
        });
    }
  
    async getEquipmentList() {
      return this.get('equipment_list', async () => {
        const response = await api.get('/equipment');
        return response.data;
      });
    }
  
    async getEquipmentDetails(id) {
      return this.get(`equipment_${id}`, async () => {
        const response = await api.get(`/equipment/${id}`);
        return response.data;
      });
    }
  
    async getUserPreferences() {
      return this.get('user_preferences', async () => {
        const response = await api.get('/users/preferences');
        return response.data;
      });
    }
  
    updateEquipmentCache(equipment) {
      this.set(`equipment_${equipment.id}`, equipment);
      
      // Atualiza também a lista de equipamentos
      this.get('equipment_list').then(list => {
        if (list) {
          const updatedList = list.map(item => 
            item.id === equipment.id ? equipment : item
          );
          this.set('equipment_list', updatedList);
        }
      });
    }
  
    invalidateEquipmentCache(equipmentId) {
      this.remove(`equipment_${equipmentId}`);
      this.remove('equipment_list');
    }
  
    getOfflineCapableData() {
      const offlineData = {
        equipment: [],
        serviceOrders: [],
        preferences: null
      };
  
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => {
          try {
            const stored = JSON.parse(localStorage.getItem(key));
            if (key.includes('equipment_list')) {
              offlineData.equipment = stored.value;
            } else if (key.includes('service_orders')) {
              offlineData.serviceOrders = stored.value;
            } else if (key.includes('user_preferences')) {
              offlineData.preferences = stored.value;
            }
          } catch (error) {
            console.error('Erro ao ler dados offline:', error);
          }
        });
  
      return offlineData;
    }
  
    estimateCacheSize() {
      let totalSize = 0;
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => {
          totalSize += localStorage.getItem(key).length * 2; // Aproximação em bytes
        });
      return totalSize;
    }
  
    setupPeriodicCleanup(interval = 60 * 60 * 1000) { // 1 hora
      setInterval(() => this.clearOldItems(), interval);
    }
  }
  
  export default new CacheService();