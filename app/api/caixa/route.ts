import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { caixaMovimentoSchema } from "@/lib/validations";
import { requireApiAuth } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    requireApiAuth(request);
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const inicio = searchParams.get("inicio");
    const fim = searchParams.get("fim");

    let query = supabase
      .from("caixa_movimentos")
      .select("*")
      .order("data", { ascending: false });

    if (inicio && fim) {
      const start = `${inicio} 00:00:00`;
      const end = `${fim} 23:59:59`;
      query = query.gte("data", start).lte("data", end);
    }

    const { data, error } = await query.limit(100);
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json(
      { error: "Erro ao listar movimentos de caixa" },
      { status }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    requireApiAuth(request);
    const body = await request.json();
    const parsed = caixaMovimentoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("caixa_movimentos")
      .insert(parsed.data)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json(
      { error: "Erro ao registrar movimento" },
      { status }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    requireApiAuth(request);
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }
    const supabase = getAdminClient();
    const { error } = await supabase.from("caixa_movimentos").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json(
      { error: "Erro ao excluir movimento" },
      { status }
    );
  }
}
