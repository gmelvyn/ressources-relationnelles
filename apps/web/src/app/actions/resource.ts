"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canAdminCatalog, canAdminUsers, canModerate, normalizeRole } from "@/lib/permissions";
import { getCurrentUser } from "@/lib/session";
import {
  ResourceCatalogValidationError,
  createResource,
  updateResourceProgress,
  createResourceComment,
} from "@/lib/resources";
import { moderateResource, createCategory, updateUserRole, toggleUserStatus } from "@/lib/admin";

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createResourceAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Vous devez être connecté pour créer une ressource." };
  }

  const title = formString(formData, "title");
  const summary = formString(formData, "summary");
  const content = formString(formData, "content");
  const categoryId = formString(formData, "categoryId");
  const typeId = formString(formData, "typeId");
  const sourceUrl = formString(formData, "sourceUrl");
  const visibility = formString(formData, "visibility") || "PUBLIC";
  const duration = Number.parseInt(formString(formData, "durationMinutes"), 10);
  const relationTypeIds = formData
    .getAll("relationTypeIds")
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  if (!title || !summary || !content || !categoryId || !typeId || relationTypeIds.length === 0) {
    return { error: "Titre, résumé, contenu, catégorie, type et relation sont obligatoires." };
  }

  try {
    const resource = await createResource(user.id, user.role, {
      title,
      summary,
      content,
      categoryId,
      typeId,
      sourceUrl,
      visibility,
      durationMinutes: Number.isNaN(duration) ? undefined : duration,
      relationTypeIds,
    });

    revalidatePath("/");
    revalidatePath("/resources");
    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return {
      success:
        resource.status === "PUBLISHED"
          ? "Ressource publiée."
          : "Ressource envoyée en modération avant publication.",
    };
  } catch (error) {
    if (error instanceof ResourceCatalogValidationError) {
      return { error: error.message };
    }

    console.error("Erreur de création de ressource", error);
    return { error: "Impossible d'enregistrer la ressource." };
  }
}

export async function updateProgressAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const resourceId = formString(formData, "resourceId");
  const intent = formString(formData, "intent");
  const redirectTo = formString(formData, "redirectTo") || "/dashboard";

  if (!resourceId || !intent) {
    redirect(redirectTo);
  }

  try {
    await updateResourceProgress(user.id, { resourceId, intent });

    revalidatePath("/dashboard");
    revalidatePath("/resources");
    revalidatePath(redirectTo);
  } catch (error) {
    console.error("Erreur de progression", error);
  }

  redirect(redirectTo);
}

export async function createCommentAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const resourceId = formString(formData, "resourceId");
  const slug = formString(formData, "slug");
  const parentId = formString(formData, "parentId");
  const content = formString(formData, "content");

  if (!resourceId || !slug || content.length < 2) {
    redirect(slug ? `/resources/${slug}` : "/resources");
  }

  try {
    await createResourceComment(user.id, {
      resourceId,
      parentId: parentId || undefined,
      content,
    });

    revalidatePath(`/resources/${slug}`);
  } catch (error) {
    console.error("Erreur de commentaire", error);
  }

  redirect(`/resources/${slug}#echanges`);
}

export async function moderateResourceAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || !canModerate(user.role)) {
    redirect("/dashboard");
  }

  const resourceId = formString(formData, "resourceId");
  const action = formString(formData, "action");
  const reason = formString(formData, "reason");

  if (!resourceId || !action) {
    redirect("/admin");
  }

  try {
    await moderateResource({
      resourceId,
      action,
      reason,
      moderatorId: user.id,
    });

    revalidatePath("/admin");
    revalidatePath("/resources");
  } catch (error) {
    console.error("Erreur de modération", error);
  }

  redirect("/admin");
}

export async function createCategoryAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || !canAdminCatalog(user.role)) {
    redirect("/dashboard");
  }

  const name = formString(formData, "name");
  const description = formString(formData, "description");
  const color = formString(formData, "color");

  if (!name || !description) {
    redirect("/admin");
  }

  try {
    await createCategory({ name, description, color });

    revalidatePath("/admin");
    revalidatePath("/resources");
  } catch (error) {
    console.error("Erreur de catégorie", error);
  }

  redirect("/admin");
}

export async function updateUserRoleAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || !canAdminUsers(user.role)) {
    redirect("/dashboard");
  }

  const userId = formString(formData, "userId");
  const role = normalizeRole(formString(formData, "role"));

  if (!userId) {
    redirect("/admin");
  }

  try {
    await updateUserRole(userId, role);
    revalidatePath("/admin");
  } catch (error) {
    console.error("Erreur de mise à jour du rôle", error);
  }

  redirect("/admin");
}

export async function toggleUserStatusAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || !canAdminUsers(user.role)) {
    redirect("/dashboard");
  }

  const userId = formString(formData, "userId");
  const action = formString(formData, "action");

  if (!userId || userId === user.id) {
    redirect("/admin");
  }

  try {
    await toggleUserStatus(userId, action);
    revalidatePath("/admin");
  } catch (error) {
    console.error("Erreur de statut utilisateur", error);
  }

  redirect("/admin");
}
