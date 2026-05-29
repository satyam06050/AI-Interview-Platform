// src/lib/session.js
import { getIronSession } from "iron-session";

export const sessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: "interviewiq_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

/**
 * Server-side helper: get session from request & response objects
 * (for use in API Route Handlers)
 */
export async function getSession(req, res) {
  return getIronSession(req, res, sessionOptions);
}
