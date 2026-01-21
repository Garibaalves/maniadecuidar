import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase";
import { requireClientAuth } from "@/lib/api";
import { animalSchema } from "@/lib/validations";

const animalCreateSchema = animalSchema.omit({ cliente_id: true });

export async function GET(request: NextRequest) {
  try {
    const auth = requireClientAuth(request);
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("animais")
      .select("id, nome, especie, raca, porte, temperamento, sexo, data_nascimento, observacoes")
      .eq("cliente_id", auth.cliente_id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao listar animais" }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireClientAuth(request);
    const body = await request.json();
    const parsed = animalCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("animais")
      .insert({ ...parsed.data, cliente_id: auth.cliente_id })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao criar animal" }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = requireClientAuth(request);
    const body = await request.json();
    const parsed = z.object({ id: z.string().uuid() }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ID obrigatorio" },
        { status: 400 }
      );
    }
    const supabase = getAdminClient();
    const { error } = await supabase
      .from("animais")
      .delete()
      .eq("id", parsed.data.id)
      .eq("cliente_id", auth.cliente_id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao excluir animal" }, { status });
  }
}
