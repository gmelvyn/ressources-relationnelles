import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  class ResourceCatalogValidationError extends Error {}

  return {
    revalidatePath: vi.fn(),
    getCurrentUser: vi.fn(),
    ResourceCatalogValidationError,
    resources: {
      createResource: vi.fn(),
      getAdminOverview: vi.fn(),
      getAdminStats: vi.fn(),
      getAdminUsers: vi.fn(),
      getCatalogMeta: vi.fn(),
      getDashboardData: vi.fn(),
      getResourceAccessBySlug: vi.fn(),
      getResourceComments: vi.fn(),
      getResources: vi.fn(),
      createResourceComment: vi.fn(),
      shareResource: vi.fn(),
      updateResourceProgress: vi.fn(),
    },
    admin: {
      createCategory: vi.fn(),
      deleteResource: vi.fn(),
      moderateComment: vi.fn(),
      moderateResource: vi.fn(),
      toggleUserStatus: vi.fn(),
      updateUserRole: vi.fn(),
    },
    prisma: {
      resourceComment: {
        delete: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      resource: {
        findMany: vi.fn(),
      },
      resourceProgress: {
        findMany: vi.fn(),
      },
      user: {
        delete: vi.fn(),
        update: vi.fn(),
      },
    },
    authGet: vi.fn(),
    authPost: vi.fn(),
  };
});

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/session", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@/lib/resources", () => ({
  ResourceCatalogValidationError: mocks.ResourceCatalogValidationError,
  ...mocks.resources,
}));

vi.mock("@/lib/admin", () => mocks.admin);

vi.mock("@/lib/prisma", () => ({
  default: mocks.prisma,
}));

vi.mock("@/lib/auth", () => ({
  auth: {},
}));

vi.mock("better-auth/next-js", () => ({
  toNextJsHandler: () => ({
    GET: mocks.authGet,
    POST: mocks.authPost,
  }),
}));

import * as adminCategoriesRoute from "../../src/app/api/admin/categories/route";
import * as adminCommentsRoute from "../../src/app/api/admin/comments/route";
import * as adminModerateRoute from "../../src/app/api/admin/moderate/route";
import * as adminOverviewRoute from "../../src/app/api/admin/overview/route";
import * as adminResourcesRoute from "../../src/app/api/admin/resources/route";
import * as adminStatsExportRoute from "../../src/app/api/admin/statistics/export/route";
import * as adminUsersRoute from "../../src/app/api/admin/users/route";
import * as authRoute from "../../src/app/api/auth/[...all]/route";
import * as dashboardRoute from "../../src/app/api/dashboard/route";
import * as meRoute from "../../src/app/api/me/route";
import * as meCommentsRoute from "../../src/app/api/me/comments/route";
import * as meLikesRoute from "../../src/app/api/me/likes/route";
import * as meProfileRoute from "../../src/app/api/me/profile/route";
import * as meResourcesRoute from "../../src/app/api/me/resources/route";
import * as resourcesRoute from "../../src/app/api/resources/route";
import * as resourceDetailRoute from "../../src/app/api/resources/[slug]/route";
import * as resourceCommentsRoute from "../../src/app/api/resources/comments/route";
import * as resourceProgressRoute from "../../src/app/api/resources/progress/route";
import * as resourceShareRoute from "../../src/app/api/resources/share/route";

function jsonRequest(url: string, body: unknown, init?: RequestInit) {
  return new Request(url, {
    method: init?.method ?? "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
}

async function readJson(response: Response) {
  return response.json() as Promise<unknown>;
}

const citizen = {
  id: "user-1",
  name: "Ada",
  email: "ada@example.com",
  role: "citizen",
};

const moderator = {
  ...citizen,
  role: "moderator",
};

const catalogAdmin = {
  ...citizen,
  role: "catalog_admin",
};

const superAdmin = {
  ...citizen,
  role: "super_admin",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getCurrentUser.mockResolvedValue(citizen);
});

describe("api route coverage", () => {
  it("expose les handlers Better Auth GET et POST", () => {
    expect(authRoute.GET).toBe(mocks.authGet);
    expect(authRoute.POST).toBe(mocks.authPost);
  });

  it("GET /api/me retourne l'utilisateur et ses permissions", async () => {
    mocks.getCurrentUser.mockResolvedValue(catalogAdmin);

    const response = await meRoute.GET();
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      user: catalogAdmin,
      permissions: {
        canModerate: true,
        canAdminCatalog: true,
        canAdminUsers: false,
      },
    });
  });

  it("GET /api/dashboard exige une session", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);

    const response = await dashboardRoute.GET();

    expect(response.status).toBe(401);
    expect(await readJson(response)).toEqual({ error: "Non autorise" });
  });

  it("GET /api/dashboard retourne les compteurs de progression", async () => {
    mocks.resources.getDashboardData.mockResolvedValue({
      progress: [
        { progress: { isFavorite: true, isSaved: false, status: "STARTED" } },
        { progress: { isFavorite: false, isSaved: true, status: "COMPLETED" } },
        { progress: { isFavorite: false, isSaved: false, status: "EXPLOITED" } },
      ],
    });

    const response = await dashboardRoute.GET();
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      counters: { favorites: 1, saved: 1, completed: 2 },
    });
    expect(mocks.resources.getDashboardData).toHaveBeenCalledWith(citizen.id);
  });

  it("GET /api/resources transmet les filtres de catalogue", async () => {
    mocks.resources.getCatalogMeta.mockResolvedValue({ categories: [] });
    mocks.resources.getResources.mockResolvedValue([{ id: "resource-1" }]);

    const response = await resourcesRoute.GET(
      new Request("http://local.test/api/resources?search=test&category=couple&type=video"),
    );
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body).toEqual({
      meta: { categories: [] },
      resources: [{ id: "resource-1" }],
    });
    expect(mocks.resources.getResources).toHaveBeenCalledWith(
      {
        search: "test",
        category: "couple",
        relation: undefined,
        type: "video",
        status: undefined,
      },
      citizen.id,
    );
  });

  it("POST /api/resources exige une session", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);

    const response = await resourcesRoute.POST(jsonRequest("http://local.test/api/resources", {}));

    expect(response.status).toBe(401);
  });

  it("POST /api/resources cree une ressource valide", async () => {
    mocks.resources.createResource.mockResolvedValue({ id: "resource-1" });

    const response = await resourcesRoute.POST(
      jsonRequest("http://local.test/api/resources", {
        title: "Titre",
        summary: "Resume",
        content: "Contenu",
        categoryId: "cat-1",
        typeId: "type-1",
        relationTypeIds: ["rel-1"],
      }),
    );

    expect(response.status).toBe(201);
    expect(await readJson(response)).toEqual({ id: "resource-1" });
    expect(mocks.resources.createResource).toHaveBeenCalled();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/resources");
  });

  it("GET /api/resources/[slug] refuse une ressource restreinte anonyme", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    mocks.resources.getResourceAccessBySlug.mockResolvedValue({
      resource: null,
      accessDenied: true,
    });

    const response = await resourceDetailRoute.GET(new Request("http://local.test"), {
      params: Promise.resolve({ slug: "private-resource" }),
    });

    expect(response.status).toBe(401);
    expect(await readJson(response)).toEqual({ error: "Connexion requise" });
  });

  it("GET /api/resources/[slug] retourne une ressource et ses commentaires", async () => {
    mocks.resources.getResourceAccessBySlug.mockResolvedValue({
      resource: { id: "resource-1", title: "Ressource" },
      accessDenied: false,
    });
    mocks.resources.getResourceComments.mockResolvedValue([{ id: "comment-1" }]);

    const response = await resourceDetailRoute.GET(new Request("http://local.test"), {
      params: Promise.resolve({ slug: "resource-slug" }),
    });

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({
      resource: { id: "resource-1", title: "Ressource" },
      comments: [{ id: "comment-1" }],
    });
  });

  it("GET /api/resources/comments exige un resourceId", async () => {
    const response = await resourceCommentsRoute.GET(
      new Request("http://local.test/api/resources/comments"),
    );

    expect(response.status).toBe(400);
  });

  it("GET /api/resources/comments retourne les commentaires", async () => {
    mocks.resources.getResourceComments.mockResolvedValue([{ id: "comment-1" }]);

    const response = await resourceCommentsRoute.GET(
      new Request("http://local.test/api/resources/comments?resourceId=resource-1"),
    );

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({ comments: [{ id: "comment-1" }] });
  });

  it("POST /api/resources/comments cree un commentaire authentifie", async () => {
    mocks.resources.createResourceComment.mockResolvedValue({ id: "comment-1" });

    const response = await resourceCommentsRoute.POST(
      jsonRequest("http://local.test/api/resources/comments", {
        resourceId: "resource-1",
        content: "Merci",
        slug: "resource-slug",
      }),
    );

    expect(response.status).toBe(201);
    expect(await readJson(response)).toEqual({ id: "comment-1" });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/resources/resource-slug");
  });

  it("DELETE /api/resources/comments supprime le commentaire de son auteur", async () => {
    mocks.prisma.resourceComment.findUnique.mockResolvedValue({
      id: "comment-1",
      authorId: citizen.id,
      resource: { slug: "resource-slug" },
    });

    const response = await resourceCommentsRoute.DELETE(
      jsonRequest("http://local.test/api/resources/comments", { commentId: "comment-1" }),
    );

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({ success: true });
    expect(mocks.prisma.resourceComment.delete).toHaveBeenCalledWith({
      where: { id: "comment-1" },
    });
  });

  it("POST /api/resources/progress met a jour la progression", async () => {
    mocks.resources.updateResourceProgress.mockResolvedValue({ resourceId: "resource-1" });

    const response = await resourceProgressRoute.POST(
      jsonRequest("http://local.test/api/resources/progress", {
        resourceId: "resource-1",
        intent: "favorite",
      }),
    );

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({ resourceId: "resource-1" });
  });

  it("POST /api/resources/share exige un resourceId", async () => {
    const response = await resourceShareRoute.POST(
      jsonRequest("http://local.test/api/resources/share", {}),
    );

    expect(response.status).toBe(400);
  });

  it("POST /api/resources/share partage une ressource", async () => {
    mocks.resources.shareResource.mockResolvedValue({ id: "resource-1", shareCount: 2 });

    const response = await resourceShareRoute.POST(
      jsonRequest("http://local.test/api/resources/share", { resourceId: "resource-1" }),
    );

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({ id: "resource-1", shareCount: 2 });
  });

  it("GET /api/me/comments exige une session", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);

    const response = await meCommentsRoute.GET();

    expect(response.status).toBe(401);
  });

  it("GET /api/me/comments retourne les commentaires de l'utilisateur", async () => {
    mocks.prisma.resourceComment.findMany.mockResolvedValue([{ id: "comment-1" }]);

    const response = await meCommentsRoute.GET();

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual([{ id: "comment-1" }]);
  });

  it("GET /api/me/resources retourne les ressources de l'utilisateur", async () => {
    mocks.prisma.resource.findMany.mockResolvedValue([{ id: "resource-1" }]);

    const response = await meResourcesRoute.GET();

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual([{ id: "resource-1" }]);
  });

  it("GET /api/me/likes retourne les ressources favorites", async () => {
    mocks.prisma.resourceProgress.findMany.mockResolvedValue([
      { resource: { id: "resource-1" } },
    ]);

    const response = await meLikesRoute.GET();

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual([{ id: "resource-1" }]);
  });

  it("PATCH /api/me/profile valide le nom affiche", async () => {
    const response = await meProfileRoute.PATCH(
      jsonRequest("http://local.test/api/me/profile", { name: " " }, { method: "PATCH" }),
    );

    expect(response.status).toBe(400);
  });

  it("PATCH /api/me/profile met a jour le profil", async () => {
    mocks.prisma.user.update.mockResolvedValue({ id: citizen.id, name: "Ada Lovelace" });

    const response = await meProfileRoute.PATCH(
      jsonRequest(
        "http://local.test/api/me/profile",
        { firstName: "Ada", lastName: "Lovelace", username: "@Ada!" },
        { method: "PATCH" },
      ),
    );

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({
      profile: { id: citizen.id, name: "Ada Lovelace" },
    });
    expect(mocks.prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ username: "ada" }),
      }),
    );
  });

  it("DELETE /api/me/profile exige la confirmation exacte", async () => {
    const response = await meProfileRoute.DELETE(
      jsonRequest("http://local.test/api/me/profile", { confirmation: "non" }, { method: "DELETE" }),
    );

    expect(response.status).toBe(400);
  });

  it("DELETE /api/me/profile supprime le compte confirme", async () => {
    const response = await meProfileRoute.DELETE(
      jsonRequest(
        "http://local.test/api/me/profile",
        { confirmation: "SUPPRIMER" },
        { method: "DELETE" },
      ),
    );

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({ success: true });
    expect(mocks.prisma.user.delete).toHaveBeenCalledWith({ where: { id: citizen.id } });
  });

  it("GET /api/admin/overview exige un moderateur", async () => {
    mocks.getCurrentUser.mockResolvedValue(citizen);

    const response = await adminOverviewRoute.GET();

    expect(response.status).toBe(403);
  });

  it("GET /api/admin/overview retourne la synthese admin", async () => {
    mocks.getCurrentUser.mockResolvedValue(superAdmin);
    mocks.resources.getAdminOverview.mockResolvedValue({ total: 1 });
    mocks.resources.getResources.mockResolvedValue([{ id: "resource-1" }]);
    mocks.resources.getAdminUsers.mockResolvedValue([{ id: "user-2" }]);

    const response = await adminOverviewRoute.GET();
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      overview: { total: 1 },
      pendingResources: [{ id: "resource-1" }],
      users: [{ id: "user-2" }],
      permissions: { canAdminCatalog: true, canAdminUsers: true },
    });
  });

  it("GET /api/admin/users retourne les utilisateurs pour un super-admin", async () => {
    mocks.getCurrentUser.mockResolvedValue(superAdmin);
    mocks.resources.getAdminUsers.mockResolvedValue([{ id: "user-2" }]);

    const response = await adminUsersRoute.GET();

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({ users: [{ id: "user-2" }] });
  });

  it("PATCH /api/admin/users refuse de modifier son propre statut", async () => {
    mocks.getCurrentUser.mockResolvedValue(superAdmin);

    const response = await adminUsersRoute.PATCH(
      jsonRequest(
        "http://local.test/api/admin/users",
        { userId: superAdmin.id, action: "suspend" },
        { method: "PATCH" },
      ),
    );

    expect(response.status).toBe(400);
  });

  it("PATCH /api/admin/users modifie un role", async () => {
    mocks.getCurrentUser.mockResolvedValue(superAdmin);
    mocks.admin.updateUserRole.mockResolvedValue({ id: "user-2", role: "moderator" });

    const response = await adminUsersRoute.PATCH(
      jsonRequest(
        "http://local.test/api/admin/users",
        { userId: "user-2", role: "moderator" },
        { method: "PATCH" },
      ),
    );

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({ id: "user-2", role: "moderator" });
  });

  it("POST /api/admin/categories cree une categorie", async () => {
    mocks.getCurrentUser.mockResolvedValue(catalogAdmin);
    mocks.admin.createCategory.mockResolvedValue({ id: "category-1" });

    const response = await adminCategoriesRoute.POST(
      jsonRequest("http://local.test/api/admin/categories", {
        name: "Couple",
        description: "Relations de couple",
      }),
    );

    expect(response.status).toBe(201);
    expect(await readJson(response)).toEqual({ id: "category-1" });
  });

  it("PATCH /api/admin/comments modere un commentaire", async () => {
    mocks.getCurrentUser.mockResolvedValue(moderator);
    mocks.admin.moderateComment.mockResolvedValue({ id: "comment-1", status: "HIDDEN" });

    const response = await adminCommentsRoute.PATCH(
      jsonRequest(
        "http://local.test/api/admin/comments",
        { commentId: "comment-1", action: "hide" },
        { method: "PATCH" },
      ),
    );

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({ id: "comment-1", status: "HIDDEN" });
  });

  it("DELETE /api/admin/comments supprime un commentaire", async () => {
    mocks.getCurrentUser.mockResolvedValue(moderator);

    const response = await adminCommentsRoute.DELETE(
      jsonRequest(
        "http://local.test/api/admin/comments",
        { commentId: "comment-1" },
        { method: "DELETE" },
      ),
    );

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({ success: true });
  });

  it("POST /api/admin/moderate modere une ressource", async () => {
    mocks.getCurrentUser.mockResolvedValue(moderator);
    mocks.admin.moderateResource.mockResolvedValue({ id: "resource-1", status: "PUBLISHED" });

    const response = await adminModerateRoute.POST(
      jsonRequest("http://local.test/api/admin/moderate", {
        resourceId: "resource-1",
        action: "publish",
      }),
    );

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({ id: "resource-1", status: "PUBLISHED" });
    expect(mocks.admin.moderateResource).toHaveBeenCalledWith(
      expect.objectContaining({ moderatorId: moderator.id }),
    );
  });

  it("DELETE /api/admin/resources supprime une ressource", async () => {
    mocks.getCurrentUser.mockResolvedValue(catalogAdmin);

    const response = await adminResourcesRoute.DELETE(
      jsonRequest(
        "http://local.test/api/admin/resources",
        { resourceId: "resource-1" },
        { method: "DELETE" },
      ),
    );

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({ success: true });
    expect(mocks.admin.deleteResource).toHaveBeenCalledWith("resource-1");
  });

  it("GET /api/admin/statistics/export genere un CSV", async () => {
    mocks.getCurrentUser.mockResolvedValue(moderator);
    mocks.resources.getAdminStats.mockResolvedValue({
      counters: {
        consultations: 10,
        searches: 2,
        creations: 3,
        shares: 4,
        comments: 5,
      },
    });

    const response = await adminStatsExportRoute.GET(
      new Request("http://local.test/api/admin/statistics/export?period=current-month"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/csv");
    expect(await response.text()).toContain('"Consultations";"10"');
  });
});
