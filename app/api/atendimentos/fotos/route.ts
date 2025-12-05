import { NextResponse, type NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { requireApiAuth } from "@/lib/api";

const BUCKET = "atendimento-fotos";

export async function POST(request: NextRequest) {
  try {
    requireApiAuth(request);
    const body = await request.json();
    const { agendamento_id, fileName, fileBase64 } = body as {
      agendamento_id: string;
      fileName: string;
      fileBase64: string;
    };
    if (!agendamento_id || !fileName || !fileBase64) {
      return NextResponse.json({ error: "Dados obrigatorios ausentes" }, { status: 400 });
    }
    const supabase = getAdminClient();

    const { data: atendimentoRow, error: atendimentoError } = await supabase
      .from("atendimentos")
      .select("id")
      .eq("agendamento_id", agendamento_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (atendimentoError) throw atendimentoError;
    if (!atendimentoRow) {
      return NextResponse.json(
        { error: "Atendimento nao encontrado para este agendamento" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(fileBase64, "base64");
    const path = `${agendamento_id}/${Date.now()}-${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: "image/jpeg", upsert: false });
    if (uploadError) throw uploadError;
    const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const { data: record, error: insertError } = await supabase
      .from("atendimento_fotos")
      .insert({
        atendimento_id: atendimentoRow.id,
        url_foto: path, // armazenamos o path; o GET devolve URL assinada
      })
      .select()
      .single();
    if (insertError) throw insertError;

    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24);
    return NextResponse.json({
      ok: true,
      url: signed?.signedUrl ?? publicUrl.publicUrl,
      foto: { ...record, url_foto: signed?.signedUrl ?? publicUrl.publicUrl },
      path,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao salvar foto" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    requireApiAuth(request);
    const { searchParams } = new URL(request.url);
    const agendamento_id = searchParams.get("agendamento_id");
    if (!agendamento_id) {
      return NextResponse.json({ error: "agendamento_id e obrigatorio" }, { status: 400 });
    }
    const supabase = getAdminClient();

    const { data: atendimentoRow, error: atendimentoError } = await supabase
      .from("atendimentos")
      .select("id")
      .eq("agendamento_id", agendamento_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (atendimentoError) throw atendimentoError;
    if (!atendimentoRow) return NextResponse.json({ data: [] });

    const { data, error } = await supabase
      .from("atendimento_fotos")
      .select("*")
      .eq("atendimento_id", atendimentoRow.id)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const signed = await Promise.all(
      (data ?? []).map(async (foto) => {
        const path = extractPath(foto.url_foto);
        if (!path) return { ...foto, url_foto: foto.url_foto };
        const { data: urlData } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24);
        return { ...foto, url_foto: urlData?.signedUrl ?? foto.url_foto };
      })
    );

    return NextResponse.json({ data: signed });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar fotos" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    requireApiAuth(request);
    const { id, url } = await request.json();
    if (!id) return NextResponse.json({ error: "ID obrigatorio" }, { status: 400 });
    const supabase = getAdminClient();

    let path: string | undefined;
    if (url) {
      const marker = `${BUCKET}/`;
      const idx = url.indexOf(marker);
      if (idx >= 0) path = url.substring(idx + marker.length);
    }
    if (path) {
      await supabase.storage.from(BUCKET).remove([path]);
    }

    const { error } = await supabase.from("atendimento_fotos").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao excluir foto" }, { status: 500 });
  }
}

function extractPath(url: string | null): string | null {
  if (!url) return null;
  try {
    if (!url.startsWith("http")) return url.replace(/^\/+/, "");
    const parsed = new URL(url);
    const marker = `/${BUCKET}/`;
    const idx = parsed.pathname.indexOf(marker);
    if (idx >= 0) {
      return parsed.pathname.substring(idx + marker.length);
    }
    return parsed.pathname.replace(/^\/+/, "");
  } catch {
    return url;
  }
}
