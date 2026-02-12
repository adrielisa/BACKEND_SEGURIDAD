# 🚀 Guía de Inicio Rápido

## Prerrequisitos

Asegúrate de tener instalado:
- Node.js 18+ 
- PostgreSQL 15+
- Git

## Pasos para Iniciar

### 1. Instalar PostgreSQL

**Windows:**
```bash
# Descargar desde https://www.postgresql.org/download/windows/
# O usar Chocolatey:
choco install postgresql
```

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Crear Base de Datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# Dentro de psql:
CREATE DATABASE crud_db;
\q
```

**O usando comando directo:**
```bash
createdb -U postgres crud_db
```

### 3. Configurar el Proyecto

```bash
# Instalar dependencias
npm install

# Copiar y configurar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales
# Mínimo cambiar: DB_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET
```

### 4. Iniciar el Servidor

**Modo desarrollo (con hot reload):**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

El servidor estará disponible en:
- API: http://localhost:3000
- Documentación: http://localhost:3000/api-docs
- Health Check: http://localhost:3000/api/health

## 🧪 Probar la API

### Usando cURL

**1. Registrar un usuario:**
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

**2. Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "Password123!"
  }'
```

**3. Obtener usuarios (necesitas el token del login):**
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Usando Postman o Thunder Client

1. Importar la colección desde la documentación Swagger
2. Configurar el token en Authorization
3. Probar los endpoints

## 🐳 Usar con Docker (Opcional)

```bash
# Construir y ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

## 🔧 Solución de Problemas

### Error: "password authentication failed"
- Verifica que el password en `.env` coincida con tu PostgreSQL
- Asegúrate que PostgreSQL esté corriendo: `pg_isready`

### Error: "database does not exist"
- Crea la base de datos: `createdb crud_db`

### Error: "role does not exist"
- Crea el usuario: `createuser -U postgres nombre_usuario`

### Error: "EADDRINUSE"
- El puerto 3000 está ocupado
- Cambia `PORT=3001` en `.env`
- O mata el proceso: `npx kill-port 3000`

### Error: "Cannot find module"
- Reinstala dependencias: 
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📖 Siguientes Pasos

1. Lee el [README.md](README.md) completo
2. Explora la [documentación Swagger](http://localhost:3000/api-docs)
3. Revisa los ejemplos de tests en `tests/`
4. Personaliza según tus necesidades

## 🆘 Ayuda

Si tienes problemas:
1. Revisa los logs en `logs/error.log`
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate que PostgreSQL esté corriendo
4. Revisa la consola para mensajes de error

## ✅ Checklist de Configuración

- [ ] Node.js 18+ instalado
- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `crud_db` creada
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` configurado
- [ ] JWT_SECRET y JWT_REFRESH_SECRET únicos y seguros
- [ ] Servidor iniciado sin errores
- [ ] Documentación accesible en /api-docs

¡Listo! Ya puedes comenzar a desarrollar 🎉
