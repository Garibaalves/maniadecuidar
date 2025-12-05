import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase";
import { requireApiAuth } from "@/lib/api";

const atendimentoSchema = z.object({
  agendamento_id: z.string().uuid(),
  observacoes: z.string().optional(),
  iniciar: z.boolean().default(false),
  encerrar: z.boolean().default(false),
  itens: z
    .array(
      z.object({
        tipo_item: z.enum(["SERVICO", "PRODUTO"]),
        servico_id: z.string().uuid().optional(),
        produto_id: z.string().uuid().optional(),
        quantidade: z.number().positive(),
        valor_unitario: z.number().nonnegative(),
      })
    )
    .optional(),
  forma_pagamento: z.enum(["PIX", "DINHEIRO", "DEBITO", "CREDITO"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    requireApiAuth(request);
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("atendimentos")
      .select(
        "*, agendamentos(data, hora, status, clientes(nome, telefone1), animais(nome)), atendimento_itens(*, servicos(nome), produtos(nome))"
      )
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao listar atendimentos" }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsed = atendimentoSchema.safeParse(payload);
    requireApiAuth(request);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    const { agendamento_id, iniciar, encerrar, observacoes, itens, forma_pagamento } =
      parsed.data;

    if (iniciar) {
      await supabase
        .from("agendamentos")
        .update({ status: "EM_ATENDIMENTO" })
        .eq("id", agendamento_id);
      const { data, error } = await supabase
        .from("atendimentos")
        .insert({
          agendamento_id,
          data_inicio: new Date().toISOString(),
          observacoes,
        })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (encerrar) {
      const { data: atendimento, error } = await supabase
        .from("atendimentos")
        .update({
          data_fim: new Date().toISOString(),
          observacoes,
          forma_pagamento,
        })
        .eq("agendamento_id", agendamento_id)
        .select()
        .single();
      if (error) throw error;

      if (itens?.length) {
        const mapped = itens.map((item) => ({
          atendimento_id: atendimento.id,
          ...item,
          valor_total: item.quantidade * item.valor_unitario,
        }));
        await supabase.from("atendimento_itens").insert(mapped);
      }

      const total =
        itens?.reduce(
          (acc, item) => acc + item.quantidade * item.valor_unitario,
          0
        ) ?? 0;

      if (total > 0 && forma_pagamento) {
        await supabase.from("caixa_movimentos").insert({
          data: new Date().toISOString(),
          tipo: "ENTRADA",
          categoria: "atendimento",
          forma_pagamento,
          valor: total,
          descricao: "Receita de atendimento",
          referencia_tabela: "atendimentos",
          referencia_id: atendimento.id,
        });
      }

      await supabase
        .from("agendamentos")
        .update({ status: "CONCLUIDO" })
        .eq("id", agendamento_id);

      return NextResponse.json({ data: { ...atendimento, valor_total: total } });
    }

    return NextResponse.json({ error: "Operação não informada" }, { status: 400 });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao registrar atendimento" }, { status });
  }
}
