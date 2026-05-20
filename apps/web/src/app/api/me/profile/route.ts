import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";

function normalizeUsername(value?: string | null) {
  return (value ?? "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
    const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
    const displayName = typeof body.name === "string" ? body.name.trim() : "";
    const username = normalizeUsername(body.username);
    const bio = typeof body.bio === "string" ? body.bio.trim() : "";
    const name = displayName || [firstName, lastName].filter(Boolean).join(" ");

    if (!name) {
      return NextResponse.json({ error: "Le nom affiché est obligatoire." }, { status: 400 });
    }

    const profile = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        firstName: firstName || null,
        lastName: lastName || null,
        username: username || null,
        bio: bio || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        firstName: true,
        lastName: true,
        username: true,
        bio: true,
        role: true,
        emailVerified: true,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/settings");

    return NextResponse.json({ profile });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "Ce pseudo est déjà utilisé." }, { status: 409 });
    }

    console.error("[ME_PROFILE_PATCH]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));

    if (body.confirmation !== "SUPPRIMER") {
      return NextResponse.json(
        { error: "Pour supprimer votre compte, saisissez exactement SUPPRIMER." },
        { status: 400 },
      );
    }

    await prisma.user.delete({
      where: { id: user.id },
    });

    revalidatePath("/");
    revalidatePath("/resources");
    revalidatePath("/dashboard");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ME_PROFILE_DELETE]", error);
    return NextResponse.json(
      { error: "Impossible de supprimer le compte pour le moment." },
      { status: 500 },
    );
  }
}
