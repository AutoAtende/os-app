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
  type: yup.string().oneOf(['preventive', 'corrective', 'predictive'], 'Tipo inválido').required('Tipo é obrigatório'),
  priority: yup.string().oneOf(['low', 'medium', 'high', 'critical'], 'Prioridade inválida'),
  scheduled_for: yup.date().required('Data de agendamento é obrigatória'),
});

module.exports = {
  userSchema,
  equipmentSchema,
  serviceOrderSchema,
};