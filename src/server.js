require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 3000;

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📝 Documentación: http://localhost:${PORT}/api-docs`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⏰ Iniciado: ${new Date().toLocaleString()}`);
    });

    // Manejo de promesas rechazadas no manejadas
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! 💥 Cerrando servidor...');
      console.error(err.name, err.message);
      console.error(err.stack);
      server.close(() => {
        process.exit(1);
      });
    });

    // Manejo de excepciones no capturadas
    process.on('uncaughtException', (err) => {
      console.error('UNCAUGHT EXCEPTION! 💥 Cerrando servidor...');
      console.error(err.name, err.message);
      console.error(err.stack);
      process.exit(1);
    });

    // Manejo de señal SIGTERM (para deployment)
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM RECIBIDO. Cerrando servidor gracefully...');
      server.close(() => {
        console.log('💥 Proceso terminado');
      });
    });

    // Manejo de SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      console.log('👋 SIGINT RECIBIDO. Cerrando servidor...');
      server.close(() => {
        console.log('💥 Proceso terminado');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();
