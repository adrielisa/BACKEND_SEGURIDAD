const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CRUD API Seguro',
      version: '1.0.0',
      description: 'API RESTful segura para gestión de usuarios con autenticación JWT',
      contact: {
        name: 'API Support',
        email: 'support@api.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://tu-api.com/api',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingrese el token JWT obtenido del login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['nombre', 'email', 'password'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del usuario'
            },
            nombre: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Nombre completo del usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario'
            },
            edad: {
              type: 'integer',
              minimum: 1,
              maximum: 150,
              description: 'Edad del usuario'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'Rol del usuario'
            },
            isActive: {
              type: 'boolean',
              description: 'Estado del usuario'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string'
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js', './src/models/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
