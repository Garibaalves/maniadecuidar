export type Perfil = "ADMIN" | "FUNCIONARIO";

export type Usuario = {
  id: string;
  nome: string;
  telefone: string;
  perfil: Perfil;
  ativo: boolean;
  created_at?: string;
};

export type Cliente = {
  id: string;
  nome: string;
  cpf?: string | null;
  email?: string | null;
  telefone1: string;
  telefone2?: string | null;
  endereco_rua?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  observacoes?: string | null;
  abacatepay_customer_id?: string | null;
};

export type Animal = {
  id: string;
  cliente_id: string;
  nome: string;
  especie: string;
  raca?: string | null;
  porte: "PEQUENO" | "MEDIO" | "GRANDE";
  temperamento: "CALMO" | "AGITADO";
  sexo: "MACHO" | "FEMEA";
  data_nascimento?: string | null;
  observacoes?: string | null;
};

export type Servico = {
  id: string;
  nome: string;
  descricao?: string | null;
  duracao_minutos: number;
  valor_padrao: number;
  ativo: boolean;
};

export type Produto = {
  id: string;
  nome: string;
  descricao?: string | null;
  sku?: string | null;
  unidade?: string | null;
  preco_venda: number;
  preco_custo?: number | null;
  estoque_atual: number;
  ativo: boolean;
};

export type AgendamentoStatus =
  | "AGENDADO"
  | "EM_ATENDIMENTO"
  | "CONCLUIDO"
  | "CANCELADO"
  | "NAO_COMPARECEU";

export type Agendamento = {
  id: string;
  cliente_id: string;
  animal_id: string;
  funcionario_id?: string | null;
  data: string;
  hora: string;
  status: AgendamentoStatus;
  observacoes?: string | null;
};

export type CaixaFormaPagamento = "PIX" | "DINHEIRO" | "DEBITO" | "CREDITO" | "OUTROS";

export type PlanoServico = {
  servico_id: string;
  quantidade: number;
  servicos?: {
    id: string;
    nome: string;
    valor_padrao?: number | null;
  } | null;
};

export type Plano = {
  id: string;
  nome: string;
  descricao?: string | null;
  intervalo_dias: number;
  valor: number;
  ativo: boolean;
  plano_servicos?: PlanoServico[];
};

export type AssinaturaStatus = "PENDENTE" | "ATIVA" | "CANCELADA" | "ATRASADA";

export type Assinatura = {
  id: string;
  plano_id: string;
  cliente_id: string;
  status: AssinaturaStatus;
  data_adesao?: string | null;
  data_ultimo_pagamento?: string | null;
  data_vencimento?: string | null;
  stripe_subscription_id?: string | null;
  stripe_customer_id?: string | null;
  stripe_checkout_url?: string | null;
  abacatepay_billing_id?: string | null;
  planos?: Plano | null;
  clientes?: { id: string; nome: string; telefone1?: string | null } | null;
};
