import { NextResponse } from "next/server";
import { canAdminCatalog, canAdminUsers, canModerate } from "@/lib/permissions";
import { getAdminOverview, getAdminUsers, getResources } from "@/lib/resources";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();

  if (!user || !canModerate(user.role)) {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  const [overview, pendingResources, users] = await Promise.all([
    getAdminOverview(),
    getResources({ status: "PENDING_REVIEW" }, user.id),
    canAdminUsers(user.role) ? getAdminUsers() : Promise.resolve([]),
  ]);

  return NextResponse.json({
    user,
    overview,
    pendingResources,
    users,
    permissions: {
      canAdminCatalog: canAdminCatalog(user.role),
      canAdminUsers: canAdminUsers(user.role),
    },
  });
}
