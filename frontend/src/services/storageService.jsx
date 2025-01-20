const STORAGE_PREFIX = '@EquipmentApp:';

export const storage = {
  getItem(key) {
    try {
      const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Erro ao ler do storage:', error);
      return null;
    }
  },

  setItem(key, value) {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Erro ao salvar no storage:', error);
      return false;
    }
  },

  removeItem(key) {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      return true;
    } catch (error) {
      console.error('Erro ao remover do storage:', error);
      return false;
    }
  },

  clear() {
    try {
      // Remove apenas os itens com o prefix da aplicação
      Object.keys(localStorage)
        .filter(key => key.startsWith(STORAGE_PREFIX))
        .forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Erro ao limpar storage:', error);
      return false;
    }
  },

  // Métodos específicos da aplicação
  getToken() {
    return this.getItem('token');
  },

  setToken(token) {
    return this.setItem('token', token);
  },

  getUser() {
    return this.getItem('user');
  },

  setUser(user) {
    return this.setItem('user', user);
  },

  clearAuth() {
    this.removeItem('token');
    this.removeItem('user');
  }
};

export default storage;