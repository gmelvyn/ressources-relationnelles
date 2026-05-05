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
  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        Connectez-vous pour participer aux échanges modérés autour de cette ressource.
      </div>
    );
  }

  return (
    <form action={createCommentAction} className="space-y-3">
      <input type="hidden" name="resourceId" value={resourceId} />
      <input type="hidden" name="slug" value={slug} />
      {parentId ? <input type="hidden" name="parentId" value={parentId} /> : null}
      <Textarea name="content" required minLength={2} maxLength={1200} placeholder="Ajouter un commentaire" />
      <Button type="submit">Publier</Button>
    </form>
  );
}
