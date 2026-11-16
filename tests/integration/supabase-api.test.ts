/**
 * Gerçek Supabase projesine karşı uçtan uca yetki testi.
 * Demo hesaplarıyla gerçekten giriş yapar ve Data API'ye doğrudan istek gönderir.
 *
 * Çalıştırma: npm run test:api   (ARMA_API_TEST=1 olmadan atlanır)
 * Gerekenler: .env.local (URL + publishable key), .env.admin (secret key + ARMA_DEMO_PASSWORD),
 *             migration + seed uygulanmış ve demo hesapları oluşturulmuş olmalı.
 * Testin oluşturduğu rezervasyonlar sonunda secret key ile silinir.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { addDays, todayIn } from '../../src/lib/dates';

for (const file of ['.env.local', '.env.admin']) {
  try {
    process.loadEnvFile(file);
  } catch {
    // isteğe bağlı
  }
}

const enabled = process.env.ARMA_API_TEST === '1';
const url = process.env.VITE_SUPABASE_URL ?? '';
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const password = process.env.ARMA_DEMO_PASSWORD ?? '';
const domain = process.env.ARMA_DEMO_EMAIL_DOMAIN || 'arma-demo.test';
const TEST_GUEST = 'Otomatik Test Misafiri';

const HOTEL = {
  sahil: 'b0000000-0000-4000-8000-000000000001',
  sehir: 'b0000000-0000-4000-8000-000000000002',
};

function newClient(key = publishableKey) {
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function signedIn(who: 'sahil' | 'sehir' | 'merkez') {
  const client = newClient();
  const { data, error } = await client.auth.signInWithPassword({ email: `${who}@${domain}`, password });
  if (error) throw error;
  return { client, token: data.session!.access_token };
}

/** supabase-js kullanmadan, ham HTTP isteğiyle Data API çağrısı. */
async function rawRest(path: string, token: string, init: RequestInit = {}) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : null };
}

async function roomId(client: SupabaseClient, hotelId: string, number: string) {
  const { data, error } = await client.from('rooms').select('id').eq('hotel_id', hotelId).eq('number', number).single();
  if (error) throw error;
  return data.id as string;
}

describe.skipIf(!enabled)('Supabase Data API — gerçek oturumlarla yetki', () => {
  let sahil: Awaited<ReturnType<typeof signedIn>>;
  let sehir: Awaited<ReturnType<typeof signedIn>>;
  let merkez: Awaited<ReturnType<typeof signedIn>>;
  const today = todayIn('Europe/Istanbul');
  const far = (n: number) => addDays(today, 300 + n);

  beforeAll(async () => {
    expect(url && publishableKey && secretKey && password, 'Ortam değişkenleri eksik').toBeTruthy();
    [sahil, sehir, merkez] = await Promise.all([signedIn('sahil'), signedIn('sehir'), signedIn('merkez')]);
  });

  afterAll(async () => {
    if (!enabled || !secretKey) return;
    const admin = newClient(secretKey);
    await admin.from('reservations').delete().eq('guest_name', TEST_GUEST);
  });

  it('hatalı şifreyle giriş reddedilir', async () => {
    const { error } = await newClient().auth.signInWithPassword({
      email: `sahil@${domain}`,
      password: 'yanlis-sifre-123',
    });
    expect(error?.message).toMatch(/Invalid login credentials/i);
  });

  it('giriş yapmamış istek otel verisi okuyamaz', async () => {
    const { data, error } = await newClient().from('reservations').select('id');
    expect(data ?? []).toHaveLength(0);
    expect(error?.code).toBe('42501');
  });

  it('Sahil çalışanı yalnızca Sahil verisini görür; Şehir verisini ham API isteğiyle de alamaz', async () => {
    const hotels = await sahil.client.from('hotels').select('code');
    expect(hotels.data?.map((h) => h.code)).toEqual(['sahil']);

    const all = await sahil.client.from('reservations').select('hotel_id');
    expect(all.data!.length).toBeGreaterThan(0);
    expect(new Set(all.data!.map((r) => r.hotel_id))).toEqual(new Set([HOTEL.sahil]));

    const raw = await rawRest(`reservations?hotel_id=eq.${HOTEL.sehir}&select=id,guest_name`, sahil.token);
    expect(raw.status).toBe(200);
    expect(raw.body).toEqual([]);

    const rawRooms = await rawRest(`rooms?hotel_id=eq.${HOTEL.sehir}&select=id`, sahil.token);
    expect(rawRooms.body).toEqual([]);
  });

  it('Şehir çalışanı yalnızca Şehir verisini görür', async () => {
    const hotels = await sehir.client.from('hotels').select('code');
    expect(hotels.data?.map((h) => h.code)).toEqual(['sehir']);
    const foreign = await sehir.client.from('reservations').select('id').eq('hotel_id', HOTEL.sahil);
    expect(foreign.data).toEqual([]);
  });

  it('Sahil çalışanı Şehir oteline rezervasyon yazamaz, Şehir rezervasyonunu iptal edemez', async () => {
    const sehirRoom = await roomId(merkez.client, HOTEL.sehir, '402');
    const insert = await rawRest('reservations', sahil.token, {
      method: 'POST',
      body: JSON.stringify({
        hotel_id: HOTEL.sehir,
        room_id: sehirRoom,
        guest_name: TEST_GUEST,
        adults: 1,
        check_in: far(0),
        check_out: far(1),
      }),
    });
    expect(insert.status).toBeGreaterThanOrEqual(400);

    const target = await merkez.client
      .from('reservations')
      .select('id, status')
      .eq('hotel_id', HOTEL.sehir)
      .eq('status', 'onayli')
      .limit(1)
      .single();
    const update = await rawRest(`reservations?id=eq.${target.data!.id}`, sahil.token, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'iptal' }),
    });
    expect(update.body).toEqual([]);

    const after = await merkez.client.from('reservations').select('status').eq('id', target.data!.id).single();
    expect(after.data!.status).toBe('onayli');
  });

  it('merkez ofis iki oteli ve toplu özeti görür', async () => {
    const hotels = await merkez.client.from('hotels').select('code').order('code');
    expect(hotels.data?.map((h) => h.code)).toEqual(['sahil', 'sehir']);
    const summary = await merkez.client.rpc('hotel_day_summary');
    expect(summary.error).toBeNull();
    expect((summary.data as { hotel_code: string }[]).map((s) => s.hotel_code).sort()).toEqual(['sahil', 'sehir']);
  });

  it('aynı oda çakışan tarihlerde ikinci kez verilemez; iptal odayı serbest bırakır', async () => {
    const room = await roomId(merkez.client, HOTEL.sahil, '104');
    const base = { hotel_id: HOTEL.sahil, room_id: room, guest_name: TEST_GUEST, adults: 1, note: null };

    const first = await sahil.client
      .from('reservations')
      .insert({ ...base, check_in: far(10), check_out: far(13) })
      .select('id')
      .single();
    expect(first.error).toBeNull();

    const clash = await merkez.client.from('reservations').insert({ ...base, check_in: far(12), check_out: far(14) });
    expect(clash.error?.code).toBe('23P01');

    const cancel = await sahil.client.from('reservations').update({ status: 'iptal' }).eq('id', first.data!.id).select('id');
    expect(cancel.data).toHaveLength(1);

    const retry = await merkez.client.from('reservations').insert({ ...base, check_in: far(12), check_out: far(14) });
    expect(retry.error).toBeNull();
  });
});
