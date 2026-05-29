// src/app/api/user/current-user/route.js
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
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Return fresh data from DB (credits may have changed)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, credits: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Refresh session credits
    session.user.credits = user.credits;
    await session.save();

    return NextResponse.json(user);
  } catch (error) {
    console.error("Current user error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
