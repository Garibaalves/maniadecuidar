import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { agendamentoSchema } from "@/lib/validations";
import { requireApiAuth } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    requireApiAuth(request);
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const data = searchParams.get("data");
    const status = searchParams.get("status");

    let query = supabase
      .from("agendamentos")
      .select(
        "*, clientes(id, nome, telefone1), animais(id, nome), agendamento_servicos(servico_id, valor, servicos(id, nome, valor_padrao))"
      )
      .order("data", { ascending: true })
      .order("hora", { ascending: true });

    if (data) query = query.eq("data", data);
    if (status) query = query.eq("status", status);

    const { data: rows, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error(error);
    const statusCode = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json(
      { error: "Erro ao listar agendamentos" },
      { status: statusCode }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    requireApiAuth(request);
    const body = await request.json();
    const parsed = agendamentoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { servicos, ...agendamento } = parsed.data;
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("agendamentos")
      .insert(agendamento)
      .select()
      .single();
    if (error) throw error;

    if (servicos?.length) {
      const { data: defaults, error: defError } = await supabase
        .from("servicos")
        .select("id, valor_padrao")
        .in(
          "id",
          servicos.map((s) => s.servico_id)
        );
      if (defError) throw defError;
      const mapValor = new Map<string, number>();
      (defaults ?? []).forEach((s) => mapValor.set(s.id, Number(s.valor_padrao ?? 0)));

      const payload = servicos.map((s) => ({
        agendamento_id: data.id,
        servico_id: s.servico_id,
        valor:
          s.valor != null && !Number.isNaN(s.valor)
            ? s.valor
            : mapValor.get(s.servico_id) ?? 0,
      }));
      const { error: servError } = await supabase
        .from("agendamento_servicos")
        .insert(payload);
      if (servError) throw servError;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    const statusCode = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json(
      { error: "Erro ao criar agendamento" },
      { status: statusCode }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    requireApiAuth(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    const supabase = getAdminClient();
    // remove dependências
    await supabase.from("agendamento_servicos").delete().eq("agendamento_id", id);
    await supabase.from("agendamentos").delete().eq("id", id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    const statusCode = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json(
      { error: "Erro ao excluir agendamento" },
      { status: statusCode }
    );
  }
}
