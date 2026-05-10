"use client";

import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { createCommentAction } from "@/app/actions/resource";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type CommentFormProps = {
  resourceId: string;
  slug: string;
  parentId?: string;
  isAuthenticated: boolean;
};

export function CommentForm({ resourceId, slug, parentId, isAuthenticated }: CommentFormProps) {
  const form = useForm({
    defaultValues: {
      content: "",
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: z.object({
        content: z.string().min(2, "Le commentaire est trop court").max(1200, "Le commentaire est trop long"),
      }),
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("resourceId", resourceId);
      formData.append("slug", slug);
      formData.append("content", value.content);
      if (parentId) formData.append("parentId", parentId);

      await createCommentAction(formData);
      form.reset();
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
