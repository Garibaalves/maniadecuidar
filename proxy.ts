import { NextResponse, type NextRequest } from "next/server";
import { verifyTokenEdge } from "./lib/auth-edge";
import { env } from "./lib/env";

const protectedRoutes = [
  "/dashboard",
  "/clientes",
  "/animais",
  "/servicos",
  "/produtos",
  "/atendimentos",
  "/agenda",
  "/caixa",
  "/estoque",
  "/despesas",
];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(env.AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await verifyTokenEdge(token);
    return NextResponse.next();
  } catch (error) {
    console.error("JWT invalido", error);
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(env.AUTH_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clientes/:path*",
    "/animais/:path*",
    "/servicos/:path*",
    "/produtos/:path*",
    "/atendimentos/:path*",
    "/agenda/:path*",
    "/caixa/:path*",
    "/estoque/:path*",
    "/despesas/:path*",
  ],
};
