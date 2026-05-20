import { describe, expect, it } from "vitest";
import { categorySeeds, resourceSeeds } from "@/lib/resource-fixtures";

describe("resource fixtures", () => {
  it("expose les catégories attendues par la recette", () => {
    expect(categorySeeds.map((category) => category.name)).toEqual(
      expect.arrayContaining(["Couple", "Famille", "Amis"]),
    );
  });

  it("contient une ressource publique filtrable en catégorie Couple", () => {
    expect(
      resourceSeeds.some(
        (resource) =>
          resource.categorySlug === "couple" &&
          resource.visibility !== "RESTRICTED",
      ),
    ).toBe(true);
  });

  it("contient une ressource restreinte pour valider le refus anonyme", () => {
    expect(
      resourceSeeds.some((resource) => resource.visibility === "RESTRICTED"),
    ).toBe(true);
  });

  it("contient au moins un média image ou vidéo pour la page détail", () => {
    expect(
      resourceSeeds.some((resource) => resource.imageUrl || resource.sourceUrl),
    ).toBe(true);
  });
});
