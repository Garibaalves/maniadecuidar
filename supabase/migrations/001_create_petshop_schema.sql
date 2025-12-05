-- Extension
create extension if not exists "uuid-ossp";

-- Usuarios
create table if not exists public.usuarios (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  telefone text unique not null,
  senha_hash text not null,
  perfil text not null check (perfil in ('ADMIN','FUNCIONARIO')),
  ativo boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Funcionarios
create table if not exists public.funcionarios (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  tipo_remuneracao text not null check (tipo_remuneracao in ('SALARIO','COMISSAO')),
  salario_mensal numeric,
  porcentagem_comissao numeric,
  ativo boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Clientes
create table if not exists public.clientes (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  cpf text,
  email text,
  telefone1 text not null,
  telefone2 text,
  endereco_rua text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  estado text,
  cep text,
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index clientes_telefone_idx on public.clientes(telefone1, telefone2);
create index clientes_nome_idx on public.clientes(nome);

-- Animais
create table if not exists public.animais (
  id uuid primary key default uuid_generate_v4(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  nome text not null,
  especie text not null,
  raca text,
  porte text not null,
  sexo text not null,
  data_nascimento date,
  observacoes text,
  created_at timestamptz default now()
);
create index animais_cliente_idx on public.animais(cliente_id);

-- Servicos
create table if not exists public.servicos (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  descricao text,
  duracao_minutos integer,
  valor_padrao numeric,
  ativo boolean not null default true,
  created_at timestamptz default now()
);

-- Produtos
create table if not exists public.produtos (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  descricao text,
  sku text,
  unidade text,
  preco_venda numeric not null default 0,
  preco_custo numeric,
  estoque_atual integer not null default 0,
  ativo boolean not null default true,
  created_at timestamptz default now()
);
create index produtos_sku_idx on public.produtos(sku);

-- Agenda config & bloqueios
create table if not exists public.agenda_config (
  id uuid primary key default uuid_generate_v4(),
  dia_semana smallint not null check (dia_semana between 0 and 6),
  hora_inicio time not null,
  hora_fim time not null,
  intervalo_minutos integer not null default 30,
  unique (dia_semana)
);

create table if not exists public.agenda_bloqueios (
  id uuid primary key default uuid_generate_v4(),
  data date not null,
  hora_inicio time not null,
  hora_fim time not null,
  motivo text
);
create index agenda_bloqueios_data_idx on public.agenda_bloqueios(data);

-- Agendamentos
create table if not exists public.agendamentos (
  id uuid primary key default uuid_generate_v4(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  animal_id uuid not null references public.animais(id) on delete cascade,
  funcionario_id uuid references public.funcionarios(id),
  data date not null,
  hora time not null,
  status text not null check (status in ('AGENDADO','EM_ATENDIMENTO','CONCLUIDO','CANCELADO','NAO_COMPARECEU')) default 'AGENDADO',
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index agendamentos_data_hora_idx on public.agendamentos(data, hora);
create index agendamentos_cliente_idx on public.agendamentos(cliente_id);

create table if not exists public.agendamento_servicos (
  id uuid primary key default uuid_generate_v4(),
  agendamento_id uuid not null references public.agendamentos(id) on delete cascade,
  servico_id uuid not null references public.servicos(id),
  valor numeric
);
create index agendamento_servicos_agendamento_idx on public.agendamento_servicos(agendamento_id);

-- Atendimentos
create table if not exists public.atendimentos (
  id uuid primary key default uuid_generate_v4(),
  agendamento_id uuid not null references public.agendamentos(id) on delete cascade,
  data_inicio timestamptz,
  data_fim timestamptz,
  observacoes text,
  valor_total numeric,
  forma_pagamento text check (forma_pagamento in ('PIX','DINHEIRO','DEBITO','CREDITO')),
  created_at timestamptz default now()
);
create unique index atendimentos_agendamento_unique on public.atendimentos(agendamento_id);

create table if not exists public.atendimento_itens (
  id uuid primary key default uuid_generate_v4(),
  atendimento_id uuid not null references public.atendimentos(id) on delete cascade,
  tipo_item text not null check (tipo_item in ('SERVICO','PRODUTO')),
  servico_id uuid references public.servicos(id),
  produto_id uuid references public.produtos(id),
  quantidade numeric not null default 1,
  valor_unitario numeric not null default 0,
  valor_total numeric not null default 0
);
create index atendimento_itens_atendimento_idx on public.atendimento_itens(atendimento_id);

create table if not exists public.atendimento_fotos (
  id uuid primary key default uuid_generate_v4(),
  atendimento_id uuid not null references public.atendimentos(id) on delete cascade,
  url_foto text not null,
  created_at timestamptz default now()
);

-- Estoque movimentos
create table if not exists public.estoque_movimentos (
  id uuid primary key default uuid_generate_v4(),
  produto_id uuid not null references public.produtos(id),
  tipo text not null check (tipo in ('ENTRADA','SAIDA')),
  quantidade numeric not null,
  motivo text,
  referencia_tabela text,
  referencia_id uuid,
  created_at timestamptz default now()
);
create index estoque_movimentos_produto_idx on public.estoque_movimentos(produto_id);

-- Caixa movimentos
create table if not exists public.caixa_movimentos (
  id uuid primary key default uuid_generate_v4(),
  data timestamptz not null,
  tipo text not null check (tipo in ('ENTRADA','SAIDA')),
  categoria text,
  forma_pagamento text not null check (forma_pagamento in ('PIX','DINHEIRO','DEBITO','CREDITO','OUTROS')),
  valor numeric not null,
  descricao text,
  referencia_tabela text,
  referencia_id uuid,
  created_at timestamptz default now()
);
create index caixa_data_idx on public.caixa_movimentos(data);

-- Contas fixas
create table if not exists public.contas_fixas (
  id uuid primary key default uuid_generate_v4(),
  descricao text not null,
  categoria text,
  valor_mensal numeric not null,
  dia_vencimento integer not null check (dia_vencimento between 1 and 31),
  ativo boolean not null default true,
  created_at timestamptz default now()
);

-- Despesas
create table if not exists public.despesas (
  id uuid primary key default uuid_generate_v4(),
  descricao text not null,
  categoria text,
  valor numeric not null,
  data_vencimento date not null,
  data_pagamento date,
  conta_fixa_id uuid references public.contas_fixas(id),
  observacoes text,
  created_at timestamptz default now()
);
create index despesas_vencimento_idx on public.despesas(data_vencimento);
