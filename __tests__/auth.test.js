const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, disconnectTestDB } = require('../src/config/testDb');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

describe('POST /api/auth/register', () => {
  it('harus berhasil register dengan data valid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Budi Santoso',
        email: 'budi@unas.ac.id',
        password: 'Password123',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.data.email).toBe('budi@unas.ac.id');
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it('harus menolak password lemah', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Budi Santoso',
        email: 'budi2@unas.ac.id',
        password: 'abc',
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('harus menolak email duplikat', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Budi Santoso',
        email: 'duplikat@unas.ac.id',
        password: 'Password123',
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Budi Santoso',
        email: 'duplikat@unas.ac.id',
        password: 'Password123',
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('harus menolak field role dari request', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Hacker',
        email: 'hacker@evil.com',
        password: 'Hacker123',
        role: 'admin',
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login Test',
        email: 'login@unas.ac.id',
        password: 'Password123',
      });
  });

  it('harus berhasil login dengan kredensial valid', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@unas.ac.id',
        password: 'Password123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('harus menolak password salah dengan pesan generik', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@unas.ac.id',
        password: 'PasswordSalah',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Email atau password salah.');
  });

  it('harus menolak email yang tidak terdaftar', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'tidakada@unas.ac.id',
        password: 'Password123',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});