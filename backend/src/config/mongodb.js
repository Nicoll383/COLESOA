const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✓ Conectado a MongoDB');

    mongoose.connection.on('error', (err) => {
      console.error('Error de MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB desconectado');
    });

    return mongoose.connection;
  } catch (error) {
    console.error('✗ Error al conectar con MongoDB:', error.message);
    throw error;
  }
};

module.exports = {
  connectMongoDB,
  mongoose
};
