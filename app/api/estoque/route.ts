import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { estoqueMovimentoSchema } from "@/lib/validations";
import { requireApiAuth } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    requireApiAuth(request);
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("estoque_movimentos")
      .select("*, produtos(nome, sku)")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao listar estoque" }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    requireApiAuth(request);
    const body = await request.json();
    const parsed = estoqueMovimentoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const supabase = getAdminClient();

    // Busca estoque atual
    const { data: produto, error: produtoError } = await supabase
      .from("produtos")
      .select("id, estoque_atual")
      .eq("id", parsed.data.produto_id)
      .maybeSingle();
    if (produtoError) throw produtoError;
    if (!produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const quantidade = Number(parsed.data.quantidade);
    const novoEstoque =
      parsed.data.tipo === "ENTRADA"
        ? produto.estoque_atual + quantidade
        : produto.estoque_atual - quantidade;

    if (novoEstoque < 0) {
      return NextResponse.json(
        { error: "Estoque insuficiente para saída" },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("produtos")
      .update({ estoque_atual: novoEstoque })
      .eq("id", parsed.data.produto_id);
    if (updateError) throw updateError;

    const { data, error } = await supabase
      .from("estoque_movimentos")
      .insert({ ...parsed.data, quantidade })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ data, novoEstoque });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao movimentar estoque" }, { status });
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
    const { data: mov, error: movError } = await supabase
      .from("estoque_movimentos")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (movError) throw movError;
    if (!mov) return NextResponse.json({ error: "Movimentação não encontrada" }, { status: 404 });

    const { data: produto, error: prodError } = await supabase
      .from("produtos")
      .select("id, estoque_atual")
      .eq("id", mov.produto_id)
      .maybeSingle();
    if (prodError) throw prodError;
    if (!produto) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

    const ajuste =
      mov.tipo === "ENTRADA" ? -Number(mov.quantidade) : Number(mov.quantidade);
    const novoEstoque = produto.estoque_atual + ajuste;
    if (novoEstoque < 0) {
      return NextResponse.json(
        { error: "Estoque insuficiente para excluir esta movimentação" },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("produtos")
      .update({ estoque_atual: novoEstoque })
      .eq("id", mov.produto_id);
    if (updateError) throw updateError;

    const { error: deleteError } = await supabase
      .from("estoque_movimentos")
      .delete()
      .eq("id", id);
    if (deleteError) throw deleteError;

    return NextResponse.json({ ok: true, estoque_atual: novoEstoque });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao excluir movimentação" }, { status });
  }
}
