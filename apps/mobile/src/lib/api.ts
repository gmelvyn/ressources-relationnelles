import { Platform } from 'react-native';

import { authClient } from '@/lib/auth-client';
import { API_URL } from '@/lib/config';
import type {
  AdminPayload,
  CatalogMeta,
  CurrentUser,
  DashboardPayload,
  ResourceComment,
  ResourceListItem,
} from '@/lib/types';

export type ResourceFilters = {
  search?: string;
  category?: string;
  relation?: string;
  type?: string;
  status?: string;
};

export type ApiMe = {
  user: CurrentUser | null;
  permissions: {
    canModerate: boolean;
    canAdminCatalog: boolean;
    canAdminUsers: boolean;
  };
};

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function buildQuery(filters: ResourceFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }

  if (Platform.OS !== 'web') {
    const cookie = authClient.getCookie();
    if (cookie) headers.set('Cookie', cookie);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body,
    credentials: Platform.OS === 'web' ? 'include' : 'omit',
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(payload?.error ?? 'Erreur reseau', response.status);
  }

  return payload as T;
}

export function getMe() {
  return apiFetch<ApiMe>('/api/me');
}

export function getResources(filters: ResourceFilters = {}) {
  return apiFetch<{ meta: CatalogMeta; resources: ResourceListItem[] }>(
    `/api/resources${buildQuery(filters)}`,
  );
}

export function getResource(slug: string) {
  return apiFetch<{ resource: ResourceListItem; comments: ResourceComment[] }>(
    `/api/resources/${encodeURIComponent(slug)}`,
  );
}

export function createResource(input: {
  title: string;
  summary: string;
  content: string;
  categoryId: string;
  typeId: string;
  visibility: string;
  durationMinutes?: number;
  sourceUrl?: string;
  relationTypeIds: string[];
}) {
  return apiFetch<ResourceListItem>('/api/resources', {
    method: 'POST',
    body: input,
  });
}

export function createComment(input: { resourceId: string; content: string; parentId?: string }) {
  return apiFetch<ResourceComment>('/api/resources/comments', {
    method: 'POST',
    body: input,
  });
}

export function updateProgress(input: { resourceId: string; intent: string }) {
  return apiFetch('/api/resources/progress', {
    method: 'POST',
    body: input,
  });
}

export function getDashboard() {
  return apiFetch<DashboardPayload>('/api/dashboard');
}

export function getAdminOverview() {
  return apiFetch<AdminPayload>('/api/admin/overview');
}

export function moderateResource(input: { resourceId: string; action: string; reason?: string }) {
  return apiFetch('/api/admin/moderate', {
    method: 'POST',
    body: input,
  });
}

export function createCategory(input: { name: string; description: string; color?: string }) {
  return apiFetch('/api/admin/categories', {
    method: 'POST',
    body: input,
  });
}

export function updateUser(input: { userId: string; role?: string; action?: string }) {
  return apiFetch('/api/admin/users', {
    method: 'PATCH',
    body: input,
  });
}
