import { NextResponse } from "next/server";
import { createCsrfCookieValue, createCsrfToken, csrfCookieName } from "@/lib/csrf";

export async function GET() {
  const token = createCsrfToken();
  const response = NextResponse.json({ token });

  response.cookies.set(csrfCookieName, await createCsrfCookieValue(token), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 30,
  });

  return response;
}
