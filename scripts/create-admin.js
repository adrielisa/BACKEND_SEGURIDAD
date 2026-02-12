require('dotenv').config();
const { connectDB } = require('../src/config/database');
const User = require('../src/models/User');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdminUser() {
  try {
    console.log('🔧 Creando usuario administrador...\n');

    // Conectar a la base de datos
    await connectDB();

    // Solicitar datos
    const nombre = await question('Nombre completo: ');
    const email = await question('Email: ');
    const password = await question('Contraseña (mínimo 8 caracteres, mayúscula, minúscula, número y especial): ');
    const edad = await question('Edad (opcional, presiona Enter para omitir): ');

    // Validar email
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      console.error('❌ Email inválido');
      process.exit(1);
    }

    // Validar contraseña
    if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
      console.error('❌ La contraseña no cumple con los requisitos de seguridad');
      process.exit(1);
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.error('❌ Ya existe un usuario con ese email');
      process.exit(1);
    }

    // Crear usuario admin
    const adminUser = await User.create({
      nombre,
      email,
      password,
      edad: edad ? parseInt(edad) : null,
      role: 'admin',
      isActive: true
    });

    console.log('\n✅ Usuario administrador creado exitosamente!');
    console.log('\n📋 Detalles:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Nombre: ${adminUser.nombre}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log('\n🔐 Puedes iniciar sesión ahora con estas credenciales.');

  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Ejecutar
createAdminUser();
