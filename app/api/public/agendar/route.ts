import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase";

const publicAgendarSchema = z
  .object({
    telefone: z.string().min(8),
    nome: z.string().min(3),
    cpf: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    animal_id: z.string().uuid().optional(),
    animal: z
      .object({
        nome: z.string().min(2),
        especie: z.string().default("cachorro"),
        porte: z.enum(["PEQUENO", "MEDIO", "GRANDE"]),
        sexo: z.enum(["MACHO", "FEMEA"]),
      })
      .optional(),
    servicos: z.array(z.string().uuid()).min(1),
    data: z.string(),
    hora: z.string(),
    observacoes: z.string().optional(),
  })
  .refine((data) => data.animal_id || data.animal, {
    message: "Informe o animal ou selecione um existente",
    path: ["animal"],
  });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = publicAgendarSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    const { telefone, nome, cpf, email, animal_id, animal, servicos, data, hora, observacoes } =
      parsed.data;

    const { data: existingCliente } = await supabase
      .from("clientes")
      .select("*")
      .eq("telefone1", telefone)
      .maybeSingle();

    const clienteId = existingCliente?.id
      ? existingCliente.id
      : (
          await supabase
            .from("clientes")
            .insert({
              nome,
              telefone1: telefone,
              cpf,
              email,
            })
            .select()
            .single()
        ).data?.id;

    if (!clienteId) {
      return NextResponse.json({ error: "Não foi possível criar cliente" }, { status: 400 });
    }

    let finalAnimalId = animal_id;
    if (!finalAnimalId && animal) {
      const { data: createdAnimal, error: animalError } = await supabase
        .from("animais")
        .insert({
          cliente_id: clienteId,
          nome: animal.nome,
          especie: animal.especie,
          porte: animal.porte,
          sexo: animal.sexo,
        })
        .select()
        .single();
      if (animalError) throw animalError;
      finalAnimalId = createdAnimal.id;
    }

    const { data: createdAgendamento, error: agError } = await supabase
      .from("agendamentos")
      .insert({
        cliente_id: clienteId,
        animal_id: finalAnimalId,
        data,
        hora,
        status: "AGENDADO",
        observacoes,
      })
      .select()
      .single();
    if (agError) throw agError;

    const payloadServices = servicos.map((serviceId) => ({
      agendamento_id: createdAgendamento.id,
      servico_id: serviceId,
    }));
    await supabase.from("agendamento_servicos").insert(payloadServices);

    return NextResponse.json({ data: createdAgendamento });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao salvar agendamento" }, { status: 500 });
  }
}
