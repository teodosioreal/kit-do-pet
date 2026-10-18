-- Kit do Pet — esquema inicial
-- Regra geral: o cliente (role "authenticated") só enxerga os próprios dados.
-- Tudo o que envolve pagamento, direitos e envios é escrito pelo servidor
-- usando a service role (que ignora RLS).

-- ---------------------------------------------------------------------------
-- Perfis (1:1 com auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  whatsapp text,                       -- só dígitos, com DDI (ex.: 5511999998888)
  whatsapp_consent_at timestamptz,     -- consentimento LGPD para mensagens
  terms_accepted_at timestamptz,
  reminders_enabled boolean not null default true,
  reminders_whatsapp text,             -- número que recebe os lembretes (se nulo, usa whatsapp)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, lower(new.email))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Pedidos e eventos de pagamento
-- ---------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  provider text not null,                 -- 'kiwify' | 'cakto' | 'manual'
  provider_order_id text not null,
  status text not null check (status in ('approved', 'refunded', 'chargeback', 'canceled')),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  customer_name text,
  customer_phone text,
  provider_product_ids text[] not null default '{}',
  items text[] not null default '{}',     -- chaves internas: kit, reminders, extra_pet, guide_training, guide_treats
  amount_cents integer,
  raw jsonb,
  approved_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_order_id)
);
create index orders_user_idx on public.orders (user_id);
create index orders_created_idx on public.orders (created_at desc);

-- Log de todo webhook recebido (auditoria + depuração)
create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_type text,
  provider_order_id text,
  signature_valid boolean,
  headers jsonb,
  query jsonb,
  body text,
  processed_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);
create index webhook_events_created_idx on public.webhook_events (created_at desc);

-- ---------------------------------------------------------------------------
-- Direitos (o que cada cliente pode usar)
-- ---------------------------------------------------------------------------
create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  product text not null check (product in ('kit', 'reminders', 'extra_pet', 'guide_training', 'guide_treats')),
  quantity integer not null default 1 check (quantity > 0),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,                 -- nulo = vitalício
  revoked_at timestamptz,
  source text not null default 'order' check (source in ('order', 'manual')),
  note text,
  created_at timestamptz not null default now(),
  -- um mesmo pedido não gera o mesmo direito duas vezes (manuais têm order_id nulo)
  unique (order_id, product)
);
create index entitlements_user_idx on public.entitlements (user_id);

-- Direitos ativos agora
create or replace view public.active_entitlements
with (security_invoker = true) as
select *
from public.entitlements
where revoked_at is null
  and starts_at <= now()
  and (expires_at is null or expires_at > now());

-- Quantos pets o usuário pode ter (1 por kit + 1 por "mais um pet")
create or replace function public.pet_limit(uid uuid)
returns integer language sql stable security definer set search_path = public as $$
  select coalesce(sum(quantity), 0)::int
  from public.active_entitlements
  where user_id = uid and product in ('kit', 'extra_pet');
$$;

create or replace function public.has_entitlement(uid uuid, p text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.active_entitlements where user_id = uid and product = p);
$$;

-- ---------------------------------------------------------------------------
-- Pets
-- ---------------------------------------------------------------------------
create sequence public.pet_registry_seq start 1001;

create or replace function public.gen_public_code()
returns text language plpgsql volatile set search_path = public as $$
declare
  alphabet constant text := 'abcdefghjkmnpqrstuvwxyz23456789';
  bytes bytea;
  result text;
  i int;
begin
  loop
    -- md5 de um uuid aleatório: 16 bytes uniformes, sem depender do pgcrypto
    bytes := decode(md5(gen_random_uuid()::text || clock_timestamp()::text), 'hex');
    result := '';
    for i in 0..7 loop
      result := result || substr(alphabet, 1 + (get_byte(bytes, i) % length(alphabet)), 1);
    end loop;
    exit when not exists (select 1 from public.pets where public_code = result);
  end loop;
  return result;
end $$;

create table public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  public_code text not null unique,
  registry_number text not null unique,
  name text not null check (char_length(name) between 1 and 60),
  species text not null check (species in ('dog', 'cat')),
  breed text,
  sex text check (sex in ('male', 'female')),
  color text,
  birth_date date,
  birth_place text,
  photo_path text,                        -- caminho no bucket pet-photos
  traits text,                            -- características
  notes text,                             -- observações
  tutor_name text,
  tutor_whatsapp text,
  rg_color text not null default 'blue' check (rg_color in ('green', 'blue', 'pink')),
  public_fields jsonb not null default jsonb_build_object(
    'photo', true, 'species', true, 'breed', true, 'sex', true, 'color', true,
    'birth_date', false, 'traits', true, 'notes', false, 'tutor_name', true, 'contact', true
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index pets_user_idx on public.pets (user_id);

-- Gera código público, número de registro e aplica o limite de pets
create or replace function public.pets_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  current_count int;
begin
  -- serializa inserções do mesmo usuário para o limite não ser furado em paralelo
  perform pg_advisory_xact_lock(hashtext('pets:' || new.user_id::text));
  select count(*) into current_count from public.pets where user_id = new.user_id;
  if current_count >= public.pet_limit(new.user_id) then
    raise exception 'PET_LIMIT_REACHED' using errcode = 'P0001';
  end if;

  new.public_code := public.gen_public_code();
  new.registry_number := 'KP-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.pet_registry_seq')::text, 6, '0');
  return new;
end $$;

create trigger pets_before_insert
  before insert on public.pets
  for each row execute function public.pets_before_insert();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger pets_touch before update on public.pets
  for each row execute function public.touch_updated_at();
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Vacinas, vermífugos e antipulgas
-- ---------------------------------------------------------------------------
create table public.health_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('vaccine', 'dewormer', 'antiflea')),
  name text not null check (char_length(name) between 1 and 80),
  applied_on date,
  next_due_on date,
  notes text,
  created_at timestamptz not null default now()
);
create index health_records_pet_idx on public.health_records (pet_id);
create index health_records_due_idx on public.health_records (next_due_on);

-- user_id sempre vem do dono do pet (o cliente não escolhe)
create or replace function public.health_records_set_owner()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select user_id into new.user_id from public.pets where id = new.pet_id;
  if new.user_id is null then
    raise exception 'PET_NOT_FOUND';
  end if;
  return new;
end $$;

create trigger health_records_set_owner
  before insert or update of pet_id on public.health_records
  for each row execute function public.health_records_set_owner();

-- ---------------------------------------------------------------------------
-- Lembretes enviados (evita duplicidade)
-- ---------------------------------------------------------------------------
create table public.reminder_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  health_record_id uuid references public.health_records(id) on delete set null,
  kind text not null check (kind in ('due_in_3_days', 'due_today', 'renewal')),
  ref_date date not null,                 -- data da dose (ou do vencimento do plano)
  phone text,
  status text not null default 'sent' check (status in ('sent', 'failed')),
  error text,
  created_at timestamptz not null default now(),
  unique nulls not distinct (user_id, health_record_id, kind, ref_date)
);
create index reminder_log_created_idx on public.reminder_log (created_at desc);

-- ---------------------------------------------------------------------------
-- Avisos "Encontrei este pet" (também serve de limite de envios)
-- ---------------------------------------------------------------------------
create table public.found_reports (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  ip_hash text not null,
  latitude double precision,
  longitude double precision,
  accuracy_m double precision,
  notified boolean not null default false,
  created_at timestamptz not null default now()
);
create index found_reports_pet_idx on public.found_reports (pet_id, created_at desc);
create index found_reports_ip_idx on public.found_reports (ip_hash, created_at desc);

-- ---------------------------------------------------------------------------
-- Guias (bônus em PDF) — gerenciados pelo admin
-- ---------------------------------------------------------------------------
create table public.guides (
  product text not null check (product in ('guide_training', 'guide_treats')),
  species text not null check (species in ('dog', 'cat')),
  file_path text not null,
  file_name text not null,
  updated_at timestamptz not null default now(),
  primary key (product, species)
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.webhook_events enable row level security;
alter table public.entitlements enable row level security;
alter table public.pets enable row level security;
alter table public.health_records enable row level security;
alter table public.reminder_log enable row level security;
alter table public.found_reports enable row level security;
alter table public.guides enable row level security;

-- profiles: ler e atualizar o próprio perfil (só colunas liberadas abaixo)
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- orders / entitlements: somente leitura do que é seu
create policy "orders_select_own" on public.orders
  for select to authenticated using (user_id = (select auth.uid()));
create policy "entitlements_select_own" on public.entitlements
  for select to authenticated using (user_id = (select auth.uid()));

-- pets: CRUD do que é seu
create policy "pets_select_own" on public.pets
  for select to authenticated using (user_id = (select auth.uid()));
create policy "pets_insert_own" on public.pets
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "pets_update_own" on public.pets
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "pets_delete_own" on public.pets
  for delete to authenticated using (user_id = (select auth.uid()));

-- health_records: CRUD dos registros dos seus pets
create policy "health_select_own" on public.health_records
  for select to authenticated using (user_id = (select auth.uid()));
create policy "health_insert_own" on public.health_records
  for insert to authenticated with check (
    exists (select 1 from public.pets p where p.id = pet_id and p.user_id = (select auth.uid()))
  );
create policy "health_update_own" on public.health_records
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "health_delete_own" on public.health_records
  for delete to authenticated using (user_id = (select auth.uid()));

-- reminder_log: o cliente pode ver o histórico dele
create policy "reminder_log_select_own" on public.reminder_log
  for select to authenticated using (user_id = (select auth.uid()));

-- webhook_events, found_reports, guides: sem políticas = só o servidor acessa.

-- Permissões por coluna: o cliente não altera campos de sistema
revoke insert, update on public.profiles from anon, authenticated;
grant update (full_name, whatsapp, whatsapp_consent_at, terms_accepted_at, reminders_enabled, reminders_whatsapp)
  on public.profiles to authenticated;

revoke insert, update on public.pets from anon, authenticated;
grant insert (user_id, name, species, breed, sex, color, birth_date, birth_place, photo_path, traits, notes,
              tutor_name, tutor_whatsapp, rg_color, public_fields)
  on public.pets to authenticated;
grant update (name, species, breed, sex, color, birth_date, birth_place, photo_path, traits, notes,
              tutor_name, tutor_whatsapp, rg_color, public_fields)
  on public.pets to authenticated;

revoke insert, update on public.health_records from anon, authenticated;
grant insert (pet_id, kind, name, applied_on, next_due_on, notes) on public.health_records to authenticated;
grant update (kind, name, applied_on, next_due_on, notes) on public.health_records to authenticated;

revoke all on public.orders, public.entitlements, public.webhook_events, public.reminder_log,
              public.found_reports, public.guides from anon;
revoke insert, update, delete on public.orders, public.entitlements, public.reminder_log from authenticated;
revoke all on function public.pet_limit(uuid), public.has_entitlement(uuid, text) from anon;

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('pet-photos', 'pet-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('guides', 'guides', false, 52428800, array['application/pdf'])
on conflict (id) do nothing;

-- Fotos: cada usuário só mexe na pasta <user_id>/...
create policy "pet_photos_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "pet_photos_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "pet_photos_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "pet_photos_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
-- Bucket "guides": sem políticas = só o servidor (download via URL assinada após checar o direito).
