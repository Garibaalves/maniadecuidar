import { NextResponse, type NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { env } from "@/lib/env";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(env.AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    const payload = verifyToken(token);
    const supabase = getAdminClient();
    const { data: user, error } = await supabase
      .from("usuarios")
      .select("id, nome, telefone, perfil, ativo")
      .eq("id", payload.user_id)
      .maybeSingle();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 });
    }

    if (!user || !user.ativo) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}
