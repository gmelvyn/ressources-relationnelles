import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const resources = await prisma.resource.findMany({
    where: { authorId: user.id },
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      imageUrl: true,
      status: true,
      visibility: true,
      createdAt: true,
      category: { select: { name: true, color: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(resources);
}
