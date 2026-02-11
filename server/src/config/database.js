import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Seleccionar URI según entorno
    const MONGODB_URI = process.env.NODE_ENV === 'production'
      ? process.env.MONGODB_URI_PROD || process.env.MONGODB_URI
      : process.env.MONGODB_URI;

    // Opciones optimizadas de conexión
    const options = {
      maxPoolSize: 50,              // Máximo de conexiones en pool (prod)
      minPoolSize: 10,              // Mínimo de conexiones mantenidas
      serverSelectionTimeoutMS: 5000, // Timeout para seleccionar servidor
      socketTimeoutMS: 45000,       // Timeout de socket
      family: 4,                    // Usar IPv4
      retryWrites: true,            // Reintentar escrituras fallidas
      retryReads: true,             // Reintentar lecturas fallidas
    };

    const conn = await mongoose.connect(MONGODB_URI, options);

    const dbType = MONGODB_URI.includes('localhost') ? 'Local' : 'Atlas (Cloud)';
    console.log(`✅ MongoDB conectado: ${conn.connection.host} (${dbType})`);
    console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);

    // Manejo de eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error(`❌ Error de MongoDB: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconectado');
    });

    // Manejo de cierre graceful
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB desconectado por cierre de la aplicación');
      process.exit(0);
    });

  } catch (error) {
    console.error(`❌ Error al conectar a MongoDB: ${error.message}`);
    console.error('💡 Verifica que MongoDB esté corriendo o que las credenciales sean correctas');
    process.exit(1);
  }
};

export default connectDB;
