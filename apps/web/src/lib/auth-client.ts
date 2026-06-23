import {
  adminClient,
  inferAdditionalFields,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    twoFactorClient({
      twoFactorPage: "/dashboard/settings",
    }),
    inferAdditionalFields<typeof auth>(),
  ],
});
