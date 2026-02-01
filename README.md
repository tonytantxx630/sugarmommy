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
- SQLite database at `./data/app.db` (created automatically)

## Local development

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

