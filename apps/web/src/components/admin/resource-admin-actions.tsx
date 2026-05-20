"use client";

import { Trash2 } from "lucide-react";
import { deleteResourceAction } from "@/app/actions/resource";
import { Button } from "@/components/ui/button";

type ResourceAdminActionsProps = {
  resourceId: string;
};

export function ResourceAdminActions({ resourceId }: ResourceAdminActionsProps) {
  return (
    <form action={deleteResourceAction} className="rounded-lg border bg-muted/30 p-3 text-right">
      <input type="hidden" name="resourceId" value={resourceId} />
      <Button type="submit" variant="outline" size="sm">
        <Trash2 className="size-4" />
        Supprimer
      </Button>
    </form>
  );
}
