import api from './api';

class UploadService {
  async uploadFile(file, onProgress) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro no upload do arquivo:', error);
      throw new Error('Falha no upload do arquivo');
    }
  }

  async uploadMultipleFiles(files, onProgress) {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });

      const response = await api.post('/files/batch', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro no upload dos arquivos:', error);
      throw new Error('Falha no upload dos arquivos');
    }
  }

  async deleteFile(fileId) {
    try {
      await api.delete(`/files/${fileId}`);
      return true;
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      throw new Error('Falha ao excluir arquivo');
    }
  }

  getFileUrl(fileId) {
    return `${api.defaults.baseURL}/files/${fileId}`;
  }

  validateFileSize(file, maxSizeMB = 5) {
    const maxSize = maxSizeMB * 1024 * 1024; // Converter para bytes
    return file.size <= maxSize;
  }

  validateFileType(file, allowedTypes = []) {
    if (allowedTypes.length === 0) return true;
    return allowedTypes.includes(file.type);
  }

  getFileTypeIcon(mimeType) {
    // Retorna o nome do ícone baseado no tipo do arquivo
    if (mimeType.startsWith('image/')) {
      return 'image';
    } else if (mimeType === 'application/pdf') {
      return 'pdf';
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return 'excel';
    } else if (mimeType.includes('word')) {
      return 'word';
    } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return 'powerpoint';
    } else {
      return 'file';
    }
  }
}

export default new UploadService();