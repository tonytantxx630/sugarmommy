import { insertRecord, listRecords, type MealType } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  const records = listRecords();
  return NextResponse.json(records);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const obj = (body ?? {}) as Record<string, unknown>;
  const mealType = obj.mealType as MealType | undefined;
  const sugarLevel = obj.sugarLevel;
  const comment = obj.comment;

  if (mealType !== "empty stomach" && mealType !== "after meal") {
    return badRequest("mealType must be 'empty stomach' or 'after meal'");
  }

  const sugarInt = Number(sugarLevel);
  if (!Number.isInteger(sugarInt)) {
    return badRequest("sugarLevel must be an integer");
  }

  if (sugarInt < 0 || sugarInt > 1000) {
    return badRequest("sugarLevel out of range");
  }

  const row = insertRecord({ mealType, sugarLevel: sugarInt, comment: typeof comment === "string" ? comment : null });
  return NextResponse.json(row, { status: 201 });
}
