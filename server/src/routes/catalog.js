import { Router } from 'express';
import { db } from '../lib/db.js';
import { requireAuth } from '../lib/require-auth.js';

export const catalogRouter = Router();

catalogRouter.use(requireAuth);

catalogRouter.get('/clients', async (_, res) => {
  const items = await db.client.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(items);
});

catalogRouter.post('/clients', async (req, res) => {
  const item = await db.client.create({ data: req.body });
  res.status(201).json(item);
});

catalogRouter.get('/technicians', async (_, res) => {
  const items = await db.technician.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(items);
});

catalogRouter.post('/technicians', async (req, res) => {
  const item = await db.technician.create({ data: req.body });
  res.status(201).json(item);
});

catalogRouter.get('/services', async (_, res) => {
  const items = await db.serviceItem.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(items);
});

catalogRouter.post('/services', async (req, res) => {
  const payload = { ...req.body, basePrice: Number(req.body.basePrice) };
  const item = await db.serviceItem.create({ data: payload });
  res.status(201).json(item);
});

catalogRouter.get('/equipments', async (_, res) => {
  const items = await db.equipment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { client: { select: { id: true, name: true } } },
  });
  res.json(items);
});

catalogRouter.post('/equipments', async (req, res) => {
  const item = await db.equipment.create({ data: req.body });
  res.status(201).json(item);
});
