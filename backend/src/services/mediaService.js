const AWS = require('aws-sdk');
const path = require('path');
const sharp = require('sharp');
const { v4: uuid } = require('uuid');

class MediaService {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
    this.bucketName = process.env.AWS_BUCKET_NAME;
  }

  async uploadPhoto(file, folder = 'photos') {
    try {
      // Processa a imagem com sharp
      const processedImage = await sharp(file.buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      const fileName = `${folder}/${uuid()}${path.extname(file.originalname)}`;

      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: processedImage,
        ContentType: file.mimetype,
        ACL: 'public-read'
      };

      const result = await this.s3.upload(uploadParams).promise();

      return {
        url: result.Location,
        key: fileName
      };
    } catch (error) {
      console.error('Erro no upload da foto:', error);
      throw new Error('Falha no upload da foto');
    }
  }

  async uploadFile(file, folder = 'attachments') {
    try {
      const fileName = `${folder}/${uuid()}${path.extname(file.originalname)}`;

      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
      };

      const result = await this.s3.upload(uploadParams).promise();

      return {
        url: result.Location,
        key: fileName,
        name: file.originalname,
        type: file.mimetype
      };
    } catch (error) {
      console.error('Erro no upload do arquivo:', error);
      throw new Error('Falha no upload do arquivo');
    }
  }

  async deleteFile(key) {
    try {
      const deleteParams = {
        Bucket: this.bucketName,
        Key: key
      };

      await this.s3.deleteObject(deleteParams).promise();
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      throw new Error('Falha ao deletar arquivo');
    }
  }

  async getSignedUrl(key, expirationInSeconds = 3600) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: expirationInSeconds
      };

      return await this.s3.getSignedUrlPromise('getObject', params);
    } catch (error) {
      console.error('Erro ao gerar URL assinada:', error);
      throw new Error('Falha ao gerar URL de acesso');
    }
  }
}

module.exports = new MediaService();