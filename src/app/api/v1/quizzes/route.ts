import { NextRequest, NextResponse } from "next/server";
import { getQuizzes, createQuiz } from "@/lib/db-quiz-question";
import { asyncWrapper } from "@/lib/middleware/asyncWrapper";

async function handleGET() {
  const rows = await getQuizzes();
  return NextResponse.json({ success: true, data: rows });
}

function toSlug(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_");
}

async function handlePOST(request: NextRequest) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const title = (body?.title || "").trim();
  if (!title) return NextResponse.json({ success: false, error: "Missing title" }, { status: 400 });

  const id = body?.id ? toSlug(String(body.id)) : toSlug(title);
  try {
    const created = await createQuiz({ id, title, description: body?.description ?? null });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: any) {
    // common PG errors
    if (err?.code === "23505") {
      return NextResponse.json({ success: false, error: `Quiz id '${id}' already exists` }, { status: 409 });
    }
    const msg = err?.detail || err?.message || "Internal Server Error";
    console.error("[API] create quiz error:", { code: err?.code, message: err?.message, detail: err?.detail });
    return NextResponse.json({ success: false, error: msg, code: err?.code }, { status: 500 });
  }
}

export const GET = asyncWrapper(handleGET);
export const POST = asyncWrapper(handlePOST);
