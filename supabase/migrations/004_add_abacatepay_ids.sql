alter table public.clientes
  add column if not exists abacatepay_customer_id text;

alter table public.assinaturas
  add column if not exists abacatepay_billing_id text;
