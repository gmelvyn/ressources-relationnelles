"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CatalogMeta, ResourceFilters } from "@/lib/resources";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";

type ResourceFiltersProps = {
  meta: CatalogMeta;
  filters: ResourceFilters;
};

export function ResourceFilters({ meta, filters }: ResourceFiltersProps) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      search: filters.search || "",
      category: filters.category || "",
      relation: filters.relation || "",
      type: filters.type || "",
    },
    onSubmit: async ({ value }) => {
      const params = new URLSearchParams();
      if (value.search) params.set("search", value.search);
      if (value.category) params.set("category", value.category);
      if (value.relation) params.set("relation", value.relation);
      if (value.type) params.set("type", value.type);

      const queryString = params.toString();
      router.push(`/resources${queryString ? `?${queryString}` : ""}`);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="rounded-lg border bg-card p-4 shadow-sm"
    >
      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
        <form.Field
          name="search"
          children={(field) => (
            <label className="relative">
              <span className="sr-only">Recherche</span>
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Rechercher une ressource"
                className="pl-9"
              />
            </label>
          )}
        />

        <form.Field
          name="category"
          children={(field) => (
            <label>
              <span className="sr-only">Catégorie</span>
              <select
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
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
          )}
        />

        <form.Field
          name="relation"
          children={(field) => (
            <label>
              <span className="sr-only">Relation</span>
              <select
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
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
          )}
        />

        <form.Field
          name="type"
          children={(field) => (
            <label>
              <span className="sr-only">Type de ressource</span>
              <select
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
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
          )}
        />

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              <SlidersHorizontal className="size-4" />
              {isSubmitting ? "Filtrage..." : "Filtrer"}
            </Button>
          )}
        />
      </div>
    </form>
  );
}
