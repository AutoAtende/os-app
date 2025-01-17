const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class FileService {
  constructor() {
    this.uploadPath = path.resolve(__dirname, '..', '..', 'uploads');
    this.ensureUploadDirectory();
  }

  ensureUploadDirectory() {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async saveFile(file) {
    const hash = crypto.randomBytes(10).toString('hex');
    const fileName = `${hash}-${file.originalname}`;
    const filePath = path.join(this.uploadPath, fileName);

    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, file.buffer, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          name: fileName,
          path: filePath,
          url: `/uploads/${fileName}`,
        });
      });
    });
  }

  async deleteFile(fileName) {
    const filePath = path.join(this.uploadPath, fileName);
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}