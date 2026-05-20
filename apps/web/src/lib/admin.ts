import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { slugify } from "@/lib/slugify";
import { normalizeRole } from "@/lib/permissions";

export type ModerateResourceInput = {
  resourceId: string;
  action: string;
  reason?: string;
  moderatorId: string;
};

export async function moderateResource(input: ModerateResourceInput) {
  const { resourceId, action, reason, moderatorId } = input;

  const status =
    action === "publish"
      ? "PUBLISHED"
      : action === "suspend"
        ? "SUSPENDED"
        : action === "archive"
          ? "ARCHIVED"
          : "PENDING_REVIEW";

  return await prisma.resource.update({
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
          moderatorId,
        },
      },
    },
  });
}

export type CreateCategoryInput = {
  name: string;
  description: string;
  color?: string;
};

export async function createCategory(input: CreateCategoryInput) {
  const { name, description, color } = input;
  return await prisma.resourceCategory.create({
    data: {
      name,
      slug: `${slugify(name)}-${randomUUID().slice(0, 4)}`,
      description,
      color: color || "#0f766e",
    },
  });
}

export async function deleteResource(resourceId: string) {
  return await prisma.resource.delete({
    where: { id: resourceId },
  });
}

export async function moderateComment(
  commentId: string,
  action: "publish" | "delete" | "hide",
  moderatorId: string,
) {
  const comment = await prisma.resourceComment.findUniqueOrThrow({
    where: { id: commentId },
    select: { id: true, resourceId: true },
  });

  if (action === "delete") {
    await prisma.resourceModeration.create({
      data: {
        targetType: "COMMENT",
        targetId: comment.id,
        resourceId: comment.resourceId,
        moderatorId,
        action,
      },
    });

    return await prisma.resourceComment.delete({
      where: { id: comment.id },
    });
  }

  const status = action === "publish" ? "VISIBLE" : "HIDDEN";

  await prisma.resourceModeration.create({
    data: {
      targetType: "COMMENT",
      targetId: comment.id,
      resourceId: comment.resourceId,
      moderatorId,
      action,
    },
  });

  return await prisma.resourceComment.update({
    where: { id: comment.id },
    data: { status },
  });
}

export async function updateUserRole(userId: string, role: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: { role: normalizeRole(role) },
  });
}

export async function toggleUserStatus(userId: string, action: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      banned: action === "ban",
      banReason: action === "ban" ? "Désactivation administrative" : null,
      banExpires: null,
    },
  });
}
