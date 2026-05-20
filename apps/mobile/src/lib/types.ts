export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  username?: string | null;
  bio?: string | null;
  role: string;
  emailVerified?: boolean;
};

export type CatalogItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  color?: string;
  supportsActivity?: boolean;
  supportsMessaging?: boolean;
};

export type CatalogMeta = {
  categories: CatalogItem[];
  relationTypes: CatalogItem[];
  resourceTypes: CatalogItem[];
};

export type ResourceListItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  sourceUrl?: string | null;
  imageUrl?: string | null;
  durationMinutes?: number | null;
  difficulty: string;
  visibility: string;
  status: string;
  viewCount: number;
  shareCount: number;
  createdAt: string;
  category: CatalogItem;
  type: CatalogItem;
  relations: CatalogItem[];
  author?: {
    id: string;
    name: string;
    email: string;
  } | null;
  commentsCount: number;
  progress?: {
    status: string;
    isFavorite: boolean;
    isSaved: boolean;
  } | null;
};

export type ResourceComment = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    name: string;
    email: string;
    image?: string | null;
  };
  replies: ResourceComment[];
};

export type DashboardPayload = {
  user: CurrentUser;
  data: {
    progress: ResourceListItem[];
    ownResources: ResourceListItem[];
  };
  counters: {
    favorites: number;
    saved: number;
    completed: number;
  };
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned?: boolean | null;
  createdAt: string;
};

export type AdminPayload = {
  user: CurrentUser;
  overview: {
    counters: {
      resources: number;
      users: number;
      comments: number;
      pendingResources: number;
    };
    topResources: ResourceListItem[];
  };
  pendingResources: ResourceListItem[];
  users: AdminUser[];
  permissions: {
    canAdminCatalog: boolean;
    canAdminUsers: boolean;
  };
};

export type MyResource = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  imageUrl?: string | null;
  status: string;
  visibility: string;
  createdAt: string;
  category: { name: string; color?: string };
};

export type MyComment = {
  id: string;
  content: string;
  createdAt: string;
  resource: { id: string; title: string; slug: string };
};

export type MyLike = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  imageUrl?: string | null;
  createdAt: string;
};
