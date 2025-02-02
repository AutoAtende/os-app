const express = require('express');
const router = express.Router();
const multer = require('multer');
const multerConfig = require('../config/multer');

// Middlewares
const AuthMiddleware = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const schemas = require('../validations/schemas');

// Controllers
const AuthController = require('../controllers/AuthController');
const EquipmentController = require('../controllers/EquipmentController');
const ServiceOrderController = require('../controllers/ServiceOrderController');
const UserController = require('../controllers/UserController');
const MaintenanceController = require('../controllers/MaintenanceController');
const NotificationController = require('../controllers/NotificationController');
const ReportController = require('../controllers/ReportController');
const DashboardController = require('../controllers/DashboardController');

const upload = multer(multerConfig);

// Rotas públicas
router.post('/auth/login', validate(schemas.loginSchema), AuthController.login);
router.post('/auth/forgot-password', AuthController.forgotPassword);
router.post('/auth/reset-password', AuthController.resetPassword);

// Middleware de autenticação para rotas protegidas
router.use(AuthMiddleware.authenticate);

// Equipamentos
router.get('/equipment', AuthMiddleware.hasDepartmentAccess, EquipmentController.index);
router.post('/equipment', 
  AuthMiddleware.hasRole(['admin', 'manager']),
  validate(schemas.equipmentSchema),
  upload.single('image'),
  EquipmentController.store
);
router.get('/equipment/:id', AuthMiddleware.hasDepartmentAccess, EquipmentController.show);
router.put('/equipment/:id',
  AuthMiddleware.hasRole(['admin', 'manager']),
  validate(schemas.equipmentSchema),
  upload.single('image'),
  EquipmentController.update
);
router.delete('/equipment/:id', AuthMiddleware.hasRole(['admin']), EquipmentController.destroy);

// Ordens de Serviço
router.get('/service-orders', AuthMiddleware.hasDepartmentAccess, ServiceOrderController.index);
router.post('/service-orders',
  validate(schemas.serviceOrderSchema),
  upload.array('attachments', 5),
  ServiceOrderController.store
);
router.get('/service-orders/:id', ServiceOrderController.show);
router.put('/service-orders/:id',
  AuthMiddleware.hasRole(['admin', 'technician']),
  validate(schemas.serviceOrderUpdateSchema),
  ServiceOrderController.update
);

// Usuários
router.get('/users', AuthMiddleware.hasRole(['admin']), UserController.index);
router.post('/users',
  AuthMiddleware.hasRole(['admin']),
  validate(schemas.userSchema),
  UserController.store
);
router.put('/users/:id',
  AuthMiddleware.hasRole(['admin']),
  validate(schemas.userUpdateSchema),
  UserController.update
);
router.delete('/users/:id', AuthMiddleware.hasRole(['admin']), UserController.delete);

// Manutenções
router.post('/maintenance',
  validate(schemas.maintenanceSchema),
  upload.fields([
    { name: 'photos', maxCount: 5 },
    { name: 'documents', maxCount: 3 }
  ]),
  MaintenanceController.store
);
router.get('/maintenance', AuthMiddleware.hasDepartmentAccess, MaintenanceController.index);
router.get('/maintenance/:id', AuthMiddleware.hasDepartmentAccess, MaintenanceController.show);
router.put('/maintenance/:id',
  AuthMiddleware.hasRole(['admin', 'technician']),
  validate(schemas.maintenanceUpdateSchema),
  MaintenanceController.update
);

// Dashboard
router.get('/dashboard/stats', AuthMiddleware.hasDepartmentAccess, DashboardController.getStats);

// Notificações
router.get('/notifications', NotificationController.list);
router.put('/notifications/:id/read', NotificationController.markAsRead);
router.put('/notifications/mark-all-read', NotificationController.markAllAsRead);
router.get('/notifications/preferences', NotificationController.getUserPreferences);
router.put('/notifications/preferences', NotificationController.updateUserPreferences);

// Relatórios
router.get('/reports/generate', AuthMiddleware.hasRole(['admin', 'manager']), ReportController.generate);
router.get('/reports/:id/download', AuthMiddleware.hasRole(['admin', 'manager']), ReportController.download);
router.get('/reports', AuthMiddleware.hasRole(['admin', 'manager']), ReportController.list);
router.delete('/reports/:id', AuthMiddleware.hasRole(['admin']), ReportController.delete);

module.exports = router;