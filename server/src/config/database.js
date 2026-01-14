import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Opciones de conexión (ya no son necesarias en Mongoose 6+)
    });

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);

    // Manejo de eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error(`❌ Error de MongoDB: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB desconectado');
    });

    // Manejo de cierre graceful
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB desconectado por cierre de la aplicación');
      process.exit(0);
    });

  } catch (error) {
    console.error(`❌ Error al conectar a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
