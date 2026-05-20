import { expect, test } from "@playwright/test";

const publicPages = [
  { path: "/", text: "(RE)Sources Relationnelles", role: "heading" },
  { path: "/resources", text: "Ressources relationnelles", role: "heading" },
  { path: "/resources/une-question-vraie-par-jour", text: "Une question vraie par jour", role: "heading" },
  { path: "/help", text: "Repères d'utilisation et de confiance", role: "heading" },
  { path: "/login", text: "Bienvenue" },
  { path: "/signup", text: "Créer un compte" },
];

for (const { path, text, role } of publicPages) {
  test(`affiche la page publique ${path}`, async ({ page }) => {
    await page.goto(path);
    if (role === "heading") {
      await expect(page.getByRole("heading", { name: text })).toBeVisible();
    } else {
      await expect(page.getByText(text)).toBeVisible();
    }
  });
}

const protectedPages = [
  "/dashboard",
  "/dashboard/profile",
  "/dashboard/settings",
  "/resources/new",
  "/admin",
];

for (const path of protectedPages) {
  test(`redirige la page protégée ${path} vers la connexion`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText("Bienvenue")).toBeVisible();
  });
}
