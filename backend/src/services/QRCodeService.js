const QRCode = require('qrcode');
const { v4: uuid } = require('uuid');
const S3Service = require('./S3Service');
const logger = require('../utils/logger');

class QRCodeService {
  constructor() {
    this.baseUrl = process.env.APP_URL;
    this.defaultOptions = {
      errorCorrectionLevel: 'H',
      type: 'svg',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    };
  }

  async generateForEquipment(equipment) {
    try {
      const data = {
        id: equipment.id,
        code: equipment.code,
        type: 'equipment',
        timestamp: new Date().toISOString()
      };

      const qrUrl = `${this.baseUrl}/equipment/scan/${equipment.id}`;
      
      // Gera o QR Code como SVG
      const qrSvg = await QRCode.toString(qrUrl, {
        ...this.defaultOptions,
        width: 300
      });

      // Converte SVG para Buffer para upload
      const qrBuffer = Buffer.from(qrSvg);

      // Upload para S3
      const fileName = `qrcodes/equipment/${equipment.id}-${uuid()}.svg`;
      const uploaded = await S3Service.uploadFile({
        buffer: qrBuffer,
        originalname: fileName,
        mimetype: 'image/svg+xml'
      }, 'qrcodes');

      return {
        url: uploaded.url,
        key: uploaded.key,
        data: qrUrl
      };

    } catch (error) {
      logger.error('Erro ao gerar QR Code:', error);
      throw new Error('Falha ao gerar QR Code');
    }
  }

  async generateBatch(equipments) {
    try {
      const results = await Promise.all(
        equipments.map(equipment => this.generateForEquipment(equipment))
      );

      return results;
    } catch (error) {
      logger.error('Erro ao gerar lote de QR Codes:', error);
      throw new Error('Falha ao gerar QR Codes em lote');
    }
  }

  async generatePrintableSheet(equipments) {
    try {
      const qrCodes = await this.generateBatch(equipments);

      // Gera HTML para impressão
      const html = this.generatePrintTemplate(equipments, qrCodes);

      // Converte HTML para PDF
      const pdf = await this.convertToPDF(html);

      // Upload do PDF para S3
      const fileName = `qrcodes/sheets/batch-${uuid()}.pdf`;
      const uploaded = await S3Service.uploadFile({
        buffer: pdf,
        originalname: fileName,
        mimetype: 'application/pdf'
      }, 'qrcodes');

      return uploaded.url;

    } catch (error) {
      logger.error('Erro ao gerar folha de QR Codes:', error);
      throw new Error('Falha ao gerar folha de QR Codes');
    }
  }

  generatePrintTemplate(equipments, qrCodes) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .qr-container {
              display: inline-block;
              margin: 10px;
              padding: 15px;
              border: 1px solid #ccc;
              text-align: center;
            }
            .qr-code {
              width: 200px;
              height: 200px;
            }
            .qr-info {
              margin-top: 10px;
              font-family: Arial, sans-serif;
            }
          </style>
        </head>
        <body>
          ${qrCodes.map((qr, index) => `
            <div class="qr-container">
              <img src="${qr.url}" class="qr-code"/>
              <div class="qr-info">
                <strong>${equipments[index].name}</strong><br/>
                Código: ${equipments[index].code}
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `;
  }

  validateQRCode(qrData) {
    try {
      // Verifica se o QR Code é válido e pertence ao sistema
      const url = new URL(qrData);
      return url.origin === this.baseUrl && url.pathname.includes('/equipment/scan/');
    } catch (error) {
      return false;
    }
  }
}

module.exports = new QRCodeService();