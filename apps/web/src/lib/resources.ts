import prisma from "@/lib/prisma";
import {
  categorySeeds,
  relationTypeSeeds,
  resourceSeeds,
  resourceTypeSeeds,
  type FixtureResource,
} from "@/lib/resource-fixtures";
import { slugify } from "@/lib/slugify";
import { canModerate } from "@/lib/permissions";

export type CatalogMeta = {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    color: string;
  }>;
  relationTypes: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
  }>;
  resourceTypes: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    supportsActivity: boolean;
    supportsMessaging: boolean;
  }>;
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
  createdAt: Date;
  category: CatalogMeta["categories"][number];
  type: CatalogMeta["resourceTypes"][number];
  relations: Array<CatalogMeta["relationTypes"][number]>;
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

export type ResourceFilters = {
  search?: string;
  category?: string;
  relation?: string;
  type?: string;
  status?: string;
};

export type AdminStatsFilters = {
  period?: "all" | "current-month" | "last-month";
  category?: string;
};

const includeResource = {
  category: true,
  type: true,
  author: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  relations: {
    include: {
      relationType: true,
    },
  },
  comments: {
    where: {
      status: "VISIBLE",
    },
    select: {
      id: true,
    },
  },
  progress: true,
};

const useFixtureCatalog = process.env.RECETTE_USE_FIXTURES === "1";

async function uniqueSlug(title: string) {
  const base = slugify(title) || "ressource";
  let slug = base;
  let index = 1;

  while (
    await prisma.resource.findUnique({ where: { slug }, select: { id: true } })
  ) {
    index += 1;
    slug = `${base}-${index}`;
  }

  return slug;
}

export type CreateResourceInput = {
  title: string;
  summary: string;
  content: string;
  categoryId: string;
  typeId: string;
  sourceUrl?: string;
  visibility?: string;
  durationMinutes?: number;
  relationTypeIds: string[];
};

function canSeeResource(resource: {
  authorId?: string | null;
  status: string;
  visibility: string;
}, userId?: string | null) {
  const isAuthor = Boolean(userId && resource.authorId === userId);

  return (
    isAuthor ||
    (resource.status === "PUBLISHED" &&
      (resource.visibility === "PUBLIC" ||
        Boolean(userId && ["RESTRICTED", "SHARED"].includes(resource.visibility))))
  );
}

export class ResourceCatalogValidationError extends Error {
  constructor(
    message = "La catégorie, le type ou la relation sélectionnée n'existe plus.",
  ) {
    super(message);
    this.name = "ResourceCatalogValidationError";
  }
}

async function validateResourceCatalog(
  input: Pick<CreateResourceInput, "categoryId" | "typeId" | "relationTypeIds">,
) {
  const [category, type, relationTypes] = await Promise.all([
    prisma.resourceCategory.findFirst({
      where: { id: input.categoryId, isActive: true },
      select: { id: true },
    }),
    prisma.resourceType.findFirst({
      where: { id: input.typeId, isActive: true },
      select: { id: true },
    }),
    prisma.relationType.findMany({
      where: { id: { in: input.relationTypeIds }, isActive: true },
      select: { id: true },
    }),
  ]);

  const uniqueRelationTypeIds = new Set(input.relationTypeIds);

  if (
    !category ||
    !type ||
    relationTypes.length !== uniqueRelationTypeIds.size
  ) {
    throw new ResourceCatalogValidationError();
  }
}

export async function createResource(
  userId: string,
  userRole: string,
  input: CreateResourceInput,
) {
  const status =
    canModerate(userRole) || input.visibility === "PRIVATE"
      ? "PUBLISHED"
      : "PENDING_REVIEW";
  await validateResourceCatalog(input);

  return await prisma.resource.create({
    data: {
      title: input.title,
      slug: await uniqueSlug(input.title),
      summary: input.summary,
      content: input.content,
      sourceUrl: input.sourceUrl || null,
      durationMinutes: input.durationMinutes || null,
      visibility: input.visibility || "PUBLIC",
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      categoryId: input.categoryId,
      typeId: input.typeId,
      authorId: userId,
      relations: {
        create: input.relationTypeIds.map((relationTypeId) => ({
          relationTypeId,
        })),
      },
    },
  });
}

export type UpdateProgressInput = {
  resourceId: string;
  intent: string;
};

export async function updateResourceProgress(
  userId: string,
  input: UpdateProgressInput,
) {
  const { resourceId, intent } = input;
  const now = new Date();
  const data =
    intent === "favorite"
      ? { isFavorite: true }
      : intent === "unfavorite"
        ? { isFavorite: false }
        : intent === "save"
          ? { isSaved: true }
          : intent === "unsave"
            ? { isSaved: false }
            : intent === "start"
              ? { status: "IN_PROGRESS", startedAt: now }
              : intent === "complete"
                ? { status: "COMPLETED", completedAt: now, exploitedAt: now }
                : intent === "uncomplete"
                  ? {
                      status: "NOT_STARTED",
                      completedAt: null,
                      exploitedAt: null,
                    }
                  : intent === "exploit"
                    ? { status: "EXPLOITED", exploitedAt: now }
                    : {
                        status: "NOT_STARTED",
                        completedAt: null,
                        exploitedAt: null,
                      };

  return await prisma.resourceProgress.upsert({
    where: {
      userId_resourceId: {
        userId,
        resourceId,
      },
    },
    create: {
      userId,
      resourceId,
      ...data,
    },
    update: data,
  });
}

export type CreateCommentInput = {
  resourceId: string;
  parentId?: string;
  content: string;
};

export async function createResourceComment(
  userId: string,
  input: CreateCommentInput,
) {
  return await prisma.resourceComment.create({
    data: {
      resourceId: input.resourceId,
      authorId: userId,
      parentId: input.parentId || null,
      content: input.content,
      status: "PENDING_REVIEW",
    },
  });
}

function fixtureMeta(): CatalogMeta {
  return {
    categories: categorySeeds.map((category) => ({
      id: category.slug,
      ...category,
    })),
    relationTypes: relationTypeSeeds.map((relation) => ({
      id: relation.slug,
      ...relation,
    })),
    resourceTypes: resourceTypeSeeds.map((type) => ({
      id: type.slug,
      ...type,
    })),
  };
}

function fixtureResource(resource: FixtureResource): ResourceListItem {
  const meta = fixtureMeta();
  const category =
    meta.categories.find((item) => item.slug === resource.categorySlug) ??
    meta.categories[0];
  const type =
    meta.resourceTypes.find((item) => item.slug === resource.typeSlug) ??
    meta.resourceTypes[0];

  return {
    id: resource.slug,
    title: resource.title,
    slug: resource.slug,
    summary: resource.summary,
    content: resource.content,
    sourceUrl: resource.sourceUrl,
    imageUrl: resource.imageUrl ?? null,
    durationMinutes: resource.durationMinutes,
    difficulty: resource.difficulty,
    visibility: resource.visibility ?? "PUBLIC",
    status: resource.status ?? "PUBLISHED",
    viewCount: 0,
    shareCount: 0,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    category,
    type,
    relations: resource.relationSlugs
      .map((slug) =>
        meta.relationTypes.find((relation) => relation.slug === slug),
      )
      .filter((relation): relation is CatalogMeta["relationTypes"][number] =>
        Boolean(relation),
      ),
    author: null,
    commentsCount: 0,
    progress: null,
  };
}

function applyFixtureFilters(
  resources: ResourceListItem[],
  filters: ResourceFilters,
) {
  const search = filters.search?.trim().toLowerCase();

  return resources.filter((resource) => {
    if (search) {
      const haystack =
        `${resource.title} ${resource.summary} ${resource.content}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    if (filters.category && resource.category.slug !== filters.category)
      return false;
    if (filters.type && resource.type.slug !== filters.type) return false;
    if (
      filters.relation &&
      !resource.relations.some((relation) => relation.slug === filters.relation)
    ) {
      return false;
    }

    return true;
  });
}

function mapDbResource(
  resource: Awaited<ReturnType<typeof prisma.resource.findMany>>[number],
): ResourceListItem {
  const record = resource as unknown as {
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
    createdAt: Date;
    category: ResourceListItem["category"];
    type: ResourceListItem["type"];
    relations: Array<{ relationType: ResourceListItem["relations"][number] }>;
    author?: ResourceListItem["author"];
    comments: Array<{ id: string }>;
    progress: Array<{
      userId: string;
      status: string;
      isFavorite: boolean;
      isSaved: boolean;
    }>;
  };

  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    summary: record.summary,
    content: record.content,
    sourceUrl: record.sourceUrl,
    imageUrl: record.imageUrl,
    durationMinutes: record.durationMinutes,
    difficulty: record.difficulty,
    visibility: record.visibility,
    status: record.status,
    viewCount: record.viewCount,
    shareCount: record.shareCount,
    createdAt: record.createdAt,
    category: record.category,
    type: record.type,
    relations: record.relations.map((relation) => relation.relationType),
    author: record.author,
    commentsCount: record.comments.length,
    progress: record.progress[0]
      ? {
          status: record.progress[0].status,
          isFavorite: record.progress[0].isFavorite,
          isSaved: record.progress[0].isSaved,
        }
      : null,
  };
}

export async function getCatalogMeta(): Promise<CatalogMeta> {
  if (useFixtureCatalog) {
    return fixtureMeta();
  }

  try {
    const [categories, relationTypes, resourceTypes] = await Promise.all([
      prisma.resourceCategory.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
      prisma.relationType.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
      prisma.resourceType.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
    ]);

    if (categories.length && relationTypes.length && resourceTypes.length) {
      return { categories, relationTypes, resourceTypes };
    }
  } catch (error) {
    console.error(
      "Catalogue indisponible, utilisation des données de démonstration",
      error,
    );
  }

  return fixtureMeta();
}

export async function getWritableCatalogMeta(): Promise<CatalogMeta | null> {
  if (useFixtureCatalog) {
    return null;
  }

  const [categories, relationTypes, resourceTypes] = await Promise.all([
    prisma.resourceCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.relationType.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.resourceType.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!categories.length || !relationTypes.length || !resourceTypes.length) {
    return null;
  }

  return { categories, relationTypes, resourceTypes };
}

export async function getResources(
  filters: ResourceFilters = {},
  userId?: string | null,
) {
  if (useFixtureCatalog) {
    return applyFixtureFilters(resourceSeeds.map(fixtureResource), filters).filter(
      (resource) => canSeeResource(resource, userId),
    );
  }

  try {
    const visibility = userId ? ["PUBLIC", "RESTRICTED", "SHARED"] : ["PUBLIC"];
    const where = {
      status: filters.status ?? "PUBLISHED",
      AND: [
        {
          OR: [
            { visibility: { in: visibility } },
            ...(userId ? [{ visibility: "PRIVATE", authorId: userId }] : []),
          ],
        },
        ...(filters.search
          ? [
              {
                OR: [
                  {
                    title: {
                      contains: filters.search,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    summary: {
                      contains: filters.search,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    content: {
                      contains: filters.search,
                      mode: "insensitive" as const,
                    },
                  },
                ],
              },
            ]
          : []),
        ...(filters.category ? [{ category: { slug: filters.category } }] : []),
        ...(filters.type ? [{ type: { slug: filters.type } }] : []),
        ...(filters.relation
          ? [
              {
                relations: {
                  some: {
                    relationType: {
                      slug: filters.relation,
                    },
                  },
                },
              },
            ]
          : []),
      ],
    };

    const resources = await prisma.resource.findMany({
      where,
      include: {
        ...includeResource,
        progress: {
          where: userId ? { userId } : { userId: "__anonymous__" },
        },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });

    if (filters.search && resources.length) {
      await prisma.resource.updateMany({
        where: { id: { in: resources.map((resource) => resource.id) } },
        data: { searchCount: { increment: 1 } },
      });
    }

    return resources.map(mapDbResource);
  } catch (error) {
    console.error(
      "Ressources indisponibles, utilisation des données de démonstration",
      error,
    );
  }

  return applyFixtureFilters(resourceSeeds.map(fixtureResource), filters).filter(
    (resource) => canSeeResource(resource, userId),
  );
}

export async function getResourceBySlug(slug: string, userId?: string | null) {
  const access = await getResourceAccessBySlug(slug, userId);
  return access.resource;
}

export async function getResourceAccessBySlug(
  slug: string,
  userId?: string | null,
): Promise<{ resource: ResourceListItem | null; accessDenied: boolean }> {
  if (useFixtureCatalog) {
    const fixture =
      resourceSeeds
        .map(fixtureResource)
        .find((resource) => resource.slug === slug) ?? null;

    if (!fixture) return { resource: null, accessDenied: false };
    if (!canSeeResource(fixture, userId)) {
      return { resource: null, accessDenied: true };
    }

    return { resource: fixture, accessDenied: false };
  }

  try {
    const resource = await prisma.resource.findUnique({
      where: { slug },
      include: {
        ...includeResource,
        progress: {
          where: userId ? { userId } : { userId: "__anonymous__" },
        },
      },
    });

    if (!resource) return { resource: null, accessDenied: false };

    if (!canSeeResource(resource, userId)) {
      return { resource: null, accessDenied: true };
    }

    const updatedResource = await prisma.resource.update({
      where: { id: resource.id },
      data: { viewCount: { increment: 1 } },
      include: {
        ...includeResource,
        progress: {
          where: userId ? { userId } : { userId: "__anonymous__" },
        },
      },
    });

    return { resource: mapDbResource(updatedResource), accessDenied: false };
  } catch (error) {
    console.error(
      "Ressource indisponible, utilisation des données de démonstration",
      error,
    );
  }

  const fixture =
    resourceSeeds.map(fixtureResource).find((resource) => resource.slug === slug) ??
    null;

  if (!fixture) return { resource: null, accessDenied: false };
  if (!canSeeResource(fixture, userId)) {
    return { resource: null, accessDenied: true };
  }

  return { resource: fixture, accessDenied: false };
}

export async function getResourceComments(resourceId: string) {
  if (useFixtureCatalog) {
    return [];
  }

  try {
    return await prisma.resourceComment.findMany({
      where: {
        resourceId,
        parentId: null,
        status: "VISIBLE",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        replies: {
          where: { status: "VISIBLE" },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Commentaires indisponibles", error);
    return [];
  }
}

export async function getDashboardData(userId: string) {
  try {
    const [progress, ownResources] = await Promise.all([
      prisma.resourceProgress.findMany({
        where: { userId },
        include: {
          resource: {
            include: {
              category: true,
              type: true,
              relations: { include: { relationType: true } },
              comments: { where: { status: "VISIBLE" }, select: { id: true } },
              author: { select: { id: true, name: true, email: true } },
              progress: { where: { userId } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.resource.findMany({
        where: { authorId: userId },
        include: {
          category: true,
          type: true,
          relations: { include: { relationType: true } },
          comments: { where: { status: "VISIBLE" }, select: { id: true } },
          author: { select: { id: true, name: true, email: true } },
          progress: { where: { userId } },
        },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return {
      progress: progress.map((item) => mapDbResource(item.resource)),
      ownResources: ownResources.map(mapDbResource),
    };
  } catch (error) {
    console.error("Tableau de bord indisponible", error);
    return {
      progress: [],
      ownResources: [],
    };
  }
}

export async function getAdminOverview() {
  if (useFixtureCatalog) {
    const fixtures = resourceSeeds.map(fixtureResource);

    return {
      counters: {
        resources: fixtures.length,
        users: 0,
        comments: 0,
        pendingResources: 0,
      },
      topResources: fixtures.slice(0, 6),
    };
  }

  try {
    const [resources, users, comments, pendingResources] = await Promise.all([
      prisma.resource.count(),
      prisma.user.count(),
      prisma.resourceComment.count(),
      prisma.resource.count({ where: { status: "PENDING_REVIEW" } }),
    ]);

    const topResources = await prisma.resource.findMany({
      take: 6,
      include: {
        category: true,
        type: true,
        relations: { include: { relationType: true } },
        comments: { where: { status: "VISIBLE" }, select: { id: true } },
        author: { select: { id: true, name: true, email: true } },
        progress: { where: { userId: "__admin__" } },
      },
      orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
    });

    return {
      counters: { resources, users, comments, pendingResources },
      topResources: topResources.map(mapDbResource),
    };
  } catch (error) {
    console.error("Administration indisponible", error);
    const fixtures = resourceSeeds.map(fixtureResource);
    return {
      counters: {
        resources: fixtures.length,
        users: 0,
        comments: 0,
        pendingResources: 0,
      },
      topResources: fixtures.slice(0, 6),
    };
  }
}

export async function shareResource(resourceId: string) {
  if (useFixtureCatalog) {
    return { id: resourceId, shareCount: 1 };
  }

  return await prisma.resource.update({
    where: { id: resourceId },
    data: { shareCount: { increment: 1 } },
    select: { id: true, shareCount: true },
  });
}

export async function getPendingComments() {
  if (useFixtureCatalog) {
    return [];
  }

  try {
    return await prisma.resourceComment.findMany({
      where: { status: "PENDING_REVIEW" },
      include: {
        resource: { select: { id: true, title: true, slug: true } },
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 30,
    });
  } catch (error) {
    console.error("Commentaires en modération indisponibles", error);
    return [];
  }
}

function getStatsDateFilter(period: AdminStatsFilters["period"]) {
  const normalized = period ?? "all";
  const now = new Date();

  if (normalized === "current-month") {
    return {
      gte: new Date(now.getFullYear(), now.getMonth(), 1),
      lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
    };
  }

  if (normalized === "last-month") {
    return {
      gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      lt: new Date(now.getFullYear(), now.getMonth(), 1),
    };
  }

  return null;
}

export async function getAdminStats(filters: AdminStatsFilters = {}) {
  if (useFixtureCatalog) {
    const resources = applyFixtureFilters(resourceSeeds.map(fixtureResource), {
      category: filters.category,
    });

    return {
      counters: {
        consultations: resources.reduce((total, resource) => total + resource.viewCount, 0),
        searches: 0,
        creations: resources.length,
        shares: resources.reduce((total, resource) => total + resource.shareCount, 0),
        comments: 0,
      },
      topResources: resources.slice(0, 6),
    };
  }

  const createdAt = getStatsDateFilter(filters.period);
  const where = {
    ...(createdAt ? { createdAt } : {}),
    ...(filters.category ? { category: { slug: filters.category } } : {}),
  };

  try {
    const [summary, createdResources, comments, topResources] = await Promise.all([
      prisma.resource.aggregate({
        where,
        _sum: {
          viewCount: true,
          searchCount: true,
          shareCount: true,
        },
      }),
      prisma.resource.count({ where }),
      prisma.resourceComment.count({
        where: {
          ...(createdAt ? { createdAt } : {}),
          ...(filters.category
            ? { resource: { category: { slug: filters.category } } }
            : {}),
        },
      }),
      prisma.resource.findMany({
        where,
        take: 6,
        include: {
          category: true,
          type: true,
          relations: { include: { relationType: true } },
          comments: { where: { status: "VISIBLE" }, select: { id: true } },
          author: { select: { id: true, name: true, email: true } },
          progress: { where: { userId: "__admin__" } },
        },
        orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
      }),
    ]);

    return {
      counters: {
        consultations: summary._sum.viewCount ?? 0,
        searches: summary._sum.searchCount ?? 0,
        creations: createdResources,
        shares: summary._sum.shareCount ?? 0,
        comments,
      },
      topResources: topResources.map(mapDbResource),
    };
  } catch (error) {
    console.error("Statistiques indisponibles", error);
    const resources = applyFixtureFilters(resourceSeeds.map(fixtureResource), {
      category: filters.category,
    });

    return {
      counters: {
        consultations: resources.reduce((total, resource) => total + resource.viewCount, 0),
        searches: 0,
        creations: resources.length,
        shares: resources.reduce((total, resource) => total + resource.shareCount, 0),
        comments: 0,
      },
      topResources: resources.slice(0, 6),
    };
  }
}

export async function getAdminUsers() {
  if (useFixtureCatalog) {
    return [];
  }

  try {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        twoFactorEnabled: true,
        banned: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  } catch (error) {
    console.error("Utilisateurs indisponibles", error);
    return [];
  }
}
