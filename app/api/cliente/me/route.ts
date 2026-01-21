import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { requireClientAuth } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const auth = requireClientAuth(request);
    const supabase = getAdminClient();
    const { data: cliente, error } = await supabase
      .from("clientes")
      .select("id, nome, telefone1, telefone2, cpf, email, endereco_rua, numero, complemento, bairro, cidade, estado, cep")
      .eq("id", auth.cliente_id)
      .maybeSingle();
    if (error) throw error;
    if (!cliente) {
      return NextResponse.json({ error: "Cliente nao encontrado" }, { status: 404 });
    }
    return NextResponse.json({ data: cliente });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao carregar cliente" }, { status });
  }
}
