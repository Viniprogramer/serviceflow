import { Router } from 'express';
import multer from 'multer';
import { db } from '../lib/db.js';
import { requireAuth } from '../lib/require-auth.js';

const upload = multer({ storage: multer.memoryStorage() });

export const workOrdersRouter = Router();
workOrdersRouter.use(requireAuth);

workOrdersRouter.get('/work-orders', async (_, res) => {
  const items = await db.workOrder.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { id: true, name: true } },
      technician: { select: { id: true, name: true } },
      service: { select: { id: true, title: true } },
      equipment: { select: { id: true, name: true } },
      photos: true,
    },
  });
  res.json(items);
});

workOrdersRouter.post('/work-orders', async (req, res) => {
  const order = await db.workOrder.create({
    data: {
      clientId: req.body.clientId,
      technicianId: req.body.technicianId,
      serviceId: req.body.serviceId,
      equipmentId: req.body.equipmentId,
      status: req.body.status ?? 'OPEN',
      description: req.body.description ?? '',
    },
    include: { photos: true },
  });

  res.status(201).json(order);
});

workOrdersRouter.patch('/work-orders/:id/status', async (req, res) => {
  const order = await db.workOrder.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).json({ error: 'Work order not found' });

  const updated = await db.workOrder.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
    include: { photos: true },
  });

  res.json(updated);
});

workOrdersRouter.post('/work-orders/:id/photos', upload.single('photo'), async (req, res) => {
  const order = await db.workOrder.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).json({ error: 'Work order not found' });

  const photo = await db.workOrderPhoto.create({
    data: {
      workOrderId: req.params.id,
      fileName: req.file?.originalname ?? req.body.fileName ?? `photo-${Date.now()}.jpg`,
    },
  });

  res.status(201).json(photo);
});
