import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase";
import { requireClientAuth } from "@/lib/api";

const updateSchema = z.object({
  nome: z.string().min(3).optional(),
  cpf: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  telefone1: z.string().min(8).optional(),
  telefone2: z.string().optional(),
  endereco_rua: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  observacoes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = requireClientAuth(request);
    const supabase = getAdminClient();
    const { data: cliente, error } = await supabase
      .from("clientes")
      .select("id, nome, telefone1, telefone2, cpf, email, endereco_rua, numero, complemento, bairro, cidade, estado, cep, observacoes")
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
    return NextResponse.json({ error: "Erro ao carregar perfil" }, { status });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = requireClientAuth(request);
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const supabase = getAdminClient();
    const { data: updated, error } = await supabase
      .from("clientes")
      .update(parsed.data)
      .eq("id", auth.cliente_id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status });
  }
}
