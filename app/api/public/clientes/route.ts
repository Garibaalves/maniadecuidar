import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const telefone = searchParams.get("telefone");
    if (!telefone) {
      return NextResponse.json({ error: "telefone é obrigatório" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data: cliente, error } = await supabase
      .from("clientes")
      .select("id, nome, telefone1, animais(id, nome, especie, porte, sexo)")
      .eq("telefone1", telefone)
      .maybeSingle();
    if (error) throw error;

    return NextResponse.json({ data: cliente ?? null });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar cliente" }, { status: 500 });
  }
}
