import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { canModerate } from "@/lib/permissions";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { createResourceComment, getResourceComments } from "@/lib/resources";

export async function GET(req: Request) {
  const resourceId = new URL(req.url).searchParams.get("resourceId");

  if (!resourceId) {
    return NextResponse.json({ error: "ID ressource manquant" }, { status: 400 });
  }

  const comments = await getResourceComments(resourceId);

  return NextResponse.json({ comments });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { resourceId, content, slug } = body;

    if (!resourceId || !content || content.length < 2) {
      return NextResponse.json({ error: "Commentaire trop court ou invalide" }, { status: 400 });
    }

    const comment = await createResourceComment(user.id, body);

    if (slug) {
      revalidatePath(`/resources/${slug}`);
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("[RESOURCES_COMMENTS_POST]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { commentId, slug } = body;

    if (!commentId) {
      return NextResponse.json({ error: "ID commentaire manquant" }, { status: 400 });
    }

    const comment = await prisma.resourceComment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        authorId: true,
        resource: { select: { slug: true } },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Commentaire introuvable" }, { status: 404 });
    }

    if (comment.authorId !== user.id && !canModerate(user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    await prisma.resourceComment.delete({
      where: { id: comment.id },
    });

    revalidatePath(`/resources/${slug || comment.resource.slug}`);
    revalidatePath("/dashboard/profile");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[RESOURCES_COMMENTS_DELETE]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
