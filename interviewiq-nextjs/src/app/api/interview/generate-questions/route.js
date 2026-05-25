// src/app/api/interview/generate-questions/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import prisma from "@/lib/prisma";

const CREDIT_COST = 10;

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, experience, mode, resumeText, projects, skills } = await request.json();

    // Check credits
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || user.credits < CREDIT_COST) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }

    // Build AI prompt
    const contextParts = [];
    if (resumeText) contextParts.push(`Resume context:\n${resumeText.slice(0, 2000)}`);
    if (projects?.length) contextParts.push(`Projects: ${projects.join(", ")}`);
    if (skills?.length) contextParts.push(`Skills: ${skills.join(", ")}`);

    const prompt = `
You are an expert interviewer. Generate 5 interview questions for:
- Role: ${role}
- Experience: ${experience}
- Mode: ${mode} Interview
${contextParts.length ? "\n" + contextParts.join("\n") : ""}

Rules:
- Mix easy (2), medium (2), and hard (1) questions
- Last question should be the hardest
- For Technical mode: focus on coding, system design, data structures
- For HR mode: focus on behavior, teamwork, communication
- Each question should have a realistic timeLimit in seconds (60-180)

Return ONLY valid JSON array:
[
  { "question": "...", "difficulty": "easy|medium|hard", "timeLimit": 90 },
  ...
]`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const aiData = await aiRes.json();
    const raw = aiData.choices?.[0]?.message?.content ?? "[]";

    let questions = [];
    try {
      questions = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      questions = [];
    }

    // Deduct credits
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: CREDIT_COST } },
    });

    // Create interview record in PostgreSQL
    const interview = await prisma.interview.create({
      data: {
        userId: user.id,
        role,
        experience,
        mode,
        status: "ongoing",
        questions,
        answers: [],
        questionWiseScore: [],
      },
    });

    // Update session credits
    session.user.credits = updatedUser.credits;
    await session.save();

    return NextResponse.json({
      interviewId: interview.id,
      questions,
      userName: user.name,
      creditsLeft: updatedUser.credits,
    });
  } catch (error) {
    console.error("Generate questions error:", error);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}
