"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api-client";

type ModerateResourceFormProps = {
  resourceId: string;
};

export function ModerateResourceForm({ resourceId }: ModerateResourceFormProps) {
  const router = useRouter();
  const publishForm = useForm({
    onSubmit: async () => {
      await apiRequest("/api/admin/moderate", {
        method: "POST",
        body: { resourceId, action: "publish" },
      });
      router.refresh();
    },
  });

  const suspendForm = useForm({
    defaultValues: {
      reason: "",
    },
    validators: {
      onChange: z.object({
        reason: z.string().min(1, "Motif requis"),
      }),
    },
    onSubmit: async ({ value }) => {
      await apiRequest("/api/admin/moderate", {
        method: "POST",
        body: { resourceId, action: "suspend", reason: value.reason },
      });
      router.refresh();
    },
  });

  return (
    <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/30 p-3">
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Publication..." : "Publier"}
            </Button>
          )}
        />
      </form>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          suspendForm.handleSubmit();
        }}
        className="flex gap-2"
      >
        <suspendForm.Field
          name="reason"
          children={(field) => (
            <Input
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Motif"
              className={`w-48 ${field.state.meta.errors.length > 0 ? "border-destructive" : ""}`}
            />
          )}
        />
        <suspendForm.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button type="submit" variant="outline" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Suspension..." : "Suspendre"}
            </Button>
          )}
        />
      </form>
    </div>
  );
}
