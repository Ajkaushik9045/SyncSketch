// src/config/env
import dotenv from "dotenv";
import { z } from "zod";
// ✅ Cache parsed config to prevent re-parsing on multiple imports
let cachedConfig: ReturnType<typeof parseEnv> | null = null;

function parseEnv() {
  // Load .env once
  dotenv.config();

  // Define schema
  const envSchema = z.object({
    PORT: z.string().default("3000"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    JWT_SECRET: z.string().min(6, "JWT_SECRET must be at least 6 chars long"),
    JWT_EXPIRES_IN: z.string().default("24h"),
    JWT_REFRESH_SECRET: z.string().min(6, "JWT_REFRESH_SECRET must be at least 6 chars long"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

    MONGO_URI: z.string().regex(
      /^mongodb(\+srv)?:\/\/.+/,
      "MONGO_URI must be a valid MongoDB connection string"
    ),

    SMTP_HOST: z.string(),
    SMTP_PORT: z
      .string()
      .transform((val) => {
        const port = parseInt(val, 10);
        if (isNaN(port)) throw new Error("SMTP_PORT must be a number");
        return port;
      }),
    SMTP_USER: z.email("SMTP_USER must be a valid email"),
    SMTP_PASS: z.string(),
    SMTP_SECURE: z
      .string()
      .optional()
      .transform((val) => val === "true"),

    MAIL_SENDER_NAME: z.string().default("No-Reply"),
  });

  return envSchema.parse(process.env);
}

// Export cached config
const env = cachedConfig ?? (cachedConfig = parseEnv());



export const config = {
  server: {
    port: env.PORT ? Number(env.PORT) : 3000,
    env: env.NODE_ENV,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  database: {
    uri: env.MONGO_URI,
  },
  mail: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    secure: env.SMTP_SECURE ?? false,
    senderName: env.MAIL_SENDER_NAME,
  },
};
