"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { updateUserRoleAction } from "@/app/actions/resource";
import { Button } from "@/components/ui/button";
import { roles } from "@/lib/permissions";

type UserRoleFormProps = {
  userId: string;
  currentRole: string;
};

export function UserRoleForm({ userId, currentRole }: UserRoleFormProps) {
  const form = useForm({
    defaultValues: {
      role: currentRole,
    },
    validators: {
      onChange: z.object({
        role: z.string(),
      }),
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("role", value.role);
      await updateUserRoleAction(formData);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex gap-2"
    >
      <form.Field
        name="role"
        children={(field) => (
          <select
            name={field.name}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            className="h-9 w-full rounded-md border bg-background px-2"
          >
            <option value={roles.citizen}>Citoyen</option>
            <option value={roles.moderator}>Modérateur</option>
            <option value={roles.catalogAdmin}>Administrateur catalogue</option>
            <option value={roles.superAdmin}>Super-administrateur</option>
          </select>
        )}
      />
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button type="submit" variant="outline" size="sm" disabled={!canSubmit || isSubmitting}>
            OK
          </Button>
        )}
      />
    </form>
  );
}
