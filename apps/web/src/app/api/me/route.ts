import { NextResponse } from "next/server";
import { canAdminCatalog, canAdminUsers, canModerate } from "@/lib/permissions";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();

  return NextResponse.json({
    user,
    permissions: {
      canModerate: canModerate(user?.role),
      canAdminCatalog: canAdminCatalog(user?.role),
      canAdminUsers: canAdminUsers(user?.role),
    },
  });
}
