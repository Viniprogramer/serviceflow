import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { authRouter } from './routes/auth.js';
import { catalogRouter } from './routes/catalog.js';
import { workOrdersRouter } from './routes/work-orders.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', service: 'serviceflow-api', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api', catalogRouter);
app.use('/api', workOrdersRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`ServiceFlow API running on http://localhost:${PORT}`);
});
