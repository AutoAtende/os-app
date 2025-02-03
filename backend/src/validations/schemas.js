const yup = require('yup');

const schemas = {
  loginSchema: yup.object().shape({
    email: yup.string()
      .email('Email inválido')
      .required('Email é obrigatório'),
    password: yup.string()
      .required('Senha é obrigatória')
      .min(6, 'Senha deve ter no mínimo 6 caracteres')
  }),

  equipmentSchema: yup.object().shape({
    name: yup.string()
      .required('Nome é obrigatório')
      .min(3, 'Nome deve ter no mínimo 3 caracteres'),
    code: yup.string()
      .required('Código é obrigatório')
      .matches(/^[A-Za-z0-9-]+$/, 'Código deve conter apenas letras, números e hífen'),
    serial_number: yup.string(),
    department: yup.string()
      .required('Departamento é obrigatório'),
    description: yup.string()
      .max(500, 'Descrição deve ter no máximo 500 caracteres'),
    maintenance_frequency: yup.number()
      .min(1, 'Frequência deve ser maior que 0')
  }),

  serviceOrderSchema: yup.object().shape({
    equipment_id: yup.number()
      .required('Equipamento é obrigatório'),
    description: yup.string()
      .required('Descrição é obrigatória')
      .min(10, 'Descrição deve ter no mínimo 10 caracteres'),
    type: yup.string()
      .oneOf(['preventive', 'corrective', 'predictive'], 'Tipo inválido')
      .required('Tipo é obrigatório'),
    priority: yup.string()
      .oneOf(['low', 'medium', 'high', 'critical'], 'Prioridade inválida')
      .required('Prioridade é obrigatória'),
    scheduled_for: yup.date()
      .required('Data de agendamento é obrigatória')
  }),

  serviceOrderUpdateSchema: yup.object().shape({
    status: yup.string()
      .oneOf(['pending', 'in_progress', 'completed', 'cancelled'], 'Status inválido')
      .required('Status é obrigatório'),
    notes: yup.string(),
    completion_notes: yup.string()
      .when('status', {
        is: 'completed',
        then: yup.string().required('Notas de conclusão são obrigatórias')
      })
  }),

  maintenanceSchema: yup.object().shape({
    equipment_id: yup.number()
      .required('Equipamento é obrigatório'),
    description: yup.string()
      .required('Descrição é obrigatória')
      .min(10, 'Descrição deve ter no mínimo 10 caracteres'),
    type: yup.string()
      .oneOf(['preventive', 'corrective', 'predictive'], 'Tipo inválido')
      .required('Tipo é obrigatório'),
    cost: yup.number()
      .min(0, 'Custo não pode ser negativo'),
    notes: yup.string()
      .max(1000, 'Observações devem ter no máximo 1000 caracteres')
  }),

  maintenanceUpdateSchema: yup.object().shape({
    status: yup.string()
      .oneOf(['pending', 'in_progress', 'completed'], 'Status inválido')
      .required('Status é obrigatório'),
    notes: yup.string(),
    cost: yup.number()
      .min(0, 'Custo não pode ser negativo'),
    completion_notes: yup.string()
      .when('status', {
        is: 'completed',
        then: yup.string().required('Notas de conclusão são obrigatórias')
      })
  }),

  userSchema: yup.object().shape({
    name: yup.string()
      .required('Nome é obrigatório')
      .min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: yup.string()
      .email('Email inválido')
      .required('Email é obrigatório'),
    password: yup.string()
      .required('Senha é obrigatória')
      .min(6, 'Senha deve ter no mínimo 6 caracteres'),
    role: yup.string()
      .oneOf(['admin', 'manager', 'technician'], 'Função inválida')
      .required('Função é obrigatória'),
    department: yup.string()
      .required('Departamento é obrigatório')
  }),

  userUpdateSchema: yup.object().shape({
    name: yup.string()
      .min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: yup.string()
      .email('Email inválido'),
    password: yup.string()
      .min(6, 'Senha deve ter no mínimo 6 caracteres'),
    role: yup.string()
      .oneOf(['admin', 'manager', 'technician'], 'Função inválida'),
    department: yup.string()
  })
};

module.exports = schemas;