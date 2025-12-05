import { z } from "zod";

export const loginSchema = z.object({
  telefone: z.string().min(8, "Informe o telefone"),
  senha: z.string().min(6, "Senha inválida"),
});

export const clienteSchema = z.object({
  nome: z.string().min(3),
  cpf: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  telefone1: z.string().min(8),
  telefone2: z.string().optional(),
  endereco_rua: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  observacoes: z.string().optional(),
});

export const clienteUpdateSchema = clienteSchema.extend({
  id: z.string().uuid(),
});

export const animalSchema = z.object({
  cliente_id: z.string().uuid(),
  nome: z.string().min(2),
  especie: z.string(),
  raca: z.string().optional(),
  porte: z.enum(["PEQUENO", "MEDIO", "GRANDE"]),
  sexo: z.enum(["MACHO", "FEMEA"]),
  data_nascimento: z.string().optional(),
  observacoes: z.string().optional(),
});

export const servicoSchema = z.object({
  nome: z.string().min(2),
  descricao: z.string().optional(),
  duracao_minutos: z.number().int().positive(),
  valor_padrao: z.number().nonnegative(),
  ativo: z.boolean().default(true),
});

export const servicoUpdateSchema = servicoSchema.extend({
  id: z.string().uuid(),
});

export const produtoSchema = z.object({
  nome: z.string().min(2),
  descricao: z.string().optional(),
  sku: z.string().optional(),
  unidade: z.string().optional(),
  preco_venda: z.number().nonnegative(),
  preco_custo: z.number().nonnegative().optional(),
  estoque_atual: z.number().int().nonnegative().default(0),
  ativo: z.boolean().default(true),
});

export const produtoUpdateSchema = produtoSchema.extend({
  id: z.string().uuid(),
});

export const funcionarioSchema = z.object({
  nome: z.string().min(2),
  telefone: z.string().min(8),
  usuario_id: z.string().uuid(),
  tipo_remuneracao: z.enum(["SALARIO", "COMISSAO"]),
  salario_mensal: z.number().nonnegative().optional(),
  porcentagem_comissao: z.number().nonnegative().optional(),
  ativo: z.boolean().default(true),
});

export const agendaConfigSchema = z.object({
  dia_semana: z.number().min(0).max(6),
  hora_inicio: z.string(),
  hora_fim: z.string(),
  intervalo_minutos: z.number().int().positive(),
});

export const agendamentoSchema = z.object({
  cliente_id: z.string().uuid(),
  animal_id: z.string().uuid(),
  funcionario_id: z.string().uuid().nullable().optional(),
  data: z.string(),
  hora: z.string(),
  status: z.enum([
    "AGENDADO",
    "EM_ATENDIMENTO",
    "CONCLUIDO",
    "CANCELADO",
    "NAO_COMPARECEU",
  ]),
  observacoes: z.string().optional(),
  servicos: z.array(
    z.object({
      servico_id: z.string().uuid(),
      valor: z.number().nonnegative().optional(),
    })
  ),
});

export const estoqueMovimentoSchema = z.object({
  produto_id: z.string().uuid(),
  tipo: z.enum(["ENTRADA", "SAIDA"]),
  quantidade: z.number().positive(),
  motivo: z.string(),
  referencia_tabela: z.string().optional(),
  referencia_id: z.string().optional(),
});

export const caixaMovimentoSchema = z.object({
  data: z.string(),
  tipo: z.enum(["ENTRADA", "SAIDA"]),
  categoria: z.string(),
  forma_pagamento: z.enum(["PIX", "DINHEIRO", "DEBITO", "CREDITO", "OUTROS"]),
  valor: z.number().positive(),
  descricao: z.string().optional(),
  referencia_tabela: z.string().optional(),
  referencia_id: z.string().optional(),
});

export const despesaSchema = z.object({
  descricao: z.string(),
  categoria: z.string(),
  valor: z.number().positive(),
  data_vencimento: z.string(),
  data_pagamento: z.string().optional(),
  conta_fixa_id: z.string().uuid().nullable().optional(),
  observacoes: z.string().optional(),
});

export const despesaUpdateSchema = despesaSchema.extend({
  id: z.string().uuid(),
});
export const contaFixaSchema = z.object({
  descricao: z.string(),
  categoria: z.string(),
  valor_mensal: z.number().positive(),
  dia_vencimento: z.number().min(1).max(31),
  ativo: z.boolean().default(true),
});
