import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResourceCard } from "@/components/resources/resource-card";
import { SiteHeader } from "@/components/layout/site-header";
import { getResources } from "@/lib/resources";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  const featuredResources = (await getResources({}, user?.id)).slice(0, 3);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader user={user} />

      <section
        className="relative min-h-[76svh] overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/images/relations-hero.png')" }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative mx-auto flex min-h-[76svh] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-white">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-100">
              Plateforme citoyenne de ressources relationnelles
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              (RE)Sources Relationnelles
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
              Un catalogue public et modéré pour créer, renforcer et enrichir
              les relations avec soi, ses proches, ses collègues et ses
              communautés.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/resources">
                  Explorer le catalogue
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/70 bg-white/10 text-white hover:bg-white/20"
              >
                <Link href="/resources/new">Créer une ressource</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-teal-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            {
              icon: BookOpenCheck,
              label: "Catalogue dynamique",
              value: "Catégories, relations, formats",
            },
            {
              icon: UsersRound,
              label: "Echanges modérés",
              value: "Commentaires et réponses",
            },
            {
              icon: BarChart3,
              label: "Progression",
              value: "Favoris, côté, exploité",
            },
            {
              icon: ShieldCheck,
              label: "Back-office",
              value: "Validation, statistiques, RGPD",
            },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <item.icon className="mt-1 size-5 text-teal-200" />
              <div>
                <p className="font-semibold">{item.label}</p>
                <p className="text-sm text-white/70">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              Ressources à découvrir
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              Des supports concrets pour agir
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/resources">Voir toutes les ressources</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {featuredResources.map((resource) => (
            <ResourceCard key={resource.slug} resource={resource} />
          ))}
        </div>
      </section>
    </main>
  );
}
