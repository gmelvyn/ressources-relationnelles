import { redirect } from "next/navigation";
import { BarChart3, BookOpenCheck, MessageSquare, ShieldAlert, UsersRound } from "lucide-react";
import {
  createCategoryAction,
  moderateResourceAction,
  toggleUserStatusAction,
  updateUserRoleAction,
} from "@/app/actions/resource";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteHeader } from "@/components/layout/site-header";
import { ResourceCard } from "@/components/resources/resource-card";
import { canAdminCatalog, canAdminUsers, canModerate, roleLabel, roles } from "@/lib/permissions";
import { getAdminOverview, getAdminUsers, getResources } from "@/lib/resources";
import { getCurrentUser } from "@/lib/session";

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
                  <form action={updateUserRoleAction} className="flex gap-2">
                    <input type="hidden" name="userId" value={managedUser.id} />
                    <select
                      name="role"
                      defaultValue={managedUser.role ?? roles.citizen}
                      className="h-9 w-full rounded-md border bg-background px-2"
                    >
                      <option value={roles.citizen}>Citoyen</option>
                      <option value={roles.moderator}>Modérateur</option>
                      <option value={roles.catalogAdmin}>Administrateur catalogue</option>
                      <option value={roles.superAdmin}>Super-administrateur</option>
                    </select>
                    <Button type="submit" variant="outline" size="sm">
                      OK
                    </Button>
                  </form>
                  <span>{managedUser.banned ? "Désactivé" : "Actif"}</span>
                  <form action={toggleUserStatusAction} className="text-right">
                    <input type="hidden" name="userId" value={managedUser.id} />
                    <input type="hidden" name="action" value={managedUser.banned ? "unban" : "ban"} />
                    <Button type="submit" variant="outline" size="sm" disabled={managedUser.id === user.id}>
                      {managedUser.banned ? "Réactiver" : "Désactiver"}
                    </Button>
                  </form>
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
                  <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/30 p-3">
                    <form action={moderateResourceAction}>
                      <input type="hidden" name="resourceId" value={resource.id} />
                      <input type="hidden" name="action" value="publish" />
                      <Button type="submit">Publier</Button>
                    </form>
                    <form action={moderateResourceAction} className="flex gap-2">
                      <input type="hidden" name="resourceId" value={resource.id} />
                      <input type="hidden" name="action" value="suspend" />
                      <Input name="reason" placeholder="Motif" className="w-48" />
                      <Button type="submit" variant="outline">
                        Suspendre
                      </Button>
                    </form>
                  </div>
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
            {canAdminCatalog(user.role) ? (
              <form action={createCategoryAction} className="space-y-4 rounded-lg border bg-card p-5 shadow-sm">
                <div>
                  <h2 className="font-semibold">Nouvelle catégorie</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Le référentiel reste administrable.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Couleur</Label>
                  <Input id="color" name="color" type="color" defaultValue="#0f766e" className="h-10" />
                </div>
                <Button type="submit" className="w-full">
                  Créer
                </Button>
              </form>
            ) : null}

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
