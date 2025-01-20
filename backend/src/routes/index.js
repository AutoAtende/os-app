const express = require('express');
const router = express.Router();
const multer = require('multer');
const multerConfig = require('../config/multer');

// Middlewares
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const validate = require('../middlewares/validate');
const schemas = require('../validations/schemas');

// Controllers
const authController = require('../controllers/AuthController');
const equipmentController = require('../controllers/EquipmentController');
const serviceOrderController = require('../controllers/ServiceOrderController');
const userController = require('../controllers/UserController');
const maintenanceController = require('../controllers/MaintenanceController');
const notificationController = require('../controllers/NotificationController');
const reportController = require('../controllers/ReportController');
const dashboardController = require('../controllers/DashboardController');

const upload = multer(multerConfig);

// Rotas públicas
router.post('/auth/login', validate(schemas.loginSchema), authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);

// Middleware de autenticação para rotas protegidas
router.use(AuthMiddleware.authenticate);

// Equipamentos
router.get('/equipment', 
  AuthMiddleware.hasDepartmentAccess,
  equipmentController.index
);

router.post('/equipment',
  AuthMiddleware.hasRole(['admin', 'manager']),
  validate(schemas.equipmentSchema),
  upload.single('image'),
  equipmentController.store
);

router.get('/equipment/:id',
  AuthMiddleware.hasDepartmentAccess,
  equipmentController.show
);

router.put('/equipment/:id',
  AuthMiddleware.hasRole(['admin', 'manager']),
  validate(schemas.equipmentSchema),
  upload.single('image'),
  equipmentController.update
);

router.delete('/equipment/:id',
  AuthMiddleware.hasRole(['admin']),
  equipmentController.delete
);

router.get('/equipment/:id/qrcode',
  AuthMiddleware.hasDepartmentAccess,
  equipmentController.generateQRCode
);

// Manutenções
router.post('/maintenance',
  validate(schemas.maintenanceSchema),
  upload.fields([
    { name: 'photos', maxCount: 5 },
    { name: 'documents', maxCount: 3 }
  ]),
  maintenanceController.store
);

router.get('/maintenance',
  AuthMiddleware.hasDepartmentAccess,
  maintenanceController.index
);

router.get('/maintenance/:id',
  AuthMiddleware.hasDepartmentAccess,
  maintenanceController.show
);

router.put('/maintenance/:id',
  AuthMiddleware.hasRole(['admin', 'technician']),
  validate(schemas.maintenanceUpdateSchema),
  maintenanceController.update
);

// Ordens de Serviço
router.get('/service-orders',
  AuthMiddleware.hasDepartmentAccess,
  serviceOrderController.index
);

router.post('/service-orders',
  validate(schemas.serviceOrderSchema),
  upload.array('attachments', 5),
  serviceOrderController.store
);

router.get('/service-orders/:id',
  AuthMiddleware.hasDepartmentAccess,
  serviceOrderController.show
);

router.put('/service-orders/:id',
  AuthMiddleware.hasRole(['admin', 'technician']),
  validate(schemas.serviceOrderUpdateSchema),
  serviceOrderController.update
);

// Usuários
router.get('/users',
  AuthMiddleware.hasRole(['admin']),
  userController.index
);

router.post('/users',
  AuthMiddleware.hasRole(['admin']),
  validate(schemas.userSchema),
  userController.store
);

router.put('/users/:id',
  AuthMiddleware.hasRole(['admin']),
  validate(schemas.userUpdateSchema),
  userController.update
);

// Relatórios
router.get('/reports/maintenance',
  AuthMiddleware.hasRole(['admin', 'manager']),
  reportController.generateMaintenanceReport
);

router.get('/reports/equipment',
  AuthMiddleware.hasRole(['admin', 'manager']),
  reportController.generateEquipmentReport
);

router.get('/reports/performance',
  AuthMiddleware.hasRole(['admin', 'manager']),
  reportController.generatePerformanceReport
);

// Dashboard
router.get('/dashboard/stats',
  AuthMiddleware.hasDepartmentAccess,
  dashboardController.getStats
);

// Notificações
router.get('/notifications',
  notificationController.list
);

router.put('/notifications/preferences',
  notificationController.updatePreferences
);

router.put('/notifications/:id/read',
  notificationController.markAsRead
);

module.exports = router;