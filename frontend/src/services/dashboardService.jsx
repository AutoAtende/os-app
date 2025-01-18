import api from './api';

class DashboardService {
  async getStatistics(period = 'month') {
    try {
      const response = await api.get('/dashboard/stats', {
        params: { period }
      });
      return this.formatStatistics(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      throw new Error('Falha ao carregar dados do dashboard');
    }
  }

  async getMaintenanceMetrics(startDate, endDate) {
    try {
      const response = await api.get('/dashboard/maintenance-metrics', {
        params: { start_date: startDate, end_date: endDate }
      });
      return this.formatMaintenanceMetrics(response.data);
    } catch (error) {
      console.error('Erro ao carregar métricas de manutenção:', error);
      throw new Error('Falha ao carregar métricas de manutenção');
    }
  }

  async getEquipmentPerformance() {
    try {
      const response = await api.get('/dashboard/equipment-performance');
      return this.formatEquipmentPerformance(response.data);
    } catch (error) {
      console.error('Erro ao carregar performance dos equipamentos:', error);
      throw new Error('Falha ao carregar performance dos equipamentos');
    }
  }

  formatStatistics(data) {
    return {
      summary: {
        totalEquipments: data.totalEquipments,
        activeEquipments: data.activeEquipments,
        maintenanceInProgress: data.maintenanceInProgress,
        pendingMaintenances: data.pendingMaintenances
      },
      maintenancesByType: [
        {
          name: 'Preventiva',
          value: data.preventiveMaintenances,
          color: '#4CAF50'
        },
        {
          name: 'Corretiva',
          value: data.correctiveMaintenances,
          color: '#FFA000'
        },
        {
          name: 'Preditiva',
          value: data.predictiveMaintenances,
          color: '#2196F3'
        }
      ],
      maintenanceTrend: data.maintenanceTrend.map(item => ({
        date: new Date(item.date).toLocaleDateString(),
        preventive: item.preventive,
        corrective: item.corrective,
        predictive: item.predictive
      })),
      departmentStats: data.departmentStats.map(item => ({
        name: item.department,
        maintenances: item.maintenanceCount,
        equipments: item.equipmentCount,
        costs: item.totalCosts
      }))
    };
  }

  formatMaintenanceMetrics(data) {
    return {
      averageResolutionTime: this.formatDuration(data.averageResolutionTime),
      completionRate: `${data.completionRate.toFixed(1)}%`,
      averageCost: this.formatCurrency(data.averageCost),
      maintenanceEfficiency: data.maintenanceEfficiency.map(item => ({
        technician: item.technicianName,
        completedCount: item.completedCount,
        averageTime: this.formatDuration(item.averageTime),
        satisfactionRate: `${item.satisfactionRate.toFixed(1)}%`
      }))
    };
  }

  formatEquipmentPerformance(data) {
    return {
      mostMaintained: data.mostMaintained.map(item => ({
        name: item.name,
        code: item.code,
        maintenanceCount: item.maintenanceCount,
        totalCost: this.formatCurrency(item.totalCost),
        lastMaintenance: new Date(item.lastMaintenance).toLocaleDateString()
      })),
      criticalEquipments: data.criticalEquipments.map(item => ({
        name: item.name,
        code: item.code,
        status: item.status,
        lastMaintenance: new Date(item.lastMaintenance).toLocaleDateString(),
        daysOverdue: item.daysOverdue
      }))
    };
  }

  formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 
      ? `${hours}h ${remainingMinutes}min`
      : `${remainingMinutes}min`;
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  calculateKPIs(data) {
    return {
      mtbf: this.calculateMTBF(data.failures, data.operatingHours),
      mttr: this.calculateMTTR(data.repairTimes),
      availability: this.calculateAvailability(data.uptime, data.downtime),
      oee: this.calculateOEE(data.availability, data.performance, data.quality)
    };
  }

  calculateMTBF(failures, operatingHours) {
    if (!failures || failures === 0) return 0;
    return (operatingHours / failures).toFixed(2);
  }

  calculateMTTR(repairTimes) {
    if (!repairTimes || repairTimes.length === 0) return 0;
    const total = repairTimes.reduce((sum, time) => sum + time, 0);
    return (total / repairTimes.length).toFixed(2);
  }

  calculateAvailability(uptime, downtime) {
    const total = uptime + downtime;
    if (total === 0) return 0;
    return ((uptime / total) * 100).toFixed(2);
  }

  calculateOEE(availability, performance, quality) {
    return ((availability * performance * quality) / 10000).toFixed(2);
  }

  getPerformanceLevel(value, type) {
    const levels = {
      availability: { low: 85, medium: 95 },
      mtbf: { low: 24, medium: 72 },
      mttr: { low: 4, medium: 2 },
      oee: { low: 65, medium: 85 }
    };

    const thresholds = levels[type];
    if (!thresholds) return 'unknown';

    const numValue = parseFloat(value);
    if (numValue < thresholds.low) return 'critical';
    if (numValue < thresholds.medium) return 'warning';
    return 'good';
  }

  getPriorityLevel(metrics) {
    const scores = {
      age: this.getAgeScore(metrics.age),
      failures: this.getFailureScore(metrics.failureCount),
      cost: this.getCostScore(metrics.maintenanceCost),
      criticality: this.getCriticalityScore(metrics.criticalityLevel)
    };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    return this.getPriorityFromScore(totalScore);
  }

  getAgeScore(monthsOld) {
    if (monthsOld > 60) return 3;
    if (monthsOld > 36) return 2;
    return 1;
  }

  getFailureScore(failures) {
    if (failures > 5) return 3;
    if (failures > 2) return 2;
    return 1;
  }

  getCostScore(cost) {
    if (cost > 10000) return 3;
    if (cost > 5000) return 2;
    return 1;
  }

  getCriticalityScore(level) {
    const scores = { high: 3, medium: 2, low: 1 };
    return scores[level] || 1;
  }

  getPriorityFromScore(score) {
    if (score >= 10) return 'critical';
    if (score >= 7) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  }
}

export default new DashboardService();