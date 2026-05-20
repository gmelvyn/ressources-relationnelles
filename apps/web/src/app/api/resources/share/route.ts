import { NextResponse } from "next/server";
import { shareResource } from "@/lib/resources";

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => null);
    const resourceId =
      typeof payload?.resourceId === "string" ? payload.resourceId : null;

    if (!resourceId) {
      return NextResponse.json({ error: "ID ressource manquant" }, { status: 400 });
    }

    const resource = await shareResource(resourceId);
    return NextResponse.json(resource);
  } catch (error) {
    console.error("[RESOURCE_SHARE]", error);
    return NextResponse.json({ error: "Erreur lors du partage" }, { status: 500 });
  }
}
