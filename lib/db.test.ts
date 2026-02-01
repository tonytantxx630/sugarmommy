import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { openDb } from "./db";

describe("db", () => {
  it("inserts and lists records", () => {
    const dbPath = path.join(os.tmpdir(), `sugarmommy-test-${Date.now()}.db`);
    const db = openDb(dbPath);

    const insert = db.prepare(
      `INSERT INTO records (meal_type, sugar_level, comment, created_at) VALUES (?, ?, ?, ?)`
    );
    insert.run("empty stomach", 90, "test", new Date("2026-01-01T00:00:00.000Z").toISOString());
    insert.run("after meal", 130, null, new Date("2026-01-02T00:00:00.000Z").toISOString());

    const rows = db
      .prepare(`SELECT meal_type, sugar_level, comment, created_at FROM records ORDER BY datetime(created_at) ASC`)
      .all();

    expect(rows.length).toBe(2);
    expect(rows[0]).toMatchObject({ meal_type: "empty stomach", sugar_level: 90, comment: "test" });
    expect(rows[1]).toMatchObject({ meal_type: "after meal", sugar_level: 130, comment: null });

    db.close();
  });
});
