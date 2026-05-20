"use client";

import { CheckCircle2, Trash2 } from "lucide-react";
import { moderateCommentAction } from "@/app/actions/resource";
import { Button } from "@/components/ui/button";

type CommentModerationFormProps = {
  commentId: string;
};

export function CommentModerationForm({ commentId }: CommentModerationFormProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <form action={moderateCommentAction}>
        <input type="hidden" name="commentId" value={commentId} />
        <input type="hidden" name="action" value="publish" />
        <Button type="submit" size="sm">
          <CheckCircle2 className="size-4" />
          Publier
        </Button>
      </form>

      <form action={moderateCommentAction}>
        <input type="hidden" name="commentId" value={commentId} />
        <input type="hidden" name="action" value="delete" />
        <Button type="submit" variant="outline" size="sm">
          <Trash2 className="size-4" />
          Supprimer
        </Button>
      </form>
    </div>
  );
}
