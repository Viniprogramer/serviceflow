# ServiceFlow - Service Order Management

ServiceFlow is a bilingual (EN/PT-BR) React + Node platform for small companies to manage field services and work orders.

## Features

- Clients management
- Technicians management
- Services catalog
- Equipment registry
- Work orders
- Photo attachments per work order
- Status workflow (OPEN, IN_PROGRESS, COMPLETED, CANCELED)
- JWT authentication (login/register)
- Role support (ADMIN, TECH)
- Modern responsive enterprise-style interface
- English and Portuguese-BR language switch

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL + Prisma 7
- Auth: JWT + bcrypt

## Folder structure

- `client/` React app
- `server/` API, auth, Prisma schema, seed

## Setup

1. Install dependencies:

```bash
cd /home/usuario/Desktop/gringa/serviceflow
npm install
npm run install:all
```

2. Configure backend env:

```bash
cd server
cp .env.example .env
```

3. Initialize database:

```bash
npm run db:generate
npx prisma migrate dev --name init_serviceflow
npm run db:seed
```

4. Run full stack:

```bash
cd ..
npm run dev
```

## URLs

- Frontend: http://localhost:5174
- API: http://localhost:4000/api/health

## Demo account

- Email: `admin@serviceflow.io`
- Password: `Service123!`

## Main API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST /api/clients`
- `GET/POST /api/technicians`
- `GET/POST /api/services`
- `GET/POST /api/equipments`
- `GET/POST /api/work-orders`
- `PATCH /api/work-orders/:id/status`
- `POST /api/work-orders/:id/photos`
