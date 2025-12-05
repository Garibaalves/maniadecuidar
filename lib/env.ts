import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1),
  AUTH_COOKIE_NAME: z.string().default("mdc.session"),
  APP_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
   
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Missing environment variables");
}

export const env = parsed.data;
