"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AtSign,
  CheckCircle2,
  IdCard,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api-client";

type SettingsPanelProps = {
  profile: {
    name: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    bio: string | null;
  };
};

export function SettingsPanel({ profile }: SettingsPanelProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function updateProfile(formData: FormData) {
    setError(null);
    setSaved(false);
    setSaving(true);

    try {
      await apiRequest("/api/me/profile", {
        method: "PATCH",
        body: {
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          name: formData.get("name"),
          username: formData.get("username"),
          bio: formData.get("bio"),
        },
      });
      setSaved(true);
      router.refresh();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Impossible d'enregistrer les modifications.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAccount(formData: FormData) {
    setError(null);
    setDeleting(true);

    try {
      await apiRequest("/api/me/profile", {
        method: "DELETE",
        body: {
          confirmation: formData.get("confirmation"),
        },
      });
      window.location.assign("/login?accountDeleted=1");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Impossible de supprimer le compte.");
      setDeleting(false);
    }
  }

  return (
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

        {saved ? (
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-teal-700/20 bg-teal-50 p-3 text-sm text-teal-900 dark:bg-teal-950/30 dark:text-teal-100">
            <CheckCircle2 className="size-4" />
            Profil mis à jour.
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            updateProfile(new FormData(event.currentTarget));
          }}
          className="mt-6 space-y-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                name="firstName"
                defaultValue={profile.firstName ?? ""}
                autoComplete="given-name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                name="lastName"
                defaultValue={profile.lastName ?? ""}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Nom affiché</Label>
            <Input
              id="name"
              name="name"
              defaultValue={profile.name}
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
                defaultValue={profile.username ?? ""}
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
              defaultValue={profile.bio ?? ""}
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
            <p className="mt-2">{profile.email}</p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
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
              ressources publiées peuvent rester visibles mais ne seront plus
              rattachées à votre identité.
            </p>
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            deleteAccount(new FormData(event.currentTarget));
          }}
          className="mt-6 space-y-4"
        >
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
            <Button type="submit" variant="destructive" disabled={deleting}>
              <Trash2 className="size-4" />
              {deleting ? "Suppression..." : "Supprimer définitivement"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
