/**
 * PGlite (WebAssembly ile Node içinde çalışan gerçek PostgreSQL) üzerinde
 * repodaki migration ve seed dosyalarını uygulayıp RLS davranışını test etmeye yarar.
 * Docker veya Supabase bağlantısı gerektirmez. Supabase'in sağladığı roller ve
 * auth.uid() fonksiyonu supabase-shim.sql ile taklit edilir.
 */
import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));

export const HOTELS = {
  sahil: 'b0000000-0000-4000-8000-000000000001',
  sehir: 'b0000000-0000-4000-8000-000000000002',
} as const;

export const USERS = {
  sahil: '11111111-1111-4111-8111-111111111111',
  sehir: '22222222-2222-4222-8222-222222222222',
  merkez: '33333333-3333-4333-8333-333333333333',
  izleyici: '44444444-4444-4444-8444-444444444444',
  uyeliksiz: '55555555-5555-4555-8555-555555555555',
} as const;

function read(relative: string) {
  return readFileSync(join(ROOT, relative), 'utf8');
}

export async function createTestDb() {
  const db = await PGlite.create({ extensions: { btree_gist } });
  await db.exec(read('tests/db/supabase-shim.sql'));

  const migrations = readdirSync(join(ROOT, 'supabase/migrations'))
    .filter((f) => f.endsWith('.sql'))
    .sort();
  for (const file of migrations) {
    await db.exec(read(`supabase/migrations/${file}`));
  }
  await db.exec(read('supabase/seed.sql'));

  // Demo betiğinin kurduğu üyeliklerin aynısı (+ testler için izleyici ve üyeliksiz hesap).
  await db.exec(`
    insert into auth.users (id, email) values
      ('${USERS.sahil}', 'sahil@test.local'),
      ('${USERS.sehir}', 'sehir@test.local'),
      ('${USERS.merkez}', 'merkez@test.local'),
      ('${USERS.izleyici}', 'izleyici@test.local'),
      ('${USERS.uyeliksiz}', 'uyeliksiz@test.local');
    insert into public.hotel_members (hotel_id, user_id, role) values
      ('${HOTELS.sahil}', '${USERS.sahil}', 'resepsiyon'),
      ('${HOTELS.sehir}', '${USERS.sehir}', 'resepsiyon'),
      ('${HOTELS.sahil}', '${USERS.merkez}', 'merkez_ofis'),
      ('${HOTELS.sehir}', '${USERS.merkez}', 'merkez_ofis'),
      ('${HOTELS.sahil}', '${USERS.izleyici}', 'izleyici');
  `);
  return db;
}

type Db = Awaited<ReturnType<typeof createTestDb>>;

/** Sorguyu Supabase'in Data API'si gibi: anon veya oturum açmış kullanıcı rolüyle çalıştırır. */
export async function as<T>(db: Db, userId: string | null, fn: () => Promise<T>): Promise<T> {
  const claims = userId ? JSON.stringify({ sub: userId, role: 'authenticated' }) : '';
  await db.query(`select set_config('request.jwt.claims', $1, false)`, [claims]);
  await db.exec(`set role ${userId ? 'authenticated' : 'anon'}`);
  try {
    return await fn();
  } finally {
    await db.exec('reset role');
    await db.query(`select set_config('request.jwt.claims', '', false)`);
  }
}

/** Otelin saat dilimindeki bugünden n gün sonrası (YYYY-MM-DD). */
export async function dayOffset(db: Db, n: number) {
  const res = await db.query<{ d: string }>(
    `select to_char((now() at time zone 'Europe/Istanbul')::date + $1::int, 'YYYY-MM-DD') as d`,
    [n],
  );
  return res.rows[0]!.d;
}

export async function roomId(db: Db, hotel: keyof typeof HOTELS, number: string) {
  const res = await db.query<{ id: string }>(
    `select id from public.rooms where hotel_id = $1 and number = $2`,
    [HOTELS[hotel], number],
  );
  const id = res.rows[0]?.id;
  if (!id) throw new Error(`Oda bulunamadı: ${hotel} ${number}`);
  return id;
}

/** Hatanın PostgreSQL SQLSTATE kodunu döndürür (beklenen hata yoksa test başarısız olur). */
export async function pgErrorCode(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    return (error as { code?: string }).code ?? 'unknown';
  }
  throw new Error('Hata bekleniyordu, sorgu başarılı oldu.');
}
