export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  };
  
  export const formatDateTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('pt-BR');
  };
  
  export const formatStatus = (status) => {
    const statusMap = {
      active: 'Ativo',
      inactive: 'Inativo',
      maintenance: 'Em Manutenção',
      pending: 'Pendente',
      completed: 'Concluído',
      in_progress: 'Em Andamento'
    };
    return statusMap[status] || status;
  };
  
  export const formatMaintenanceType = (type) => {
    const typeMap = {
      corrective: 'Corretiva',
      preventive: 'Preventiva',
      predictive: 'Preditiva'
    };
    return typeMap[type] || type;
  };