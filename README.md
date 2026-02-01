# sugarmommy

A minimal web app to record and visualize blood glucose readings.

## Features

- **Input** tab: record glucose with meal type, level, optional comment
- **Graph** tab: plot readings over time with two series
  - empty stomach: red dots if > 95
  - after meal: red dots if > 120
  - hover dots to see comment

## Tech

- Next.js (App Router) + TypeScript + Tailwind
- Postgres (Neon via Vercel Marketplace) using `POSTGRES_URL` / `DATABASE_URL`

## Local development

1) Ensure you have a Postgres connection string in your environment:

- `POSTGRES_URL` (recommended)
- or `DATABASE_URL`

If you created Postgres via Vercel/Neon, you can copy the connection string from the Vercel Storage integration.

2) Run:

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Tests

```bash
npm test
```

## API

- `GET /api/records` → all records ordered by time
- `POST /api/records` → `{ mealType, sugarLevel, comment? }`

