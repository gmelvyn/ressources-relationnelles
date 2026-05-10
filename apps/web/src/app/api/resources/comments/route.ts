import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { createResourceComment } from "@/lib/resources";

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { resourceId, content } = body;

    if (!resourceId || !content || content.length < 2) {
      return NextResponse.json({ error: "Commentaire trop court ou invalide" }, { status: 400 });
    }

    const comment = await createResourceComment(user.id, body);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("[RESOURCES_COMMENTS_POST]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
