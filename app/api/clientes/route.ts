import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { clienteSchema, clienteUpdateSchema } from "@/lib/validations";
import { requireApiAuth } from "@/lib/api";
import { ensureAbacatePayCustomerId } from "@/lib/abacatepay";

const ABACATEPAY_MISSING_DATA = "ABACATEPAY_MISSING_DATA";

function buildAbacatePayCustomerPayload(input: {
  nome: string;
  telefone1: string;
  email?: string | null;
  cpf?: string | null;
}) {
  if (!input.email || !input.cpf || !input.telefone1) {
    throw new Error(ABACATEPAY_MISSING_DATA);
  }

  return {
    name: input.nome,
    cellphone: input.telefone1,
    email: input.email,
    taxId: input.cpf,
  };
}

export async function GET(request: NextRequest) {
  try {
    requireApiAuth(request);
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(searchParams.get("pageSize") ?? "10");
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("clientes")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(
        `nome.ilike.%${search}%,telefone1.ilike.%${search}%,cpf.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;
    return NextResponse.json({ data, count });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao listar clientes" }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    requireApiAuth(request);
    const body = await request.json();
    const parsed = clienteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const abacatepayCustomer = buildAbacatePayCustomerPayload(parsed.data);
    const { id: abacatepayCustomerId } = await ensureAbacatePayCustomerId({
      customer: abacatepayCustomer,
    });
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("clientes")
      .insert({ ...parsed.data, abacatepay_customer_id: abacatepayCustomerId })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    const message = (error as Error).message;
    if (message === ABACATEPAY_MISSING_DATA) {
      return NextResponse.json(
        { error: "Informe email, CPF e telefone para criar cliente no AbacatePay" },
        { status: 400 }
      );
    }
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    requireApiAuth(request);
    const body = await request.json();
    const parsed = clienteUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { id, ...data } = parsed.data;
    const supabase = getAdminClient();
    const { data: updated, error } = await supabase
      .from("clientes")
      .update({ ...data })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    let current = updated;
    if (!current.abacatepay_customer_id) {
      const abacatepayCustomer = buildAbacatePayCustomerPayload(current);
      const { id: abacatepayCustomerId } = await ensureAbacatePayCustomerId({
        customer: abacatepayCustomer,
      });
      const { data: synced, error: syncError } = await supabase
        .from("clientes")
        .update({ abacatepay_customer_id: abacatepayCustomerId })
        .eq("id", id)
        .select()
        .single();
      if (syncError) throw syncError;
      current = synced;
    }
    return NextResponse.json({ data: current });
  } catch (error) {
    console.error(error);
    const message = (error as Error).message;
    if (message === ABACATEPAY_MISSING_DATA) {
      return NextResponse.json(
        { error: "Informe email, CPF e telefone para criar cliente no AbacatePay" },
        { status: 400 }
      );
    }
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status });
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
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao excluir cliente" }, { status });
  }
}
