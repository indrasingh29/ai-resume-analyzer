import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(24, "JWT_SECRET must be at least 24 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_ORIGIN: z.string().default("http://localhost:3000"),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(5),
  PASSWORD_RESET_RESPONSE_MODE: z.enum(["inline", "generic"]).default("inline"),
  PASSWORD_RESET_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(30),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid API environment configuration", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid API environment configuration");
}

if (
  parsed.data.NODE_ENV === "production" &&
  parsed.data.JWT_SECRET.toLowerCase().includes("replace")
) {
  throw new Error("JWT_SECRET must be replaced before running in production");
}

export const env = {
  ...parsed.data,
  MAX_UPLOAD_BYTES: parsed.data.MAX_UPLOAD_MB * 1024 * 1024,
  PASSWORD_RESET_TOKEN_TTL_MS: parsed.data.PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000,
  CLIENT_ORIGINS: parsed.data.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
};
