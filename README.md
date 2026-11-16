# Arma

Arma, otellerin günlük operasyonunu tek sistemde yönetmek için geliştirilen bir otel yönetim yazılımıdır. Bu depo, **ilk çalışan web prototipini** içerir.

## Bu prototip nedir, ne değildir

Uzun vadeli hedef, RMOS gibi kapsamlı otel yazılımlarının **işlevsel muadili** olmaktır: ön büro, kat hizmetleri, folyo ve kasa, gece kapanışı, acente ve kontrat, muhasebe, stok, satın alma ve diğer departmanlar. Kapsam haritası: [docs/kapsam-haritasi.md](docs/kapsam-haritasi.md). Sonraki modüller için ekran envanteri: [docs/rmos-ekran-envanteri.md](docs/rmos-ekran-envanteri.md).

Bu prototip o hedefin **ilk dilimidir**, RMOS'un yerini tutmaz:

- Çalışan: herkese açık tanıtım sayfası, gerçek çalışan girişi, çok otelli yetki modeli, otel paneli, oda durumu, rezervasyon listesi, rezervasyon oluşturma ve iptal.
- Henüz yok: giriş/çıkış (check-in/out) işlemleri, misafir kartı, fiyat ve kontrat, folyo, ödeme, fatura, gece kapanışı, raporlar, dış entegrasyonlar.
- RMOS'un ekranları veya iş kuralları birebir kopyalanmadı. Bilinmeyen kurallar varsayım olarak işaretlendi: [docs/prototip-varsayimlari.md](docs/prototip-varsayimlari.md).
- Tüm otel, oda ve misafir verileri **kurgusaldır** (Arma Sahil Oteli, Arma Şehir Oteli).

## Teknoloji

| Katman | Seçim | Neden |
| --- | --- | --- |
| Arayüz | React 19 + TypeScript + Vite | Yaygın, hızlı geliştirme; aynı kod ileride Electron içinde çalışabilir |
| Yönlendirme | React Router | Web'de temiz adresler, Electron için `hash` kipi |
| Veritabanı ve giriş | Supabase (PostgreSQL + Auth) | Merkezi veri, gerçek kimlik doğrulama, satır düzeyi güvenlik (RLS) |
| Testler | Vitest + PGlite | Veritabanı kuralları Docker gerektirmeden gerçek PostgreSQL üzerinde test edilir |

Ek durum yönetimi, CSS çerçevesi veya bileşen kütüphanesi kullanılmadı.

## Klasör yapısı

```
src/
  pages/            Landing, giriş ve uygulama ekranları
  pages/app/hotel/  Otel paneli, odalar, rezervasyonlar, yeni rezervasyon
  auth/             Oturum ve otel yetkisi sağlayıcıları
  lib/              Supabase istemcisi, veri erişimi, tarih ve oda durumu mantığı
  styles/           Tasarım belirteçleri ve sayfa stilleri
supabase/
  migrations/       Sürümlenen şema (tablolar, RLS, fonksiyonlar)
  seed.sql          Kurgusal örnek veri (tekrar çalıştırılabilir)
  config.toml       Supabase CLI ayarları (herkese açık kayıt kapalı)
scripts/
  demo-kullanicilari.mjs   Demo hesaplarını ve otel üyeliklerini oluşturur
tests/
  db/               PGlite üzerinde RLS ve rezervasyon kuralı testleri
  integration/      Gerçek Supabase projesine karşı uçtan uca yetki testi
```

## Yerelde çalıştırma

Gerekenler: Node.js 20.12 veya üzeri, bir Supabase projesi.

```bash
npm install
cp .env.example .env.local     # VITE_SUPABASE_URL ve VITE_SUPABASE_PUBLISHABLE_KEY doldurulur
npm run dev                    # http://localhost:5173
```

Supabase ayarları eksikse landing page yine açılır; giriş sayfası "Kurulum tamamlanmamış" uyarısı gösterir.

## Supabase kurulumu (sıfırdan)

Şemanın tamamı repodaki dosyalardan yeniden üretilebilir; panelde elle yapılması gereken tek ayar herkese açık kaydı kapatmaktır.

1. **Proje oluşturun** ve `Project Settings → API Keys` bölümünden publishable key'i `.env.local` dosyasına yazın.
2. **Migration ve örnek veriyi uygulayın** (Supabase CLI ile):

   ```bash
   supabase login
   supabase link --project-ref <proje-ref>
   supabase db push --include-seed
   ```

   CLI yerine Supabase panelindeki SQL Editor'da önce `supabase/migrations/` altındaki dosyalar (sırayla), sonra `supabase/seed.sql` çalıştırılabilir.

3. **Herkese açık kaydı kapatın:** `Authentication → Sign In / Providers → Allow new users to sign up` kapalı olmalı. Bu ayar `supabase/config.toml` içinde de kapalı; `supabase config push` ile buluta gönderilebilir. Kayıt açık kalsa bile, üyeliği olmayan bir hesap RLS nedeniyle hiçbir otel verisi göremez.

4. **Demo hesaplarını oluşturun:**

   ```bash
   cp .env.admin.example .env.admin   # SUPABASE_SECRET_KEY ve isteğe bağlı ARMA_DEMO_PASSWORD
   npm run demo:kullanicilar
   ```

   `ARMA_DEMO_PASSWORD` boş bırakılırsa her hesaba rastgele şifre üretilir ve yalnızca bir kez ekrana yazılır. Betik tekrar çalıştırılabilir. Secret key tüm RLS kurallarını atlar; yalnızca `.env.admin` içinde tutun, tarayıcı koduna veya repoya koymayın.

### Demo hesapları

| E-posta | Yetki | Görür |
| --- | --- | --- |
| `sahil@arma-demo.test` | Arma Sahil Oteli · ön büro | Yalnızca Sahil Oteli |
| `sehir@arma-demo.test` | Arma Şehir Oteli · ön büro | Yalnızca Şehir Oteli |
| `merkez@arma-demo.test` | İki otel · merkez ofis | İki oteli ayrı ayrı ve toplu özet |

Şifre: `.env.admin` dosyasındaki `ARMA_DEMO_PASSWORD`. E-posta alan adı `ARMA_DEMO_EMAIL_DOMAIN` ile değiştirilebilir.

Yeni bir gerçek kullanıcıya yetki vermek için kullanıcı Supabase Auth'ta oluşturulur ve `hotel_members` tablosuna `(hotel_id, user_id, role)` satırı eklenir.

## Yetki modeli

- `hotel_members` tablosu kullanıcıyı otele bağlar. Roller: `resepsiyon` (ön büro), `yonetici`, `merkez_ofis`, `izleyici` (yalnızca okur).
- Her tabloda RLS açıktır. Bir kullanıcı yalnızca üyesi olduğu otellerin oteller, odalar ve rezervasyonlar kayıtlarını okur. Adres çubuğunu değiştirmek veya API'ye doğrudan istek göndermek başka otelin verisini döndürmez.
- Rezervasyon oluşturma ve iptal `resepsiyon`, `yonetici` ve `merkez_ofis` rollerine açıktır. Kullanıcı yalnızca izin verilen alanları yazabilir: durum her zaman "Onaylı" başlar ve rezervasyonu oluşturan kişi otomatik kaydedilir.
- Rezervasyonlar silinmez, iptal edilir. Durum geçişleri veritabanı tetikleyicisinde denetlenir.
- **Çifte satış engeli:** aynı odanın kesişen gecelerde iki aktif rezervasyona verilmesi bir PostgreSQL `EXCLUDE` kısıtıyla engellenir. Bu kontrol atomiktir; iki çalışan aynı anda kaydetse bile yalnızca biri başarılı olur. Çıkış günü yeni girişe açıktır.
- `anon` (giriş yapmamış) rolünün hiçbir tabloya ve fonksiyona izni yoktur.

## Testler

```bash
npm test          # birim testleri + PGlite üzerinde veritabanı/RLS testleri (ağ gerekmez)
npm run test:api  # gerçek Supabase projesine karşı uçtan uca yetki testi
npm run typecheck
npm run build
```

- `tests/db`: migration ve seed'i gerçek PostgreSQL'e (PGlite) uygular; otel veri ayrımını, yazma yetkilerini, çakışma engelini, kapasite ve arızalı oda kurallarını test eder.
- `tests/integration`: demo hesaplarıyla gerçekten giriş yapar, ham HTTP isteğiyle başka otelin verisine erişmeyi dener, çakışan rezervasyonu dener. Buluttaki veriyi değiştirdiği için yalnızca açıkça çalıştırılır ve oluşturduğu test kayıtlarını sonunda siler. `.env.local` ve `.env.admin` gerekir.

## Masaüstü (Electron) hazırlığı

Bu sürümde Electron paketi yok. Arayüz şu kararlarla Electron'a taşınmaya uygun tutuldu:

- Sunucu tarafı render veya Node'a bağımlı kod yok; uygulama statik dosyalar ve Supabase API'si ile çalışır.
- Fontlar pakete gömülü (`@fontsource`); harici CDN'e bağımlılık yok.
- Dosyadan yükleme için `VITE_ROUTER_MODE=hash` ve `npx vite build --base ./` ile derlenebilir.

Electron'a geçiş çevrimdışı çalışmayı kendiliğinden sağlamaz; veri hâlâ merkezi veritabanındadır. Fiziksel sunucu, kendi sunucusunda barındırma ve çevrimdışı çalışma kararları ileride ayrıca değerlendirilecek.

## Bilinen sınırlar

- "Bugün", otelin saat dilimindeki takvim günüdür. Gerçek otel yazılımlarında iş günü gece kapanışıyla ilerler.
- Rezervasyon oluşturulurken oda seçilir; oda tipine rezervasyon alıp odayı sonradan atama henüz yok.
- Fiyat, acente, ödeme ve misafir kartı yok; misafir yalnızca ad soyadıyla tutulur.
- Uygulama paketi tek parça (yaklaşık 170 KB gzip); sayfa bazında bölme sonraki iyileştirmelerden.
