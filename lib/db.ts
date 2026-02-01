import { neon } from "@neondatabase/serverless";

export type MealType = "empty stomach" | "after meal";

export type RecordRow = {
  id: number;
  meal_type: MealType;
  sugar_level: number;
  comment: string | null;
  created_at: string; // ISO
};

function getConnString(): string {
  // Neon integration typically injects POSTGRES_URL or DATABASE_URL.
  const url =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (!url) {
    throw new Error(
      "Missing database connection string. Set POSTGRES_URL (recommended) or DATABASE_URL in env."
    );
  }
  return url;
}

let schemaReady: Promise<void> | null = null;

async function ensureSchema() {
  if (schemaReady) return schemaReady;

  schemaReady = (async () => {
    const sql = neon(getConnString());

    await sql`
      CREATE TABLE IF NOT EXISTS records (
        id SERIAL PRIMARY KEY,
        meal_type TEXT NOT NULL,
        sugar_level INTEGER NOT NULL,
        comment TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_records_meal_type ON records(meal_type);`;
  })();

  return schemaReady;
}

export async function listRecords(): Promise<RecordRow[]> {
  await ensureSchema();
  const sql = neon(getConnString());

  const rows = await sql`
    SELECT id, meal_type, sugar_level, comment,
           to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS created_at
    FROM records
    ORDER BY created_at ASC, id ASC;
  `;

  return rows as unknown as RecordRow[];
}

export async function insertRecord(input: {
  mealType: MealType;
  sugarLevel: number;
  comment?: string | null;
}): Promise<RecordRow> {
  await ensureSchema();
  const sql = neon(getConnString());

  const comment = input.comment?.trim() ? input.comment.trim() : null;

  const rows = await sql`
    INSERT INTO records (meal_type, sugar_level, comment)
    VALUES (${input.mealType}, ${input.sugarLevel}, ${comment})
    RETURNING id, meal_type, sugar_level, comment,
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS created_at;
  `;

  const typed = rows as unknown as RecordRow[];
  if (!typed[0]) throw new Error("Insert failed");
  return typed[0];
}

export async function deleteRecordById(id: number): Promise<{ deleted: boolean }>{
  await ensureSchema();
  const sql = neon(getConnString());

  const rows = await sql`
    DELETE FROM records
    WHERE id = ${id}
    RETURNING id;
  `;

  const deleted = Array.isArray(rows) && rows.length > 0;
  return { deleted };
}
