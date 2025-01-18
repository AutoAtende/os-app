const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

class S3Service {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
    this.bucket = process.env.AWS_BUCKET_NAME;
  }

  async uploadFile(file) {
    const fileStream = fs.createReadStream(file.path);
    const fileName = `${Date.now()}-${path.basename(file.originalname)}`;

    const uploadParams = {
      Bucket: this.bucket,
      Key: fileName,
      Body: fileStream,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    try {
      const data = await this.s3.upload(uploadParams).promise();
      return {
        url: data.Location,
        key: data.Key
      };
    } catch (error) {
      console.error('Erro no upload para S3:', error);
      throw new Error('Falha no upload do arquivo');
    }
  }

  async deleteFile(key) {
    const deleteParams = {
      Bucket: this.bucket,
      Key: key
    };

    try {
      await this.s3.deleteObject(deleteParams).promise();
    } catch (error) {
      console.error('Erro ao deletar arquivo do S3:', error);
      throw new Error('Falha ao deletar arquivo');
    }
  }

  getSignedUrl(key) {
    return this.s3.getSignedUrl('getObject', {
      Bucket: this.bucket,
      Key: key,
      Expires: 60 * 5,
    });
  }
}

module.exports = new S3Service();