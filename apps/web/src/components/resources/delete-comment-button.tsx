"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";

type DeleteCommentButtonProps = {
  commentId: string;
  slug: string;
};

export function DeleteCommentButton({
  commentId,
  slug,
}: DeleteCommentButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function removeComment() {
    const confirmed = window.confirm("Supprimer définitivement ce commentaire ?");
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      await apiRequest("/api/resources/comments", {
        method: "DELETE",
        body: { commentId, slug },
      });
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-muted-foreground hover:text-destructive"
      disabled={isDeleting}
      onClick={removeComment}
      aria-label="Supprimer le commentaire"
    >
      <Trash2 className="size-3.5" />
      {isDeleting ? "Suppression..." : "Supprimer"}
    </Button>
  );
}
