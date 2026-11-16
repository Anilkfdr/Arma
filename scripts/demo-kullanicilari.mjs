#!/usr/bin/env node
/**
 * Arma demo kullanıcılarını Supabase Auth'ta oluşturur ve kurgusal otellere üyeliklerini bağlar.
 *
 * Gerekli ortam değişkenleri (.env.admin dosyasından veya kabuktan okunur; repoya EKLENMEZ):
 *   SUPABASE_URL              Proje adresi (yoksa VITE_SUPABASE_URL kullanılır)
 *   SUPABASE_SECRET_KEY       Secret key (sb_secret_...) ya da eski SUPABASE_SERVICE_ROLE_KEY
 *   ARMA_DEMO_PASSWORD        (isteğe bağlı) Tüm demo hesapları için şifre. Verilmezse her hesaba
 *                             rastgele şifre üretilir ve yalnızca bir kez ekrana yazılır.
 *   ARMA_DEMO_EMAIL_DOMAIN    (isteğe bağlı) Varsayılan: arma-demo.test
 *
 * Önce migration ve seed uygulanmış olmalıdır (oteller seed ile gelir).
 * Tekrar çalıştırılabilir: mevcut hesabın şifresi yalnızca ARMA_DEMO_PASSWORD verildiyse güncellenir.
 */
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';

for (const file of ['.env.local', '.env.admin']) {
  try {
    process.loadEnvFile(file);
  } catch {
    // Dosya yoksa kabuktaki değişkenler kullanılır.
  }
}

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const sharedPassword = process.env.ARMA_DEMO_PASSWORD;
const domain = process.env.ARMA_DEMO_EMAIL_DOMAIN || 'arma-demo.test';

if (!url || !secretKey) {
  console.error(
    'Eksik ayar: SUPABASE_URL (veya VITE_SUPABASE_URL) ve SUPABASE_SECRET_KEY gerekli.\n' +
      '.env.admin.example dosyasını .env.admin olarak kopyalayıp doldurun.',
  );
  process.exit(1);
}
if (secretKey.startsWith('sb_publishable_')) {
  console.error('Publishable key ile kullanıcı oluşturulamaz; secret / service_role anahtarı gerekir.');
  process.exit(1);
}
if (sharedPassword && (sharedPassword.length < 10 || !/[a-zA-Z]/.test(sharedPassword) || !/\d/.test(sharedPassword))) {
  console.error('ARMA_DEMO_PASSWORD en az 10 karakter olmalı ve harf ile rakam içermeli.');
  process.exit(1);
}

const ACCOUNTS = [
  {
    email: `sahil@${domain}`,
    fullName: 'Sahil Ön Büro (demo)',
    memberships: [{ hotel: 'sahil', role: 'resepsiyon' }],
  },
  {
    email: `sehir@${domain}`,
    fullName: 'Şehir Ön Büro (demo)',
    memberships: [{ hotel: 'sehir', role: 'resepsiyon' }],
  },
  {
    email: `merkez@${domain}`,
    fullName: 'Merkez Ofis (demo)',
    memberships: [
      { hotel: 'sahil', role: 'merkez_ofis' },
      { hotel: 'sehir', role: 'merkez_ofis' },
    ],
  },
];

const supabase = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function randomPassword() {
  // Harf + rakam içeren 16 karakterlik şifre.
  return `Arma${randomBytes(9).toString('base64url')}7`;
}

async function findUserByEmail(email) {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (data.users.length < 200) return null;
  }
  return null;
}

const { data: hotels, error: hotelError } = await supabase.from('hotels').select('id, code, name');
if (hotelError) {
  console.error('Oteller okunamadı. Migration ve seed uygulandı mı?', hotelError.message);
  process.exit(1);
}
const hotelByCode = new Map(hotels.map((h) => [h.code, h]));
for (const code of ['sahil', 'sehir']) {
  if (!hotelByCode.has(code)) {
    console.error(`"${code}" kodlu kurgusal otel bulunamadı. Önce seed.sql uygulanmalı.`);
    process.exit(1);
  }
}

const summary = [];
for (const account of ACCOUNTS) {
  let user = await findUserByEmail(account.email);
  let password = null;

  if (!user) {
    password = sharedPassword || randomPassword();
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: account.fullName },
    });
    if (error) {
      console.error(`${account.email} oluşturulamadı:`, error.message);
      process.exit(1);
    }
    user = data.user;
  } else if (sharedPassword) {
    password = sharedPassword;
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      user_metadata: { full_name: account.fullName },
    });
    if (error) {
      console.error(`${account.email} güncellenemedi:`, error.message);
      process.exit(1);
    }
  }

  const rows = account.memberships.map((m) => ({
    hotel_id: hotelByCode.get(m.hotel).id,
    user_id: user.id,
    role: m.role,
  }));
  const { error: memberError } = await supabase
    .from('hotel_members')
    .upsert(rows, { onConflict: 'hotel_id,user_id' });
  if (memberError) {
    console.error(`${account.email} üyelikleri yazılamadı:`, memberError.message);
    process.exit(1);
  }

  summary.push({
    email: account.email,
    // Ortak şifre .env.admin'den geldiyse ekrana yazılmaz; yalnızca üretilen şifre bir kez gösterilir.
    sifre: !password ? '(değiştirilmedi)' : sharedPassword ? '.env.admin → ARMA_DEMO_PASSWORD' : password,
    oteller: account.memberships.map((m) => `${hotelByCode.get(m.hotel).name} · ${m.role}`).join(', '),
  });
}

console.log(
  sharedPassword
    ? '\nDemo hesapları hazır. Şifre: .env.admin dosyasındaki ARMA_DEMO_PASSWORD.\n'
    : '\nDemo hesapları hazır. Üretilen şifreler yalnızca şimdi gösteriliyor; güvenli bir yere not edin.\n',
);
console.table(summary);
