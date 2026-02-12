require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
      logger.info(`📝 Documentación: http://localhost:${PORT}/api-docs`);
      logger.info(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`⏰ Iniciado: ${new Date().toLocaleString()}`);
    });

    // Manejo de promesas rechazadas no manejadas
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! 💥 Cerrando servidor...');
      logger.error(err.name, err.message);
      logger.error(err.stack);
      server.close(() => {
        process.exit(1);
      });
    });

    // Manejo de excepciones no capturadas
    process.on('uncaughtException', (err) => {
      logger.error('UNCAUGHT EXCEPTION! 💥 Cerrando servidor...');
      logger.error(err.name, err.message);
      logger.error(err.stack);
      process.exit(1);
    });

    // Manejo de señal SIGTERM (para deployment)
    process.on('SIGTERM', () => {
      logger.info('👋 SIGTERM RECIBIDO. Cerrando servidor gracefully...');
      server.close(() => {
        logger.info('💥 Proceso terminado');
      });
    });

    // Manejo de SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      logger.info('👋 SIGINT RECIBIDO. Cerrando servidor...');
      server.close(() => {
        logger.info('💥 Proceso terminado');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();
