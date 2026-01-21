-- Assinaturas de planos
create table if not exists public.assinaturas (
  id uuid primary key default uuid_generate_v4(),
  plano_id uuid not null references public.planos(id) on delete restrict,
  cliente_id uuid not null references public.clientes(id) on delete restrict,
  status text not null check (status in ('PENDENTE','ATIVA','CANCELADA','ATRASADA')) default 'PENDENTE',
  data_adesao date not null default (now()::date),
  data_ultimo_pagamento date,
  data_vencimento date,
  stripe_subscription_id text,
  stripe_customer_id text,
  stripe_checkout_url text,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists assinaturas_cliente_idx on public.assinaturas(cliente_id);
create index if not exists assinaturas_plano_idx on public.assinaturas(plano_id);
