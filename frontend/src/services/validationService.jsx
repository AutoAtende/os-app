import * as yup from 'yup';

class ValidationService {
  constructor() {
    this.setCustomValidations();
  }

  setCustomValidations() {
    yup.addMethod(yup.string, 'cnpj', function () {
      return this.test('cnpj', 'CNPJ inválido', value => {
        if (!value) return true;
        return this.validateCNPJ(value);
      });
    });

    yup.addMethod(yup.string, 'phone', function () {
      return this.test('phone', 'Telefone inválido', value => {
        if (!value) return true;
        return this.validatePhone(value);
      });
    });
  }

  getEquipmentSchema() {
    return yup.object().shape({
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
        .required('Frequência de manutenção é obrigatória')
        .min(1, 'Frequência deve ser maior que 0'),
      status: yup.string()
        .oneOf(['active', 'maintenance', 'inactive'], 'Status inválido')
        .required('Status é obrigatório')
    });
  }

  getServiceOrderSchema() {
    return yup.object().shape({
      equipment_id: yup.number()
        .required('Equipamento é obrigatório'),
      description: yup.string()
        .required('Descrição é obrigatória')
        .min(10, 'Descrição deve ter no mínimo 10 caracteres'),
      type: yup.string()
        .oneOf(['corrective', 'preventive', 'predictive'], 'Tipo inválido')
        .required('Tipo é obrigatório'),
      priority: yup.string()
        .oneOf(['low', 'medium', 'high', 'critical'], 'Prioridade inválida')
        .required('Prioridade é obrigatória'),
      scheduled_for: yup.date()
        .required('Data agendada é obrigatória')
        .min(new Date(), 'Data deve ser futura'),
      notes: yup.string()
        .max(1000, 'Observações devem ter no máximo 1000 caracteres'),
      cost: yup.number()
        .min(0, 'Custo não pode ser negativo'),
      parts_replaced: yup.array().of(
        yup.object().shape({
          name: yup.string().required('Nome da peça é obrigatório'),
          quantity: yup.number()
            .required('Quantidade é obrigatória')
            .min(1, 'Quantidade deve ser maior que 0'),
          cost: yup.number()
            .min(0, 'Custo não pode ser negativo')
        })
      )
    });
  }

  getUserSchema(isEditing = false) {
    return yup.object().shape({
      name: yup.string()
        .required('Nome é obrigatório')
        .min(3, 'Nome deve ter no mínimo 3 caracteres'),
      email: yup.string()
        .required('Email é obrigatório')
        .email('Email inválido'),
      password: yup.string()
        .when('$isEditing', {
          is: false,
          then: yup.string()
            .required('Senha é obrigatória')
            .min(6, 'Senha deve ter no mínimo 6 caracteres')
        }),
      passwordConfirmation: yup.string()
        .when('password', {
          is: val => val && val.length > 0,
          then: yup.string()
            .oneOf([yup.ref('password')], 'Senhas não conferem')
            .required('Confirmação de senha é obrigatória')
        }),
      role: yup.string()
        .oneOf(['admin', 'manager', 'technician'], 'Função inválida')
        .required('Função é obrigatória')
    }).context({ isEditing });
  }

  getSettingsSchema() {
    return yup.object().shape({
      notifications: yup.object().shape({
        email: yup.boolean(),
        push: yup.boolean(),
        maintenanceReminder: yup.boolean(),
        maintenanceOverdue: yup.boolean(),
        equipmentStatusChange: yup.boolean()
      }),
      maintenance: yup.object().shape({
        defaultFrequency: yup.number()
          .required('Frequência padrão é obrigatória')
          .min(1, 'Frequência deve ser maior que 0'),
        reminderDays: yup.number()
          .required('Dias de lembrete é obrigatório')
          .min(1, 'Deve ter pelo menos 1 dia'),
        criticalAgeMonths: yup.number()
          .required('Idade crítica é obrigatória')
          .min(1, 'Deve ter pelo menos 1 mês')
      }),
      email: yup.object().shape({
        reminderTime: yup.string()
          .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido'),
        dailyReportTime: yup.string()
          .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido'),
        reportRecipients: yup.string()
          .test('emails', 'Email(s) inválido(s)', value => {
            if (!value) return true;
            const emails = value.split('\n');
            return emails.every(email => 
              yup.string().email().isValidSync(email.trim())
            );
          })
      })
    });
  }

  async validateForm(schema, data) {
    try {
      await schema.validate(data, { abortEarly: false });
      return { isValid: true, errors: {} };
    } catch (validationError) {
      const errors = {};
      validationError.inner.forEach(error => {
        errors[error.path] = error.message;
      });
      return { isValid: false, errors };
    }
  }

  validateCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]/g, '');

    if (cnpj.length !== 14) return false;

    if (/^(\d)\1+$/.test(cnpj)) return false;

    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    let digits = cnpj.substring(size);
    let sum = 0;
    let pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += numbers.charAt(size - i) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    size = size + 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += numbers.charAt(size - i) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result === parseInt(digits.charAt(1));
  }

  validatePhone(phone) {
    phone = phone.replace(/[^\d]/g, '');
    return /^(\d{10,11})$/.test(phone);
  }

  formatErrorMessage(error) {
    if (error.inner) {
      return error.inner.map(err => err.message).join(', ');
    }
    return error.message;
  }
}

export default new ValidationService();