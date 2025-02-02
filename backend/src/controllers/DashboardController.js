const {Equipment} = require('../models/Equipment');
const {MaintenanceHistory} = require('../models/MaintenanceHistory')
const {User} = require('../models/User');
const { Op, Sequelize } = require('sequelize');
const CacheService = require('../services/CacheService');
const logger = require('../utils/logger');

class DashboardController {
  async getStats(req, res) {
    try {
      const { period = 'month' } = req.query;
      
      // Tenta buscar do cache
      const cacheKey = `dashboard:${period}:${req.userId}`;
      const cachedData = await CacheService.get(cacheKey);
      
      if (cachedData) {
        return res.json(cachedData);
      }

      // Calcula datas
      const endDate = new Date();
      const startDate = this.getStartDate(period);

      // Busca dados
      const [
        equipmentStats,
        maintenanceStats,
        performanceMetrics,
        upcomingMaintenances
      ] = await Promise.all([
        this.getEquipmentStats(),
        this.getMaintenanceStats(startDate, endDate),
        this.getPerformanceMetrics(startDate, endDate),
        this.getUpcomingMaintenances()
      ]);

      const dashboardData = {
        equipmentStats,
        maintenanceStats,
        performanceMetrics,
        upcomingMaintenances,
        lastUpdate: new Date()
      };

      // Salva no cache por 5 minutos
      await CacheService.set(cacheKey, dashboardData, 300);

      return res.json(dashboardData);

    } catch (error) {
      logger.error('Erro ao buscar estatísticas do dashboard:', error);
      return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }

  async getEquipmentStats() {
    const totalEquipments = await Equipment.count();
    const activeEquipments = await Equipment.count({ where: { status: 'active' } });
    const maintenanceEquipments = await Equipment.count({ where: { status: 'maintenance' } });
    
    return {
      total: totalEquipments,
      active: activeEquipments,
      inMaintenance: maintenanceEquipments,
      inactive: totalEquipments - activeEquipments - maintenanceEquipments
    };
  }

  async getMaintenanceStats(startDate, endDate) {
    const maintenances = await MaintenanceHistory.findAll({
      where: {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        'type',
        'status',
        [Sequelize.fn('COUNT', '*'), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('cost')), 'totalCost']
      ],
      group: ['type', 'status']
    });

    const byType = {};
    const byStatus = {};

    maintenances.forEach(m => {
      byType[m.type] = (byType[m.type] || 0) + m.get('count');
      byStatus[m.status] = (byStatus[m.status] || 0) + m.get('count');
    });

    return {
      byType,
      byStatus,
      totalCost: maintenances.reduce((sum, m) => sum + (m.get('totalCost') || 0), 0)
    };
  }

  async getPerformanceMetrics(startDate, endDate) {
    const completedMaintenances = await MaintenanceHistory.findAll({
      where: {
        status: 'completed',
        completion_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'name']
        }
      ]
    });

    // Calcula métricas
    const totalTime = completedMaintenances.reduce((sum, m) => {
      const duration = new Date(m.completion_date) - new Date(m.created_at);
      return sum + duration;
    }, 0);

    const avgTime = completedMaintenances.length > 0 
      ? totalTime / completedMaintenances.length
      : 0;

    return {
      avgResolutionTime: Math.round(avgTime / (1000 * 60 * 60)), // em horas
      completionRate: await this.calculateCompletionRate(startDate, endDate),
      technicianPerformance: await this.calculateTechnicianPerformance(startDate, endDate)
    };
  }

  async getUpcomingMaintenances() {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    return await MaintenanceHistory.findAll({
      where: {
        status: 'pending',
        scheduled_date: {
          [Op.lte]: nextWeek
        }
      },
      include: [
        {
          model: Equipment,
          attributes: ['id', 'name', 'code']
        },
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'name']
        }
      ],
      order: [['scheduled_date', 'ASC']],
      limit: 5
    });
  }

  async calculateCompletionRate(startDate, endDate) {
    const [completed, total] = await Promise.all([
      MaintenanceHistory.count({
        where: {
          status: 'completed',
          completion_date: {
            [Op.between]: [startDate, endDate]
          }
        }
      }),
      MaintenanceHistory.count({
        where: {
          created_at: {
            [Op.between]: [startDate, endDate]
          }
        }
      })
    ]);

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  async calculateTechnicianPerformance(startDate, endDate) {
    const performances = await MaintenanceHistory.findAll({
      attributes: [
        [Sequelize.fn('COUNT', '*'), 'total'],
        [Sequelize.fn('AVG', 
          Sequelize.literal('EXTRACT(EPOCH FROM (completion_date - created_at))/3600')
        ), 'avgTime']
      ],
      where: {
        status: 'completed',
        completion_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'name']
        }
      ],
      group: ['technician.id', 'technician.name']
    });

    return performances.map(p => ({
      technician: p.technician,
      completedMaintenances: p.get('total'),
      averageResolutionTime: Math.round(p.get('avgTime'))
    }));
  }

  getStartDate(period) {
    const date = new Date();
    switch (period) {
      case 'week':
        date.setDate(date.getDate() - 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'year':
        date.setFullYear(date.getFullYear() - 1);
        break;
      default:
        date.setMonth(date.getMonth() - 1); // Padrão: último mês
    }
    return date;
  }
}

module.exports = new DashboardController();