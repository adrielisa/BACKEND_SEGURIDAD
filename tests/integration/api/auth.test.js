const request = require('supertest');
const app = require('../../../src/app');
const User = require('../../../src/models/User');

describe('Auth Endpoints', () => {
  let authToken;
  let testUser;
  
  beforeEach(async () => {
    // Limpiar usuarios antes de cada test
    await User.destroy({ where: {} });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Test User',
          email: 'test@example.com',
          password: 'Test1234!',
          edad: 25
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should not register user with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Test User',
          email: 'invalid-email',
          password: 'Test1234!',
          edad: 25
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('should not register user with weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Test User',
          email: 'test@example.com',
          password: 'weak',
          edad: 25
        });

      expect(res.statusCode).toBe(400);
    });

    it('should not register duplicate email', async () => {
      // Crear primer usuario
      await User.create({
        nombre: 'Existing User',
        email: 'test@example.com',
        password: 'Test1234!',
        edad: 30
      });

      // Intentar registrar con mismo email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Test User',
          email: 'test@example.com',
          password: 'Test1234!',
          edad: 25
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('email');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Crear usuario para tests de login
      await User.create({
        nombre: 'Test User',
        email: 'test@example.com',
        password: 'Test1234!',
        edad: 25
      });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test1234!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('user');
      
      authToken = res.body.data.token;
    });

    it('should not login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('incorrectos');
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test1234!'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should not login inactive user', async () => {
      // Desactivar usuario
      await User.update(
        { isActive: false },
        { where: { email: 'test@example.com' } }
      );

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test1234!'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('desactivado');
    });
  });

  describe('GET /api/auth/me', () => {
    beforeEach(async () => {
      // Crear usuario y obtener token
      testUser = await User.create({
        nombre: 'Test User',
        email: 'test@example.com',
        password: 'Test1234!',
        edad: 25
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test1234!'
        });

      authToken = loginRes.body.data.token;
    });

    it('should get current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should not get user without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('autenticado');
    });

    it('should not get user with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/auth/logout');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toContain('cerrada');
    });
  });
});
