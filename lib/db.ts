import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export type MealType = "empty stomach" | "after meal";

export type RecordRow = {
  id: number;
  meal_type: MealType;
  sugar_level: number;
  comment: string | null;
  created_at: string; // ISO
};

export function openDb(dbFilePath: string) {
  const dir = path.dirname(dbFilePath);
  fs.mkdirSync(dir, { recursive: true });

  const db = new Database(dbFilePath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meal_type TEXT NOT NULL,
      sugar_level INTEGER NOT NULL,
      comment TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at);
    CREATE INDEX IF NOT EXISTS idx_records_meal_type ON records(meal_type);
  `);

  return db;
}

let _db: ReturnType<typeof openDb> | null = null;

export function getDb() {
  if (_db) return _db;
  const dbPath = process.env.SUGARMOMMY_DB_PATH || path.join(process.cwd(), "data", "app.db");
  _db = openDb(dbPath);
  return _db;
}

export function listRecords(): RecordRow[] {
  const db = getDb();
  const stmt = db.prepare(
    `SELECT id, meal_type, sugar_level, comment, created_at
     FROM records
     ORDER BY datetime(created_at) ASC, id ASC`
  );
  return stmt.all() as RecordRow[];
}

export function insertRecord(input: { mealType: MealType; sugarLevel: number; comment?: string | null }): RecordRow {
  const db = getDb();
  const createdAt = new Date().toISOString();
  const comment = input.comment?.trim() ? input.comment.trim() : null;

  const stmt = db.prepare(
    `INSERT INTO records (meal_type, sugar_level, comment, created_at)
     VALUES (?, ?, ?, ?)`
  );
  const info = stmt.run(input.mealType, input.sugarLevel, comment, createdAt);

  const row = db
    .prepare(
      `SELECT id, meal_type, sugar_level, comment, created_at
       FROM records
       WHERE id = ?`
    )
    .get(info.lastInsertRowid as number) as RecordRow;

  return row;
}
