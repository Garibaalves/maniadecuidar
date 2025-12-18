import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { animalSchema, animalUpdateSchema } from "@/lib/validations";
import { requireApiAuth } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    requireApiAuth(request);
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get("cliente_id");
    const nome = searchParams.get("nome");

    let query = supabase
      .from("animais")
      .select("*, clientes(nome, telefone1)")
      .order("created_at", { ascending: false });

    if (clienteId) {
      query = query.eq("cliente_id", clienteId);
    }
    if (nome) {
      query = query.ilike("nome", `%${nome}%`);
    }

    const { data, error } = await query;
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
    requireApiAuth(request);
    const body = await request.json();
    const parsed = animalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("animais")
      .insert(parsed.data)
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

export async function PATCH(request: NextRequest) {
  try {
    requireApiAuth(request);
    const body = await request.json();
    const parsed = animalUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { id, ...data } = parsed.data;
    const supabase = getAdminClient();
    const { data: updated, error } = await supabase
      .from("animais")
      .update({ ...data })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao atualizar animal" }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    requireApiAuth(request);
    const body = await request.json();
    const id = body?.id as string | undefined;
    if (!id) {
      return NextResponse.json({ error: "ID obrigatorio" }, { status: 400 });
    }
    const supabase = getAdminClient();
    const { error } = await supabase.from("animais").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao excluir animal" }, { status });
  }
}
