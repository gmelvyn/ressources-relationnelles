"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { createPost } from "@/lib/posts";

export async function createPostAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Vous devez être connecté pour publier." };
  }

  const content = formData.get("content") as string;
  const imageFile = formData.get("image") as File | null;

  if ((!content || typeof content !== "string" || content.trim().length === 0) && (!imageFile || imageFile.size === 0)) {
    return { error: "Le post ne peut pas être vide." };
  }

  try {
    await createPost(user.id, { content, imageFile });

    revalidatePath("/portal");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la création du post:", error);
    return { error: "Une erreur est survenue lors de la publication." };
  }
}
