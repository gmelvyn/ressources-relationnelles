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

async function uniqueSlug(title: string) {
  const base = slugify(title) || "ressource";
  let slug = base;
  let index = 1;

  while (await prisma.resource.findUnique({ where: { slug }, select: { id: true } })) {
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

export async function createResource(userId: string, userRole: string, input: CreateResourceInput) {
  const status = canModerate(userRole) || input.visibility === "PRIVATE" ? "PUBLISHED" : "PENDING_REVIEW";

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

export async function updateResourceProgress(userId: string, input: UpdateProgressInput) {
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
                : intent === "exploit"
                  ? { status: "EXPLOITED", exploitedAt: now }
                  : { status: "NOT_STARTED", completedAt: null, exploitedAt: null };

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

export async function createResourceComment(userId: string, input: CreateCommentInput) {
  return await prisma.resourceComment.create({
    data: {
      resourceId: input.resourceId,
      authorId: userId,
      parentId: input.parentId || null,
      content: input.content,
    },
  });
}

function fixtureMeta(): CatalogMeta {
  return {
    categories: categorySeeds.map((category) => ({ id: category.slug, ...category })),
    relationTypes: relationTypeSeeds.map((relation) => ({ id: relation.slug, ...relation })),
    resourceTypes: resourceTypeSeeds.map((type) => ({ id: type.slug, ...type })),
  };
}

function fixtureResource(resource: FixtureResource): ResourceListItem {
  const meta = fixtureMeta();
  const category = meta.categories.find((item) => item.slug === resource.categorySlug) ?? meta.categories[0];
  const type = meta.resourceTypes.find((item) => item.slug === resource.typeSlug) ?? meta.resourceTypes[0];

  return {
    id: resource.slug,
    title: resource.title,
    slug: resource.slug,
    summary: resource.summary,
    content: resource.content,
    sourceUrl: resource.sourceUrl,
    imageUrl: null,
    durationMinutes: resource.durationMinutes,
    difficulty: resource.difficulty,
    visibility: "PUBLIC",
    status: "PUBLISHED",
    viewCount: 0,
    shareCount: 0,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    category,
    type,
    relations: resource.relationSlugs
      .map((slug) => meta.relationTypes.find((relation) => relation.slug === slug))
      .filter((relation): relation is CatalogMeta["relationTypes"][number] => Boolean(relation)),
    author: null,
    commentsCount: 0,
    progress: null,
  };
}

function applyFixtureFilters(resources: ResourceListItem[], filters: ResourceFilters) {
  const search = filters.search?.trim().toLowerCase();

  return resources.filter((resource) => {
    if (search) {
      const haystack = `${resource.title} ${resource.summary} ${resource.content}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    if (filters.category && resource.category.slug !== filters.category) return false;
    if (filters.type && resource.type.slug !== filters.type) return false;
    if (filters.relation && !resource.relations.some((relation) => relation.slug === filters.relation)) {
      return false;
    }

    return true;
  });
}

function mapDbResource(resource: Awaited<ReturnType<typeof prisma.resource.findMany>>[number]): ResourceListItem {
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
    progress: Array<{ userId: string; status: string; isFavorite: boolean; isSaved: boolean }>;
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
    console.error("Catalogue indisponible, utilisation des données de démonstration", error);
  }

  return fixtureMeta();
}

export async function getResources(filters: ResourceFilters = {}, userId?: string | null) {
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
                  { title: { contains: filters.search, mode: "insensitive" as const } },
                  { summary: { contains: filters.search, mode: "insensitive" as const } },
                  { content: { contains: filters.search, mode: "insensitive" as const } },
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

    return resources.map(mapDbResource);
  } catch (error) {
    console.error("Ressources indisponibles, utilisation des données de démonstration", error);
  }

  return applyFixtureFilters(resourceSeeds.map(fixtureResource), filters);
}

export async function getResourceBySlug(slug: string, userId?: string | null) {
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

    if (!resource) return null;

    const canSeePrivate = userId && resource.authorId === userId;
    const canSee =
      resource.status === "PUBLISHED" &&
      (resource.visibility === "PUBLIC" ||
        (userId && ["RESTRICTED", "SHARED"].includes(resource.visibility)) ||
        canSeePrivate);

    if (!canSee) return null;

    return mapDbResource(resource);
  } catch (error) {
    console.error("Ressource indisponible, utilisation des données de démonstration", error);
  }

  return resourceSeeds.map(fixtureResource).find((resource) => resource.slug === slug) ?? null;
}

export async function getResourceComments(resourceId: string) {
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

export async function getAdminUsers() {
  try {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
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
