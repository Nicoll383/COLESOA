const express = require('express');
const router = express.Router();
const PadreController = require('../controllers/padre.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio de uploads si no existe
const uploadDir = 'uploads/documentos/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF, JPG, JPEG o PNG'));
    }
  }
});

// Todas las rutas requieren autenticación y rol de padre
router.use(authenticateToken);
router.use(authorize(['padre']));

// ========== RUTAS DE HIJOS ==========
router.get('/hijos', PadreController.getHijos);

// ========== RUTAS DE CUOTAS ==========
router.get('/hijos/:estudianteId/cuotas', PadreController.getCuotasHijo);
router.post('/cuotas/:cuotaId/pagar', PadreController.registrarPagoCuota);

// ========== RUTAS DE DOCUMENTOS ==========
router.get('/hijos/:estudianteId/documentos', PadreController.getDocumentosHijo);
router.post('/hijos/:estudianteId/documentos/:documentoId/upload', upload.single('file'), PadreController.subirDocumento);

module.exports = router;
