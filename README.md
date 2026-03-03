# SmartSpend

SmartSpend is a production-ready expense tracker with a modern, responsive PWA frontend and scalable REST backend.

## Stack

- **Frontend (PWA):** Next.js + React + Tailwind CSS + Recharts
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Auth:** JWT + bcrypt password hashing
- **Security:** Helmet, CORS, rate limiting, HPP, mongo sanitization

## Folder Structure

```text
.
├── api
│   ├── src
│   │   ├── config
│   │   ├── middlewares
│   │   ├── models
│   │   ├── routes
│   │   ├── utils
│   │   └── index.ts
│   └── .env.example
├── web
│   ├── src
│   │   ├── app
│   │   ├── components
│   │   ├── contexts
│   │   └── lib
│   ├── public
│   └── .env.example
└── README.md
```

## Features

- JWT auth (signup/login/logout) with protected dashboard routes
- Dashboard cards (balance, income, expense, monthly overview)
- Add/edit/delete transactions
- Filter transactions by date/category/type + title search
- Analytics page (monthly spending, category breakdown, income vs expense, highest category)
- Monthly budget with warning/exceeded states
- Export transactions to CSV and monthly report to PDF
- Dark/light mode persisted in localStorage
- Mobile-first UI with glassmorphism cards, rounded corners, soft shadows, smooth motion
- Bonus: recurring transactions + multi-currency + bottom nav + installable PWA + offline caching

## Local Setup

### 1) Backend

```bash
cd api
npm install
cp .env.example .env
npm run dev
```

Backend runs on `http://localhost:4000`.

Required envs in `api/.env`:

- `MONGODB_URI`
- `JWT_SECRET`
- `PORT` (default `4000`)
- `CLIENT_ORIGIN` (default `http://localhost:3000`)

### 2) Frontend

```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3000`.

Required env in `web/.env.local`:

- `NEXT_PUBLIC_API_URL=http://localhost:4000`

## Docker (One-command Startup)

From the project root:

```bash
docker compose up --build
```

Services:

- Frontend (Next.js): `http://localhost:3000`
- Backend API: `http://localhost:4000`
- MongoDB: `mongodb://localhost:27017/smartspend`

Stop and remove containers:

```bash
docker compose down
```

Stop and remove containers + Mongo data:

```bash
docker compose down -v
```

## API Overview

Base URL: `/api`

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`
- `PATCH /auth/currency`
- `GET /dashboard`
- `GET /analytics`
- `GET /transactions`
- `POST /transactions`
- `PATCH /transactions/:id`
- `DELETE /transactions/:id`
- `PUT /budget`
- `GET /budget/:month`
- `GET /export/csv`
- `GET /export/pdf?month=YYYY-MM`

All routes except signup/login require `Authorization: Bearer <JWT>`.

## Deployment (Vercel + MongoDB Atlas)

### Backend

1. Create MongoDB Atlas cluster and get connection string.
2. Deploy backend (`api`) to Render/Railway/Fly.io.
3. Set backend env vars:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `CLIENT_ORIGIN=<your-vercel-domain>`
4. Ensure deployed API URL is public HTTPS.

### Frontend (Vercel)

1. Import `web` project into Vercel.
2. Set env variable:
   - `NEXT_PUBLIC_API_URL=<your-backend-url>`
3. Deploy.
4. Update backend `CLIENT_ORIGIN` to Vercel domain.

## Production Notes

- Use strong random JWT secret in production.
- Rotate secrets and enable Atlas IP allowlists.
- Add monitoring/logging (Sentry + hosted logs).
- Add refresh token strategy if you need long-lived sessions.


