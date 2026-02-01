import { describe, expect, it } from "vitest";

// These tests require a real Postgres connection.
// In CI or local dev without Postgres configured, we skip.
const conn =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

describe("db", () => {
  it.skipIf(!conn)("inserts and lists records (requires POSTGRES_URL/DATABASE_URL)", async () => {
    const { insertRecord, listRecords } = await import("./db");

    // Insert 2 records
    await insertRecord({ mealType: "empty stomach", sugarLevel: 90, comment: "test" });
    await insertRecord({ mealType: "after meal", sugarLevel: 130, comment: null });

    const rows = await listRecords();
    expect(rows.length).toBeGreaterThanOrEqual(2);

    const last2 = rows.slice(-2);
    expect(last2[0]?.meal_type).toBeDefined();
    expect(last2[1]?.meal_type).toBeDefined();
  });
});
