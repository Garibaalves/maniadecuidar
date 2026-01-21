-- Planos de assinatura recorrente
create table if not exists public.planos (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  descricao text,
  intervalo_dias integer not null check (intervalo_dias > 0),
  valor numeric not null default 0,
  ativo boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists public.plano_servicos (
  id uuid primary key default uuid_generate_v4(),
  plano_id uuid not null references public.planos(id) on delete cascade,
  servico_id uuid not null references public.servicos(id),
  quantidade integer not null default 1 check (quantidade > 0),
  created_at timestamptz default now(),
  unique (plano_id, servico_id)
);

create index if not exists plano_servicos_plano_idx on public.plano_servicos(plano_id);
