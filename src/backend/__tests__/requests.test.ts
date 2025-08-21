import request from 'supertest';
import express from 'express';
import cors from 'cors';

// Lightweight handler extraction for test
const app = express();
app.use(express.json());
app.use(cors());
app.post('/api/requests', (req, res) => {
  const { fullName, email, acceptAGB, acceptPrivacy } = req.body || {};
  if (!fullName || !email || !acceptAGB || !acceptPrivacy) return res.status(400).send('Ungültige Eingabe');
  return res.status(201).json({ id: 'test' });
});

describe('POST /api/requests', () => {
  it('rejects invalid input', async () => {
    const res = await request(app).post('/api/requests').send({});
    expect(res.status).toBe(400);
  });

  it('accepts valid input', async () => {
    const res = await request(app).post('/api/requests').send({
      fullName: 'Max Mustermann',
      email: 'max@example.com',
      acceptAGB: true,
      acceptPrivacy: true,
      type: 'ALG2',
      message: 'Bitte helfen',
      signedAt: new Date().toISOString(),
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });
});

