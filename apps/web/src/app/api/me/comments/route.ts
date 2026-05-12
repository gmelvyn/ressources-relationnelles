import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const comments = await prisma.resourceComment.findMany({
    where: { authorId: user.id, status: "VISIBLE" },
    include: {
      resource: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comments);
}
