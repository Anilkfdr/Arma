-- Arma — çekirdek şema (ilk prototip)
--
-- Kapsam: işletme grubu, oteller, kullanıcı-otel üyeliği (yetki), oda tipleri,
-- odalar ve rezervasyonlar. Uzun vadeli RMOS muadili hedefinin yalnızca ilk dilimidir.
--
-- Güvenlik ilkeleri:
--   * Her tabloda RLS açıktır. Otel verisine erişim yalnızca hotel_members üyeliği ile mümkündür.
--   * anon rolü hiçbir tabloya erişemez. authenticated rolüne yalnızca gereken izinler,
--     gerektiğinde sütun düzeyinde verilir (Supabase yeni projelerde otomatik izin vermiyor).
--   * Aynı odanın çakışan iki aktif rezervasyona verilmesi veritabanında bir EXCLUDE
--     kısıtıyla atomik olarak engellenir; arayüz kontrolüne güvenilmez.

create extension if not exists btree_gist with schema extensions;

-- Yardımcı fonksiyonlar için API'ye açılmayan şema.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Tablolar
-- ---------------------------------------------------------------------------

-- İşletme grubu: aynı sahibin/şirketin otellerini bir araya getirir (ör. merkez ofis).
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 2 and 120),
  created_at timestamptz not null default now()
);

create table public.hotels (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  code text not null unique check (code ~ '^[a-z0-9-]{2,32}$'),
  name text not null check (length(btrim(name)) between 2 and 120),
  timezone text not null default 'Europe/Istanbul',
  currency char(3) not null default 'TRY',
  created_at timestamptz not null default now()
);
create index hotels_organization_id_idx on public.hotels (organization_id);

-- Kullanıcı ↔ otel üyeliği. Bir kullanıcı birden çok otelde farklı rollere sahip olabilir.
--   yonetici    : otel müdürü / yönetici (şimdilik resepsiyonla aynı yazma yetkisi)
--   resepsiyon  : ön büro çalışanı; rezervasyon oluşturur ve iptal eder
--   merkez_ofis : merkez ofis; üyesi olduğu otellerde resepsiyon yetkisiyle çalışır
--   izleyici    : yalnızca okur
create table public.hotel_members (
  hotel_id uuid not null references public.hotels (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('yonetici', 'resepsiyon', 'merkez_ofis', 'izleyici')),
  created_at timestamptz not null default now(),
  primary key (hotel_id, user_id)
);
create index hotel_members_user_id_idx on public.hotel_members (user_id);

create table public.room_types (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels (id) on delete restrict,
  code text not null check (code ~ '^[A-Z0-9]{2,8}$'),
  name text not null check (length(btrim(name)) between 2 and 80),
  capacity smallint not null check (capacity between 1 and 12),
  sort_order smallint not null default 0,
  unique (hotel_id, code),
  -- Bileşik anahtar: odanın tipi mutlaka aynı otele ait olsun.
  unique (hotel_id, id)
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels (id) on delete restrict,
  room_type_id uuid not null,
  number text not null check (number ~ '^[A-Za-z0-9-]{1,10}$'),
  floor smallint,
  -- Kat hizmetleri durumu (basitleştirilmiş: temiz / kirli).
  housekeeping_status text not null default 'temiz' check (housekeeping_status in ('temiz', 'kirli')),
  -- Arızalı / satış dışı (OOO). Satılabilir oda envanterinden düşülür.
  out_of_order boolean not null default false,
  out_of_order_reason text check (out_of_order_reason is null or length(out_of_order_reason) <= 200),
  unique (hotel_id, number),
  unique (hotel_id, id),
  foreign key (hotel_id, room_type_id) references public.room_types (hotel_id, id)
);
create index rooms_room_type_id_idx on public.rooms (room_type_id);

-- Rezervasyon. Tarih aralığı [check_in, check_out): çıkış günü konaklama gecesi sayılmaz.
--   onayli       : onaylandı, misafir henüz gelmedi
--   konaklamada  : misafir giriş yaptı (in-house)
--   cikis_yapti  : misafir çıkış yaptı
--   iptal        : iptal edildi; oda serbest kalır
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  reservation_no bigint generated always as identity unique,
  hotel_id uuid not null references public.hotels (id) on delete restrict,
  room_id uuid not null,
  guest_name text not null check (length(btrim(guest_name)) between 2 and 120),
  adults smallint not null default 2 check (adults between 1 and 12),
  check_in date not null,
  check_out date not null,
  status text not null default 'onayli'
    check (status in ('onayli', 'konaklamada', 'cikis_yapti', 'iptal')),
  note text check (note is null or length(note) <= 500),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  cancelled_at timestamptz,
  cancelled_by uuid references auth.users (id) on delete set null,
  constraint reservations_dates_check check (check_out > check_in),
  constraint reservations_max_nights_check check (check_out - check_in <= 90),
  constraint reservations_room_fk foreign key (hotel_id, room_id) references public.rooms (hotel_id, id),
  -- Aynı oda için aktif rezervasyonların gece aralıkları kesişemez (atomik, yarış durumuna dayanıklı).
  constraint reservations_no_overlap exclude using gist (
    room_id with =,
    daterange(check_in, check_out, '[)') with &&
  ) where (status in ('onayli', 'konaklamada'))
);
create index reservations_hotel_dates_idx on public.reservations (hotel_id, check_in, check_out);
create index reservations_room_id_idx on public.reservations (room_id);

-- ---------------------------------------------------------------------------
-- Yetki yardımcıları (security definer: hotel_members üzerindeki RLS'e takılmadan
-- yalnızca çağıran kullanıcının kendi üyeliğine bakar)
-- ---------------------------------------------------------------------------

create function private.is_hotel_member(p_hotel_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.hotel_members m
    where m.hotel_id = p_hotel_id
      and m.user_id = (select auth.uid())
  );
$$;

create function private.can_write_reservations(p_hotel_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.hotel_members m
    where m.hotel_id = p_hotel_id
      and m.user_id = (select auth.uid())
      and m.role in ('yonetici', 'resepsiyon', 'merkez_ofis')
  );
$$;

create function private.is_organization_member(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.hotel_members m
    join public.hotels h on h.id = m.hotel_id
    where h.organization_id = p_organization_id
      and m.user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_hotel_member(uuid) from public;
revoke all on function private.can_write_reservations(uuid) from public;
revoke all on function private.is_organization_member(uuid) from public;
grant execute on function private.is_hotel_member(uuid) to authenticated;
grant execute on function private.can_write_reservations(uuid) to authenticated;
grant execute on function private.is_organization_member(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Rezervasyon iş kuralları (tetikleyici)
-- ---------------------------------------------------------------------------

create function private.reservations_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_capacity smallint;
  v_out_of_order boolean;
begin
  if tg_op = 'INSERT' then
    new.guest_name := btrim(new.guest_name);

    -- Oda, çağıran kullanıcının görebildiği satırlar içinde aranır (RLS geçerlidir).
    select rt.capacity, r.out_of_order
      into v_capacity, v_out_of_order
    from public.rooms r
    join public.room_types rt on rt.id = r.room_type_id
    where r.id = new.room_id
      and r.hotel_id = new.hotel_id;

    if not found then
      raise exception 'Oda bu otelde bulunamadı.'
        using errcode = 'P0001', hint = 'room_not_found';
    end if;

    if v_out_of_order and new.status in ('onayli', 'konaklamada') then
      raise exception 'Bu oda arızalı / satış dışı olarak işaretli.'
        using errcode = 'P0001', hint = 'room_out_of_order';
    end if;

    if new.adults > v_capacity then
      raise exception 'Kişi sayısı oda kapasitesini (%) aşıyor.', v_capacity
        using errcode = 'P0001', hint = 'capacity_exceeded';
    end if;

    if new.status = 'iptal' and new.cancelled_at is null then
      new.cancelled_at := now();
    end if;
  elsif tg_op = 'UPDATE' then
    if new.status is distinct from old.status then
      if not (
        (old.status = 'onayli' and new.status in ('iptal', 'konaklamada'))
        or (old.status = 'konaklamada' and new.status = 'cikis_yapti')
      ) then
        raise exception 'Geçersiz durum değişikliği: % → %', old.status, new.status
          using errcode = 'P0001', hint = 'invalid_transition';
      end if;

      if new.status = 'iptal' then
        new.cancelled_at := now();
        new.cancelled_by := auth.uid();
      end if;
    end if;
  end if;

  return new;
end;
$$;

create trigger reservations_before_write
before insert or update on public.reservations
for each row execute function private.reservations_before_write();

-- ---------------------------------------------------------------------------
-- Satır düzeyi güvenlik (RLS)
-- ---------------------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.hotels enable row level security;
alter table public.hotel_members enable row level security;
alter table public.room_types enable row level security;
alter table public.rooms enable row level security;
alter table public.reservations enable row level security;

create policy "Üyesi olunan otellerin grubu okunur"
  on public.organizations for select to authenticated
  using (private.is_organization_member(id));

create policy "Üyesi olunan oteller okunur"
  on public.hotels for select to authenticated
  using (private.is_hotel_member(id));

create policy "Kullanıcı kendi üyeliklerini okur"
  on public.hotel_members for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Üyesi olunan otelin oda tipleri okunur"
  on public.room_types for select to authenticated
  using (private.is_hotel_member(hotel_id));

create policy "Üyesi olunan otelin odaları okunur"
  on public.rooms for select to authenticated
  using (private.is_hotel_member(hotel_id));

create policy "Üyesi olunan otelin rezervasyonları okunur"
  on public.reservations for select to authenticated
  using (private.is_hotel_member(hotel_id));

create policy "Yetkili rol rezervasyon oluşturur"
  on public.reservations for insert to authenticated
  with check (private.can_write_reservations(hotel_id));

create policy "Yetkili rol rezervasyon durumunu değiştirir"
  on public.reservations for update to authenticated
  using (private.can_write_reservations(hotel_id))
  with check (private.can_write_reservations(hotel_id));

-- Silme politikası yok: rezervasyonlar silinmez, iptal edilir.

-- ---------------------------------------------------------------------------
-- Tablo izinleri (açıkça verilir)
-- ---------------------------------------------------------------------------

revoke all on public.organizations, public.hotels, public.hotel_members,
  public.room_types, public.rooms, public.reservations
  from anon, authenticated;

grant select on public.organizations, public.hotels, public.hotel_members,
  public.room_types, public.rooms, public.reservations
  to authenticated;

-- Kullanıcı yalnızca bu alanları gönderebilir; durum her zaman 'onayli' başlar,
-- created_by her zaman oturumdaki kullanıcıdır.
grant insert (hotel_id, room_id, guest_name, adults, check_in, check_out, note)
  on public.reservations to authenticated;

-- Mevcut kayıtta yalnızca durum değiştirilebilir (geçişler tetikleyicide denetlenir).
grant update (status) on public.reservations to authenticated;

-- Sunucu tarafı yönetim betikleri (demo kullanıcı ve üyelik kurulumu) için.
grant select, insert, update, delete on public.organizations, public.hotels, public.hotel_members,
  public.room_types, public.rooms, public.reservations
  to service_role;

-- ---------------------------------------------------------------------------
-- Okuma fonksiyonları (security invoker: RLS aynen uygulanır)
-- ---------------------------------------------------------------------------

-- Her erişilebilir otel için günün özeti. Gün, otelin saat dilimindeki takvim günüdür.
-- VARSAYIM: Gerçek otel yazılımlarında "iş tarihi" gece kapanışıyla ilerler; bu prototipte
-- henüz gece kapanışı olmadığından takvim günü kullanılıyor.
create function public.hotel_day_summary(p_hotel_id uuid default null)
returns table (
  hotel_id uuid,
  hotel_code text,
  hotel_name text,
  business_day date,
  total_rooms integer,
  out_of_order_rooms integer,
  sellable_rooms integer,
  occupied_tonight integer,
  arrivals_today integer,
  departures_today integer,
  in_house integer,
  arrivals_next_7_days integer
)
language sql
stable
security invoker
set search_path = ''
as $$
  with h as (
    select h.id, h.code, h.name, (now() at time zone h.timezone)::date as d
    from public.hotels h
    where p_hotel_id is null or h.id = p_hotel_id
  ),
  room_counts as (
    select r.hotel_id,
           count(*)::integer as total,
           count(*) filter (where r.out_of_order)::integer as ooo
    from public.rooms r
    group by r.hotel_id
  )
  select
    h.id,
    h.code,
    h.name,
    h.d,
    coalesce(rc.total, 0),
    coalesce(rc.ooo, 0),
    coalesce(rc.total, 0) - coalesce(rc.ooo, 0),
    (select count(*)::integer from public.reservations x
      where x.hotel_id = h.id and x.status in ('onayli', 'konaklamada')
        and x.check_in <= h.d and x.check_out > h.d),
    (select count(*)::integer from public.reservations x
      where x.hotel_id = h.id and x.status <> 'iptal' and x.check_in = h.d),
    (select count(*)::integer from public.reservations x
      where x.hotel_id = h.id and x.status <> 'iptal' and x.check_out = h.d),
    (select count(*)::integer from public.reservations x
      where x.hotel_id = h.id and x.status = 'konaklamada'),
    (select count(*)::integer from public.reservations x
      where x.hotel_id = h.id and x.status = 'onayli'
        and x.check_in > h.d and x.check_in <= h.d + 7)
  from h
  left join room_counts rc on rc.hotel_id = h.id
  order by h.name;
$$;

-- Verilen tarih aralığında (çıkış günü hariç) boş, satışa açık ve kişi sayısına uygun odalar.
create function public.available_rooms(
  p_hotel_id uuid,
  p_check_in date,
  p_check_out date,
  p_adults integer default 1
)
returns table (
  room_id uuid,
  room_number text,
  floor smallint,
  room_type_id uuid,
  room_type_code text,
  room_type_name text,
  capacity smallint,
  housekeeping_status text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select r.id, r.number, r.floor, rt.id, rt.code, rt.name, rt.capacity, r.housekeeping_status
  from public.rooms r
  join public.room_types rt on rt.id = r.room_type_id
  where r.hotel_id = p_hotel_id
    and p_check_out > p_check_in
    and not r.out_of_order
    and rt.capacity >= greatest(coalesce(p_adults, 1), 1)
    and not exists (
      select 1
      from public.reservations x
      where x.room_id = r.id
        and x.status in ('onayli', 'konaklamada')
        and daterange(x.check_in, x.check_out, '[)') && daterange(p_check_in, p_check_out, '[)')
    )
  order by rt.sort_order, length(r.number), r.number;
$$;

revoke all on function public.hotel_day_summary(uuid) from public, anon;
revoke all on function public.available_rooms(uuid, date, date, integer) from public, anon;
grant execute on function public.hotel_day_summary(uuid) to authenticated;
grant execute on function public.available_rooms(uuid, date, date, integer) to authenticated;
