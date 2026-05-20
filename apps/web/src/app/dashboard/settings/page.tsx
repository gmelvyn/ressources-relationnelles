import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, AtSign, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { SettingsPanel } from "@/components/dashboard/settings-panel";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default async function DashboardSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

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

  if (!profile) {
    redirect("/login");
  }

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
              <AvatarImage src={profile.image ?? ""} alt={profile.name} />
              <AvatarFallback className="text-xl">
                {initials(profile.name) || "RR"}
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
                {profile.name}
              </p>
              <p className="flex items-center gap-2">
                <AtSign className="size-4 text-teal-700" />
                {profile.username ? `@${profile.username}` : profile.email}
              </p>
            </div>
          </aside>

          <SettingsPanel profile={profile} />
        </div>
      </div>
    </main>
  );
}
