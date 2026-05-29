// src/app/api/interview/submit-answer/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { interviewId, questionIndex, answer, timeTaken } = await request.json();

    const interview = await prisma.interview.findUnique({ where: { id: interviewId } });
    if (!interview || interview.userId !== session.user.id) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const questions = interview.questions;
    const currentQuestion = questions[questionIndex];

    // AI evaluation
    const prompt = `
You are a strict but fair interviewer evaluating a candidate's answer.

Question: "${currentQuestion?.question}"
Candidate Answer: "${answer || "(no answer provided)"}"
Time Taken: ${timeTaken} seconds out of ${currentQuestion?.timeLimit} seconds

Evaluate the answer and return ONLY valid JSON:
{
  "score": <integer 1-10>,
  "feedback": "<2-3 sentences of constructive feedback mentioning strengths and areas to improve>"
}`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      }),
    });

    const aiData = await aiRes.json();
    const raw = aiData.choices?.[0]?.message?.content ?? "{}";

    let evaluation = { score: 5, feedback: "Answer received." };
    try {
      evaluation = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {}

    // Append answer and score to interview record
    const existingAnswers = Array.isArray(interview.answers) ? interview.answers : [];
    const existingScores = Array.isArray(interview.questionWiseScore) ? interview.questionWiseScore : [];

    const newAnswer = { questionIndex, answer, timeTaken, score: evaluation.score };
    const newScore = {
      question: currentQuestion?.question,
      score: evaluation.score,
      feedback: evaluation.feedback,
    };

    // Update by replacing index if already exists, else push
    const updatedAnswers = [...existingAnswers];
    updatedAnswers[questionIndex] = newAnswer;

    const updatedScores = [...existingScores];
    updatedScores[questionIndex] = newScore;

    await prisma.interview.update({
      where: { id: interviewId },
      data: { answers: updatedAnswers, questionWiseScore: updatedScores },
    });

    return NextResponse.json({ feedback: evaluation.feedback, score: evaluation.score });
  } catch (error) {
    console.error("Submit answer error:", error);
    return NextResponse.json({ error: "Failed to evaluate answer" }, { status: 500 });
  }
}
