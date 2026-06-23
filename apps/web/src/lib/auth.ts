import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { expo } from "@better-auth/expo";
import { admin, twoFactor } from "better-auth/plugins";
import prisma from "./prisma";

const isProduction = process.env.NODE_ENV === "production";
const authBaseURL =
  process.env.BETTER_AUTH_URL ?? (isProduction ? undefined : "http://localhost:3000");
const authSecret = process.env.BETTER_AUTH_SECRET;

if (!authBaseURL) {
  throw new Error("BETTER_AUTH_URL est requis en production.");
}

if (isProduction && !authBaseURL.startsWith("https://")) {
  throw new Error("BETTER_AUTH_URL doit utiliser HTTPS en production.");
}

if (isProduction && (!authSecret || authSecret.length < 32)) {
  throw new Error("BETTER_AUTH_SECRET doit contenir au moins 32 caractères en production.");
}

const sessionSecret =
  authSecret ?? "local-recette-build-secret-change-in-real-env-0123456789";

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
  secret: sessionSecret,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    expiresIn: 60 * 30,
    updateAge: 60 * 5,
    freshAge: 60 * 10,
    cookieCache: {
      enabled: false,
    },
  },
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
  advanced: {
    useSecureCookies: isProduction,
    disableCSRFCheck: false,
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          await prisma.loginAudit.create({
            data: {
              userId: session.userId,
              sessionId: session.id,
              ipAddress: typeof session.ipAddress === "string" ? session.ipAddress : null,
              userAgent: typeof session.userAgent === "string" ? session.userAgent : null,
              event: "SIGN_IN",
              success: true,
            },
          });
        },
      },
    },
  },
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
  plugins: [
    admin(),
    twoFactor({
      issuer: "RRB",
      twoFactorCookieMaxAge: 60 * 5,
      trustDeviceMaxAge: 60 * 60 * 24 * 7,
    }),
    expo(),
  ],
});
