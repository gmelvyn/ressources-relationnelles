import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { canAdminUsers, hasRequiredSensitiveAuth, isSensitiveRole } from "@/lib/permissions";
import { updateUserRole, toggleUserStatus } from "@/lib/admin";
import { getAdminUsers } from "@/lib/resources";
import prisma from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  if (!user || !canAdminUsers(user.role) || !hasRequiredSensitiveAuth(user.role, user.twoFactorEnabled)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const users = await getAdminUsers();

  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();

  if (!user || !canAdminUsers(user.role) || !hasRequiredSensitiveAuth(user.role, user.twoFactorEnabled)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId, role, action } = body;

    if (!userId) {
      return NextResponse.json({ error: "ID utilisateur manquant" }, { status: 400 });
    }

    let result;
    if (role) {
      if (isSensitiveRole(role)) {
        const targetUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { twoFactorEnabled: true },
        });

        if (!targetUser?.twoFactorEnabled) {
          return NextResponse.json(
            { error: "La 2FA doit être activée avant d'attribuer un rôle sensible." },
            { status: 400 },
          );
        }
      }

      result = await updateUserRole(userId, role);
    } else if (action) {
      if (userId === user.id) {
        return NextResponse.json({ error: "Vous ne pouvez pas modifier votre propre statut" }, { status: 400 });
      }
      result = await toggleUserStatus(userId, action);
    } else {
      return NextResponse.json({ error: "Action ou rôle manquant" }, { status: 400 });
    }

    revalidatePath("/admin");

    return NextResponse.json(result);
  } catch (error) {
    console.error("[ADMIN_USERS_PATCH]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
