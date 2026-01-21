import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { requireApiAuth, requireClientAuth } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let clienteId = searchParams.get("cliente_id");
    try {
      requireApiAuth(request);
    } catch {
      const client = requireClientAuth(request);
      clienteId = client.cliente_id;
    }
    const supabase = getAdminClient();
    const data = searchParams.get("data") ?? new Date().toISOString().slice(0, 10);

    if (!clienteId) {
      return NextResponse.json({ error: "Cliente obrigatorio" }, { status: 400 });
    }

    const { data: assinatura } = await supabase
      .from("assinaturas")
      .select(
        "id, plano_id, data_ultimo_pagamento, data_vencimento, planos(id, nome)"
      )
      .eq("cliente_id", clienteId)
      .eq("status", "ATIVA")
      .lte("data_ultimo_pagamento", data)
      .gte("data_vencimento", data)
      .order("data_ultimo_pagamento", { ascending: false })
      .maybeSingle();

    if (!assinatura) {
      return NextResponse.json({ data: null });
    }

    if (!assinatura.data_ultimo_pagamento || !assinatura.data_vencimento) {
      return NextResponse.json(
        { error: "Assinatura ativa sem periodo definido" },
        { status: 400 }
      );
    }

    const { data: planoServicos, error: planoError } = await supabase
      .from("plano_servicos")
      .select("servico_id, quantidade, servicos(id, nome)")
      .eq("plano_id", assinatura.plano_id);
    if (planoError) throw planoError;

    const consumidosMap = new Map<string, number>();
    if ((planoServicos ?? []).length) {
      const { data: consumidos, error: consumoError } = await supabase
        .from("agendamento_servicos")
        .select("servico_id, agendamentos!inner(data, status)")
        .eq("assinatura_id", assinatura.id)
        .gte("agendamentos.data", assinatura.data_ultimo_pagamento)
        .lte("agendamentos.data", assinatura.data_vencimento)
        .in("agendamentos.status", ["AGENDADO", "EM_ATENDIMENTO", "CONCLUIDO"]);
      if (consumoError) throw consumoError;

      (consumidos ?? []).forEach((row) => {
        if (!row.servico_id) return;
        consumidosMap.set(row.servico_id, (consumidosMap.get(row.servico_id) ?? 0) + 1);
      });
    }

    const servicos = (planoServicos ?? []).map((item) => {
      const consumidos = consumidosMap.get(item.servico_id) ?? 0;
      const quantidade = Number(item.quantidade ?? 0);
      const servicoInfo = Array.isArray(item.servicos) ? item.servicos[0] : item.servicos;
      return {
        servico_id: item.servico_id,
        nome: servicoInfo?.nome ?? "Servico",
        quantidade,
        consumidos,
        restantes: Math.max(quantidade - consumidos, 0),
      };
    });

    const planoInfo = Array.isArray(assinatura.planos)
      ? assinatura.planos[0]
      : assinatura.planos;

    return NextResponse.json({
      data: {
        assinatura: {
          id: assinatura.id,
          plano_id: assinatura.plano_id,
          data_ultimo_pagamento: assinatura.data_ultimo_pagamento,
          data_vencimento: assinatura.data_vencimento,
          plano_nome: planoInfo?.nome ?? "Plano",
        },
        servicos,
      },
    });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json(
      { error: "Erro ao carregar consumo da assinatura" },
      { status }
    );
  }
}
