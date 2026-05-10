import { redirect } from "next/navigation";
import { BarChart3, BookOpenCheck, MessageSquare, ShieldAlert, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/layout/site-header";
import { ResourceCard } from "@/components/resources/resource-card";
import { canAdminCatalog, canAdminUsers, canModerate, roleLabel } from "@/lib/permissions";
import { getAdminOverview, getAdminUsers, getResources } from "@/lib/resources";
import { getCurrentUser } from "@/lib/session";
import { UserRoleForm } from "@/components/admin/user-role-form";
import { UserStatusForm } from "@/components/admin/user-status-form";
import { ModerateResourceForm } from "@/components/admin/moderate-resource-form";
import { CreateCategoryForm } from "@/components/admin/create-category-form";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!canModerate(user.role)) {
    redirect("/dashboard");
  }

  const [overview, pendingResources, users] = await Promise.all([
    getAdminOverview(),
    getResources({ status: "PENDING_REVIEW" }, user.id),
    canAdminUsers(user.role) ? getAdminUsers() : Promise.resolve([]),
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
          <Badge variant="outline">RGPD, modération et qualité</Badge>
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
            <div className="mt-5 overflow-hidden rounded-lg border">
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
                  <UserRoleForm userId={managedUser.id} currentRole={managedUser.role} />
                  <span>{managedUser.banned ? "Désactivé" : "Actif"}</span>
                  <UserStatusForm
                    userId={managedUser.id}
                    isBanned={managedUser.banned}
                    isDisabled={managedUser.id === user.id}
                  />
                </div>
              ))}
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
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>Consultations : {overview.topResources.reduce((total, resource) => total + resource.viewCount, 0)}</p>
                <p>Partages : {overview.topResources.reduce((total, resource) => total + resource.shareCount, 0)}</p>
                <p>Ressource la plus active : {overview.topResources[0]?.title ?? "Aucune"}</p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
