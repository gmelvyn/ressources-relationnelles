import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { expo } from "@better-auth/expo";
import { admin } from "better-auth/plugins";
import prisma from "./prisma";

const trustedOrigins = [
  process.env.BETTER_AUTH_URL,
  process.env.MOBILE_AUTH_ORIGIN,
  "mobile://",
  "mobile://*",
  ...(process.env.NODE_ENV === "development"
    ? [
        "exp://",
        "exp://**",
        "http://localhost:8081",
        "http://localhost:19006",
        "http://127.0.0.1:8081",
      ]
    : []),
].filter((origin): origin is string => Boolean(origin));

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins,
  user: {
    additionalFields: {
      bio: {
        type: "string",
        required: false,
        input: true,
        fieldName: "bio",
      },
    },
  },
  plugins: [admin(), expo()],
});
