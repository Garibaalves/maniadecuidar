import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

const BUCKET = "atendimento-fotos";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("agendamentos")
      .select(
        `
        id, data, hora, status, observacoes,
        clientes(id, nome, telefone1),
        animais(id, nome, especie, porte, sexo),
        agendamento_servicos(servico_id, valor, servicos(id, nome, valor_padrao)),
        atendimentos(
          id,
          data_inicio,
          data_fim,
          valor_total,
          forma_pagamento,
          atendimento_fotos(id, url_foto)
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    if (data?.atendimentos?.length) {
      for (const at of data.atendimentos) {
        if (at.atendimento_fotos?.length) {
          at.atendimento_fotos = await Promise.all(
            at.atendimento_fotos.map(async (foto) => {
              const path = extractPath(foto.url_foto);
              if (!path) return foto;
              const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24);
              return { ...foto, url_foto: signed?.signedUrl ?? foto.url_foto };
            })
          );
        }
      }
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar agendamento" }, { status: 500 });
  }
}

function extractPath(url: string | null): string | null {
  if (!url) return null;
  try {
    if (!url.startsWith("http")) return url.replace(/^\/+/, "");
    const parsed = new URL(url);
    const marker = `/${BUCKET}/`;
    const idx = parsed.pathname.indexOf(marker);
    if (idx >= 0) return parsed.pathname.substring(idx + marker.length);
    return parsed.pathname.replace(/^\/+/, "");
  } catch {
    return url;
  }
}
