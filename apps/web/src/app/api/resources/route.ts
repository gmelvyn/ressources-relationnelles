import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import {
  ResourceCatalogValidationError,
  createResource,
  getCatalogMeta,
  getResources,
  type ResourceFilters,
} from "@/lib/resources";

function firstParam(value: string | null) {
  return value?.trim() || undefined;
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  const params = new URL(req.url).searchParams;
  const filters: ResourceFilters = {
    search: firstParam(params.get("search")),
    category: firstParam(params.get("category")),
    relation: firstParam(params.get("relation")),
    type: firstParam(params.get("type")),
    status: firstParam(params.get("status")),
  };

  const [meta, resources] = await Promise.all([getCatalogMeta(), getResources(filters, user?.id)]);

  return NextResponse.json({ meta, resources });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, summary, content, categoryId, typeId, relationTypeIds } = body;

    if (!title || !summary || !content || !categoryId || !typeId || !relationTypeIds?.length) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis." },
        { status: 400 }
      );
    }

    const resource = await createResource(user.id, user.role, body);

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    if (error instanceof ResourceCatalogValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("[RESOURCES_POST]", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la ressource" },
      { status: 500 }
    );
  }
}
