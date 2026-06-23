import { NextResponse } from "next/server";
import { canAdminCatalog, canAdminUsers, canModerate, hasRequiredSensitiveAuth } from "@/lib/permissions";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();

  return NextResponse.json({
    user,
    permissions: {
      canModerate: canModerate(user?.role),
      canAdminCatalog: canAdminCatalog(user?.role),
      canAdminUsers: canAdminUsers(user?.role),
      hasRequiredSensitiveAuth: hasRequiredSensitiveAuth(user?.role, user?.twoFactorEnabled),
    },
  });
}
