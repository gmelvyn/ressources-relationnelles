import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { deleteResource } from "@/lib/admin";
import { canAdminCatalog, hasRequiredSensitiveAuth } from "@/lib/permissions";
import { getCurrentUser } from "@/lib/session";

export async function DELETE(req: Request) {
  const user = await getCurrentUser();

  if (!user || !canAdminCatalog(user.role) || !hasRequiredSensitiveAuth(user.role, user.twoFactorEnabled)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const { resourceId } = await req.json();

    if (!resourceId) {
      return NextResponse.json({ error: "ID ressource manquant" }, { status: 400 });
    }

    await deleteResource(resourceId);

    revalidatePath("/admin");
    revalidatePath("/resources");
    revalidatePath("/dashboard");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_RESOURCES_DELETE]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
