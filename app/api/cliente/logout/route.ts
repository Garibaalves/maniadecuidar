import { NextResponse } from "next/server";
import { clearClientAuthCookie } from "@/lib/client-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearClientAuthCookie(response);
  return response;
}
