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
