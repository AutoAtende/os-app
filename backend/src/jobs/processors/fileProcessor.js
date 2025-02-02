const sharp = require('sharp');
const S3Service = require('../../services/S3Service');
const logger = require('../../utils/logger');

const fileProcessor = {
  async process(file, type) {
    try {
      let processedFile = file;

      // Processa imagens
      if (type === 'image') {
        processedFile.buffer = await sharp(file.buffer)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
      }

      // Upload para S3
      const result = await S3Service.uploadFile(processedFile);

      return result;

    } catch (error) {
      logger.error('Erro ao processar arquivo:', error);
      throw error;
    }
  }
};

module.exports = fileProcessor;