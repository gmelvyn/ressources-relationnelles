import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { expo } from "@better-auth/expo";
import { admin } from "better-auth/plugins";
import prisma from "./prisma";

const authBaseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
const authSecret =
  process.env.BETTER_AUTH_SECRET ??
  "local-recette-build-secret-change-in-real-env-0123456789";

const trustedOrigins = [
  authBaseURL,
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
  baseURL: authBaseURL,
  secret: authSecret,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      console.info(`Email de confirmation pour ${user.email}: ${url}`);
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600,
  },
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
      firstName: {
        type: "string",
        required: false,
        input: true,
        fieldName: "firstName",
      },
      lastName: {
        type: "string",
        required: false,
        input: true,
        fieldName: "lastName",
      },
    },
  },
  plugins: [admin(), expo()],
});
