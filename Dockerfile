# Dockerfile para producción
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar código fuente
COPY . .

# Crear directorio de logs
RUN mkdir -p logs

# Exponer puerto
EXPOSE 3000

# Usuario no root por seguridad
USER node

# Comando de inicio
CMD ["node", "src/server.js"]
