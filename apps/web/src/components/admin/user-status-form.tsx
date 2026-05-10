"use client";

import { useForm } from "@tanstack/react-form";
import { toggleUserStatusAction } from "@/app/actions/resource";
import { Button } from "@/components/ui/button";

type UserStatusFormProps = {
  userId: string;
  isBanned: boolean;
  isDisabled?: boolean;
};

export function UserStatusForm({ userId, isBanned, isDisabled }: UserStatusFormProps) {
  const form = useForm({
    onSubmit: async () => {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("action", isBanned ? "unban" : "ban");
      await toggleUserStatusAction(formData);
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
