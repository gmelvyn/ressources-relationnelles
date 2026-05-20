import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { normalizeRole } from "@/lib/permissions";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  username?: string | null;
  bio?: string | null;
  role: string;
  emailVerified?: boolean;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        username: true,
        bio: true,
        role: true,
        emailVerified: true,
      },
    });

    if (user) {
      return {
        ...user,
        role: normalizeRole(user.role),
      };
    }
  } catch (error) {
    console.error("Impossible de charger l'utilisateur courant", error);
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: "citizen",
    emailVerified: session.user.emailVerified,
  };
}
