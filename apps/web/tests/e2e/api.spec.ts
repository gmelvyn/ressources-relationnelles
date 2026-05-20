import { expect, test } from "@playwright/test";

test("couvre les endpoints API publics en mode fixtures", async ({ request }) => {
  const me = await request.get("/api/me");
  expect(me.status()).toBe(200);
  await expect(me).toBeOK();

  const resources = await request.get("/api/resources?category=couple");
  await expect(resources).toBeOK();
  const resourcesBody = await resources.json();
  expect(resourcesBody.resources).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ slug: "une-question-vraie-par-jour" }),
    ]),
  );

  const resource = await request.get("/api/resources/une-question-vraie-par-jour");
  await expect(resource).toBeOK();
  expect(await resource.json()).toEqual(
    expect.objectContaining({
      resource: expect.objectContaining({ slug: "une-question-vraie-par-jour" }),
      comments: [],
    }),
  );

  const restrictedResource = await request.get("/api/resources/carnet-de-dialogue-du-couple");
  expect(restrictedResource.status()).toBe(401);

  const missingResource = await request.get("/api/resources/ressource-inconnue");
  expect(missingResource.status()).toBe(404);

  const commentsMissingId = await request.get("/api/resources/comments");
  expect(commentsMissingId.status()).toBe(400);

  const comments = await request.get("/api/resources/comments?resourceId=une-question-vraie-par-jour");
  await expect(comments).toBeOK();
  expect(await comments.json()).toEqual({ comments: [] });

  const shareMissingId = await request.post("/api/resources/share", { data: {} });
  expect(shareMissingId.status()).toBe(400);

  const share = await request.post("/api/resources/share", {
    data: { resourceId: "une-question-vraie-par-jour" },
  });
  await expect(share).toBeOK();
  expect(await share.json()).toEqual({ id: "une-question-vraie-par-jour", shareCount: 1 });

  const authSession = await request.get("/api/auth/session");
  expect(authSession.status()).toBeLessThan(500);
});

test("couvre les endpoints API protégés sans session", async ({ request }) => {
  const unauthorizedRequests = [
    request.get("/api/dashboard"),
    request.get("/api/me/comments"),
    request.get("/api/me/resources"),
    request.get("/api/me/likes"),
    request.post("/api/resources", { data: {} }),
    request.post("/api/resources/comments", { data: {} }),
    request.delete("/api/resources/comments", { data: {} }),
    request.post("/api/resources/progress", { data: {} }),
    request.patch("/api/me/profile", { data: {} }),
    request.delete("/api/me/profile", { data: {} }),
  ];

  for (const responsePromise of unauthorizedRequests) {
    const response = await responsePromise;
    expect(response.status()).toBe(401);
  }

  const forbiddenRequests = [
    request.get("/api/admin/overview"),
    request.get("/api/admin/users"),
    request.patch("/api/admin/users", { data: {} }),
    request.delete("/api/admin/resources", { data: {} }),
    request.patch("/api/admin/comments", { data: {} }),
    request.delete("/api/admin/comments", { data: {} }),
    request.post("/api/admin/categories", { data: {} }),
    request.post("/api/admin/moderate", { data: {} }),
    request.get("/api/admin/statistics/export"),
  ];

  for (const responsePromise of forbiddenRequests) {
    const response = await responsePromise;
    expect(response.status()).toBe(403);
  }
});
