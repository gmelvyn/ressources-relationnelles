import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { moderateComment } from "@/lib/admin";
import { canModerate, hasRequiredSensitiveAuth } from "@/lib/permissions";
import { getCurrentUser } from "@/lib/session";

export async function PATCH(req: Request) {
  const user = await getCurrentUser();

  if (!user || !canModerate(user.role) || !hasRequiredSensitiveAuth(user.role, user.twoFactorEnabled)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const { commentId, action } = await req.json();

    if (!commentId || !["publish", "hide"].includes(action)) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const comment = await moderateComment(commentId, action, user.id);

    revalidatePath("/admin");
    revalidatePath("/resources");
    revalidatePath("/dashboard/profile");

    return NextResponse.json(comment);
  } catch (error) {
    console.error("[ADMIN_COMMENTS_PATCH]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();

  if (!user || !canModerate(user.role) || !hasRequiredSensitiveAuth(user.role, user.twoFactorEnabled)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const { commentId } = await req.json();

    if (!commentId) {
      return NextResponse.json({ error: "ID commentaire manquant" }, { status: 400 });
    }

    await moderateComment(commentId, "delete", user.id);

    revalidatePath("/admin");
    revalidatePath("/resources");
    revalidatePath("/dashboard/profile");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_COMMENTS_DELETE]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
