"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { canAdminCatalog, canAdminUsers, canModerate, normalizeRole } from "@/lib/permissions";
import { slugify } from "@/lib/slugify";
import { getCurrentUser } from "@/lib/session";

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function uniqueSlug(title: string) {
  const base = slugify(title) || "ressource";
  let slug = base;
  let index = 1;

  while (await prisma.resource.findUnique({ where: { slug }, select: { id: true } })) {
    index += 1;
    slug = `${base}-${index}`;
  }

  return slug;
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

  const status = canModerate(user.role) || visibility === "PRIVATE" ? "PUBLISHED" : "PENDING_REVIEW";

  try {
    await prisma.resource.create({
      data: {
        title,
        slug: await uniqueSlug(title),
        summary,
        content,
        sourceUrl: sourceUrl || null,
        durationMinutes: Number.isNaN(duration) ? null : duration,
        visibility,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        categoryId,
        typeId,
        authorId: user.id,
        relations: {
          create: relationTypeIds.map((relationTypeId) => ({
            relationTypeId,
          })),
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/resources");
    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return {
      success:
        status === "PUBLISHED"
          ? "Ressource publiée."
          : "Ressource envoyée en modération avant publication.",
    };
  } catch (error) {
    console.error("Erreur de création de ressource", error);
    return { error: "Impossible d'enregistrer la ressource. Vérifiez que les migrations sont appliquées." };
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

  const now = new Date();
  const data =
    intent === "favorite"
      ? { isFavorite: true }
      : intent === "unfavorite"
        ? { isFavorite: false }
        : intent === "save"
          ? { isSaved: true }
          : intent === "unsave"
            ? { isSaved: false }
            : intent === "start"
              ? { status: "IN_PROGRESS", startedAt: now }
              : intent === "complete"
                ? { status: "COMPLETED", completedAt: now, exploitedAt: now }
                : intent === "exploit"
                  ? { status: "EXPLOITED", exploitedAt: now }
                  : { status: "NOT_STARTED", completedAt: null, exploitedAt: null };

  try {
    await prisma.resourceProgress.upsert({
      where: {
        userId_resourceId: {
          userId: user.id,
          resourceId,
        },
      },
      create: {
        userId: user.id,
        resourceId,
        ...data,
      },
      update: data,
    });

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
    await prisma.resourceComment.create({
      data: {
        resourceId,
        authorId: user.id,
        parentId: parentId || null,
        content,
      },
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

  const status =
    action === "publish"
      ? "PUBLISHED"
      : action === "suspend"
        ? "SUSPENDED"
        : action === "archive"
          ? "ARCHIVED"
          : "PENDING_REVIEW";

  try {
    await prisma.resource.update({
      where: { id: resourceId },
      data: {
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : undefined,
        suspendedAt: status === "SUSPENDED" ? new Date() : null,
        moderationEvents: {
          create: {
            targetType: "RESOURCE",
            targetId: resourceId,
            action,
            reason: reason || null,
            moderatorId: user.id,
          },
        },
      },
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
  const color = formString(formData, "color") || "#0f766e";

  if (!name || !description) {
    redirect("/admin");
  }

  try {
    await prisma.resourceCategory.create({
      data: {
        name,
        slug: `${slugify(name)}-${randomUUID().slice(0, 4)}`,
        description,
        color,
      },
    });

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
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
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
    await prisma.user.update({
      where: { id: userId },
      data: {
        banned: action === "ban",
        banReason: action === "ban" ? "Désactivation administrative" : null,
        banExpires: null,
      },
    });
    revalidatePath("/admin");
  } catch (error) {
    console.error("Erreur de statut utilisateur", error);
  }

  redirect("/admin");
}
