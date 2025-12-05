import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { loginSchema } from "@/lib/validations";
import { signToken, verifyPassword, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { telefone, senha } = parsed.data;
    const supabase = getAdminClient();

    const { data: user, error } = await supabase
      .from("usuarios")
      .select("id, nome, telefone, senha_hash, perfil, ativo")
      .eq("telefone", telefone)
      .maybeSingle();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 });
    }

    if (!user || !user.ativo) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 });
    }

    const valid = await verifyPassword(senha, user.senha_hash);
    if (!valid) {
      return NextResponse.json({ error: "Senha inválida" }, { status: 401 });
    }

    const token = signToken({
      user_id: user.id,
      nome: user.nome,
      perfil: user.perfil,
    });

    const response = NextResponse.json({
      user: { id: user.id, nome: user.nome, perfil: user.perfil },
    });
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
