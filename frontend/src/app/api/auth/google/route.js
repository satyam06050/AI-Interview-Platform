// src/app/api/auth/google/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }

    // Upsert user in PostgreSQL
    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: { name, email, credits: 100 },
    });

    // Save user to session
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    session.user = { id: user.id, name: user.name, email: user.email, credits: user.credits };
    await session.save();

    return NextResponse.json({ id: user.id, name: user.name, email: user.email, credits: user.credits });
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
