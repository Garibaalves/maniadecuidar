import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api";
import { getAdminClient } from "@/lib/supabase";
import { assinaturaSchema, assinaturaUpdateSchema } from "@/lib/validations";
import {
  createAbacatePayBilling,
  ensureAbacatePayCustomerId,
  mapAbacatePayStatusToAssinatura,
} from "@/lib/abacatepay";

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
    const status = searchParams.get("status");
    const clienteId = searchParams.get("cliente_id");

    let query = supabase
      .from("assinaturas")
      .select("*, planos(id, nome, valor, intervalo_dias), clientes(id, nome, telefone1)")
      .order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);
    if (clienteId) query = query.eq("cliente_id", clienteId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    const statusCode = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao listar assinaturas" }, { status: statusCode });
  }
}

export async function POST(request: NextRequest) {
  try {
    requireApiAuth(request);
    const body = await request.json();
    const parsed = assinaturaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const supabase = getAdminClient();
    const { plano_id, cliente_id, data_adesao } = parsed.data;

    const { data: plano } = await supabase
      .from("planos")
      .select("id, nome, valor, intervalo_dias, descricao, ativo")
      .eq("id", plano_id)
      .maybeSingle();
    if (!plano) {
      return NextResponse.json({ error: "Plano nao encontrado" }, { status: 404 });
    }

    const { data: cliente } = await supabase
      .from("clientes")
      .select("id, nome, telefone1, email, cpf, abacatepay_customer_id")
      .eq("id", cliente_id)
      .maybeSingle();
    if (!cliente) {
      return NextResponse.json({ error: "Cliente nao encontrado" }, { status: 404 });
    }

    const customerPayload = buildAbacatePayCustomerPayload(cliente);
    const { id: abacatepayCustomerId } = await ensureAbacatePayCustomerId({
      existingId: cliente.abacatepay_customer_id,
      customer: customerPayload,
    });
    if (!cliente.abacatepay_customer_id && abacatepayCustomerId) {
      await supabase
        .from("clientes")
        .update({ abacatepay_customer_id: abacatepayCustomerId })
        .eq("id", cliente.id);
    }

    const adesao = data_adesao ?? new Date().toISOString().slice(0, 10);
    const vencimentoBase = new Date(adesao);
    vencimentoBase.setDate(vencimentoBase.getDate() + Number(plano.intervalo_dias ?? 0));
    const vencimento = vencimentoBase.toISOString().slice(0, 10);
    const requestUrl = new URL(request.url);
    const baseUrl = process.env.APP_URL ?? requestUrl.origin;
    const checkoutUrl = `${baseUrl}/assinaturas`;

    const priceCents = Math.round(Number(plano.valor ?? 0) * 100);
    if (priceCents < 100) {
      return NextResponse.json(
        { error: "Valor do plano deve ser no minimo R$ 1,00 para cobranca" },
        { status: 400 }
      );
    }

    const { data: created, error: insertError } = await supabase
      .from("assinaturas")
      .insert({
        plano_id,
        cliente_id,
        data_adesao: adesao,
        data_vencimento: vencimento,
        status: "PENDENTE",
      })
      .select()
      .single();
    if (insertError) throw insertError;

    const billing = await createAbacatePayBilling({
      frequency: "ONE_TIME",
      methods: ["PIX"],
      products: [
        {
          externalId: plano.id,
          name: plano.nome,
          description: plano.descricao ?? undefined,
          quantity: 1,
          price: priceCents,
        },
      ],
      returnUrl: checkoutUrl,
      completionUrl: checkoutUrl,
      customerId: abacatepayCustomerId,
      customer: customerPayload,
      externalId: created.id,
      metadata: {
        plano_id: plano.id,
        cliente_id,
        assinatura_id: created.id,
        intervalo_dias: String(plano.intervalo_dias ?? 0),
      },
    });

    const mappedStatus = mapAbacatePayStatusToAssinatura(billing.status);

    const { data: updated, error: updateError } = await supabase
      .from("assinaturas")
      .update({
        stripe_checkout_url: billing.url,
        abacatepay_billing_id: billing.id,
        status: mappedStatus ?? "PENDENTE",
        metadata: {
          abacatepay_billing_id: billing.id,
          abacatepay_customer_id: abacatepayCustomerId,
        },
      })
      .eq("id", created.id)
      .select()
      .single();
    if (updateError) throw updateError;

    return NextResponse.json({ data: updated ?? created, checkout_url: billing.url });
  } catch (error) {
    console.error(error);
    const message = (error as Error).message;
    if (message === ABACATEPAY_MISSING_DATA) {
      return NextResponse.json(
        { error: "Informe email, CPF e telefone para criar cliente no AbacatePay" },
        { status: 400 }
      );
    }
    const statusCode = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao criar assinatura" }, { status: statusCode });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    requireApiAuth(request);
    const body = await request.json();
    const parsed = assinaturaUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const supabase = getAdminClient();
    const { id, forma_pagamento, ...data } = parsed.data;

    const { data: current, error: currentError } = await supabase
      .from("assinaturas")
      .select("id, status, plano_id, cliente_id")
      .eq("id", id)
      .single();
    if (currentError) throw currentError;

    let updateData = { ...data };
    let caixaPayload:
      | {
          data: string;
          tipo: "ENTRADA";
          categoria: string;
          forma_pagamento: string;
          valor: number;
          descricao?: string;
          referencia_tabela: string;
          referencia_id: string;
        }
      | null = null;

    if (data.status === "ATIVA" && current.status !== "ATIVA") {
      if (!forma_pagamento) {
        return NextResponse.json(
          { error: "Informe a forma de pagamento para ativar a assinatura" },
          { status: 400 }
        );
      }

      const { data: plano } = await supabase
        .from("planos")
        .select("id, nome, valor, intervalo_dias")
        .eq("id", current.plano_id)
        .maybeSingle();
      if (!plano) {
        return NextResponse.json({ error: "Plano nao encontrado" }, { status: 404 });
      }

      const { data: cliente } = await supabase
        .from("clientes")
        .select("id, nome")
        .eq("id", current.cliente_id)
        .maybeSingle();

      const pagamentoBase = data.data_ultimo_pagamento ?? new Date().toISOString().slice(0, 10);
      const vencimentoBase = new Date(pagamentoBase);
      vencimentoBase.setDate(vencimentoBase.getDate() + Number(plano.intervalo_dias ?? 0));
      const vencimento = data.data_vencimento ?? vencimentoBase.toISOString().slice(0, 10);

      updateData = {
        ...updateData,
        data_ultimo_pagamento: pagamentoBase,
        data_vencimento: vencimento,
      };

      caixaPayload = {
        data: new Date().toISOString(),
        tipo: "ENTRADA",
        categoria: "Assinatura",
        forma_pagamento,
        valor: Number(plano.valor ?? 0),
        descricao: `Assinatura ${plano.nome}${cliente?.nome ? ` - ${cliente.nome}` : ""}`,
        referencia_tabela: "assinaturas",
        referencia_id: id,
      };
    }

    const { data: updated, error } = await supabase
      .from("assinaturas")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    if (caixaPayload) {
      const { error: caixaError } = await supabase
        .from("caixa_movimentos")
        .insert(caixaPayload);
      if (caixaError) throw caixaError;
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error(error);
    const statusCode = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao atualizar assinatura" }, { status: statusCode });
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
    const { error } = await supabase.from("assinaturas").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    const statusCode = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao excluir assinatura" }, { status: statusCode });
  }
}
