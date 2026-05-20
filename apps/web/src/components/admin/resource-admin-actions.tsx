"use client";

import { Trash2 } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";

type ResourceAdminActionsProps = {
  resourceId: string;
};

export function ResourceAdminActions({ resourceId }: ResourceAdminActionsProps) {
  const router = useRouter();
  const form = useForm({
    onSubmit: async () => {
      await apiRequest("/api/admin/resources", {
        method: "DELETE",
        body: { resourceId },
      });
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
      className="rounded-lg border bg-muted/30 p-3 text-right"
    >
      <form.Subscribe
        selector={(state) => [state.isSubmitting]}
        children={([isSubmitting]) => (
          <Button type="submit" variant="outline" size="sm" disabled={isSubmitting}>
            <Trash2 className="size-4" />
            {isSubmitting ? "Suppression..." : "Supprimer"}
          </Button>
        )}
      />
    </form>
  );
}
