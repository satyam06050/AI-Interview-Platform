// src/app/page.jsx
import HomeClient from "@/components/HomeClient";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export default async function HomePage() {
  const cookieStore = await cookies();
  const session = await getIronSession(cookieStore, sessionOptions);
  const initialUser = session.user ?? null;

  return <HomeClient initialUser={initialUser} />;
}
