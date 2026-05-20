"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CatalogMeta, ResourceFilters } from "@/lib/resources";
import { useRouter } from "next/navigation";

type ResourceFiltersProps = {
  meta: CatalogMeta;
  filters: ResourceFilters;
};

export function ResourceFilters({ meta, filters }: ResourceFiltersProps) {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    const search = String(data.get("search") ?? "");
    const category = String(data.get("category") ?? "");
    const relation = String(data.get("relation") ?? "");
    const type = String(data.get("type") ?? "");

    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (relation) params.set("relation", relation);
    if (type) params.set("type", type);

    const queryString = params.toString();
    router.push(`/resources${queryString ? `?${queryString}` : ""}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border bg-card p-4 shadow-sm"
    >
      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
        <label className="relative">
          <span className="sr-only">Recherche</span>
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={filters.search || ""}
            placeholder="Rechercher une ressource"
            className="pl-9"
          />
        </label>

        <label>
          <span className="sr-only">Catégorie</span>
          <select
            name="category"
            defaultValue={filters.category || ""}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Toutes les catégories</option>
            {meta.categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Relation</span>
          <select
            name="relation"
            defaultValue={filters.relation || ""}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Toutes les relations</option>
            {meta.relationTypes.map((relation) => (
              <option key={relation.slug} value={relation.slug}>
                {relation.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Type de ressource</span>
          <select
            name="type"
            defaultValue={filters.type || ""}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Tous les types</option>
            {meta.resourceTypes.map((type) => (
              <option key={type.slug} value={type.slug}>
                {type.name}
              </option>
            ))}
          </select>
        </label>

        <Button type="submit">
          <SlidersHorizontal className="size-4" />
          Filtrer
        </Button>
      </div>
    </form>
  );
}
