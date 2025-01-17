const { Router } = require('express');
const authMiddleware = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const schemas = require('../validations/schemas');
const { 
  UserController, 
  EquipmentController, 
  ServiceOrderController 
} = require('../controllers');

const routes = Router();

// Rotas públicas
routes.post('/login', UserController.login);
routes.post('/users', validate(schemas.userSchema), UserController.store);

// Middleware de autenticação para rotas protegidas
routes.use(authMiddleware);

// Rotas de usuários
routes.get('/users', UserController.index);
routes.put('/users/:id', validate(schemas.userSchema), UserController.update);

// Rotas de equipamentos
routes.post('/equipment', validate(schemas.equipmentSchema), EquipmentController.store);
routes.get('/equipment', EquipmentController.index);
routes.get('/equipment/:id', EquipmentController.show);
routes.put('/equipment/:id', validate(schemas.equipmentSchema), EquipmentController.update);
routes.delete('/equipment/:id', EquipmentController.destroy);

// Rotas de ordens de serviço
routes.post('/service-orders', 
  validate(schemas.serviceOrderSchema), 
  ServiceOrderController.store
);
routes.get('/service-orders', ServiceOrderController.index);
routes.get('/service-orders/:id', ServiceOrderController.show);
routes.put('/service-orders/:id', ServiceOrderController.update);

// Rota para upload de arquivos
routes.post('/files', upload.single('file'), FileController.store);

module.exports = routes;