const yup = require('yup');

const userSchema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  password: yup.string().min(6, 'Senha deve ter no mínimo 6 caracteres').required('Senha é obrigatória'),
  role: yup.string().oneOf(['admin', 'manager', 'technician'], 'Função inválida'),
});

const equipmentSchema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
  code: yup.string().required('Código é obrigatório'),
  serial_number: yup.string(),
  department: yup.string().required('Departamento é obrigatório'),
  description: yup.string(),
  maintenance_frequency: yup.number().min(1, 'Frequência deve ser maior que 0'),
});

const serviceOrderSchema = yup.object().shape({
  equipment_id: yup.number().required('Equipamento é obrigatório'),
  description: yup.string().required('Descrição é obrigatória'),
  type: yup.string()
    .oneOf(['preventive', 'corrective', 'predictive'], 'Tipo inválido')
    .required('Tipo é obrigatório'),
  priority: yup.string()
    .oneOf(['low', 'medium', 'high', 'critical'], 'Prioridade inválida')
    .required('Prioridade é obrigatória'),
  scheduled_for: yup.date().required('Data de agendamento é obrigatória'),
  notes: yup.string(),
  signature: yup.string(), // Base64 da assinatura
  cost: yup.number().min(0, 'Custo não pode ser negativo'),
  parts_replaced: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Nome da peça é obrigatório'),
      quantity: yup.number().required('Quantidade é obrigatória').min(1),
      cost: yup.number().min(0)
    })
  )
});

const maintenanceHistorySchema = yup.object().shape({
  equipment_id: yup.number().required('Equipamento é obrigatório'),
  maintenance_date: yup.date().required('Data da manutenção é obrigatória'),
  type: yup.string()
    .oneOf(['preventive', 'corrective', 'predictive'], 'Tipo inválido')
    .required('Tipo é obrigatório'),
  description: yup.string().required('Descrição é obrigatória'),
  cost: yup.number().min(0, 'Custo não pode ser negativo'),
  performed_by: yup.number().required('Técnico responsável é obrigatório'),
  parts_replaced: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Nome da peça é obrigatório'),
      quantity: yup.number().required('Quantidade é obrigatória').min(1),
      cost: yup.number().min(0)
    })
  ),
  photos: yup.array().of(
    yup.object().shape({
      url: yup.string().required('URL da foto é obrigatória'),
      description: yup.string()
    })
  ),
  attachments: yup.array().of(
    yup.object().shape({
      url: yup.string().required('URL do anexo é obrigatória'),
      name: yup.string().required('Nome do arquivo é obrigatório'),
      type: yup.string().required('Tipo do arquivo é obrigatório')
    })
  )
});


module.exports = {
  userSchema,
  equipmentSchema,
  serviceOrderSchema,
  maintenanceHistorySchema
};