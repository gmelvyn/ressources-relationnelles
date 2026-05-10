import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { ResourceCard } from "@/components/resources/resource-card";
import { ResourceFilters } from "@/components/resources/resource-filters";
import { getCatalogMeta, getResources, type ResourceFilters as Filters } from "@/lib/resources";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type ResourcesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const filters: Filters = {
    search: first(params.search),
    category: first(params.category),
    relation: first(params.relation),
    type: first(params.type),
  };
  const [meta, resources] = await Promise.all([getCatalogMeta(), getResources(filters, user?.id)]);

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader user={user} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Catalogue</p>
            <h1 className="mt-2 text-3xl font-semibold">Ressources relationnelles</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Filtrez par catégorie, type de relation ou format pour trouver un support adapté.
            </p>
          </div>
          <Button asChild>
            <Link href="/resources/new">
              <Plus className="size-4" />
              Proposer une ressource
            </Link>
          </Button>
        </div>

        <div className="mt-6">
          <ResourceFilters meta={meta} filters={filters} />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {resources.map((resource) => (
            <ResourceCard key={resource.slug} resource={resource} />
          ))}
        </div>

        {resources.length === 0 ? (
          <div className="mt-10 rounded-lg border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
            Aucune ressource ne correspond à ces critères.
          </div>
        ) : null}
      </div>
    </main>
  );
}
