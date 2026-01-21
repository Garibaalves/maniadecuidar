import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { planoSchema, planoUpdateSchema } from "@/lib/validations";
import { requireApiAuth } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    requireApiAuth(request);
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const ativos = searchParams.get("ativos");

    let query = supabase
      .from("planos")
      .select("*, plano_servicos(servico_id, quantidade, servicos(id, nome, valor_padrao))")
      .order("nome", { ascending: true });

    if (search) {
      query = query.ilike("nome", `%${search}%`);
    }
    if (ativos === "true") {
      query = query.eq("ativo", true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao listar planos" }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    requireApiAuth(request);
    const body = await request.json();
    const parsed = planoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    const { servicos, ...planData } = parsed.data;
    const { data, error } = await supabase
      .from("planos")
      .insert({ ...planData })
      .select()
      .single();
    if (error) throw error;

    if (servicos?.length) {
      const payload = servicos.map((s) => ({
        plano_id: data.id,
        servico_id: s.servico_id,
        quantidade: s.quantidade ?? 1,
      }));
      const { error: servError } = await supabase.from("plano_servicos").insert(payload);
      if (servError) throw servError;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao criar plano" }, { status });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    requireApiAuth(request);
    const body = await request.json();
    const parsed = planoUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    const { servicos, id, ...data } = parsed.data;

    const { data: updated, error } = await supabase
      .from("planos")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    // Recria vínculos de serviços do plano
    await supabase.from("plano_servicos").delete().eq("plano_id", id);
    if (servicos?.length) {
      const payload = servicos.map((s) => ({
        plano_id: id,
        servico_id: s.servico_id,
        quantidade: s.quantidade ?? 1,
      }));
      const { error: servError } = await supabase.from("plano_servicos").insert(payload);
      if (servError) throw servError;
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao atualizar plano" }, { status });
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
    await supabase.from("planos").delete().eq("id", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao excluir plano" }, { status });
  }
}
