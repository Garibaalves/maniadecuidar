import { env } from "./env";
import { verifyToken, type UserTokenPayload } from "./auth";
import { type NextRequest } from "next/server";

export function requireApiAuth(req: NextRequest): UserTokenPayload {
  const token = req.cookies.get(env.AUTH_COOKIE_NAME)?.value;
  if (!token) {
    throw new Error("UNAUTHORIZED");
  }
  try {
    return verifyToken(token);
  } catch {
    throw new Error("UNAUTHORIZED");
  }
}
