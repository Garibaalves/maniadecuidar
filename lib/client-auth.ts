import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "./env";

export type ClientTokenPayload = {
  cliente_id: string;
  nome: string;
};

const CLIENT_COOKIE_NAME = env.CLIENT_AUTH_COOKIE_NAME ?? "mdc.cliente";

export function signClientToken(payload: ClientTokenPayload) {
  return jwt.sign(payload, env.SUPABASE_JWT_SECRET, { expiresIn: "8h" });
}

export function verifyClientToken(token: string): ClientTokenPayload {
  return jwt.verify(token, env.SUPABASE_JWT_SECRET) as ClientTokenPayload;
}

export async function getClientTokenFromCookies(
  cookieStore?: Awaited<ReturnType<typeof cookies>>
) {
  const store = cookieStore ?? (await cookies());
  return store.get(CLIENT_COOKIE_NAME)?.value;
}

export function setClientAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(CLIENT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export function clearClientAuthCookie(response: NextResponse) {
  response.cookies.set(CLIENT_COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function getClientAuthFromRequest(req: NextRequest) {
  const token = req.cookies.get(CLIENT_COOKIE_NAME)?.value;
  if (!token) {
    throw new Error("Token nao encontrado");
  }
  return verifyClientToken(token);
}
