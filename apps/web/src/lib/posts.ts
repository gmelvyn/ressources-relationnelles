import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export type CreatePostInput = {
  content?: string;
  imageFile?: File | null;
};

export async function createPost(userId: string, input: CreatePostInput) {
  const { content, imageFile } = input;

  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const uniqueName = `${randomUUID()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
    const filePath = join(uploadDir, uniqueName);

    await writeFile(filePath, buffer);
    imageUrl = `/uploads/${uniqueName}`;
  }

  return await prisma.post.create({
    data: {
      content: content || "",
      image: imageUrl,
      authorId: userId,
    },
  });
}
