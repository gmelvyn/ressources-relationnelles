"use client";

import { useActionState } from "react";
import { createResourceAction } from "@/app/actions/resource";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CatalogMeta } from "@/lib/resources";

type ResourceFormProps = {
  meta: CatalogMeta;
};

type ActionState = {
  error?: string;
  success?: string;
};

async function submitResource(_state: ActionState, formData: FormData): Promise<ActionState> {
  return createResourceAction(formData);
}

export function ResourceForm({ meta }: ResourceFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(submitResource, {});

  return (
    <form action={formAction} className="space-y-6 rounded-lg border bg-card p-5 shadow-sm">
      {state.error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}
      {state.success ? (
        <div className="rounded-md border border-teal-700/30 bg-teal-700/10 p-3 text-sm text-teal-800">
          {state.success}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Titre</Label>
          <Input id="title" name="title" required maxLength={140} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Catégorie</Label>
          <select id="categoryId" name="categoryId" required className="h-9 w-full rounded-md border bg-background px-3 text-sm">
            <option value="">Sélectionner</option>
            {meta.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="typeId">Type de ressource</Label>
          <select id="typeId" name="typeId" required className="h-9 w-full rounded-md border bg-background px-3 text-sm">
            <option value="">Sélectionner</option>
            {meta.resourceTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="visibility">Visibilité</Label>
          <select id="visibility" name="visibility" className="h-9 w-full rounded-md border bg-background px-3 text-sm">
            <option value="PUBLIC">Publique</option>
            <option value="RESTRICTED">Réservée aux comptes vérifiés</option>
            <option value="SHARED">Partagée</option>
            <option value="PRIVATE">Privée</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="durationMinutes">Durée estimée</Label>
          <Input id="durationMinutes" name="durationMinutes" type="number" min="1" placeholder="15" />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Types de relations</Label>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {meta.relationTypes.map((relation) => (
              <label key={relation.id} className="flex items-center gap-2 rounded-md border p-3 text-sm">
                <input type="checkbox" name="relationTypeIds" value={relation.id} className="size-4" />
                {relation.name}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="summary">Résumé</Label>
          <Textarea id="summary" name="summary" required maxLength={300} className="min-h-24" />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="content">Contenu</Label>
          <Textarea id="content" name="content" required className="min-h-48" />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="sourceUrl">Source externe</Label>
          <Input id="sourceUrl" name="sourceUrl" type="url" placeholder="https://..." />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement..." : "Soumettre la ressource"}
        </Button>
      </div>
    </form>
  );
}
