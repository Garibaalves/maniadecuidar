alter table public.agendamento_servicos
add column assinatura_id uuid references public.assinaturas(id) on delete set null;

create index if not exists agendamento_servicos_assinatura_idx
on public.agendamento_servicos(assinatura_id);
