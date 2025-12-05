import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "./env";

export type UserTokenPayload = {
  user_id: string;
  nome: string;
  perfil: "ADMIN" | "FUNCIONARIO";
};

const COOKIE_NAME = env.AUTH_COOKIE_NAME ?? "mdc.session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: UserTokenPayload) {
  return jwt.sign(payload, env.SUPABASE_JWT_SECRET, { expiresIn: "8h" });
}

export function verifyToken(token: string): UserTokenPayload {
  return jwt.verify(token, env.SUPABASE_JWT_SECRET) as UserTokenPayload;
}

export async function getTokenFromCookies(
  cookieStore?: Awaited<ReturnType<typeof cookies>>
) {
  const store = cookieStore ?? (await cookies());
  return store.get(COOKIE_NAME)?.value;
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function getAuthFromRequest(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    throw new Error("Token nao encontrado");
  }
  return verifyToken(token);
}
