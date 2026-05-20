"use client";

import { CheckCircle2, Trash2 } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";

type CommentModerationFormProps = {
  commentId: string;
};

export function CommentModerationForm({ commentId }: CommentModerationFormProps) {
  const router = useRouter();
  const publishForm = useForm({
    onSubmit: async () => {
      await apiRequest("/api/admin/comments", {
        method: "PATCH",
        body: { commentId, action: "publish" },
      });
      router.refresh();
    },
  });

  const deleteForm = useForm({
    onSubmit: async () => {
      await apiRequest("/api/admin/comments", {
        method: "DELETE",
        body: { commentId },
      });
      router.refresh();
    },
  });

  return (
    <div className="flex flex-wrap gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          publishForm.handleSubmit();
        }}
      >
        <publishForm.Subscribe
          selector={(state) => [state.isSubmitting]}
          children={([isSubmitting]) => (
            <Button type="submit" size="sm" disabled={isSubmitting}>
              <CheckCircle2 className="size-4" />
              {isSubmitting ? "Publication..." : "Publier"}
            </Button>
          )}
        />
      </form>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          deleteForm.handleSubmit();
        }}
      >
        <deleteForm.Subscribe
          selector={(state) => [state.isSubmitting]}
          children={([isSubmitting]) => (
            <Button type="submit" variant="outline" size="sm" disabled={isSubmitting}>
              <Trash2 className="size-4" />
              {isSubmitting ? "Suppression..." : "Supprimer"}
            </Button>
          )}
        />
      </form>
    </div>
  );
}
