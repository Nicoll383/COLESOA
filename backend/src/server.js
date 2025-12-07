require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { connectMySQL } = require('./config/mysql');
const { connectMongoDB } = require('./config/mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Colegio SOA - Sistema de Matrículas'
  });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/students', require('./routes/student.routes'));
app.use('/api/enrollments', require('./routes/enrollment.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/reniec', require('./routes/reniec.routes'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Ruta no encontrada'
  });
});

// Start server
const startServer = async () => {
  try {
    // Conectar a bases de datos
    await connectMySQL();
    await connectMongoDB();

    app.listen(PORT, () => {
      console.log(`\n✓ Servidor corriendo en http://localhost:${PORT}`);
      console.log(`✓ Ambiente: ${process.env.NODE_ENV}`);
      console.log(`✓ Presiona CTRL+C para detener\n`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
