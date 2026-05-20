import { expect, test } from "@playwright/test";

async function refuseCookies(page: import("@playwright/test").Page) {
  const button = page.getByRole("button", { name: "Refuser" });
  if (await button.isVisible().catch(() => false)) {
    await button.click();
  }
}

test("filtre les ressources par catégorie Couple", async ({ page }) => {
  await page.goto("/resources");
  await refuseCookies(page);
  await page.locator('select[name="category"]').selectOption("couple");
  await page.getByRole("button", { name: /filtrer/i }).click();

  await expect(page).toHaveURL(/category=couple/);
  await expect(page.getByRole("heading", { name: "Une question vraie par jour" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Reconnaître ses émotions" })).toHaveCount(0);
});

test("affiche les médias intégrés dans le détail d'une ressource", async ({ page }) => {
  await page.goto("/resources/travail-salaire-profit", { waitUntil: "domcontentloaded" });
  await expect(page.locator('iframe[src*="youtube.com/embed"]')).toBeVisible();

  await page.goto("/resources/une-question-vraie-par-jour", { waitUntil: "domcontentloaded" });
  await expect(page.getByAltText("Une question vraie par jour")).toBeVisible();
});

test("redirige une ressource restreinte vers la connexion pour un visiteur anonyme", async ({ page }) => {
  await page.goto("/resources/carnet-de-dialogue-du-couple");
  await expect(page).toHaveURL(/\/login\?callbackUrl=\/resources\/carnet-de-dialogue-du-couple/);
});

test("affiche et mémorise le consentement RGPD", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/cookies nécessaires/i)).toBeVisible();
  await page.getByRole("button", { name: "Refuser" }).click();
  await expect(page.getByText(/cookies nécessaires/i)).toHaveCount(0);

  await page.reload();
  await expect(page.getByText(/cookies nécessaires/i)).toHaveCount(0);
});

test("génère un partage depuis le détail d'une ressource", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async () => undefined },
      configurable: true,
    });
  });

  await page.goto("/resources/une-question-vraie-par-jour");
  await refuseCookies(page);
  await page.getByRole("button", { name: "Partager" }).click();
  await expect(page.getByText("Lien de partage généré.")).toBeVisible();
});

test("reste lisible sur viewport mobile 375px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/resources");

  await expect(page.getByRole("heading", { name: "Ressources relationnelles" })).toBeVisible();
  await expect(page.getByPlaceholder("Rechercher une ressource")).toBeVisible();
  await expect(page.getByRole("button", { name: /filtrer/i })).toBeVisible();
});
