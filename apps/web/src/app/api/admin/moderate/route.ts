import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { canModerate, hasRequiredSensitiveAuth } from "@/lib/permissions";
import { moderateResource } from "@/lib/admin";

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user || !canModerate(user.role) || !hasRequiredSensitiveAuth(user.role, user.twoFactorEnabled)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { resourceId, action } = body;

    if (!resourceId || !action) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const resource = await moderateResource({
      ...body,
      moderatorId: user.id,
    });

    revalidatePath("/admin");
    revalidatePath("/resources");

    return NextResponse.json(resource);
  } catch (error) {
    console.error("[ADMIN_MODERATE_POST]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
