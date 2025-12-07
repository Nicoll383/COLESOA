const express = require('express');
const router = express.Router();
const CursoController = require('../controllers/curso.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// CRUD de cursos
router.get('/', CursoController.getAll);
router.get('/:id', CursoController.getById);
router.post('/', authorize(['administrador', 'secretaria']), CursoController.create);
router.put('/:id', authorize(['administrador', 'secretaria']), CursoController.update);
router.delete('/:id', authorize(['administrador']), CursoController.delete);

// Asignación de cursos a secciones
router.get('/seccion/cursos', CursoController.getCursosBySeccion); // GET /api/cursos/seccion/cursos?seccion_id=X&año_escolar=Y
router.get('/curso/secciones', CursoController.getSeccionesByCurso); // GET /api/cursos/curso/secciones?curso_id=X&año_escolar=Y
router.post('/asignar', authorize(['administrador', 'secretaria']), CursoController.asignarASeccion);
router.delete('/asignar/:asignacion_id', authorize(['administrador', 'secretaria']), CursoController.removerDeSeccion);
router.patch('/asignar/:asignacion_id/docente', authorize(['administrador', 'secretaria']), CursoController.actualizarDocente);

module.exports = router;
