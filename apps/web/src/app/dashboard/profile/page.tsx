import Link from "next/link";
import type { ComponentType } from "react";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  BookOpenCheck,
  Edit2,
  Heart,
  MessageCircle,
  Send,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/layout/site-header";
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

export default async function DashboardProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, resources, comments, favorites] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        name: true,
        email: true,
        image: true,
        username: true,
        bio: true,
        createdAt: true,
      },
    }),
    prisma.resource.findMany({
      where: { authorId: user.id },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        status: true,
        createdAt: true,
        category: { select: { name: true, color: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.resourceComment.findMany({
      where: { authorId: user.id, status: "VISIBLE" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        resource: { select: { title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.resourceProgress.findMany({
      where: { userId: user.id, isFavorite: true },
      select: {
        resource: {
          select: {
            id: true,
            title: true,
            slug: true,
            summary: true,
            category: { select: { name: true, color: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const displayName = profile?.name ?? user.name;
  const memberSince = profile?.createdAt
    ? formatDistanceToNow(profile.createdAt, { addSuffix: true, locale: fr })
    : null;

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader user={user} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost">
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
              Tableau de bord
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/settings">
              <Edit2 className="size-4" />
              Modifier le profil
            </Link>
          </Button>
        </div>

        <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="h-28 bg-[linear-gradient(135deg,oklch(0.39_0.11_180),oklch(0.74_0.13_155),oklch(0.9_0.06_95))] sm:h-36" />
          <div className="px-5 pb-6 sm:px-6">
            <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <Avatar className="size-24 border-4 border-background sm:size-28">
                  <AvatarImage src={profile?.image ?? ""} alt={displayName} />
                  <AvatarFallback className="text-2xl">
                    {initials(displayName) || "RR"}
                  </AvatarFallback>
                </Avatar>
                <div className="pb-1">
                  <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
                    Profil utilisateur
                  </p>
                  <h1 className="mt-1 text-3xl font-semibold">{displayName}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {profile?.username ? `@${profile.username}` : profile?.email}
                    {memberSince ? ` · membre ${memberSince}` : null}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center sm:min-w-80">
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-2xl font-semibold">{resources.length}</p>
                  <p className="text-xs text-muted-foreground">ressources</p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-2xl font-semibold">{comments.length}</p>
                  <p className="text-xs text-muted-foreground">échanges</p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-2xl font-semibold">{favorites.length}</p>
                  <p className="text-xs text-muted-foreground">favoris</p>
                </div>
              </div>
            </div>

            {profile?.bio ? (
              <p className="mt-5 max-w-3xl text-sm leading-6 text-muted-foreground">
                {profile.bio}
              </p>
            ) : (
              <p className="mt-5 max-w-3xl text-sm leading-6 text-muted-foreground">
                Ajoutez quelques mots dans vos paramètres pour personnaliser
                votre présence sur la plateforme.
              </p>
            )}
          </div>
        </section>

        <Tabs defaultValue="resources" className="mt-8">
          <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
            <TabsTrigger value="resources">Ressources</TabsTrigger>
            <TabsTrigger value="comments">Commentaires</TabsTrigger>
            <TabsTrigger value="favorites">Favoris</TabsTrigger>
          </TabsList>

          <TabsContent value="resources" className="mt-5">
            <div className="grid gap-4 lg:grid-cols-2">
              {resources.map((resource) => (
                <article
                  key={resource.id}
                  className="rounded-lg border bg-card p-5 shadow-sm transition hover:border-teal-700/40"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      style={{ backgroundColor: resource.category.color }}
                      className="text-white"
                    >
                      {resource.category.name}
                    </Badge>
                    <Badge variant="secondary">
                      {resource.status === "PUBLISHED"
                        ? "Publié"
                        : resource.status === "PENDING_REVIEW"
                          ? "En modération"
                          : resource.status}
                    </Badge>
                  </div>
                  <Link href={`/resources/${resource.slug}`} className="group">
                    <h2 className="mt-4 text-xl font-semibold group-hover:text-teal-700">
                      {resource.title}
                    </h2>
                  </Link>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {resource.summary}
                  </p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Proposée{" "}
                    {formatDistanceToNow(resource.createdAt, {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </article>
              ))}
            </div>
            {resources.length === 0 ? (
              <EmptyState
                icon={Send}
                text="Vous n'avez pas encore proposé de ressource."
              />
            ) : null}
          </TabsContent>

          <TabsContent value="comments" className="mt-5 space-y-4">
            {comments.map((comment) => (
              <article key={comment.id} className="rounded-lg border bg-card p-5">
                <p className="text-sm leading-6">{comment.content}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Sur{" "}
                  <Link
                    href={`/resources/${comment.resource.slug}`}
                    className="font-medium text-teal-700 hover:underline"
                  >
                    {comment.resource.title}
                  </Link>{" "}
                  {formatDistanceToNow(comment.createdAt, {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              </article>
            ))}
            {comments.length === 0 ? (
              <EmptyState
                icon={MessageCircle}
                text="Aucun commentaire pour le moment."
              />
            ) : null}
          </TabsContent>

          <TabsContent value="favorites" className="mt-5">
            <div className="grid gap-4 lg:grid-cols-2">
              {favorites.map(({ resource }) => (
                <article key={resource.id} className="rounded-lg border bg-card p-5">
                  <div className="flex items-center gap-2">
                    <Heart className="size-4 fill-rose-600 text-rose-600" />
                    <Badge
                      style={{ backgroundColor: resource.category.color }}
                      className="text-white"
                    >
                      {resource.category.name}
                    </Badge>
                  </div>
                  <Link href={`/resources/${resource.slug}`} className="group">
                    <h2 className="mt-4 text-xl font-semibold group-hover:text-teal-700">
                      {resource.title}
                    </h2>
                  </Link>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {resource.summary}
                  </p>
                </article>
              ))}
            </div>
            {favorites.length === 0 ? (
              <EmptyState
                icon={BookOpenCheck}
                text="Vous n'avez pas encore ajouté de ressource en favori."
              />
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function EmptyState({
  icon: Icon,
  text,
}: {
  icon: ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="mt-5 rounded-lg border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
      <Icon className="mx-auto mb-3 size-5" />
      {text}
    </div>
  );
}
