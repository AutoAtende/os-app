import axios from 'axios';
import { toast } from '@/hooks/use-toast';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://oss-api.autoatende.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@EquipmentManagement:token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Para requisições com FormData, remover o Content-Type para que o navegador defina automaticamente
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para tratamento de respostas e erros
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor"
      });
      return Promise.reject(new Error('Erro de conexão'));
    }

    // Melhoria no tratamento de erro 401
    if (error.response.status === 401) {
      // Só limpa o storage se não for tentativa de login
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('@EquipmentManagement:token');
        localStorage.removeItem('@EquipmentManagement:user');
        window.location.href = '/login';
      }
      return Promise.reject(error.response.data);
    }

    return Promise.reject(error.response.data);
  }
);
// Funções auxiliares para endpoints comuns
export const endpoints = {
  auth: {
    login: (data) => api.post('/auth/login', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    validateToken: (token) => api.post('/auth/validate-token', { token }),
  },

  equipment: {
    list: (params) => api.get('/equipment', { params }),
    get: (id) => api.get(`/equipment/${id}`),
    create: (data) => api.post('/equipment', data),
    update: (id, data) => api.put(`/equipment/${id}`, data),
    delete: (id) => api.delete(`/equipment/${id}`),
    getQRCode: (id) => api.get(`/equipment/${id}/qrcode`),
    exportAll: (format = 'pdf') => api.get(`/equipment/export?format=${format}`, {
      responseType: 'blob'
    }),
  },

  maintenance: {
    list: (params) => api.get('/maintenance', { params }),
    get: (id) => api.get(`/maintenance/${id}`),
    create: (data) => api.post('/maintenance', data),
    update: (id, data) => api.put(`/maintenance/${id}`, data),
    updateStatus: (id, status) => api.patch(`/maintenance/${id}/status`, { status }),
    getReport: (id, format = 'pdf') => api.get(`/maintenance/${id}/report?format=${format}`, {
      responseType: 'blob'
    }),
  },

  users: {
    list: (params) => api.get('/users', { params }),
    get: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    updateProfile: (data) => api.put('/users/profile', data),
    updatePassword: (data) => api.put('/users/password', data),
    delete: (id) => api.delete(`/users/${id}`),
  },

  dashboard: {
    getStats: (period = 'month') => api.get(`/dashboard/stats?period=${period}`),
    getMaintenanceMetrics: (params) => api.get('/dashboard/maintenance-metrics', { params }),
    getEquipmentPerformance: () => api.get('/dashboard/equipment-performance'),
  },

  notifications: {
    list: (params) => api.get('/notifications', { params }),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/mark-all-read'),
    getPreferences: () => api.get('/notifications/preferences'),
    updatePreferences: (data) => api.put('/notifications/preferences', data),
  },

  files: {
    upload: (file, type = 'general') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      return api.post('/files', formData);
    },
    delete: (id) => api.delete(`/files/${id}`),
  },

  reports: {
    generate: (type, params) => api.get(`/reports/${type}`, {
      params,
      responseType: 'blob'
    }),
    getStatus: (jobId) => api.get(`/reports/status/${jobId}`),
    download: (reportId) => api.get(`/reports/${reportId}/download`, {
      responseType: 'blob'
    }),
  }
};

export const handleApiError = (error) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message;
    toast({
      variant: "destructive",
      title: "Erro",
      description: message
    });
  } else {
    toast({
      variant: "destructive",
      title: "Erro",
      description: "Ocorreu um erro inesperado"
    });
  }
  return error;
};

export default api;