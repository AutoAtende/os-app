const AWS = require('aws-sdk');
const sharp = require('sharp');
const mime = require('mime-types');
const path = require('path');
const { v4: uuid } = require('uuid');
const logger = require('../utils/logger');

class S3Service {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
    this.bucket = process.env.AWS_BUCKET_NAME;
    this.allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
  }

  async uploadFile(file, folder = 'general') {
    try {
      if (!this.allowedMimes.includes(file.mimetype)) {
        throw new Error('Tipo de arquivo não permitido');
      }

      const fileName = `${folder}/${uuid()}${path.extname(file.originalname)}`;
      let processedBuffer = file.buffer;

      // Processa imagens antes do upload
      if (file.mimetype.startsWith('image/')) {
        processedBuffer = await this.processImage(file.buffer);
      }

      const params = {
        Bucket: this.bucket,
        Key: fileName,
        Body: processedBuffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
      };

      const result = await this.s3.upload(params).promise();

      return {
        url: result.Location,
        key: fileName,
        type: file.mimetype,
        size: processedBuffer.length
      };

    } catch (error) {
      logger.error('Erro no upload para S3:', error);
      throw new Error('Falha ao fazer upload do arquivo');
    }
  }

  async processImage(buffer) {
    try {
      return await sharp(buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 80,
          progressive: true
        })
        .toBuffer();
    } catch (error) {
      logger.error('Erro ao processar imagem:', error);
      throw new Error('Falha ao processar imagem');
    }
  }

  async deleteFile(key) {
    try {
      await this.s3.deleteObject({
        Bucket: this.bucket,
        Key: key
      }).promise();

      return true;
    } catch (error) {
      logger.error('Erro ao deletar arquivo do S3:', error);
      throw new Error('Falha ao deletar arquivo');
    }
  }

  async generateSignedUrl(key, expiresIn = 3600) {
    try {
      return await this.s3.getSignedUrlPromise('getObject', {
        Bucket: this.bucket,
        Key: key,
        Expires: expiresIn
      });
    } catch (error) {
      logger.error('Erro ao gerar URL assinada:', error);
      throw new Error('Falha ao gerar URL de acesso');
    }
  }

  async moveFile(oldKey, newKey) {
    try {
      // Copia o arquivo para novo local
      await this.s3.copyObject({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${oldKey}`,
        Key: newKey,
        ACL: 'public-read'
      }).promise();

      // Remove arquivo original
      await this.deleteFile(oldKey);

      return true;
    } catch (error) {
      logger.error('Erro ao mover arquivo:', error);
      throw new Error('Falha ao mover arquivo');
    }
  }
}

module.exports = new S3Service();