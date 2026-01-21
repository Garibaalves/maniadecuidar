import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { agendamentoSchema } from "@/lib/validations";
import { requireClientAuth } from "@/lib/api";

const clienteAgendamentoSchema = agendamentoSchema.omit({ cliente_id: true });

export async function GET(request: NextRequest) {
  try {
    const auth = requireClientAuth(request);
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabase
      .from("agendamentos")
      .select(
        "id, data, hora, status, observacoes, animais(id, nome), agendamento_servicos(servicos(id, nome))"
      )
      .eq("cliente_id", auth.cliente_id)
      .order("data", { ascending: false })
      .order("hora", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao listar agendamentos" }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireClientAuth(request);
    const body = await request.json();
    const parsed = clienteAgendamentoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { servicos, usar_assinatura, ...agendamento } = parsed.data;
    const supabase = getAdminClient();

    let assinaturaAtiva:
      | {
          id: string;
          plano_id: string;
          data_ultimo_pagamento: string | null;
          data_vencimento: string | null;
        }
      | null = null;
    if (usar_assinatura !== false && agendamento.data) {
      const { data: assinatura } = await supabase
        .from("assinaturas")
        .select("id, plano_id, data_ultimo_pagamento, data_vencimento")
        .eq("cliente_id", auth.cliente_id)
        .eq("status", "ATIVA")
        .lte("data_ultimo_pagamento", agendamento.data)
        .gte("data_vencimento", agendamento.data)
        .order("data_ultimo_pagamento", { ascending: false })
        .maybeSingle();
      assinaturaAtiva = assinatura ?? null;
    }

    const assinaturaServicosMap = new Map<string, number>();
    const assinaturaConsumidosMap = new Map<string, number>();
    const mapValor = new Map<string, number>();

    if (servicos?.length) {
      if (assinaturaAtiva?.id && assinaturaAtiva.plano_id) {
        if (!assinaturaAtiva.data_ultimo_pagamento || !assinaturaAtiva.data_vencimento) {
          return NextResponse.json(
            { error: "Assinatura ativa sem periodo definido" },
            { status: 400 }
          );
        }

        const { data: planoServicos, error: planoError } = await supabase
          .from("plano_servicos")
          .select("servico_id, quantidade")
          .eq("plano_id", assinaturaAtiva.plano_id);
        if (planoError) throw planoError;

        (planoServicos ?? []).forEach((item) => {
          assinaturaServicosMap.set(item.servico_id, Number(item.quantidade ?? 0));
        });

        if (assinaturaServicosMap.size > 0) {
          const { data: consumidos, error: consumoError } = await supabase
            .from("agendamento_servicos")
            .select("servico_id, agendamentos!inner(data, status)")
            .eq("assinatura_id", assinaturaAtiva.id)
            .gte("agendamentos.data", assinaturaAtiva.data_ultimo_pagamento)
            .lte("agendamentos.data", assinaturaAtiva.data_vencimento)
            .in("agendamentos.status", ["AGENDADO", "EM_ATENDIMENTO", "CONCLUIDO"]);
          if (consumoError) throw consumoError;

          (consumidos ?? []).forEach((row) => {
            if (!row.servico_id) return;
            const current = assinaturaConsumidosMap.get(row.servico_id) ?? 0;
            assinaturaConsumidosMap.set(row.servico_id, current + 1);
          });
        }
      }

      const { data: defaults, error: defError } = await supabase
        .from("servicos")
        .select("id, valor_padrao")
        .in(
          "id",
          servicos.map((s) => s.servico_id)
        );
      if (defError) throw defError;
      (defaults ?? []).forEach((s) => mapValor.set(s.id, Number(s.valor_padrao ?? 0)));

      servicos.forEach((s) => {
        const allowed = assinaturaServicosMap.get(s.servico_id);
        const consumed = assinaturaConsumidosMap.get(s.servico_id) ?? 0;
        const remaining = typeof allowed === "number" ? allowed - consumed : null;

        if (remaining !== null && remaining <= 0) {
          throw new Error("SERVICO_ASSINATURA_SEM_SALDO");
        }
      });
    }

    const { data, error } = await supabase
      .from("agendamentos")
      .insert({
        ...agendamento,
        cliente_id: auth.cliente_id,
        status: agendamento.status ?? "AGENDADO",
      })
      .select()
      .single();
    if (error) throw error;

    if (servicos?.length) {
      const payload = servicos.map((s) => {
        const allowed = assinaturaServicosMap.get(s.servico_id);
        const consumed = assinaturaConsumidosMap.get(s.servico_id) ?? 0;
        const remaining = typeof allowed === "number" ? allowed - consumed : null;

        return {
          agendamento_id: data.id,
          servico_id: s.servico_id,
          assinatura_id: remaining !== null ? assinaturaAtiva?.id ?? null : null,
          valor:
            s.valor != null && !Number.isNaN(s.valor)
              ? s.valor
              : mapValor.get(s.servico_id) ?? 0,
        };
      });
      const { error: servError } = await supabase
        .from("agendamento_servicos")
        .insert(payload);
      if (servError) throw servError;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    const message = (error as Error).message;
    if (message === "SERVICO_ASSINATURA_SEM_SALDO") {
      return NextResponse.json(
        { error: "Servico da assinatura ja consumido no periodo" },
        { status: 400 }
      );
    }
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao criar agendamento" }, { status });
  }
}
