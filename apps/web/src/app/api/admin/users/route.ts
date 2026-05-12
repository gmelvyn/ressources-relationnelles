import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canAdminUsers } from "@/lib/permissions";
import { updateUserRole, toggleUserStatus } from "@/lib/admin";
import { getAdminUsers } from "@/lib/resources";

export async function GET() {
  const user = await getCurrentUser();

  if (!user || !canAdminUsers(user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const users = await getAdminUsers();

  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();

  if (!user || !canAdminUsers(user.role)) {
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
      result = await updateUserRole(userId, role);
    } else if (action) {
      if (userId === user.id) {
        return NextResponse.json({ error: "Vous ne pouvez pas modifier votre propre statut" }, { status: 400 });
      }
      result = await toggleUserStatus(userId, action);
    } else {
      return NextResponse.json({ error: "Action ou rôle manquant" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[ADMIN_USERS_PATCH]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
