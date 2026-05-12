import { NextResponse } from "next/server";
import { getResourceBySlug, getResourceComments } from "@/lib/resources";
import { getCurrentUser } from "@/lib/session";

type ResourceRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_req: Request, { params }: ResourceRouteProps) {
  const user = await getCurrentUser();
  const { slug } = await params;
  const resource = await getResourceBySlug(slug, user?.id);

  if (!resource) {
    return NextResponse.json({ error: "Ressource introuvable" }, { status: 404 });
  }

  const comments = await getResourceComments(resource.id);

  return NextResponse.json({ resource, comments });
}
