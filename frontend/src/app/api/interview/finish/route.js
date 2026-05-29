// src/app/api/interview/finish/route.js
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

    const { interviewId } = await request.json();

    const interview = await prisma.interview.findUnique({ where: { id: interviewId } });
    if (!interview || interview.userId !== session.user.id) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const questionWiseScore = Array.isArray(interview.questionWiseScore)
      ? interview.questionWiseScore
      : [];

    // Calculate aggregate scores
    const scores = questionWiseScore.map((q) => q.score || 0);
    const finalScore = scores.length
      ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
      : 0;

    // Use AI to compute confidence/communication/correctness
    const prompt = `
Given these interview question scores and feedback:
${JSON.stringify(questionWiseScore, null, 2)}

Estimate aggregate scores (0-10) for:
- confidence: tone, decisiveness
- communication: clarity, structure
- correctness: technical/factual accuracy

Return ONLY valid JSON:
{ "confidence": <float>, "communication": <float>, "correctness": <float> }`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    const aiData = await aiRes.json();
    const raw = aiData.choices?.[0]?.message?.content ?? "{}";
    let metrics = { confidence: finalScore, communication: finalScore, correctness: finalScore };
    try {
      metrics = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {}

    const updated = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        status: "completed",
        finalScore,
        confidence: metrics.confidence,
        communication: metrics.communication,
        correctness: metrics.correctness,
      },
    });

    return NextResponse.json({
      id: updated.id,
      role: updated.role,
      experience: updated.experience,
      mode: updated.mode,
      finalScore: updated.finalScore,
      confidence: updated.confidence,
      communication: updated.communication,
      correctness: updated.correctness,
      questionWiseScore,
      status: updated.status,
      createdAt: updated.createdAt,
    });
  } catch (error) {
    console.error("Finish interview error:", error);
    return NextResponse.json({ error: "Failed to finish interview" }, { status: 500 });
  }
}
