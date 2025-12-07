const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { mongoose } = require('../config/mongodb');

// Schema de MongoDB para almacenar metadata de archivos
const FileSchema = new mongoose.Schema({
  originalName: String,
  fileName: String,
  mimeType: String,
  size: Number,
  path: String,
  category: String, // 'student_photo', 'document', 'receipt', etc.
  relatedTo: {
    type: String,
    ref: 'Collection' // 'student', 'enrollment', 'payment', etc.
  },
  relatedId: Number,
  uploadedBy: Number,
  uploadedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'active' } // 'active', 'deleted'
});

const FileModel = mongoose.model('File', FileSchema);

class FileService {
  constructor() {
    this.uploadDir = process.env.UPLOAD_PATH || './uploads';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 5242880; // 5MB default
    this.initStorage();
  }

  /**
   * Inicializar directorios de almacenamiento
   */
  async initStorage() {
    const directories = [
      `${this.uploadDir}/photos`,
      `${this.uploadDir}/documents`,
      `${this.uploadDir}/receipts`,
      `${this.uploadDir}/reports`
    ];

    for (const dir of directories) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }

  /**
   * Configurar multer storage
   */
  getMulterStorage(category = 'documents') {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const dir = `${this.uploadDir}/${category}`;
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${category}-${uniqueSuffix}${ext}`);
      }
    });
  }

  /**
   * Filtro de archivos permitidos
   */
  fileFilter(req, file, cb) {
    const allowedMimes = {
      'image/jpeg': true,
      'image/jpg': true,
      'image/png': true,
      'application/pdf': true,
      'application/msword': true,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
      'application/vnd.ms-excel': true,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true
    };

    if (allowedMimes[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }

  /**
   * Middleware de upload
   */
  upload(category = 'documents', fieldName = 'file') {
    return multer({
      storage: this.getMulterStorage(category),
      fileFilter: this.fileFilter,
      limits: {
        fileSize: this.maxFileSize
      }
    }).single(fieldName);
  }

  /**
   * Registrar archivo en MongoDB
   */
  async registerFile(fileData, uploadedBy) {
    const file = new FileModel({
      originalName: fileData.originalname,
      fileName: fileData.filename,
      mimeType: fileData.mimetype,
      size: fileData.size,
      path: fileData.path,
      category: fileData.category || 'document',
      relatedTo: fileData.relatedTo,
      relatedId: fileData.relatedId,
      uploadedBy
    });

    await file.save();
    return file;
  }

  /**
   * Obtener archivo por ID
   */
  async getFileById(id) {
    return await FileModel.findById(id);
  }

  /**
   * Listar archivos relacionados
   */
  async getFilesByRelation(relatedTo, relatedId) {
    return await FileModel.find({
      relatedTo,
      relatedId,
      status: 'active'
    }).sort({ uploadedAt: -1 });
  }

  /**
   * Eliminar archivo (soft delete)
   */
  async deleteFile(id) {
    const file = await FileModel.findById(id);
    if (!file) {
      throw new Error('Archivo no encontrado');
    }

    file.status = 'deleted';
    await file.save();

    return true;
  }

  /**
   * Eliminar archivo físicamente
   */
  async deleteFilePermanently(id) {
    const file = await FileModel.findById(id);
    if (!file) {
      throw new Error('Archivo no encontrado');
    }

    try {
      await fs.unlink(file.path);
    } catch (error) {
      console.error('Error al eliminar archivo físico:', error);
    }

    await FileModel.findByIdAndDelete(id);
    return true;
  }

  /**
   * Obtener URL de archivo
   */
  getFileUrl(fileName, category) {
    return `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${category}/${fileName}`;
  }

  /**
   * Validar tamaño de archivo
   */
  validateFileSize(size) {
    return size <= this.maxFileSize;
  }

  /**
   * Obtener estadísticas de almacenamiento
   */
  async getStorageStatistics() {
    const stats = await FileModel.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      }
    ]);

    const totalFiles = await FileModel.countDocuments({ status: 'active' });
    const totalSize = await FileModel.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$size' } } }
    ]);

    return {
      totalFiles,
      totalSize: totalSize[0]?.total || 0,
      byCategory: stats
    };
  }

  /**
   * Limpiar archivos antiguos eliminados
   */
  async cleanupDeletedFiles(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const deletedFiles = await FileModel.find({
      status: 'deleted',
      uploadedAt: { $lt: cutoffDate }
    });

    let cleaned = 0;
    for (const file of deletedFiles) {
      try {
        await fs.unlink(file.path);
        await FileModel.findByIdAndDelete(file._id);
        cleaned++;
      } catch (error) {
        console.error(`Error al limpiar archivo ${file._id}:`, error);
      }
    }

    return { cleaned, total: deletedFiles.length };
  }
}

module.exports = new FileService();
