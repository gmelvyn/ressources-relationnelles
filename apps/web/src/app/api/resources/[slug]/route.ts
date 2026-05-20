import { NextResponse } from "next/server";
import { getResourceAccessBySlug, getResourceComments } from "@/lib/resources";
import { getCurrentUser } from "@/lib/session";

type ResourceRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_req: Request, { params }: ResourceRouteProps) {
  const user = await getCurrentUser();
  const { slug } = await params;
  const access = await getResourceAccessBySlug(slug, user?.id);
  const resource = access.resource;

  if (!resource && access.accessDenied) {
    return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  }

  if (!resource) {
    return NextResponse.json({ error: "Ressource introuvable" }, { status: 404 });
  }

  const comments = await getResourceComments(resource.id);

  return NextResponse.json({ resource, comments });
}
