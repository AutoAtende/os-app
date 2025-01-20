const Queue = require('bull');
const path = require('path');
const processors = require('./processors');

class JobProcessor {
  constructor() {
    this.queues = {
      reportGeneration: new Queue('reportGeneration', {
        redis: {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
          password: process.env.REDIS_PASSWORD
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000
          },
          removeOnComplete: true
        }
      }),
      maintenanceNotification: new Queue('maintenanceNotification'),
      fileProcessing: new Queue('fileProcessing'),
      equipmentSync: new Queue('equipmentSync')
    };

    this.initializeProcessors();
  }

  initializeProcessors() {
    // Report Generation Queue
    this.queues.reportGeneration.process(async (job) => {
      try {
        const { type, filters, userId } = job.data;
        const report = await processors.reportProcessor.generate(type, filters);
        
        // Notifica o usuário que o relatório está pronto
        await this.queues.maintenanceNotification.add({
          type: 'REPORT_READY',
          userId,
          reportUrl: report.url
        });

        return report;
      } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        throw error;
      }
    });

    // File Processing Queue
    this.queues.fileProcessing.process(async (job) => {
      const { file, type } = job.data;
      return await processors.fileProcessor.process(file, type);
    });

    // Equipment Sync Queue
    this.queues.equipmentSync.process(async (job) => {
      const { equipmentId, changes } = job.data;
      return await processors.equipmentProcessor.sync(equipmentId, changes);
    });

    // Maintenance Notification Queue
    this.queues.maintenanceNotification.process(async (job) => {
      const { type, data } = job.data;
      return await processors.notificationProcessor.send(type, data);
    });
  }

  // Adiciona job na fila de geração de relatórios
  async addReportJob(type, filters, userId) {
    return await this.queues.reportGeneration.add({
      type,
      filters,
      userId
    });
  }

  // Adiciona job na fila de processamento de arquivos
  async addFileProcessingJob(file, type) {
    return await this.queues.fileProcessing.add({
      file,
      type
    });
  }

  // Adiciona job na fila de sincronização de equipamentos
  async addEquipmentSyncJob(equipmentId, changes) {
    return await this.queues.equipmentSync.add({
      equipmentId,
      changes
    });
  }

  // Adiciona job na fila de notificações
  async addNotificationJob(type, data) {
    return await this.queues.maintenanceNotification.add({
      type,
      data
    });
  }

  // Retorna o status de todos os jobs
  async getJobsStatus() {
    const status = {};
    
    for (const [queueName, queue] of Object.entries(this.queues)) {
      status[queueName] = {
        waiting: await queue.getWaitingCount(),
        active: await queue.getActiveCount(),
        completed: await queue.getCompletedCount(),
        failed: await queue.getFailedCount()
      };
    }

    return status;
  }

  // Limpa jobs completados
  async cleanCompletedJobs() {
    for (const queue of Object.values(this.queues)) {
      await queue.clean(1000 * 60 * 60 * 24, 'completed'); // Remove jobs completados há mais de 24h
    }
  }
}

module.exports = new JobProcessor();