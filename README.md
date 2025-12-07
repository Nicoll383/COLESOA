# Sistema de Matrículas - Colegio SOA

Sistema integral de gestión de matrículas escolares para nivel primaria del Colegio SOA.

## Descripción

Sistema web completo para la gestión de procesos de matrícula escolar, diseñado específicamente para nivel primaria. Incluye gestión de estudiantes, pagos, horarios, docentes y padres/apoderados.

## Tecnologías

- **Backend**: Node.js + Express
- **Frontend**: Vue.js 3 + Vue Router + Pinia
- **Bases de Datos**:
  - MySQL (datos relacionales: usuarios, matrículas, pagos)
  - MongoDB (documentos: reportes, logs, archivos adjuntos)
- **Autenticación**: JWT (JSON Web Tokens)
- **Diseño**: Inspirado en Colegio Innova

## Roles del Sistema

El sistema contempla 5 roles principales:

### 1. **Administrador**
- Gestión completa del sistema
- Configuración de períodos escolares
- Gestión de usuarios y permisos
- Reportes generales

### 2. **Secretaría / Gestión Escolar**
- Proceso de matrícula
- Actualización de datos de estudiantes
- Gestión de documentación
- Asignación de grados y secciones

### 3. **Finanzas**
- Control de pagos de matrícula
- Gestión de deudas
- Emisión de recibos y comprobantes
- Reportes financieros

### 4. **Docentes**
- Visualización de estudiantes inscritos
- Consulta de horarios
- Acceso a información de estudiantes de sus secciones

### 5. **Padres/Apoderados**
- Proceso de pre-inscripción
- Actualización de datos del estudiante
- Consulta de pagos
- Descarga de documentos

## Estructura del Proyecto

```
COLESOA/
├── backend/                 # API Node.js + Express
│   ├── src/
│   │   ├── config/         # Configuraciones (DB, JWT, etc.)
│   │   ├── models/         # Modelos de datos (MySQL y MongoDB)
│   │   ├── controllers/    # Controladores de rutas
│   │   ├── middlewares/    # Middlewares (auth, roles, etc.)
│   │   ├── routes/         # Definición de rutas
│   │   ├── services/       # Lógica de negocio
│   │   └── utils/          # Utilidades
│   ├── package.json
│   └── .env.example
│
├── frontend/               # Aplicación Vue.js
│   ├── src/
│   │   ├── assets/        # Recursos estáticos
│   │   ├── components/    # Componentes reutilizables
│   │   ├── views/         # Vistas por rol
│   │   ├── router/        # Configuración de rutas
│   │   ├── stores/        # Pinia stores
│   │   ├── services/      # Servicios API
│   │   └── utils/         # Utilidades
│   ├── package.json
│   └── vite.config.js
│
├── docs/                   # Documentación
│   ├── GUIA_INICIO.md     # Guía de inicio del proyecto
│   ├── GUIA_GIT.md        # Guía de comandos Git
│   ├── API.md             # Documentación de API
│   └── DATABASE.md        # Esquemas de base de datos
│
└── README.md              # Este archivo
```

## Inicio Rápido

Ver [Guía de Inicio](./docs/GUIA_INICIO.md) para instrucciones detalladas de instalación y configuración.

Ver [Guía de Git](./docs/GUIA_GIT.md) para flujo de trabajo con Git.

## Próximos Pasos

1. Definición de roles (COMPLETADO)
2. Configuración inicial del proyecto (EN PROCESO)
3. Modelos de base de datos
4. Sistema de autenticación
5. Módulo de matrículas
6. Módulo de pagos
7. Panel de administración
8. Interfaz de padres/apoderados

## Licencia

Proyecto privado - Colegio SOA © 2025
