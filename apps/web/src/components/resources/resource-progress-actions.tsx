"use client";

import { Bookmark, CheckCircle2, Heart, PlayCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useForm } from "@tanstack/react-form";
import { updateProgressAction } from "@/app/actions/resource";
import { Button } from "@/components/ui/button";
import type { ResourceListItem } from "@/lib/resources";

type ResourceProgressActionsProps = {
  resource: ResourceListItem;
  isAuthenticated: boolean;
  redirectTo: string;
};

function ProgressButton({
  resourceId,
  intent,
  redirectTo,
  children,
  variant = "outline",
}: {
  resourceId: string;
  intent: string;
  redirectTo: string;
  children: ReactNode;
  variant?: "outline" | "default" | "secondary";
}) {
  const form = useForm({
    onSubmit: async () => {
      const formData = new FormData();
      formData.append("resourceId", resourceId);
      formData.append("intent", intent);
      formData.append("redirectTo", redirectTo);
      await updateProgressAction(formData);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Subscribe
        selector={(state) => [state.isSubmitting]}
        children={([isSubmitting]) => (
          <Button type="submit" variant={variant} className="w-full sm:w-auto" disabled={isSubmitting}>
            {children}
          </Button>
        )}
      />
    </form>
  );
}

export function ResourceProgressActions({ resource, isAuthenticated, redirectTo }: ResourceProgressActionsProps) {
  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        Connectez-vous pour marquer vos favoris, mettre une ressource de côté et suivre votre progression.
      </div>
    );
  }

  const progress = resource.progress;

  return (
    <div className="grid gap-2 sm:flex sm:flex-wrap">
      <ProgressButton
        resourceId={resource.id}
        intent={progress?.isFavorite ? "unfavorite" : "favorite"}
        redirectTo={redirectTo}
      >
        <Heart className={progress?.isFavorite ? "size-4 fill-rose-600 text-rose-600" : "size-4"} />
        {progress?.isFavorite ? "Retirer des favoris" : "Favori"}
      </ProgressButton>

      <ProgressButton
        resourceId={resource.id}
        intent={progress?.isSaved ? "unsave" : "save"}
        redirectTo={redirectTo}
      >
        <Bookmark className={progress?.isSaved ? "size-4 fill-teal-700 text-teal-700" : "size-4"} />
        {progress?.isSaved ? "Retirer" : "Mettre de côté"}
      </ProgressButton>

      <ProgressButton resourceId={resource.id} intent="start" redirectTo={redirectTo} variant="secondary">
        <PlayCircle className="size-4" />
        Démarrer
      </ProgressButton>

      <ProgressButton resourceId={resource.id} intent="complete" redirectTo={redirectTo} variant="default">
        <CheckCircle2 className="size-4" />
        Exploitée
      </ProgressButton>
    </div>
  );
}
