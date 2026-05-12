import Link from "next/link";
import {
  Accessibility,
  DatabaseZap,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function HelpPage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader user={user} />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <p
            className="text-sm font-semibold uppercase tracking-wide text-teal-700"
            style={{ fontSize: 20, textAlign: "left", fontWeight: "bold" }}
          >
            Aide
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            Repères d'utilisation et de confiance
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            La plateforme distingue l'accès public, les fonctionnalités de
            compte citoyen et les espaces de modération ou d'administration.
          </p>
        </div>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {[
            {
              icon: ShieldCheck,
              title: "Ressources modérées",
              text: "Les ressources proposées par les citoyens passent en validation avant publication publique.",
            },
            {
              icon: LockKeyhole,
              title: "Données personnelles",
              text: "La progression reste rattachée au compte connecté et les données sensibles doivent rester minimisées.",
            },
            {
              icon: Accessibility,
              title: "Accessibilité",
              text: "Les écrans privilégient des libellés explicites, un contraste lisible et une navigation clavier standard.",
            },
            {
              icon: DatabaseZap,
              title: "Statistiques",
              text: "Les indicateurs portent sur la consultation, la recherche, les créations et l'exploitation des ressources.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-lg border bg-card p-5 shadow-sm"
            >
              <item.icon className="size-5 text-teal-700" />
              <h2 className="mt-4 font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.text}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-lg border bg-muted/30 p-6">
          <h2 className="text-xl font-semibold">Rôles de la solution</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              "Citoyen non connecté : consultation des ressources publiques.",
              "Citoyen connecté : favoris, progression, commentaires et création de ressources.",
              "Modérateur : validation des ressources et modération des échanges.",
              "Administrateur catalogue : gestion du référentiel et suivi statistique.",
              "Super-administrateur : gestion globale des droits et de la solution.",
            ].map((item) => (
              <p key={item} className="text-sm leading-6 text-muted-foreground">
                {item}
              </p>
            ))}
          </div>
          <div className="mt-6">
            <Button asChild>
              <Link href="/resources">Retour au catalogue</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
