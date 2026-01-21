import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { produtoSchema, produtoUpdateSchema } from "@/lib/validations";
import { requireApiAuth } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    requireApiAuth(request);
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    let query = supabase.from("produtos").select("*").order("nome", {
      ascending: true,
    });
    if (search) {
      query = query.or(
        `nome.ilike.%${search}%,sku.ilike.%${search}%,descricao.ilike.%${search}%`
      );
    }
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao listar produtos" }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    requireApiAuth(request);
    const body = await request.json();
    const parsed = produtoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("produtos")
      .insert(parsed.data)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao criar produto" }, { status });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    requireApiAuth(request);
    const body = await request.json();
    const parsed = produtoUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { id, ...data } = parsed.data;
    const supabase = getAdminClient();
    const { data: updated, error } = await supabase
      .from("produtos")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status });
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
    const { error } = await supabase.from("produtos").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status });
  }
}
