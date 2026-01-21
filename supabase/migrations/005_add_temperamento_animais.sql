alter table public.animais
add column temperamento text not null default 'CALMO';

alter table public.animais
add constraint animais_temperamento_check
check (temperamento in ('CALMO', 'AGITADO'));
