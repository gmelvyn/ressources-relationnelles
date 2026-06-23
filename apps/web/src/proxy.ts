import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";
import { csrfCookieName, csrfHeaderName, verifyCsrfToken } from "@/lib/csrf";

const protectedPagePatterns = [
  /^\/dashboard(?:\/.*)?$/,
  /^\/resources\/new$/,
  /^\/admin(?:\/.*)?$/,
];

function isProtectedPage(pathname: string) {
  return protectedPagePatterns.some((pattern) => pattern.test(pathname));
}

function needsCsrfCheck(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/api/")) return false;
  if (pathname.startsWith("/api/auth/") || pathname === "/api/csrf") return false;
  return !["GET", "HEAD", "OPTIONS"].includes(request.method);
}

export async function proxy(request: NextRequest) {
  if (
    process.env.NODE_ENV === "production" &&
    request.headers.get("x-forwarded-proto") === "http"
  ) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  if (needsCsrfCheck(request)) {
    const isValidCsrf = await verifyCsrfToken(
      request.headers.get(csrfHeaderName),
      request.cookies.get(csrfCookieName)?.value,
    );

    if (!isValidCsrf) {
      return NextResponse.json({ error: "Jeton CSRF invalide" }, { status: 403 });
    }
  }

  if (isProtectedPage(request.nextUrl.pathname) && !getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
