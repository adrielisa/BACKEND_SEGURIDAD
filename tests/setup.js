const { sequelize } = require('../src/config/database');

// Setup antes de todos los tests
beforeAll(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos de test configurada');
  } catch (error) {
    console.error('❌ Error al configurar base de datos de test:', error);
    throw error;
  }
});

// Cleanup después de cada test
afterEach(async () => {
  // Limpiar datos si es necesario
});

// Cleanup después de todos los tests
afterAll(async () => {
  try {
    await sequelize.close();
    console.log('✅ Conexión de test cerrada');
  } catch (error) {
    console.error('❌ Error al cerrar conexión:', error);
  }
});
