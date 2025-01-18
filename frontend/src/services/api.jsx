import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api'
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@EquipmentManagement:token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o erro for de autenticação (401), redireciona para o login
    if (error.response?.status === 401) {
      localStorage.removeItem('@EquipmentManagement:token');
      localStorage.removeItem('@EquipmentManagement:user');
      window.location = '/login';
    }
    
    // Personaliza a mensagem de erro
    const customError = new Error(
      error.response?.data?.message ||
      'Ocorreu um erro ao processar sua solicitação'
    );
    
    customError.response = error.response;
    return Promise.reject(customError);
  }
);

export default api;