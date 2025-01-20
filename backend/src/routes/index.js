const { Router } = require('express');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const validate = require('../middlewares/validate');
const schemas = require('../validations/schemas');
const multer = require('multer');
const multerConfig = require('../config/multer');

// Controllers
const AuthController = require('../controllers/AuthController');
const EquipmentController = require('../controllers/EquipmentController');
const MaintenanceController = require('../controllers/MaintenanceController');
const ReportController = require('../controllers/ReportController');
const DashboardController = require('../controllers/DashboardController');
const NotificationController = require('../controllers/NotificationController');

const routes = Router();
const upload = multer(multerConfig);

// Rotas públicas
routes.post('/auth/login', validate(schemas.loginSchema), AuthController.login);
routes.post('/auth/forgot-password', AuthController.forgotPassword);
routes.post('/auth/reset-password', AuthController.resetPassword);

// Middleware de autenticação para rotas protegidas
routes.use(AuthMiddleware.authenticate);

// Equipamentos
routes.get('/equipment', 
  AuthMiddleware.hasDepartmentAccess,
  EquipmentController.index
);

routes.post('/equipment',
  AuthMiddleware.hasRole(['admin', 'manager']),
  validate(schemas.equipmentSchema),
  upload.single('image'),
  EquipmentController.store
);

routes.get('/equipment/:id',
  AuthMiddleware.hasDepartmentAccess,
  EquipmentController.show
);

routes.put('/equipment/:id',
  AuthMiddleware.hasRole(['admin', 'manager']),
  validate(schemas.equipmentSchema),
  upload.single('image'),
  EquipmentController.update
);

routes.delete('/equipment/:id',
  AuthMiddleware.hasRole(['admin']),
  EquipmentController.delete
);

routes.get('/equipment/:id/qrcode',
  AuthMiddleware.hasDepartmentAccess,
  EquipmentController.generateQRCode
);

// Manutenções
routes.post('/maintenance',
  validate(schemas.maintenanceSchema),
  upload.fields([
    { name: 'photos', maxCount: 5 },
    { name: 'documents', maxCount: 3 }
  ]),
  MaintenanceController.store
);

routes.get('/maintenance',
  AuthMiddleware.hasDepartmentAccess,
  MaintenanceController.index
);

routes.get('/maintenance/:id',
  AuthMiddleware.hasDepartmentAccess,
  MaintenanceController.show
);

routes.put('/maintenance/:id',
  AuthMiddleware.hasRole(['admin', 'technician']),
  validate(schemas.maintenanceUpdateSchema),
  MaintenanceController.update
);

// Relatórios
routes.get('/reports/maintenance',
  AuthMiddleware.hasRole(['admin', 'manager']),
  ReportController.generateMaintenanceReport
);

routes.get('/reports/equipment',
  AuthMiddleware.hasRole(['admin', 'manager']),
  ReportController.generateEquipmentReport
);

routes.get('/reports/performance',
  AuthMiddleware.hasRole(['admin', 'manager']),
  ReportController.generatePerformanceReport
);

// Dashboard
routes.get('/dashboard/stats',
  AuthMiddleware.hasDepartmentAccess,
  DashboardController.getStats
);

// Notificações
routes.get('/notifications',
  NotificationController.list
);

routes.put('/notifications/preferences',
  NotificationController.updatePreferences
);

routes.put('/notifications/:id/read',
  NotificationController.markAsRead
);

module.exports = routes;