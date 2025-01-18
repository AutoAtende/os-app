import QrScanner from 'qr-scanner';

class QRCodeService {
  constructor() {
    this.scanner = null;
    this.stream = null;
  }

  async initializeScanner(videoElement, onDecode, onError) {
    try {
      // Verifica se o navegador suporta a API de mídia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Seu navegador não suporta acesso à câmera');
      }

      // Inicializa o scanner
      this.scanner = new QrScanner(
        videoElement,
        result => {
          if (this.validateQRCode(result)) {
            onDecode(result);
          } else {
            onError('QR Code inválido para o sistema');
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      // Inicia o scanner
      await this.scanner.start();

      return true;
    } catch (error) {
      console.error('Erro ao inicializar scanner:', error);
      onError(error.message);
      return false;
    }
  }

  stopScanner() {
    if (this.scanner) {
      this.scanner.stop();
      this.scanner.destroy();
      this.scanner = null;
    }
  }

  async switchCamera() {
    if (!this.scanner) return;

    const cameras = await QrScanner.listCameras();
    const currentCamera = this.scanner.currentCamera();
    const nextCamera = cameras.find(camera => camera.id !== currentCamera.id);

    if (nextCamera) {
      await this.scanner.setCamera(nextCamera.id);
    }
  }

  validateQRCode(result) {
    // Verifica se o QR Code contém uma URL válida do sistema
    const baseUrl = process.env.REACT_APP_BASE_URL;
    return result.startsWith(baseUrl);
  }

  async generateQRCode(data) {
    try {
      const response = await api.post('/qrcode/generate', { data });
      return response.data.qrcode;
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      throw new Error('Falha ao gerar QR Code');
    }
  }

  extractEquipmentId(qrCodeData) {
    try {
      const url = new URL(qrCodeData);
      const pathParts = url.pathname.split('/');
      return pathParts[pathParts.length - 1];
    } catch (error) {
      console.error('Erro ao extrair ID do equipamento:', error);
      return null;
    }
  }

  // Retorna as dimensões ideais para o QR Code baseado no tamanho da tela
  getQRCodeDimensions() {
    const width = window.innerWidth;
    if (width < 600) {
      return 200; // Mobile
    } else if (width < 960) {
      return 250; // Tablet
    } else {
      return 300; // Desktop
    }
  }

  // Verifica se o dispositivo tem câmera disponível
  async hasCamera() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Erro ao verificar câmera:', error);
      return false;
    }
  }
}

export default new QRCodeService();