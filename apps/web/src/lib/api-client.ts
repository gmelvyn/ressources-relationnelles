export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

let csrfTokenPromise: Promise<string> | null = null;

export async function getCsrfToken() {
  csrfTokenPromise ??= fetch("/api/csrf", {
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  })
    .then(async (response) => {
      const payload = await response.json().catch(() => null);
      if (!response.ok || typeof payload?.token !== "string") {
        throw new ApiClientError("Impossible de récupérer le jeton CSRF", response.status);
      }
      return payload.token;
    })
    .catch((error) => {
      csrfTokenPromise = null;
      throw error;
    });

  return csrfTokenPromise;
}

export async function apiRequest<T>(
  path: string,
  options: Omit<RequestInit, "body"> & { body?: unknown } = {},
) {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  const method = options.method?.toUpperCase() ?? "GET";

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    headers.set("x-csrf-token", await getCsrfToken());
  }

  const response = await fetch(path, {
    ...options,
    headers,
    body,
    credentials: "include",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiClientError(payload?.error ?? "Erreur réseau", response.status);
  }

  return payload as T;
}
