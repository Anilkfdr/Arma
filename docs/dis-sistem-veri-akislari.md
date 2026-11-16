# Otel yazılımının dış sistemlerle veri akışları

Araştırma notu, 16 Kasım 2026. Bu, kamuya açık kaynaklardan çıkarılmış genel entegrasyon haritasıdır. Hedef otellerin hangi servisleri kullandığı henüz bilinmiyor.

## Temel ayrım

Arma'nın hedefi RMOS muadili bir PMS/otel işletim platformudur. Dış satış kanalları, ödeme kuruluşları ve kamu sistemleri başka kurumlardır. Bunların veri alışverişi için ayrı bağlantıları veya aracı ürünleri gerekebilir. Tek bir evrensel "acente API'si" yoktur. Bazı sağlayıcılar birden fazla görevi tek üründe birleştirebilir.

| Bağlantı türü | Arma'dan dışarı | Dışarıdan Arma'ya | Örnek / kaynak |
| --- | --- | --- | --- |
| Online kanal yöneticisi | Oda müsaitliği, fiyat, satış kısıtları | Yeni/değişen/iptal rezervasyon | [SiteMinder pmsXchange](https://www.siteminder.com/developer-guide/), [HotelRunner](https://hotelrunner.com/en/lp/bc-channel-manager/) |
| Tur operatörü / acente rezervasyon merkezi | Onay veya ret, notlar, gerektiğinde müsaitlik/fiyat | Voucher, rezervasyon, değişiklik, iptal | [Resbox akışı](https://resbox.com/moduller.html), [Resbox'un RMOS entegrasyonu beyanı](https://resbox.com/entegrasyonlar.html) |
| Otelin kendi web sitesi rezervasyon motoru | Oda/fiyat bilgisi, rezervasyon onayı | Misafirin doğrudan rezervasyonu | [SiteMinder booking engine](https://www.siteminder.com/integrations/hotel-booking-engines/) |
| Ödeme sağlayıcısı | Tahsilat, ön provizyon veya iade isteği | İşlem sonucu ve bildirim | [iyzico 3DS](https://docs.iyzico.com/en/payment-methods/api/3ds/3ds-implementation), [webhook](https://docs.iyzico.com/en/advanced/webhook) |
| e-Belge / özel entegratör | Fatura verisi | Fatura durumu ve yanıtlar | [GİB özel entegrasyon kılavuzu](https://ebelge.gib.gov.tr/dosyalar/kilavuzlar/e-Fatura_Uygulamasi_Ozel_Entegrasyon_Kilavuzu_v1.12.pdf) |
| Konaklayan kimlik bildirimi | Giriş/çıkış ve konaklayan bilgisi | Gönderim sonucu / hata | [EGM KBS açıklaması](https://www.egm.gov.tr/kurumlar/egm.gov.tr/IcSite/strateji/Planlama/EGM-2023-Yili-Idare-Faaliyet-Raporu.pdf), [Jandarma KBS web servis rehberi](https://www.jandarma.gov.tr/kurumlar/jandarma.gov.tr/Jandarma/Uygulamalar/KBS/KBS_Tesis_2_Uygulama_TD.pdf), [KBS Tesis 2 yenilikler](https://www.jandarma.gov.tr/kurumlar/jandarma.gov.tr/Jandarma/Uygulamalar/KBS/KBS_Tesis_2_Yenilikler.pdf) |
| Merkezi Turizm Veri Tabanı (Kültür ve Turizm Bakanlığı) | Bakanlığın belirlediği günlük tesis verileri | Gönderim sonucu / hata | [Genelge haberi](https://www.alomaliye.com/2026/05/21/merkezi-turizm-veri-tabaninin-kullanilmasi-hakkinda-genelge/), [TÜROB duyurusu](https://www.turob.com/tr/haberler/2026/show/2425/merkezi-turizm-veri-tabani-gecis-tarihi-15-haziran-2026-olarak-duzenlendi) |

Zorunlu kamu bağlantıları (KBS, Merkezi Turizm Veri Tabanı, e-Belge) ile vergi ve KVKK kuralları ayrıntılı olarak [yasal-yukumlulukler.md](yasal-yukumlulukler.md) belgesinde.

RMOS'un kendi sitesi online satış kanalları, kanal yöneticisi, acente sistemleri, polis bildirimi ve e-Fatura bağlantılarından söz eder; bu, her otelin hepsini kullandığını göstermez: <https://rmosweb.com/products/rmos-web-pms>.

## Resbox ile kanal yöneticisi aynı şey mi?

Kontrat, kontenjan, stop sale ve günlük fiyat kavramları ile Arma'daki tasarım: [acente-ve-kanal-akisi.md](acente-ve-kanal-akisi.md).

Tam olarak değil. Resbox kendi tanımında özellikle tur operatörü ve acentelerden gelen yeni/değişen/iptal rezervasyonlarını denetleyip PMS'ye aktarma ve onay/ret iletişimine odaklanır. Kanal yöneticileri tipik olarak online satış siteleri arasında fiyat, müsaitlik ve kısıtları senkronize eder ve rezervasyonları PMS'ye getirir. Sağlayıcıların kapsadığı kanallar örtüşebilir; bir otelin birine, ikisine veya farklı bir birleşik çözüme ihtiyaç duyması gerçek satış kanallarına bağlıdır.

## Henüz bilinmeyenler

- Hedef otellerde hangi acenteler, online kanallar, kanal yöneticileri ve rezervasyon aracıları kullanılıyor?
- Hangi veri RMOS'a otomatik geliyor, hangisi elle giriliyor? RMOS fiyat/müsaitlik bilgisini hangi dış sisteme gönderiyor?
- e-Belge için hangi entegratör, ödeme için hangi banka/kuruluş kullanılıyor?
- Oteller Emniyet mi Jandarma KBS bölgesinde; mevcut bildirim yöntemi nedir?
- Entegrasyon sağlayıcıları Arma ile bağlantı için hangi iş ortaklığı, test ortamı ve teknik koşulları istiyor?

Bu sorular prototipi başlatmanın ön koşulu değildir. Sonraki doğrulama için kaydedilmiştir.
