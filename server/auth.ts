import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";
import { admin } from "better-auth/plugins/admin";
import { dialect } from "./db";

export const auth = betterAuth({
    database: {
        dialect,
        type: "postgres",
    },
    emailAndPassword: {
        enabled: true,
    },
    user: {
        modelName: "users",
        fields: {
            image: "avatar_url",
            createdAt: "created_at",
            updatedAt: "updated_at",
            emailVerified: "email_verified",
            role: "role",
            banned: "banned",
            banReason: "ban_reason",
            banExpires: "ban_expires",
            lastProjectId: "last_project_id",
        }
    },
    session: {
        fields: {
            createdAt: "created_at",
            updatedAt: "updated_at",
            expiresAt: "expires_at",
            ipAddress: "ip_address",
            userAgent: "user_agent",
            userId: "user_id",
            impersonatedBy: "impersonated_by"
        }
    },
    account: {
        fields: {
            createdAt: "created_at",
            updatedAt: "updated_at",
            accountId: "account_id",
            providerId: "provider_id",
            userId: "user_id",
            accessToken: "access_token",
            refreshToken: "refresh_token",
            idToken: "id_token",
            accessTokenExpiresAt: "access_token_expires_at",
            refreshTokenExpiresAt: "refresh_token_expires_at",
            password: "password"
        }
    },
    verification: {
        fields: {
            createdAt: "created_at",
            updatedAt: "updated_at",
            expiresAt: "expires_at",
            value: "value",
            identifier: "identifier"
        }
    },
    databaseHooks: {
        user: {
            create: {
                before: async (record) => {
                    // @ts-ignore
                    record.id = crypto.randomUUID();
                }
            }
        },
        session: {
            create: {
                before: async (record) => {
                    // @ts-ignore
                    record.id = crypto.randomUUID();
                }
            }
        },
        account: {
            create: {
                before: async (record) => {
                    // @ts-ignore
                    record.id = crypto.randomUUID();
                }
            }
        }
    },
    socialProviders: {
        // google: {
        //   clientId: process.env.GOOGLE_CLIENT_ID || "",
        //   clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        // },
    },
    plugins: [
        openAPI(),
        admin(),
    ],
    trustedOrigins: [
        "http://localhost:5173", // Vite default
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:4000", // Server key
        "vemakin://*", // Capacitor app (if needed)
    ],
});
