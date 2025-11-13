import { NextResponse, type NextRequest } from "next/server";
import { getQuizById, getQuestionsByQuizId, updateQuiz, deleteQuiz } from "@/lib/db-quiz-question";
import { asyncWrapper } from "@/lib/middleware/asyncWrapper";

function extractQuizId(pathname: string) {
  const m = pathname.match(/\/quizzes\/([^/]+)$/i);
  return m?.[1];
}

export const GET = asyncWrapper(async (req: NextRequest) => {
  const id = extractQuizId(req.nextUrl.pathname);
  if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  const quiz = await getQuizById(id);
  if (!quiz) return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 });
  const questions = await getQuestionsByQuizId(id);
  return NextResponse.json({ success: true, data: { ...quiz, questions } });
});

export const PUT = asyncWrapper(async (req: NextRequest) => {
  const id = extractQuizId(req.nextUrl.pathname);
  if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  const body = await req.json().catch(() => ({}));
  const updated = await updateQuiz(id, { title: body?.title, description: body?.description ?? null });
  if (!updated) return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: updated });
});

export const DELETE = asyncWrapper(async (req: NextRequest) => {
  const id = extractQuizId(req.nextUrl.pathname);
  if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  const res = await deleteQuiz(id);
  if (!res.deleted) return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: { deleted: true } });
});
