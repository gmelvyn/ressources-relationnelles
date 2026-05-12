import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const liked = await prisma.resourceProgress.findMany({
    where: { userId: user.id, isFavorite: true },
    include: {
      resource: {
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          imageUrl: true,
          createdAt: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(liked.map((p) => p.resource));
}
