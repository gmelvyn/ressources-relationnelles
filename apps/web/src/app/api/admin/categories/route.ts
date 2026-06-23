import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { canAdminCatalog, hasRequiredSensitiveAuth } from "@/lib/permissions";
import { createCategory } from "@/lib/admin";

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user || !canAdminCatalog(user.role) || !hasRequiredSensitiveAuth(user.role, user.twoFactorEnabled)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name || !description) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const category = await createCategory(body);

    revalidatePath("/admin");
    revalidatePath("/resources");

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_CATEGORIES_POST]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
