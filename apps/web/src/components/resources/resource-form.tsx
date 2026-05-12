"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { createResourceAction } from "@/app/actions/resource";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CatalogMeta } from "@/lib/resources";
import { useState } from "react";

type ResourceFormProps = {
  meta: CatalogMeta;
};

type ResourceVisibility = "PUBLIC" | "RESTRICTED" | "SHARED" | "PRIVATE";

const resourceSchema = z.object({
  title: z.string().min(1, "Titre requis").max(140, "Le titre est trop long"),
  summary: z.string().min(1, "Résumé requis").max(300, "Le résumé est trop long"),
  content: z.string().min(1, "Contenu requis"),
  categoryId: z.string().min(1, "Catégorie requise"),
  typeId: z.string().min(1, "Type requis"),
  visibility: z.enum(["PUBLIC", "RESTRICTED", "SHARED", "PRIVATE"]),
  durationMinutes: z.number().min(0),
  relationTypeIds: z.array(z.string()).min(1, "Au moins une relation est requise"),
  sourceUrl: z.string().url("URL invalide").or(z.literal("")),
});

export function ResourceForm({ meta }: ResourceFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      title: "",
      summary: "",
      content: "",
      categoryId: "",
      typeId: "",
      visibility: "PUBLIC" as ResourceVisibility,
      durationMinutes: 0,
      relationTypeIds: [] as string[],
      sourceUrl: "",
    },
    validators: {
      onChange: resourceSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      setServerSuccess(null);

      const formData = new FormData();
      formData.append("title", value.title);
      formData.append("summary", value.summary);
      formData.append("content", value.content);
      formData.append("categoryId", value.categoryId);
      formData.append("typeId", value.typeId);
      formData.append("visibility", value.visibility);
      if (value.durationMinutes > 0) formData.append("durationMinutes", value.durationMinutes.toString());
      if (value.sourceUrl) formData.append("sourceUrl", value.sourceUrl);
      value.relationTypeIds.forEach((id) => formData.append("relationTypeIds", id));

      const result = await createResourceAction(formData);

      if (result.error) {
        setServerError(result.error);
      } else if (result.success) {
        setServerSuccess(result.success);
        form.reset();
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6 rounded-lg border bg-card p-5 shadow-sm"
    >
      {serverError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </div>
      ) : null}
      {serverSuccess ? (
        <div className="rounded-md border border-teal-700/30 bg-teal-700/10 p-3 text-sm text-teal-800">
          {serverSuccess}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <form.Field
          name="title"
          children={(field) => (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={field.name}>Titre</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                maxLength={140}
                className={field.state.meta.errors.length > 0 ? "border-destructive" : ""}
              />
              {field.state.meta.errors ? (
                <p className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</p>
              ) : null}
            </div>
          )}
        />

        <form.Field
          name="categoryId"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Catégorie</Label>
              <select
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Sélectionner</option>
                {meta.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {field.state.meta.errors ? (
                <p className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</p>
              ) : null}
            </div>
          )}
        />

        <form.Field
          name="typeId"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Type de ressource</Label>
              <select
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Sélectionner</option>
                {meta.resourceTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {field.state.meta.errors ? (
                <p className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</p>
              ) : null}
            </div>
          )}
        />

        <form.Field
          name="visibility"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Visibilité</Label>
              <select
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value as ResourceVisibility)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="PUBLIC">Publique</option>
                <option value="RESTRICTED">Réservée aux comptes vérifiés</option>
                <option value="SHARED">Partagée</option>
                <option value="PRIVATE">Privée</option>
              </select>
            </div>
          )}
        />

        <form.Field
          name="durationMinutes"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Durée estimée</Label>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                min="1"
                placeholder="15"
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value ? parseInt(e.target.value) : 0)}
              />
            </div>
          )}
        />

        <form.Field
          name="relationTypeIds"
          children={(field) => (
            <div className="space-y-2 md:col-span-2">
              <Label>Types de relations</Label>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {meta.relationTypes.map((relation) => (
                  <label key={relation.id} className="flex items-center gap-2 rounded-md border p-3 text-sm">
                    <input
                      type="checkbox"
                      checked={field.state.value.includes(relation.id)}
                      onChange={(e) => {
                        const nextValue = e.target.checked
                          ? [...field.state.value, relation.id]
                          : field.state.value.filter((id) => id !== relation.id);
                        field.handleChange(nextValue);
                      }}
                      className="size-4"
                    />
                    {relation.name}
                  </label>
                ))}
              </div>
              {field.state.meta.errors ? (
                <p className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</p>
              ) : null}
            </div>
          )}
        />

        <form.Field
          name="summary"
          children={(field) => (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={field.name}>Résumé</Label>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                maxLength={300}
                className="min-h-24"
              />
              {field.state.meta.errors ? (
                <p className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</p>
              ) : null}
            </div>
          )}
        />

        <form.Field
          name="content"
          children={(field) => (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={field.name}>Contenu</Label>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                className="min-h-48"
              />
              {field.state.meta.errors ? (
                <p className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</p>
              ) : null}
            </div>
          )}
        />

        <form.Field
          name="sourceUrl"
          children={(field) => (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={field.name}>Source externe</Label>
              <Input
                id={field.name}
                name={field.name}
                type="url"
                placeholder="https://..."
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors ? (
                <p className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</p>
              ) : null}
            </div>
          )}
        />
      </div>

      <div className="flex justify-end">
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Soumettre la ressource"}
            </Button>
          )}
        />
      </div>
    </form>
  );
}
