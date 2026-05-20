"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";

type UserStatusFormProps = {
  userId: string;
  isBanned: boolean;
  isDisabled?: boolean;
};

export function UserStatusForm({ userId, isBanned, isDisabled }: UserStatusFormProps) {
  const router = useRouter();
  const form = useForm({
    onSubmit: async () => {
      await apiRequest("/api/admin/users", {
        method: "PATCH",
        body: { userId, action: isBanned ? "unban" : "ban" },
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
      className="text-right"
    >
      <form.Subscribe
        selector={(state) => [state.isSubmitting]}
        children={([isSubmitting]) => (
          <Button type="submit" variant="outline" size="sm" disabled={isDisabled || isSubmitting}>
            {isBanned ? "Réactiver" : "Désactiver"}
          </Button>
        )}
      />
    </form>
  );
}
