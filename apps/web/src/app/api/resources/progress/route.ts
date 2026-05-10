import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { updateResourceProgress } from "@/lib/resources";

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { resourceId, intent } = body;

    if (!resourceId || !intent) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const progress = await updateResourceProgress(user.id, { resourceId, intent });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("[RESOURCES_PROGRESS_POST]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
