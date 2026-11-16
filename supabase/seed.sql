-- Arma — kurgusal örnek veri
--
-- Bu dosyadaki işletme, otel, oda ve misafir adlarının TAMAMI KURGUSALDIR.
-- Gerçek bir otel, misafir veya işletme verisi içermez.
--
-- Tekrar çalıştırılabilir: oteller/odalar güncellenir, rezervasyonlar yalnızca otelde
-- hiç rezervasyon yoksa eklenir. Rezervasyon tarihleri seed'in çalıştığı güne göre
-- hesaplanır (ör. "bugünden 3 gün önce giriş").
--
-- Kullanıcı hesapları ve otel üyelikleri burada oluşturulmaz; bkz. scripts/demo-kullanicilari.mjs

insert into public.organizations (id, name)
values ('a0000000-0000-4000-8000-000000000001', 'Arma Demo İşletme Grubu')
on conflict (id) do update set name = excluded.name;

insert into public.hotels (id, organization_id, code, name, timezone, currency)
values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001',
   'sahil', 'Arma Sahil Oteli', 'Europe/Istanbul', 'TRY'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001',
   'sehir', 'Arma Şehir Oteli', 'Europe/Istanbul', 'TRY')
on conflict (id) do update
  set code = excluded.code, name = excluded.name,
      timezone = excluded.timezone, currency = excluded.currency;

-- Oda tipleri
insert into public.room_types (hotel_id, code, name, capacity, sort_order)
select h.id, v.code, v.name, v.capacity, v.sort_order
from (values
  ('sahil', 'STD', 'Standart Oda', 2, 1),
  ('sahil', 'DNZ', 'Deniz Manzaralı Oda', 3, 2),
  ('sahil', 'AIL', 'Aile Odası', 4, 3),
  ('sahil', 'SUT', 'Suit', 4, 4),
  ('sehir', 'TEK', 'Tek Kişilik Oda', 1, 1),
  ('sehir', 'STD', 'Standart Oda', 2, 2),
  ('sehir', 'SUP', 'Superior Oda', 2, 3),
  ('sehir', 'SUT', 'Suit', 3, 4)
) as v(hotel_code, code, name, capacity, sort_order)
join public.hotels h on h.code = v.hotel_code
on conflict (hotel_id, code) do update
  set name = excluded.name, capacity = excluded.capacity, sort_order = excluded.sort_order;

-- Odalar
insert into public.rooms (hotel_id, room_type_id, number, floor, housekeeping_status, out_of_order, out_of_order_reason)
select h.id, rt.id, v.number, v.floor, v.hk, v.ooo, v.ooo_reason
from (values
  -- Arma Sahil Oteli (22 oda)
  ('sahil', 'STD', '101', 1, 'temiz', false, null),
  ('sahil', 'STD', '102', 1, 'temiz', false, null),
  ('sahil', 'STD', '103', 1, 'kirli', false, null),
  ('sahil', 'STD', '104', 1, 'temiz', false, null),
  ('sahil', 'STD', '105', 1, 'temiz', false, null),
  ('sahil', 'STD', '106', 1, 'kirli', true, 'Klima bakımı (kurgusal)'),
  ('sahil', 'AIL', '107', 1, 'temiz', false, null),
  ('sahil', 'AIL', '108', 1, 'temiz', false, null),
  ('sahil', 'DNZ', '201', 2, 'temiz', false, null),
  ('sahil', 'DNZ', '202', 2, 'temiz', false, null),
  ('sahil', 'DNZ', '203', 2, 'kirli', false, null),
  ('sahil', 'DNZ', '204', 2, 'temiz', false, null),
  ('sahil', 'DNZ', '205', 2, 'temiz', false, null),
  ('sahil', 'DNZ', '206', 2, 'temiz', false, null),
  ('sahil', 'DNZ', '301', 3, 'temiz', false, null),
  ('sahil', 'DNZ', '302', 3, 'temiz', false, null),
  ('sahil', 'DNZ', '303', 3, 'temiz', false, null),
  ('sahil', 'DNZ', '304', 3, 'kirli', false, null),
  ('sahil', 'AIL', '305', 3, 'temiz', false, null),
  ('sahil', 'AIL', '306', 3, 'temiz', false, null),
  ('sahil', 'SUT', '401', 4, 'temiz', false, null),
  ('sahil', 'SUT', '402', 4, 'temiz', false, null),
  -- Arma Şehir Oteli (16 oda)
  ('sehir', 'TEK', '101', 1, 'temiz', false, null),
  ('sehir', 'TEK', '102', 1, 'temiz', false, null),
  ('sehir', 'TEK', '103', 1, 'kirli', false, null),
  ('sehir', 'STD', '104', 1, 'temiz', false, null),
  ('sehir', 'STD', '105', 1, 'temiz', false, null),
  ('sehir', 'STD', '106', 1, 'kirli', false, null),
  ('sehir', 'STD', '201', 2, 'temiz', false, null),
  ('sehir', 'STD', '202', 2, 'temiz', false, null),
  ('sehir', 'STD', '203', 2, 'kirli', true, 'Su tesisatı onarımı (kurgusal)'),
  ('sehir', 'STD', '204', 2, 'temiz', false, null),
  ('sehir', 'SUP', '205', 2, 'temiz', false, null),
  ('sehir', 'SUP', '206', 2, 'temiz', false, null),
  ('sehir', 'SUP', '301', 3, 'temiz', false, null),
  ('sehir', 'SUP', '302', 3, 'temiz', false, null),
  ('sehir', 'SUT', '401', 4, 'temiz', false, null),
  ('sehir', 'SUT', '402', 4, 'temiz', false, null)
) as v(hotel_code, type_code, number, floor, hk, ooo, ooo_reason)
join public.hotels h on h.code = v.hotel_code
join public.room_types rt on rt.hotel_id = h.id and rt.code = v.type_code
on conflict (hotel_id, number) do update
  set room_type_id = excluded.room_type_id, floor = excluded.floor,
      housekeeping_status = excluded.housekeeping_status,
      out_of_order = excluded.out_of_order, out_of_order_reason = excluded.out_of_order_reason;

-- Rezervasyonlar (kurgusal misafirler). ci/co: bugüne göre gün farkı.
insert into public.reservations (hotel_id, room_id, guest_name, adults, check_in, check_out, status, note, cancelled_at)
select h.id, r.id, v.guest, v.adults, t.d + v.ci, t.d + v.co, v.status, v.note,
       case when v.status = 'iptal' then now() end
from (values
  -- Arma Sahil Oteli
  ('sahil', '201', 'Deniz Yalçın',     2, -3,  2, 'konaklamada', null::text),
  ('sahil', '202', 'Elif Karaca',      2, -2,  3, 'konaklamada', null),
  ('sahil', '101', 'Can Aydemir',      1, -1,  0, 'konaklamada', 'Geç çıkış istedi (örnek not)'),
  ('sahil', '107', 'Selin Ergün',      4, -4,  1, 'konaklamada', null),
  ('sahil', '301', 'Hans Becker',      2, -5,  0, 'konaklamada', null),
  ('sahil', '401', 'Laura Bianchi',    2, -2,  5, 'konaklamada', null),
  ('sahil', '203', 'Okan Tekin',       3, -6,  1, 'konaklamada', null),
  ('sahil', '101', 'Zeynep Arslan',    2,  0,  4, 'onayli',      null),
  ('sahil', '204', 'Burak Şahin',      2,  0,  3, 'onayli',      'Bebek yatağı (örnek not)'),
  ('sahil', '305', 'Ayşe Koç',         4,  0,  7, 'onayli',      null),
  ('sahil', '102', 'Mert Öztürk',      2,  1,  3, 'onayli',      null),
  ('sahil', '205', 'Emma Wilson',      2,  2,  9, 'onayli',      null),
  ('sahil', '302', 'Kerem Aksoy',      3,  3,  5, 'onayli',      null),
  ('sahil', '402', 'Nina Petrova',     2,  5, 12, 'onayli',      null),
  ('sahil', '108', 'Gizem Demirtaş',   3,  6, 10, 'onayli',      null),
  ('sahil', '103', 'Tolga Uçar',       2, -7, -3, 'cikis_yapti', null),
  ('sahil', '202', 'Sevda Kılıç',      2, -6, -2, 'cikis_yapti', null),
  ('sahil', '206', 'İpek Güler',       2,  1,  4, 'iptal',       'Misafir talebiyle iptal (örnek)'),
  -- Arma Şehir Oteli
  ('sehir', '104', 'Ali Rıza Tunç',    1, -1,  1, 'konaklamada', null),
  ('sehir', '101', 'Fatma Erdem',      1, -2,  0, 'konaklamada', null),
  ('sehir', '205', 'Jonas Müller',     2, -3,  2, 'konaklamada', null),
  ('sehir', '401', 'Derya Kaplan',     2, -1,  2, 'konaklamada', null),
  ('sehir', '201', 'Emre Bulut',       2, -2,  1, 'konaklamada', null),
  ('sehir', '102', 'Hakan Yurt',       1,  0,  2, 'onayli',      null),
  ('sehir', '206', 'Sara Lindqvist',   2,  0,  3, 'onayli',      null),
  ('sehir', '105', 'Onur Çelik',       2,  1,  2, 'onayli',      null),
  ('sehir', '301', 'Pınar Aydın',      2,  2,  4, 'onayli',      null),
  ('sehir', '202', 'Kenji Tanaka',     2,  4,  6, 'onayli',      null),
  ('sehir', '101', 'Melis Uysal',      1,  1,  3, 'onayli',      null),
  ('sehir', '106', 'Serkan Doğan',     2, -4, -1, 'cikis_yapti', null),
  ('sehir', '302', 'Aylin Oral',       2,  3,  5, 'iptal',       null)
) as v(hotel_code, room_no, guest, adults, ci, co, status, note)
join public.hotels h on h.code = v.hotel_code
join public.rooms r on r.hotel_id = h.id and r.number = v.room_no
cross join lateral (select (now() at time zone h.timezone)::date as d) t
where not exists (select 1 from public.reservations x where x.hotel_id = h.id);
