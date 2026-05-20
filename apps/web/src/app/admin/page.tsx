import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3, BookOpenCheck, Download, MessageSquare, Plus, ShieldAlert, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { ResourceCard } from "@/components/resources/resource-card";
import { canAdminCatalog, canAdminUsers, canModerate, normalizeRole, roleLabel } from "@/lib/permissions";
import { getAdminOverview, getAdminStats, getAdminUsers, getCatalogMeta, getPendingComments, getResources, type AdminStatsFilters } from "@/lib/resources";
import { getCurrentUser } from "@/lib/session";
import { UserRoleForm } from "@/components/admin/user-role-form";
import { UserStatusForm } from "@/components/admin/user-status-form";
import { ModerateResourceForm } from "@/components/admin/moderate-resource-form";
import { CreateCategoryForm } from "@/components/admin/create-category-form";
import { ResourceAdminActions } from "@/components/admin/resource-admin-actions";
import { CommentModerationForm } from "@/components/admin/comment-moderation-form";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function period(value: string | undefined): AdminStatsFilters["period"] {
  if (value === "current-month" || value === "last-month") return value;
  return "all";
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!canModerate(user.role)) {
    redirect("/dashboard");
  }

  const statsFilters: AdminStatsFilters = {
    period: period(first(params.period)),
    category: first(params.category),
  };
  const exportParams = new URLSearchParams();
  if (statsFilters.period && statsFilters.period !== "all") exportParams.set("period", statsFilters.period);
  if (statsFilters.category) exportParams.set("category", statsFilters.category);

  const [overview, pendingResources, users, catalogResources, pendingComments, meta, stats] = await Promise.all([
    getAdminOverview(),
    getResources({ status: "PENDING_REVIEW" }, user.id),
    canAdminUsers(user.role) ? getAdminUsers() : Promise.resolve([]),
    canAdminCatalog(user.role) ? getResources({ status: "PUBLISHED" }, user.id) : Promise.resolve([]),
    getPendingComments(),
    getCatalogMeta(),
    getAdminStats(statsFilters),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader user={user} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Back-office</p>
            <h1 className="mt-2 text-3xl font-semibold">Administration du catalogue</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Connecté en tant que {roleLabel(user.role)}.
            </p>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            { label: "Ressources", value: overview.counters.resources, icon: BookOpenCheck },
            { label: "Utilisateurs", value: overview.counters.users, icon: UsersRound },
            { label: "Commentaires", value: overview.counters.comments, icon: MessageSquare },
            { label: "En validation", value: overview.counters.pendingResources, icon: ShieldAlert },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border bg-card p-5 shadow-sm">
              <item.icon className="size-5 text-teal-700" />
              <p className="mt-4 text-3xl font-semibold">{item.value}</p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </section>

        {canAdminUsers(user.role) ? (
          <section className="mt-10">
            <div className="flex items-center gap-3">
              <UsersRound className="size-5 text-teal-700" />
              <h2 className="text-2xl font-semibold">Comptes et rôles</h2>
            </div>
            <div className="mt-5 overflow-x-auto rounded-lg border">
              <div className="min-w-190">
              <div className="grid grid-cols-[1.4fr_1fr_1fr_auto] gap-3 bg-muted px-4 py-3 text-sm font-medium">
                <span>Utilisateur</span>
                <span>Rôle</span>
                <span>Statut</span>
                <span className="text-right">Action</span>
              </div>
              {users.map((managedUser) => (
                <div
                  key={managedUser.id}
                  className="grid grid-cols-[1.4fr_1fr_1fr_auto] items-center gap-3 border-t px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{managedUser.name}</p>
                    <p className="text-xs text-muted-foreground">{managedUser.email}</p>
                  </div>
                  <UserRoleForm userId={managedUser.id} currentRole={normalizeRole(managedUser.role)} />
                  <span>{managedUser.banned ? "Désactivé" : "Actif"}</span>
                  <UserStatusForm
                    userId={managedUser.id}
                    isBanned={managedUser.banned ?? false}
                    isDisabled={managedUser.id === user.id}
                  />
                </div>
              ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex items-center gap-3">
              <ShieldAlert className="size-5 text-teal-700" />
              <h2 className="text-2xl font-semibold">Ressources à valider</h2>
            </div>
            <div className="mt-5 space-y-5">
              {pendingResources.map((resource) => (
                <div key={resource.id} className="space-y-3">
                  <ResourceCard resource={resource} />
                  <ModerateResourceForm resourceId={resource.id} />
                </div>
              ))}
              {pendingResources.length === 0 ? (
                <div className="rounded-lg border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
                  Aucune ressource en attente de validation.
                </div>
              ) : null}
            </div>
          </div>

          <aside className="space-y-6">
            {canAdminCatalog(user.role) ? <CreateCategoryForm /> : null}

            <div className="rounded-lg border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-5 text-teal-700" />
                <h2 className="font-semibold">Statistiques</h2>
              </div>
              <form className="mt-4 grid gap-3" action="/admin">
                <select
                  name="period"
                  defaultValue={statsFilters.period}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="all">Toutes les périodes</option>
                  <option value="current-month">Mois en cours</option>
                  <option value="last-month">Dernier mois</option>
                </select>
                <select
                  name="category"
                  defaultValue={statsFilters.category ?? ""}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Toutes les catégories</option>
                  {meta.categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Filtrer</Button>
                  <Button asChild variant="outline" size="icon" aria-label="Exporter les statistiques">
                    <Link href={`/api/admin/statistics/export${exportParams.toString() ? `?${exportParams}` : ""}`}>
                      <Download className="size-4" />
                    </Link>
                  </Button>
                </div>
              </form>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>Consultations : {stats.counters.consultations}</p>
                <p>Recherches : {stats.counters.searches}</p>
                <p>Créations : {stats.counters.creations}</p>
                <p>Partages : {stats.counters.shares}</p>
                <p>Commentaires : {stats.counters.comments}</p>
                <p>Ressource la plus active : {stats.topResources[0]?.title ?? "Aucune"}</p>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-2">
          {canAdminCatalog(user.role) ? (
            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <BookOpenCheck className="size-5 text-teal-700" />
                  <h2 className="text-2xl font-semibold">Ressources publiées</h2>
                </div>
                <Button asChild>
                  <Link href="/resources/new">
                    <Plus className="size-4" />
                    Ajouter
                  </Link>
                </Button>
              </div>
              <div className="mt-5 space-y-5">
                {catalogResources.slice(0, 6).map((resource) => (
                  <div key={resource.id} className="space-y-3">
                    <ResourceCard resource={resource} />
                    <ResourceAdminActions resourceId={resource.id} />
                  </div>
                ))}
                {catalogResources.length === 0 ? (
                  <div className="rounded-lg border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
                    Aucune ressource publiée.
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <div>
            <div className="flex items-center gap-3">
              <MessageSquare className="size-5 text-teal-700" />
              <h2 className="text-2xl font-semibold">Commentaires à modérer</h2>
            </div>
            <div className="mt-5 space-y-4">
              {pendingComments.map((comment) => (
                <div key={comment.id} className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{comment.author.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Sur <Link href={`/resources/${comment.resource.slug}`} className="underline">{comment.resource.title}</Link>
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-6">{comment.content}</p>
                  </div>
                  <div className="mt-4">
                    <CommentModerationForm commentId={comment.id} />
                  </div>
                </div>
              ))}
              {pendingComments.length === 0 ? (
                <div className="rounded-lg border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
                  Aucun commentaire en attente.
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
