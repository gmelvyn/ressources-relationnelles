import Link from "next/link";
import { redirect } from "next/navigation";
import { BookMarked, CheckCircle2, Heart, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResourceCard } from "@/components/resources/resource-card";
import { SiteHeader } from "@/components/layout/site-header";
import { getDashboardData } from "@/lib/resources";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const data = await getDashboardData(user.id);
  const favorites = data.progress.filter((resource) => resource.progress?.isFavorite).length;
  const saved = data.progress.filter((resource) => resource.progress?.isSaved).length;
  const completed = data.progress.filter((resource) =>
    ["COMPLETED", "EXPLOITED"].includes(resource.progress?.status ?? ""),
  ).length;

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader user={user} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Parcours utilisateur</p>
            <h1 className="mt-2 text-3xl font-semibold">Bonjour {user.name}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Retrouvez vos favoris, ressources mises de côté, contenus exploités et contributions.
            </p>
          </div>
          <Button asChild>
            <Link href="/resources/new">
              <Plus className="size-4" />
              Nouvelle ressource
            </Link>
          </Button>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { label: "Favoris", value: favorites, icon: Heart },
            { label: "Mises de côté", value: saved, icon: BookMarked },
            { label: "Exploitées", value: completed, icon: CheckCircle2 },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border bg-card p-5 shadow-sm">
              <item.icon className="size-5 text-teal-700" />
              <p className="mt-4 text-3xl font-semibold">{item.value}</p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Suivi</p>
              <h2 className="mt-2 text-2xl font-semibold">Ressources de votre parcours</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/resources">Explorer</Link>
            </Button>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {data.progress.map((resource) => (
              <ResourceCard key={resource.slug} resource={resource} />
            ))}
          </div>
          {data.progress.length === 0 ? (
            <div className="mt-6 rounded-lg border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
              Votre parcours est vide pour le moment.
            </div>
          ) : null}
        </section>

        <section className="mt-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Contributions</p>
            <h2 className="mt-2 text-2xl font-semibold">Vos ressources proposées</h2>
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {data.ownResources.map((resource) => (
              <ResourceCard key={resource.slug} resource={resource} />
            ))}
          </div>
          {data.ownResources.length === 0 ? (
            <div className="mt-6 rounded-lg border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
              <Send className="mx-auto mb-3 size-5" />
              Vous n'avez pas encore proposé de ressource.
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
