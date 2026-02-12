# Backend CRUD Seguro - API RESTful

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

API RESTful profesional, escalable y segura para gestión de usuarios con autenticación JWT, siguiendo las mejores prácticas de la industria.

## 🚀 Características

- ✅ **CRUD Completo** de usuarios
- 🔐 **Autenticación JWT** con refresh tokens
- 👥 **Autorización por roles** (user, admin)
- 🛡️ **Seguridad robusta** (Helmet, Rate Limiting, Sanitización)
- 📊 **Paginación y búsqueda**
- ✨ **Validación de datos** con express-validator
- 📝 **Documentación Swagger** automática
- 🧪 **Tests** unitarios e integración
- 📋 **Logging** con Winston
- 🎯 **Arquitectura MVC** bien estructurada
- 🔄 **Manejo de errores** centralizado

## 📋 Requisitos Previos

- Node.js 18.x o superior
- PostgreSQL 15.x o superior
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:
```env
NODE_ENV=development
PORT=3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crud_db
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu-super-secreto-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=tu-super-secreto-refresh-key
JWT_REFRESH_EXPIRES_IN=30d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

4. **Crear la base de datos**
```bash
createdb crud_db
```

5. **Iniciar en desarrollo**
```bash
npm run dev
```

El servidor estará corriendo en `http://localhost:3000`

## 📚 Documentación API

Una vez iniciado el servidor, accede a la documentación interactiva Swagger:

🔗 **http://localhost:3000/api-docs**

## 🛣️ Endpoints Principales

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/logout` | Cerrar sesión | No |
| POST | `/api/auth/refresh` | Refrescar token | No |
| GET | `/api/auth/me` | Obtener perfil actual | Sí |
| PATCH | `/api/auth/change-password` | Cambiar contraseña | Sí |

### Usuarios

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/users` | Listar usuarios | Sí |
| GET | `/api/users/:id` | Obtener usuario | Sí |
| PATCH | `/api/users/:id` | Actualizar usuario | Sí (Owner/Admin) |
| DELETE | `/api/users/:id` | Eliminar usuario | Sí (Owner/Admin) |
| PATCH | `/api/users/:id/role` | Cambiar rol | Sí (Admin) |
| PATCH | `/api/users/:id/activate` | Activar usuario | Sí (Admin) |
| PATCH | `/api/users/:id/deactivate` | Desactivar usuario | Sí (Admin) |
| GET | `/api/users/stats` | Estadísticas | Sí (Admin) |

## 💻 Ejemplos de Uso

### Registro de Usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "password": "Password123!",
    "edad": 25
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "Password123!"
  }'
```

### Obtener Usuarios (con token)

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

### Búsqueda y Paginación

```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10&search=juan&sort=-createdAt" \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage
npm test -- --coverage
```

## 📂 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuraciones (DB, CORS, Swagger)
│   ├── controllers/     # Controladores
│   ├── middlewares/     # Middlewares (Auth, validación, seguridad)
│   ├── models/          # Modelos de datos
│   ├── routes/          # Rutas de la API
│   ├── services/        # Lógica de negocio
│   ├── utils/           # Utilidades (logger, sanitizer, etc.)
│   ├── app.js           # Configuración de Express
│   └── server.js        # Punto de entrada
├── tests/               # Tests unitarios e integración
├── logs/                # Archivos de logs
├── .env.example         # Variables de entorno (ejemplo)
├── package.json
└── README.md
```

## 🛡️ Seguridad

Este proyecto implementa múltiples capas de seguridad:

- ✅ **Helmet** - Headers de seguridad HTTP
- ✅ **Rate Limiting** - Prevención de ataques de fuerza bruta
- ✅ **Data Sanitization** - Protección contra NoSQL injection y XSS
- ✅ **HPP** - Prevención de HTTP Parameter Pollution
- ✅ **JWT** - Autenticación segura con tokens
- ✅ **Bcrypt** - Hashing de contraseñas
- ✅ **CORS** - Control de orígenes
- ✅ **Validation** - Validación robusta de datos

## 🔐 Requisitos de Contraseña

Las contraseñas deben cumplir:
- Mínimo 8 caracteres
- Al menos una letra mayúscula
- Al menos una letra minúscula
- Al menos un número
- Al menos un carácter especial (@$!%*?&)

## 🚀 Deployment

### Railway

```bash
railway login
railway init
railway add
railway up
```

### Render

1. Conectar repositorio GitHub
2. Configurar variables de entorno
3. Deploy automático

### Heroku

```bash
heroku create tu-app
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

## 📝 Scripts Disponibles

```bash
npm start          # Iniciar en producción
npm run dev        # Iniciar en desarrollo con nodemon
npm test           # Ejecutar tests
npm run lint       # Ejecutar ESLint
npm run lint:fix   # Corregir errores de ESLint
npm run format     # Formatear código con Prettier
```

## 🌍 Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `NODE_ENV` | Entorno (development/production) | Sí |
| `PORT` | Puerto del servidor | No (default: 3000) |
| `DB_HOST` | Host de PostgreSQL | Sí |
| `DB_PORT` | Puerto de PostgreSQL | No (default: 5432) |
| `DB_NAME` | Nombre de la base de datos | Sí |
| `DB_USER` | Usuario de PostgreSQL | Sí |
| `DB_PASSWORD` | Contraseña de PostgreSQL | Sí |
| `JWT_SECRET` | Secret para JWT | Sí |
| `JWT_EXPIRES_IN` | Expiración del token | No (default: 7d) |
| `JWT_REFRESH_SECRET` | Secret para refresh token | Sí |
| `ALLOWED_ORIGINS` | Orígenes permitidos (CORS) | Sí |

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👤 Autor

Tu Nombre - [@tu_usuario](https://twitter.com/tu_usuario)

## 🙏 Agradecimientos

- Express.js
- Sequelize
- JWT
- Toda la comunidad de Node.js

---

⭐️ Si este proyecto te fue útil, no olvides darle una estrella!
