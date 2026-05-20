"use client";

import { Bookmark, CheckCircle2, Heart } from "lucide-react";
import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api-client";
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
  className,
}: {
  resourceId: string;
  intent: string;
  redirectTo: string;
  children: ReactNode;
  variant?: "outline" | "default" | "secondary";
  className?: string;
}) {
  const router = useRouter();

  async function submit() {
    await apiRequest("/api/resources/progress", {
      method: "POST",
      body: { resourceId, intent },
    });
    router.refresh();
    router.push(redirectTo);
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Button
        type="submit"
        variant={variant}
        className={cn("w-full sm:w-auto", className)}
      >
        {children}
      </Button>
    </form>
  );
}

export function ResourceProgressActions({
  resource,
  isAuthenticated,
  redirectTo,
}: ResourceProgressActionsProps) {
  const searchParams = useSearchParams();
  const justExploited = searchParams.get("exploited") === "1";

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        Connectez-vous pour marquer vos favoris, mettre une ressource de côté et
        suivre votre progression.
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
        <Heart
          className={
            progress?.isFavorite
              ? "size-4 fill-rose-600 text-rose-600"
              : "size-4"
          }
        />
        {progress?.isFavorite ? "Retirer des favoris" : "Favori"}
      </ProgressButton>

      <ProgressButton
        resourceId={resource.id}
        intent={progress?.isSaved ? "unsave" : "save"}
        redirectTo={redirectTo}
      >
        <Bookmark
          className={
            progress?.isSaved ? "size-4 fill-teal-700 text-teal-700" : "size-4"
          }
        />
        {progress?.isSaved ? "Retirer" : "Mettre de côté"}
      </ProgressButton>

      <ProgressButton
        resourceId={resource.id}
        intent={progress?.status === "COMPLETED" ? "uncomplete" : "complete"}
        redirectTo={
          progress?.status === "COMPLETED"
            ? redirectTo
            : `${redirectTo}?exploited=1`
        }
        variant="outline"
        className={
          progress?.status === "COMPLETED" && justExploited
            ? "border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-700 dark:hover:bg-emerald-950/50 [animation:completed-pop_0.5s_ease-out]"
            : progress?.status === "COMPLETED"
              ? "border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-700 dark:hover:bg-emerald-950/50"
              : undefined
        }
      >
        <CheckCircle2
          className={
            progress?.status === "COMPLETED"
              ? "size-4 fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400"
              : "size-4"
          }
        />
        {progress?.status === "COMPLETED" ? "Exploitée" : "Exploiter"}
      </ProgressButton>
    </div>
  );
}
