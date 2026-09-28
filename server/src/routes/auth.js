import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { comparePassword, hashPassword, signToken } from '../lib/auth.js';
import { requireAuth } from '../lib/require-auth.js';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'TECH']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  }

  const { name, email, password, role } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: { name, email, passwordHash, role: role ?? 'TECH' },
    select: { id: true, name: true, email: true, role: true },
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return res.status(201).json({ token, user });
});

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await db.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({ user });
});
