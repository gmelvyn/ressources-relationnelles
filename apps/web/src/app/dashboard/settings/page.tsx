import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  AtSign,
  CheckCircle2,
  IdCard,
  ShieldAlert,
  Trash2,
  UserRound,
} from "lucide-react";
import { deleteAccountAction, updateProfileAction } from "@/app/actions/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/layout/site-header";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type SettingsPageProps = {
  searchParams?: Promise<{
    updated?: string;
    error?: string;
  }>;
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function errorMessage(error?: string) {
  if (error === "username") return "Ce pseudo est déjà utilisé.";
  if (error === "name") return "Le nom affiché est obligatoire.";
  if (error === "delete-confirmation") {
    return "Pour supprimer votre compte, saisissez exactement SUPPRIMER.";
  }
  if (error === "delete-account") {
    return "Impossible de supprimer le compte pour le moment.";
  }
  if (error) return "Impossible d'enregistrer les modifications.";
  return null;
}

export default async function DashboardSettingsPage({
  searchParams,
}: SettingsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
      image: true,
      firstName: true,
      lastName: true,
      username: true,
      bio: true,
    },
  });

  const displayName = profile?.name ?? user.name;
  const message = errorMessage(params?.error);

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader user={user} />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost">
            <Link href="/dashboard/profile">
              <ArrowLeft className="size-4" />
              Profil
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Retour au tableau de bord</Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-lg border bg-card p-5 shadow-sm">
            <Avatar className="size-20">
              <AvatarImage src={profile?.image ?? ""} alt={displayName} />
              <AvatarFallback className="text-xl">
                {initials(displayName) || "RR"}
              </AvatarFallback>
            </Avatar>
            <h1 className="mt-4 text-2xl font-semibold">Paramètres</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Ajustez les informations qui donnent une présence plus personnelle
              à votre compte.
            </p>
            <div className="mt-5 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <UserRound className="size-4 text-teal-700" />
                {displayName}
              </p>
              <p className="flex items-center gap-2">
                <AtSign className="size-4 text-teal-700" />
                {profile?.username ? `@${profile.username}` : profile?.email}
              </p>
            </div>
          </aside>

          <div className="space-y-6">
            <section className="rounded-lg border bg-card p-5 shadow-sm sm:p-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
                  Profil public
                </p>
                <h2 className="mt-2 text-3xl font-semibold">
                  Votre identité sur la plateforme
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Ces éléments accompagnent vos ressources, commentaires et
                  interactions avec la communauté.
                </p>
              </div>

              {params?.updated ? (
                <div className="mt-6 flex items-center gap-2 rounded-lg border border-teal-700/20 bg-teal-50 p-3 text-sm text-teal-900 dark:bg-teal-950/30 dark:text-teal-100">
                  <CheckCircle2 className="size-4" />
                  Profil mis à jour.
                </div>
              ) : null}

              {message ? (
                <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {message}
                </div>
              ) : null}

              <form action={updateProfileAction} className="mt-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      defaultValue={profile?.firstName ?? ""}
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={profile?.lastName ?? ""}
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">Nom affiché</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={displayName}
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="username">Pseudo</Label>
                  <div className="relative">
                    <AtSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      name="username"
                      defaultValue={profile?.username ?? ""}
                      className="pl-9"
                      placeholder="monpseudo"
                      autoComplete="nickname"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    name="bio"
                    defaultValue={profile?.bio ?? ""}
                    rows={5}
                    className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Quelques mots sur votre approche, vos sujets de prédilection ou ce que vous venez chercher ici."
                  />
                </div>

                <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2 font-medium text-foreground">
                    <IdCard className="size-4 text-teal-700" />
                    Email de connexion
                  </p>
                  <p className="mt-2">{profile?.email}</p>
                </div>

                <div className="flex justify-end">
                  <Button type="submit">Enregistrer les modifications</Button>
                </div>
              </form>
            </section>

            <section className="rounded-lg border border-destructive/30 bg-card p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <ShieldAlert className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-destructive">
                    Zone sensible
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Supprimer mon compte
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Cette action supprime vos données personnelles, vos sessions,
                    votre progression, vos commentaires et vos activités. Les
                    ressources publiées peuvent rester visibles mais ne seront
                    plus rattachées à votre identité.
                  </p>
                </div>
              </div>

              <form action={deleteAccountAction} className="mt-6 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="delete-confirmation">
                    Saisissez SUPPRIMER pour confirmer
                  </Label>
                  <Input
                    id="delete-confirmation"
                    name="confirmation"
                    autoComplete="off"
                    placeholder="SUPPRIMER"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="destructive">
                    <Trash2 className="size-4" />
                    Supprimer définitivement
                  </Button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
