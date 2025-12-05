import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("servicos")
      .select("id, nome, valor_padrao, descricao, ativo")
      .eq("ativo", true)
      .order("nome", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao listar serviços" }, { status: 500 });
  }
}
