export const csrfCookieName = "rrb_csrf";
export const csrfHeaderName = "x-csrf-token";

const encoder = new TextEncoder();

function getCsrfSecret() {
  return (
    process.env.BETTER_AUTH_SECRET ??
    "local-recette-build-secret-change-in-real-env-0123456789"
  );
}

function bytesToBase64Url(bytes: Uint8Array) {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

async function signCsrfToken(token: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getCsrfSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(token));
  return bytesToBase64Url(new Uint8Array(signature));
}

export function createCsrfToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

export async function createCsrfCookieValue(token: string) {
  return signCsrfToken(token);
}

export async function verifyCsrfToken(token: string | null, cookieValue: string | undefined) {
  if (!token || !cookieValue) return false;
  const expected = await signCsrfToken(token);
  return constantTimeEqual(expected, cookieValue);
}
