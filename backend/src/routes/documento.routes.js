const express = require('express');
const router = express.Router();
const DocumentoController = require('../controllers/documento.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener documentos requeridos (cualquier usuario autenticado)
router.get('/requeridos', DocumentoController.getDocumentosRequeridos);

// Obtener documentos de un estudiante (padre, secretaria, admin)
router.get(
  '/estudiante/:estudianteId',
  authorize(['padre', 'administrador', 'secretaria']),
  DocumentoController.getDocumentosEstudiante
);

// Subir documento (padre puede subir documentos de sus hijos)
router.post(
  '/subir',
  authorize(['padre', 'administrador', 'secretaria']),
  DocumentoController.subirDocumento
);

// Cambiar estado de documento (solo secretaria y admin)
router.patch(
  '/:id/estado',
  authorize(['administrador', 'secretaria']),
  DocumentoController.cambiarEstado
);

// Obtener seguimiento de un documento
router.get(
  '/:id/seguimiento',
  authorize(['padre', 'administrador', 'secretaria']),
  DocumentoController.getSeguimiento
);

// Obtener resumen de documentos por matrícula
router.get(
  '/resumen/matricula/:matriculaId',
  authorize(['padre', 'administrador', 'secretaria', 'finanzas']),
  DocumentoController.getResumenPorMatricula
);

// Obtener documentos pendientes de revisión (solo secretaria y admin)
router.get(
  '/pendientes-revision',
  authorize(['administrador', 'secretaria']),
  DocumentoController.getDocumentosPendientesRevision
);

// Obtener documento por ID
router.get(
  '/:id',
  authorize(['padre', 'administrador', 'secretaria']),
  DocumentoController.getDocumentoById
);

module.exports = router;
