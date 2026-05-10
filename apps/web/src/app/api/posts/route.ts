import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { createPost } from "@/lib/posts";

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const content = formData.get("content") as string;
    const imageFile = formData.get("image") as File | null;

    if ((!content || content.trim().length === 0) && (!imageFile || imageFile.size === 0)) {
      return NextResponse.json({ error: "Le post ne peut pas être vide." }, { status: 400 });
    }

    if (imageFile && imageFile.size > 0) {
      if (!imageFile.type.startsWith("image/")) {
        return NextResponse.json({ error: "Le fichier doit être une image." }, { status: 400 });
      }
      if (imageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "L'image ne doit pas dépasser 5MB." }, { status: 400 });
      }
    }

    const post = await createPost(user.id, { content, imageFile });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("[POSTS_POST]", error);
    return NextResponse.json({ error: "Erreur lors de la création du post" }, { status: 500 });
  }
}
