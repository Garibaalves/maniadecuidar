import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase";

const schema = z.object({
  telefone: z.string().min(8),
  cpf: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { telefone, cpf } = parsed.data;
    const supabase = getAdminClient();
    const { data: cliente } = await supabase
      .from("clientes")
      .select("id, nome")
      .eq("telefone1", telefone)
      .maybeSingle();

    if (!cliente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    if (cpf) {
      const { data: clienteCpf } = await supabase
        .from("clientes")
        .select("id")
        .eq("id", cliente.id)
        .eq("cpf", cpf)
        .maybeSingle();
      if (!clienteCpf) {
        return NextResponse.json({ error: "CPF não confere" }, { status: 401 });
      }
    }

    const { data: agendamentos } = await supabase
      .from("agendamentos")
      .select(
        "id, data, hora, status, animais(nome), agendamento_servicos(servicos(nome))"
      )
      .eq("cliente_id", cliente.id)
      .order("data", { ascending: true });

    return NextResponse.json({ cliente, agendamentos });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar agendamentos" }, { status: 500 });
  }
}
