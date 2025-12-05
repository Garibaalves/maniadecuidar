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
};

export type Animal = {
  id: string;
  cliente_id: string;
  nome: string;
  especie: string;
  raca?: string | null;
  porte: "PEQUENO" | "MEDIO" | "GRANDE";
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
