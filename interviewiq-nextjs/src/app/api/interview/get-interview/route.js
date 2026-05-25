// src/app/api/interview/get-interview/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interviews = await prisma.interview.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        role: true,
        experience: true,
        mode: true,
        status: true,
        finalScore: true,
        createdAt: true,
      },
    });

    // Map id → _id for backward-compat with existing client components
    const mapped = interviews.map((i) => ({ ...i, _id: i.id }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Get interviews error:", error);
    return NextResponse.json({ error: "Failed to fetch interviews" }, { status: 500 });
  }
}
