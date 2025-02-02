const QRCodeService = require('../../services/QRCodeService');
const {Equipment} = require('../../models/Equipment');
const logger = require('../../utils/logger');

const equipmentProcessor = {
  async sync(equipmentId, changes) {
    try {
      const equipment = await Equipment.findByPk(equipmentId);
      
      if (!equipment) {
        throw new Error('Equipamento não encontrado');
      }

      // Atualiza dados
      await equipment.update(changes);

      // Gera novo QR Code se necessário
      if (changes.needsNewQRCode) {
        const qrcode = await QRCodeService.generateForEquipment(equipment);
        await equipment.update({ qrcode_url: qrcode.url });
      }

      return equipment;

    } catch (error) {
      logger.error('Erro na sincronização do equipamento:', error);
      throw error;
    }
  }
};

module.exports = equipmentProcessor;