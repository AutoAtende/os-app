const yup = require('yup');

const schemas = {
  loginSchema: yup.object().shape({
    email: yup.string()
      .email('Email inválido')
      .required('Email é obrigatório'),
    password: yup.string()
      .required('Senha é obrigatória')
  }),

  equipmentSchema: yup.object().shape({
    name: yup.string()
      .required('Nome é obrigatório')
      .min(3, 'Nome deve ter no mínimo 3 caracteres'),
    code: yup.string()
      .required('Código é obrigatório')
      .matches(/^[A-Za-z0-9-]+$/, 'Código deve conter apenas letras, números e hífen'),
    department: yup.string()
      .required('Departamento é obrigatório'),
    description: yup.string()
      .max(500, 'Descrição deve ter no máximo 500 caracteres'),
    maintenance_frequency: yup.number()
      .min(1, 'Frequência deve ser maior que 0')
  }),

  maintenanceSchema: yup.object().shape({
    equipment_id: yup.number()
      .required('Equipamento é obrigatório'),
    description: yup.string()
      .required('Descrição é obrigatória')
      .min(10, 'Descrição deve ter no mínimo 10 caracteres'),
    type: yup.string()
      .oneOf(['corrective', 'preventive', 'predictive'], 'Tipo inválido')
      .required('Tipo é obrigatório'),
    cost: yup.number()
      .min(0, 'Custo não pode ser negativo'),
    notes: yup.string()
      .max(1000, 'Observações devem ter no máximo 1000 caracteres')
  }),

  maintenanceUpdateSchema: yup.object().shape({
    status: yup.string()
      .oneOf(['pending', 'in_progress', 'completed', 'cancelled'], 'Status inválido')
      .required('Status é obrigatório'),
    completion_notes: yup.string()
      .when('status', {
        is: 'completed',
        then: yup.string().required('Notas de conclusão são obrigatórias')
      }),
    cost: yup.number()
      .min(0, 'Custo não pode ser negativo')
  })
};

module.exports = schemas;