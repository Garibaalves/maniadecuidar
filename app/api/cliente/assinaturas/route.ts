import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase";
import { requireClientAuth } from "@/lib/api";
import {
  createAbacatePayBilling,
  ensureAbacatePayCustomerId,
  mapAbacatePayStatusToAssinatura,
} from "@/lib/abacatepay";

const createSchema = z.object({
  plano_id: z.string().uuid(),
  data_adesao: z.string().optional(),
});

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
    const auth = requireClientAuth(request);
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("assinaturas")
      .select("*, planos(id, nome, valor, intervalo_dias)")
      .eq("cliente_id", auth.cliente_id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    const status = (error as Error).message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao listar assinaturas" }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireClientAuth(request);
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const supabase = getAdminClient();
    const { plano_id, data_adesao } = parsed.data;

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
      .eq("id", auth.cliente_id)
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
    const checkoutUrl = `${baseUrl}/cliente/assinaturas`;

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
        cliente_id: cliente.id,
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
        cliente_id: cliente.id,
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
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao criar assinatura" }, { status });
  }
}
