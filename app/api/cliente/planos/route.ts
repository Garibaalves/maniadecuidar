import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { requireClientAuth } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    requireClientAuth(request);
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("planos")
      .select(
        "id, nome, descricao, intervalo_dias, valor, ativo, plano_servicos(quantidade, servicos(id, nome))"
      )
      .eq("ativo", true)
      .order("valor", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao listar planos" }, { status });
  }
}
