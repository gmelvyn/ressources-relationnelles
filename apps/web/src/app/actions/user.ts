"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeUsername(value: string) {
  return value
    .replace(/^@+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
}

export async function updateProfileAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const firstName = formString(formData, "firstName");
  const lastName = formString(formData, "lastName");
  const displayName = formString(formData, "name");
  const username = normalizeUsername(formString(formData, "username"));
  const bio = formString(formData, "bio");
  const name = displayName || [firstName, lastName].filter(Boolean).join(" ");

  if (!name) {
    redirect("/dashboard/settings?error=name");
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        firstName: firstName || null,
        lastName: lastName || null,
        username: username || null,
        bio: bio || null,
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      redirect("/dashboard/settings?error=username");
    }

    console.error("Erreur de mise à jour du profil", error);
    redirect("/dashboard/settings?error=unknown");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?updated=1");
}

export async function deleteAccountAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const confirmation = formString(formData, "confirmation");

  if (confirmation !== "SUPPRIMER") {
    redirect("/dashboard/settings?error=delete-confirmation");
  }

  try {
    await prisma.user.delete({
      where: { id: user.id },
    });
  } catch (error) {
    console.error("Erreur de suppression du compte", error);
    redirect("/dashboard/settings?error=delete-account");
  }

  revalidatePath("/");
  revalidatePath("/resources");
  revalidatePath("/dashboard");
  redirect("/login?accountDeleted=1");
}
