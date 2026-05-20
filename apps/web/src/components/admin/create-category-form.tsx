"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api-client";

export function CreateCategoryForm() {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      color: "#0f766e",
    },
    validators: {
      onChange: z.object({
        name: z.string().min(1, "Nom requis"),
        description: z.string().min(1, "Description requise"),
        color: z.string().startsWith("#"),
      }),
    },
    onSubmit: async ({ value }) => {
      await apiRequest("/api/admin/categories", {
        method: "POST",
        body: value,
      });
      form.reset();
      router.refresh();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4 rounded-lg border bg-card p-5 shadow-sm"
    >
      <div>
        <h2 className="font-semibold">Nouvelle catégorie</h2>
        <p className="mt-1 text-sm text-muted-foreground">Le référentiel reste administrable.</p>
      </div>
      
      <form.Field
        name="name"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Nom</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              required
              className={field.state.meta.errors.length > 0 ? "border-destructive" : ""}
            />
          </div>
        )}
      />

      <form.Field
        name="description"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Description</Label>
            <Textarea
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              required
              className={field.state.meta.errors.length > 0 ? "border-destructive" : ""}
            />
          </div>
        )}
      />

      <form.Field
        name="color"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Couleur</Label>
            <Input
              id={field.name}
              name={field.name}
              type="color"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="h-10"
            />
          </div>
        )}
      />

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Création..." : "Créer"}
          </Button>
        )}
      />
    </form>
  );
}
