"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function createPostAction(formData: FormData) {
  const content = formData.get("content") as string;
  const imageFile = formData.get("image") as File | null;

  if ((!content || typeof content !== "string" || content.trim().length === 0) && !imageFile) {
    return { error: "Le post ne peut pas être vide." };
  }

  // Récupérer la session côté serveur
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "Vous devez être connecté pour publier." };
  }

  let imageUrl: string | null = null;

  // Gestion de l'upload d'image
  if (imageFile && imageFile.size > 0) {
    // Validation basique
    if (!imageFile.type.startsWith("image/")) {
      return { error: "Le fichier doit être une image." };
    }
    
    if (imageFile.size > 5 * 1024 * 1024) { // 5MB limit
      return { error: "L'image ne doit pas dépasser 5MB." };
    }

    try {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Créer le dossier uploads s'il n'existe pas
      const uploadDir = join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      // Générer un nom de fichier unique
      const uniqueName = `${randomUUID()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
      const filePath = join(uploadDir, uniqueName);

      // Écrire le fichier
      await writeFile(filePath, buffer);
      
      // Définir l'URL publique
      imageUrl = `/uploads/${uniqueName}`;
    } catch (error) {
      console.error("Erreur upload image:", error);
      return { error: "Échec de l'upload de l'image." };
    }
  }

  try {
    await prisma.post.create({
      data: {
        content: content || "",
        image: imageUrl,
        authorId: session.user.id,
      },
    });

    // Revalider le chemin pour rafraîchir l'affichage
    revalidatePath("/portal");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la création du post:", error);
    return { error: "Une erreur est survenue lors de la publication." };
  }
}
