# Arma kapsam haritası

Tarih: 16 Kasım 2026. Hedef, RMOS'un kullanılan işlevlerinin zaman içinde işlevsel karşılığını geliştirmektir. Aşağıdaki liste, RMOS'un kamuya açık ürün sayfalarından çıkarılmış **başlangıç envanteridir**. Ürün ailesi, modül, ekran ve iş kuralı aynı şey değildir; kamuya açık liste eksiksiz uygulama şartnamesi sayılmamalıdır.

## Ürün aileleri

| Alan | Kamuya açık kapsam özeti | Kaynak |
| --- | --- | --- |
| Ön büro / PMS | Rezervasyon, oda planı, check-in/out, misafir, acente ve kontrat, folyo, fatura, kat hizmetleri, raporlar, entegrasyonlar | [RMOS PMS](https://rmosweb.com/products/rmos-web-pms) |
| ERP Cloud | Finans, stok, üretim, satın alma, CRM, iş takibi, İK, PDKS ve raporlama | [RMOS ERP](https://rmosweb.com/products/erp-cloud) |
| Muhasebe | Fişler, cari hesaplar, mali tablolar, ödeme/tahsilat planları, diğer modüllerin kayıtları | [RMOS Muhasebe](https://rmosweb.com/products/accounting-management) |
| Stok ve cost | Depolar, stok hareketleri, sayım, reçete ve maliyet raporları | [RMOS Stok](https://rmosweb.com/products/inventory-cost) |
| Satın alma | Talep, stok kontrolü, teklif, sipariş, mal kabul ve fatura karşılaştırması | [RMOS Satınalma](https://rmosweb.com/products/procurement-automation) |
| İş takibi | Misafir talebi, şikâyet, arıza, kat hizmetleri, bakım, anket ve alakart rezervasyon | [RMOS İş Takip](https://rmosweb.com/products/task-tracking) |
| Restoran POS | Adisyon, mobil sipariş, stok/cost, muhasebe ve oda hesabı bağlantısı | [RMOS POS](https://rmosweb.com/products/ultimate-pos) |
| Misafir deneyimi | Misafir uygulaması, talepler, sipariş, anket, sadakat ve hizmetler | [RMOS Guest](https://rmosweb.com/products/rmos-guest) |
| Kalite ve doküman | Doküman, sürüm, düzeltici faaliyet, eğitim ve kalite süreçleri | [RMOS Kalite](https://rmosweb.com/products/quality-management) |
| Devre mülk / devre tatil | Dönem bazlı satış, tesis, senet ve aidat yönetimi | [RMOS ürün kataloğu](https://rmosweb.com/products) |
| Kimlik/pasaport okuyucu | Belgeden veri alıp giriş işlemini hızlandıran donanım bağlantısı | [RMOS ürün kataloğu](https://rmosweb.com/products) |

Kamuya açık ürün görsellerinden çıkarılan ekran envanteri (Room Rack, rezervasyon girişi, acente/kontrat, check-in/out, folyo, HK Rack): [rmos-ekran-envanteri.md](rmos-ekran-envanteri.md).

RMOS ayrıca Papyro ve Dijital İtibar Yönetimi ürünlerini ayrı yeni ürünler olarak listeliyor. Bunların mevcut kurulumla ilişkisi henüz bilinmiyor: [RMOS ürün kataloğu](https://rmosweb.com/products).

## Başlangıç sırası önerisi

1. **Kapsam kaydı:** Her alan için kullanıcı rolü, amaç, giriş verisi, işlem, sonuç, istisna, rapor ve diğer modüllere etkisini yaz. Kaynağı "RMOS sayfası", "sektör kaynağı", "gözlem" veya "varsayım" olarak belirt.
2. **Ortak temel:** Otel/tesis, kullanıcı ve yetki, oda/oda tipi, misafir, acente, fiyat/kontrat, işlem geçmişi ve iş tarihi kavramlarını netleştir. Birden çok otel ve para birimini daha sonra yamamak zorunda kalmamak için veri sınırlarını baştan tasarla.
3. **İlk uçtan uca çalışan akış:** Elle rezervasyon → müsaitlik ve oda atama → giriş → oda durumunun güncellenmesi → oda ücreti ve bir ek harcamanın folyoya işlenmesi → gün sonu → ödeme ve çıkış → günlük rapor. Bu akış diğer modüllerin bağlanacağı temel davranışları görünür kılar.
4. **Kapsamı genişletme:** Acente kontratları ve grup rezervasyonları; POS ve stok/cost; satın alma ve muhasebe; CRM, iş takibi ve misafir deneyimi; kalan ürün aileleri. Alanlar arası veri ve kayıtların tutarlılığı her aşamada korunur.
5. **Gerçek dış bağlantılar:** Kanal yöneticisi, acente merkezi, ödeme, e-Belge ve kimlik bildirimi gibi bağlantıları [dış sistem haritasındaki](dis-sistem-veri-akislari.md) akışlara göre ele al. Sağlayıcı erişimi olmayan bağlantılar prototipte örnek veri ve test arayüzüyle gösterilebilir.

Bu sıra, nihai kapsamı daraltmaz; ilk doğrulanabilir iş akışını seçer.

## Şimdiden bilinen boşluklar

- Kamuya açık sayfalar bütün ekranları, alanları, yetkileri ve hata durumlarını açıklamıyor.
- Ana ürün aileleri ile gerçek kurulumda etkin olan alt modüllerin listesi eşleştirilmeli.
- Fiyat kuralları, gece işlemleri, muhasebe kayıtları ve dış sistem mesajlarının tam davranışı henüz doğrulanmadı.
- Ürün geliştikçe gerçek kullanım gözlemleriyle bu harita güncellenecek; belirsiz noktalar kesin gereksinim gibi yazılmayacak.
