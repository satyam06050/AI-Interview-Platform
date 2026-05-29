// src/app/api/interview/report/[id]/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interview = await prisma.interview.findUnique({
      where: { id: params.id },
    });

    if (!interview || interview.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: interview.id,
      _id: interview.id,
      role: interview.role,
      experience: interview.experience,
      mode: interview.mode,
      status: interview.status,
      finalScore: interview.finalScore,
      confidence: interview.confidence,
      communication: interview.communication,
      correctness: interview.correctness,
      questionWiseScore: interview.questionWiseScore,
      createdAt: interview.createdAt,
    });
  } catch (error) {
    console.error("Report fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}
