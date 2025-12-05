import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("data");
    if (!date) {
      return NextResponse.json({ error: "Data é obrigatória" }, { status: 400 });
    }

    // calcula dia da semana em UTC para evitar deslocamento por timezone local
    const [year, month, day] = date.split("-").map(Number);
    const diaSemana = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

    const { data: config } = await supabase
      .from("agenda_config")
      .select("*")
      .eq("dia_semana", diaSemana)
      .maybeSingle();

    if (!config) {
      return NextResponse.json({ slots: [] });
    }

    const { data: bloqueios } = await supabase
      .from("agenda_bloqueios")
      .select("*")
      .eq("data", date);

    const { data: agendamentos } = await supabase
      .from("agendamentos")
      .select("hora")
      .eq("data", date)
      .in("status", ["AGENDADO", "EM_ATENDIMENTO"]);

    const taken = new Set((agendamentos ?? []).map((a) => a.hora));

    const slots: string[] = [];
    let current = toMinutes(config.hora_inicio);
    const end = toMinutes(config.hora_fim);

    const isBlocked = (hora: string) =>
      (bloqueios ?? []).some((block) => {
        const start = toMinutes(block.hora_inicio);
        const finish = toMinutes(block.hora_fim);
        const target = toMinutes(hora);
        return target >= start && target < finish;
      });

    while (current < end) {
      const hour = String(Math.floor(current / 60)).padStart(2, "0");
      const minute = String(current % 60).padStart(2, "0");
      const time = `${hour}:${minute}`;
      if (!taken.has(time) && !isBlocked(time)) {
        slots.push(time);
      }
      current += config.intervalo_minutos;
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao calcular horários" }, { status: 500 });
  }
}
