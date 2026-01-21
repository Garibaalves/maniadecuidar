import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase";

const petSchema = z
  .object({
    nome: z.string().min(2),
    especie: z.string().default("Cachorro"),
    porte: z.enum(["PEQUENO", "MEDIO", "GRANDE"]),
    temperamento: z.enum(["CALMO", "AGITADO"]),
    sexo: z.enum(["MACHO", "FEMEA"]),
    raca: z.string().optional(),
  })
  .optional();

const schema = z.object({
  nome: z.string().min(3),
  telefone1: z.string().min(8),
  cpf: z.string().min(11),
  email: z.string().email().optional().or(z.literal("")),
  pet: petSchema,
});

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    const telefone = onlyDigits(parsed.data.telefone1);
    const cpf = onlyDigits(parsed.data.cpf);

    const { data: existente } = await supabase
      .from("clientes")
      .select("id")
      .eq("telefone1", telefone)
      .maybeSingle();
    if (existente) {
      return NextResponse.json({ error: "Telefone ja cadastrado" }, { status: 409 });
    }

    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .insert({
        nome: parsed.data.nome,
        telefone1: telefone,
        cpf,
        email: parsed.data.email || null,
      })
      .select()
      .single();
    if (clienteError) throw clienteError;

    if (parsed.data.pet) {
      const pet = parsed.data.pet;
      const { error: petError } = await supabase.from("animais").insert({
        cliente_id: cliente.id,
        nome: pet.nome,
        especie: pet.especie,
        porte: pet.porte,
        temperamento: pet.temperamento,
        sexo: pet.sexo,
        raca: pet.raca,
      });
      if (petError) throw petError;
    }

    return NextResponse.json({ data: { id: cliente.id, nome: cliente.nome } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao cadastrar cliente" }, { status: 500 });
  }
}
