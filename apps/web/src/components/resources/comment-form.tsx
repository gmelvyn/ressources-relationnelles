"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api-client";

type CommentFormProps = {
  resourceId: string;
  slug: string;
  parentId?: string;
  isAuthenticated: boolean;
};

export function CommentForm({ resourceId, slug, parentId, isAuthenticated }: CommentFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: {
      content: "",
    },
    validators: {
      onChange: z.object({
        content: z.string().min(2, "Le commentaire est trop court").max(1200, "Le commentaire est trop long"),
      }),
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        const comment = await apiRequest<{ id: string }>("/api/resources/comments", {
          method: "POST",
          body: {
            resourceId,
            slug,
            content: value.content,
            parentId,
          },
        });
        form.reset();
        router.replace(`/resources/${slug}?comment=${comment.id}#echanges`);
        router.refresh();
      } catch (error) {
        setServerError(error instanceof Error ? error.message : "Impossible de publier le commentaire.");
      }
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        Connectez-vous pour participer aux échanges modérés autour de cette ressource.
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-3"
    >
      {serverError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </div>
      ) : null}
      <form.Field
        name="content"
        children={(field) => (
          <>
            <Textarea
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              required
              minLength={2}
              maxLength={1200}
              placeholder="Ajouter un commentaire"
              className={field.state.meta.errors.length > 0 ? "border-destructive" : ""}
            />
            {field.state.meta.errors ? (
              <p className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</p>
            ) : null}
          </>
        )}
      />
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Publication..." : "Publier"}
          </Button>
        )}
      />
    </form>
  );
}
