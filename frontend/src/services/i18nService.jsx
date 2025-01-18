import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importando os arquivos de tradução
const resources = {
  'pt-BR': {
    translation: {
      common: {
        save: 'Salvar',
        cancel: 'Cancelar',
        edit: 'Editar',
        delete: 'Excluir',
        back: 'Voltar',
        add: 'Adicionar',
        search: 'Buscar',
        filter: 'Filtrar',
        yes: 'Sim',
        no: 'Não',
        loading: 'Carregando...',
        noData: 'Nenhum dado encontrado',
        error: 'Erro',
        success: 'Sucesso',
        confirm: 'Confirmar',
      },
      equipment: {
        title: 'Equipamentos',
        new: 'Novo Equipamento',
        edit: 'Editar Equipamento',
        name: 'Nome do Equipamento',
        code: 'Código',
        serialNumber: 'Número de Série',
        department: 'Departamento',
        status: {
          active: 'Ativo',
          maintenance: 'Em Manutenção',
          inactive: 'Inativo'
        },
        maintenanceFrequency: 'Frequência de Manutenção',
        lastMaintenance: 'Última Manutenção',
        description: 'Descrição',
        deleteConfirm: 'Tem certeza que deseja excluir este equipamento?'
      },
      serviceOrder: {
        title: 'Ordens de Serviço',
        new: 'Nova Ordem de Serviço',
        edit: 'Editar Ordem de Serviço',
        description: 'Descrição',
        type: {
          corrective: 'Corretiva',
          preventive: 'Preventiva',
          predictive: 'Preditiva'
        },
        priority: {
          low: 'Baixa',
          medium: 'Média',
          high: 'Alta',
          critical: 'Crítica'
        },
        status: {
          pending: 'Pendente',
          inProgress: 'Em Andamento',
          completed: 'Concluída',
          cancelled: 'Cancelada'
        },
        scheduledFor: 'Data Agendada',
        completedAt: 'Data de Conclusão',
        technician: 'Técnico Responsável',
        cost: 'Custo',
        attachments: 'Anexos',
        deleteConfirm: 'Tem certeza que deseja excluir esta ordem de serviço?'
      },
      users: {
        title: 'Usuários',
        new: 'Novo Usuário',
        edit: 'Editar Usuário',
        name: 'Nome',
        email: 'E-mail',
        role: {
          admin: 'Administrador',
          manager: 'Gerente',
          technician: 'Técnico'
        },
        password: 'Senha',
        confirmPassword: 'Confirmar Senha',
        active: 'Usuário Ativo',
        deleteConfirm: 'Tem certeza que deseja excluir este usuário?'
      },
      dashboard: {
        title: 'Dashboard',
        summary: {
          totalEquipments: 'Total de Equipamentos',
          activeEquipments: 'Equipamentos Ativos',
          maintenanceInProgress: 'Em Manutenção',
          pendingMaintenances: 'Manutenções Pendentes'
        },
        charts: {
          maintenanceByType: 'Manutenções por Tipo',
          maintenanceTrend: 'Tendência de Manutenções',
          departmentStats: 'Estatísticas por Departamento',
          equipmentPerformance: 'Performance de Equipamentos'
        },
        kpis: {
          mtbf: 'Tempo Médio Entre Falhas',
          mttr: 'Tempo Médio de Reparo',
          availability: 'Disponibilidade',
          oee: 'Eficiência Global'
        }
      },
      notifications: {
        success: {
          save: 'Dados salvos com sucesso!',
          delete: 'Item excluído com sucesso!',
          update: 'Dados atualizados com sucesso!'
        },
        error: {
          general: 'Ocorreu um erro. Tente novamente.',
          save: 'Erro ao salvar os dados.',
          delete: 'Erro ao excluir o item.',
          update: 'Erro ao atualizar os dados.',
          invalidForm: 'Por favor, preencha todos os campos obrigatórios.'
        }
      },
      validation: {
        required: 'Campo obrigatório',
        email: 'E-mail inválido',
        minLength: 'Mínimo de {{count}} caracteres',
        maxLength: 'Máximo de {{count}} caracteres',
        passwordMatch: 'As senhas não conferem',
        invalidDate: 'Data inválida'
      }
    }
  },
  'en': {
    translation: {
      // Traduções em inglês aqui...
    }
  }
};

const i18nService = {
  async initialize() {
    await i18n
      .use(initReactI18next)
      .init({
        resources,
        lng: 'pt-BR', // Idioma padrão
        fallbackLng: 'pt-BR',
        interpolation: {
          escapeValue: false
        }
      });

    return i18n;
  },

  changeLanguage(language) {
    return i18n.changeLanguage(language);
  },

  getCurrentLanguage() {
    return i18n.language;
  },

  formatDate(date, format = 'default') {
    const d = new Date(date);
    const options = {
      default: { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      },
      long: {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      },
      short: {
        day: '2-digit',
        month: '2-digit'
      },
      datetime: {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    };

    return d.toLocaleDateString(i18n.language, options[format]);
  },

  formatCurrency(value) {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: i18n.language === 'pt-BR' ? 'BRL' : 'USD'
    }).format(value);
  },

  formatNumber(value, decimals = 0) {
    return new Intl.NumberFormat(i18n.language, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  },

  formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (i18n.language === 'pt-BR') {
      return hours > 0 
        ? `${hours}h ${remainingMinutes}min`
        : `${remainingMinutes}min`;
    }

    return hours > 0 
      ? `${hours}h ${remainingMinutes}m`
      : `${remainingMinutes}m`;
  },

  getWeekDays(short = false) {
    const format = new Intl.DateTimeFormat(i18n.language, { weekday: short ? 'short' : 'long' });
    const weekDays = [];
    
    for(let i = 0; i < 7; i++) {
      const date = new Date(2021, 8, i + 5); // Uma semana começando em domingo
      weekDays.push(format.format(date));
    }
    
    return weekDays;
  },

  getMonths(short = false) {
    const format = new Intl.DateTimeFormat(i18n.language, { month: short ? 'short' : 'long' });
    const months = [];
    
    for(let i = 0; i < 12; i++) {
      const date = new Date(2021, i, 1);
      months.push(format.format(date));
    }
    
    return months;
  }
};

export default i18nService;