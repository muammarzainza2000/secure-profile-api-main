const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, disconnectTestDB } = require('../src/config/testDb');

let token;

beforeAll(async () => {
  await connectTestDB();

  // Register dan login untuk dapat token
  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email: 'test@unas.ac.id',
      password: 'Password123',
    });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'test@unas.ac.id',
      password: 'Password123',
    });

  token = loginRes.body.token;
});

afterAll(async () => {
  await disconnectTestDB();
});

describe('GET /api/users/me', () => {
  it('harus mengembalikan profil dengan token valid', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('test@unas.ac.id');
    expect(res.body.data.passwordHash).toBeUndefined();
    expect(res.body.data.createdAt).toBeDefined();
  });

  it('harus menolak request tanpa token', async () => {
    const res = await request(app).get('/api/users/me');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('harus menolak token yang dimodifikasi', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}Z`);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/users', () => {
  it('harus mengembalikan daftar user tanpa passwordHash', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    res.body.data.forEach((user) => {
      expect(user.passwordHash).toBeUndefined();
    });
  });
});

describe('GET /api/users/count', () => {
  it('harus mengembalikan jumlah user', async () => {
    const res = await request(app)
      .get('/api/users/count')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.count).toBeGreaterThan(0);
  });
});

describe('POST /api/auth/change-password', () => {
  it('harus berhasil ganti password', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        oldPassword: 'Password123',
        newPassword: 'NewPassword456',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('harus menolak password lama yang salah', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        oldPassword: 'PasswordSalah',
        newPassword: 'NewPassword789',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});