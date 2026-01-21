import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { requireClientAuth } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const auth = requireClientAuth(request);
    const supabase = getAdminClient();

    const [{ count: petsCount }, { count: totalAgendamentos }, { count: abertosCount }] =
      await Promise.all([
        supabase
          .from("animais")
          .select("id", { count: "exact", head: true })
          .eq("cliente_id", auth.cliente_id),
        supabase
          .from("agendamentos")
          .select("id", { count: "exact", head: true })
          .eq("cliente_id", auth.cliente_id),
        supabase
          .from("agendamentos")
          .select("id", { count: "exact", head: true })
          .eq("cliente_id", auth.cliente_id)
          .in("status", ["AGENDADO", "EM_ATENDIMENTO"]),
      ]);

    const { data: atendimentos } = await supabase
      .from("atendimentos")
      .select("valor_total, agendamentos!inner(cliente_id)")
      .eq("agendamentos.cliente_id", auth.cliente_id);

    const valorGasto = (atendimentos ?? []).reduce(
      (acc, item) => acc + Number(item.valor_total ?? 0),
      0
    );

    return NextResponse.json({
      data: {
        total_pets: petsCount ?? 0,
        total_agendamentos: totalAgendamentos ?? 0,
        agendamentos_abertos: abertosCount ?? 0,
        valor_gasto: valorGasto,
      },
    });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao carregar dashboard" }, { status });
  }
}
