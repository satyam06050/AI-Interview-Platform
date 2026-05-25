// src/app/api/interview/resume/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("resume");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read PDF buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Dynamically import pdf-parse (CJS module)
    const pdfParse = (await import("pdf-parse")).default;
    const pdfData = await pdfParse(buffer);
    const resumeText = pdfData.text;

    // Use OpenAI to extract structured info
    const aiPrompt = `
Extract structured information from this resume text and return ONLY valid JSON.

Resume:
${resumeText.slice(0, 4000)}

Return JSON with this exact shape:
{
  "role": "most recent or primary job title",
  "experience": "total years of experience as a string, e.g. '3 years'",
  "skills": ["skill1", "skill2", ...],
  "projects": ["project name 1", "project name 2", ...]
}
Only return the JSON object, no markdown or extra text.`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: aiPrompt }],
        temperature: 0.3,
      }),
    });

    const aiData = await aiRes.json();
    const raw = aiData.choices?.[0]?.message?.content ?? "{}";

    let parsed = {};
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      parsed = {};
    }

    return NextResponse.json({
      role: parsed.role ?? "",
      experience: parsed.experience ?? "",
      skills: parsed.skills ?? [],
      projects: parsed.projects ?? [],
      resumeText,
    });
  } catch (error) {
    console.error("Resume parse error:", error);
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 });
  }
}
