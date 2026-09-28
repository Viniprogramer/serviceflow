import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('Service123!', 10);

  const admin = await db.user.upsert({
    where: { email: 'admin@serviceflow.io' },
    update: { name: 'Service Admin', passwordHash, role: 'ADMIN' },
    create: { name: 'Service Admin', email: 'admin@serviceflow.io', passwordHash, role: 'ADMIN' },
  });

  const tech = await db.technician.create({ data: { name: 'Alex Turner', specialty: 'Electrical Systems' } });
  const client = await db.client.create({ data: { name: 'Northpoint Hotel', contact: 'Bianca Lima', phone: '+55 11 94444-2020' } });
  const service = await db.serviceItem.create({ data: { title: 'Emergency Repair', basePrice: 980 } });
  const equipment = await db.equipment.create({
    data: { clientId: client.id, name: 'Main Generator', serialNumber: 'GEN-7821' },
  });

  await db.workOrder.create({
    data: {
      clientId: client.id,
      technicianId: tech.id,
      serviceId: service.id,
      equipmentId: equipment.id,
      status: 'OPEN',
      description: 'Generator shutdown during peak operation.',
    },
  });

  console.log('Seed complete');
  console.log('Demo login: admin@serviceflow.io');
  console.log('Demo password: Service123!');
  console.log(`Admin user id: ${admin.id}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
