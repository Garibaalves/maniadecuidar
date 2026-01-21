import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase";
import { signClientToken, setClientAuthCookie } from "@/lib/client-auth";

const schema = z.object({
  telefone: z.string().min(8),
  cpf: z.string().min(11),
});

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const telefone = onlyDigits(parsed.data.telefone);
    const cpf = onlyDigits(parsed.data.cpf);

    const supabase = getAdminClient();
    const { data: cliente, error } = await supabase
      .from("clientes")
      .select("id, nome, cpf")
      .eq("telefone1", telefone)
      .maybeSingle();
    if (error) throw error;

    if (!cliente) {
      return NextResponse.json({ error: "Cliente nao encontrado" }, { status: 404 });
    }

    if (onlyDigits(cliente.cpf ?? "") !== cpf) {
      return NextResponse.json({ error: "CPF nao confere" }, { status: 401 });
    }

    const token = signClientToken({ cliente_id: cliente.id, nome: cliente.nome });
    const response = NextResponse.json({ data: { id: cliente.id, nome: cliente.nome } });
    setClientAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao autenticar cliente" }, { status: 500 });
  }
}
