# Acente rezervasyonları, kontratlar ve günlük fiyatlar

Tarih: 16 Kasım 2026. Bu belge, rezervasyonların otele nasıl geldiğini, fiyatların nasıl tanımlanıp değiştirildiğini ve Arma'nın bunları nasıl ele alması gerektiğini anlatır. Henüz uygulanmış bir modül yoktur; bu bir öğrenme ve tasarım notudur.

Kaynak etiketleri:

- **Sektör bilgisi:** Yaygın işleyiş. Kaynaklı olanlar bağlantıyla verildi.
- **Ürün gözlemi:** RMOS ekran görüntülerinde görülen ([ekran envanteri](rmos-ekran-envanteri.md)).
- **Hedef otel bilgisi:** Doğrudan gözlenmemiş, ikinci elden bilgi.
- **Varsayım:** Doğrulanmadı.

## Hedef oteller hakkında bilinen

- **Hedef otel bilgisi:** Satışın ağırlıkla **tur operatörleri** üzerinden yapıldığı biliniyor (ör. ETS, Anex). Online kanalların ve doğrudan satışın payı bilinmiyor.
- **Varsayım:** Hem iç pazar hem dış pazar satışı olabilir; bu durumda TL ve döviz (EUR vb.) kontratlar birlikte bulunur.
- **Ürün gözlemi:** RMOS'un kontrat ekranındaki acente kodlarında aynı operatörün pazar ve para birimine göre ayrı tanımlandığı görülüyor (ör. bir operatörün "EUR" ve "RUS" ayrı kayıtları, "İÇ PAZAR" ayrı pazar adı).
- **Sonuç:** Arma için acente, kontrat ve kontenjan modülü, online kanal bağlantısından **daha öncelikli**.

## Rezervasyonun üç kaynağı

| Kaynak | Fiyat nasıl belirlenir | Rezervasyon otele nasıl gelir | Kim öder |
| --- | --- | --- | --- |
| Tur operatörü / toptancı acente | Sezon öncesi imzalanan **kontrat**; sonradan özel tekliflerle değişir | Voucher: e-posta/PDF, operatörün sistemi, rezervasyon aracısı (ör. [Resbox](https://resbox.com/moduller.html)) ya da XML | Çoğunlukla acente; otel acenteye fatura keser ("acente kredi") |
| Online kanallar (Booking.com, Expedia vb.) | **Günlük fiyat:** her tarih, oda tipi ve fiyat planı için ayrı fiyat | Kanal yöneticisi üzerinden XML | Kanala göre misafir veya kanal |
| Doğrudan (otel sitesi, telefon, e-posta, kapıdan gelen) | Otelin kendi fiyatı | Rezervasyon motoru veya elle giriş | Misafir |

## Tur operatörü kontratı: temel kavramlar

| Kavram | Sade anlatım | Kaynak |
| --- | --- | --- |
| Kontrat | Otel ile acente arasında, sezon için fiyat ve koşulları belirleyen anlaşma | Sektör bilgisi |
| Dönem | Fiyatların geçerli olduğu tarih aralıkları (ör. düşük, orta, yüksek sezon) | Sektör bilgisi |
| Pansiyon tipi | Fiyata dahil yeme-içme: oda-kahvaltı, yarım pansiyon, tam pansiyon, her şey dahil, ultra her şey dahil | Sektör bilgisi; RMOS rezervasyon ekranında "Pansiyon" alanı |
| Fiyat tablosu | Dönem × oda tipi × pansiyon × kişi sayısı için fiyat (kişi başı veya oda başı) | Ürün gözlemi: rezervasyon ekranında "Tablo Kodu", acente menüsünde "Tablo / Fiyat İşlemleri" |
| Çocuk ve ek kişi kuralları | Yaş bantlarına göre ücretsiz veya indirimli çocuk, 3. yetişkin indirimi, ek yatak | Ürün gözlemi: 0-2, 3-6, 7-10, 11-14 yaş alanları |
| Kontenjan (allotment) | Acenteye her gün için ayrılmış oda sayısı; acente bu odaları otele sormadan satabilir | [Allotment tanımı](https://en.wikipedia.org/wiki/Allotment_(travel_industry)), [Xotels sözlüğü](https://xotels.com/en/glossary/allotment) |
| Release (cut-off) | Girişten belirli gün önce satılmamış kontenjanın otele geri dönmesi | [Release açıklaması](https://guides.netstorming.net/en/hotel-direct-contract/release) |
| Stop sale | Otelin acenteye belirli tarihler için "yeni satış yapma" bildirimi | [Tourpaq kılavuzu](https://manual.tourpaq.com/stop-sales) |
| Garantili kontenjan | Bir sistem kılavuzuna göre stop sale sırasında yalnızca garantili ya da güvenceli odalar satılabiliyor | [Tourpaq kılavuzu](https://manual.tourpaq.com/stop-sales/agreed-allotment-stop-sale); RMOS'taki "Forecast (Garantili Satış)" ile ilişkisi **varsayım** |
| Free sale / on request | Kontenjan dışında satış: serbest satış ya da otelin onayına bağlı satış | Sektör bilgisi, varsayım |
| Özel teklif (SPO), erken rezervasyon indirimi | Kontrata sonradan eklenen indirim ve kampanyalar | Sektör bilgisi |
| En az konaklama, iptal koşulları | Kontratta tanımlanan satış kısıtları ve iptal cezaları | Sektör bilgisi |
| Voucher | Acentenin otele gönderdiği rezervasyon belgesi; numarası rezervasyonda tutulur | Ürün gözlemi: rezervasyon ekranında "Voucher" alanı |
| Fiyat kontrolü | PMS'in kontrattan hesapladığı tutar ile acentenin bildirdiği tutarın karşılaştırılması | Sektör bilgisi; ürün gözlemi: "Fiyat O/M: Otomatik" |
| Acente kredi | Konaklama bedelinin misafirden değil acenteden tahsil edilmesi | Ürün gözlemi: check-out listesinde "ACENTA KREDİ", fatura menüsünde "Acenta Kredi Fatura" |

## Tur operatörü rezervasyonunun yaşam döngüsü (sektör bilgisi, hedef otelde doğrulanmadı)

1. Sezon öncesi kontrat imzalanır. Fiyat tablosu, çocuk kuralları, kontenjan ve release otele ve operatörün sistemine işlenir.
2. Operatör kendi müşterisine satış yapar; kontenjan içindeyse otele sormaz.
3. Rezervasyon otele voucher olarak gelir.
4. Otel kaydı PMS'e alır ve eşler: acente kodu, oda tipi, pansiyon, kişi ve çocuk yaşları. Fiyat kontrattan hesaplanır.
5. Otel onaylar veya reddeder; kontenjan dışı ya da on request durumlarda karar otelindir.
6. Değişiklik ve iptal mesajları aynı yoldan gelir; aynı rezervasyon birden çok kez güncellenebilir.
7. Otel dolduğunda veya stratejik nedenle stop sale gönderir; operatörler satışı durdurur.
8. Misafir konaklar; bedel acente kredisiyse folyo acente hesabında toplanır, misafir yalnızca ekstralarını öder.
9. Çıkıştan sonra acenteye fatura kesilir; hesaplanan ve bildirilen tutar farklıysa uyuşmazlık incelenir.

### Operatörlerin kullandığı sistemler (kamuya açık bilgi sınırlı)

- **Anex:** Bir yazılım firmasının [sunumuna](https://santsg.com/wp-content/uploads/2023/10/SanTSG-Presentation.pdf) göre 2011'den beri SanTSG'nin TourVisio ürününü kullanıyor. Aynı sunuma göre bu sistemler oda fiyatlarını, özel teklifleri, stop sale ve kontrat öğelerini XML ile dışarı aktarabiliyor. Bu bir satıcı iddiası; otel tarafındaki PMS bağlantısının nasıl yapıldığı belgelenmemiş.
- **ETS:** Otellere rezervasyonun hangi yolla aktarıldığına dair kamuya açık teknik bilgi bulunamadı.
- **Rezervasyon aracıları:** [Resbox](https://resbox.com/moduller.html) gibi ürünler tur operatörlerinden gelen yeni, değişen ve iptal rezervasyonları denetleyip PMS'e aktarmaya odaklanıyor. Resbox, RMOS ile entegrasyon [beyan ediyor](https://resbox.com/entegrasyonlar.html). Ayrıntı: [dış sistem haritası](dis-sistem-veri-akislari.md).

## Online kanallar ve günlük fiyat

- **Günlük fiyat:** Her tarih, oda tipi ve fiyat planı için ayrı fiyat. Talebe göre her gün değişebilir.
- **Kısıtlar:** Fiyatla birlikte en az gece, o gün girişe veya çıkışa kapalı olma ve satışa kapalı olma gönderilir.
- **Kanal yöneticisi:** Otel her kanala ayrı bağlanmaz.
  - PMS'ten kanal yöneticisine: müsaitlik, fiyat ve kısıt.
  - Kanal yöneticisinden PMS'e: yeni, değişen ve iptal rezervasyon.

  Örnekler: [SiteMinder pmsXchange](https://www.siteminder.com/developer-guide/), [HotelRunner](https://hotelrunner.com/en/lp/bc-channel-manager/).
- RMOS menüsünde "Kanal Yönetimi" ayrı bir grup (ürün gözlemi). Bağlantıların bir kısmını RMOS'un kendisi yapıyor olabilir (varsayım).

## Fiyat girişleri ve değişiklikleri

Fiyatlar iki farklı biçimde yönetilir:

| | Kontrat fiyatı (tur operatörü) | Günlük fiyat (online, doğrudan) |
| --- | --- | --- |
| Tanım | Dönem bazında, sezon öncesi | Her gün için ayrı |
| Değişiklik | Kontrat eki, özel teklif, erken rezervasyon dönemleri | Her gün, çoğunlukla toplu ("Haziran hafta sonları +%10") |
| Karşı tarafa iletim | Operatörün sistemi, e-posta, aracı | Kanal yöneticisi |

### Fiyat toplantısı ve forecast

- **Hedef otel bilgisi (geçmişe dönük doğrudan gözlem):** Fiyatlar düzenli toplantılarda Forecast ekranı açılarak belirleniyor. Ayın her günü için doluluk çubuk grafikle görülüyor, fiyat gün gün dolulukla yeniden ayarlanıyor. Satılan odanın kapasiteyi aştığı ("short'a giren") günler görsel olarak öne çıkıyor.
- **Ürün gözlemi:** RMOS'un Grafik Forecast ve Tarih Forecast ekranları ([ekran envanteri, bölüm 7](rmos-ekran-envanteri.md#7-forecast-grafik-forecast-ve-tarih-forecast)) bu kullanımla örtüşüyor: günlük dolu/boş oda çubukları, doluluk yüzdesi, geçen yıl karşılaştırması, kalan oda ve kontenjan sütunları.
- **Sektör bilgisi:** Talebe göre fiyatı gün gün değiştirmek gelir yönetiminin (revenue management) temelidir. Tur operatörü ağırlıklı otellerde bu kararlar çoğunlukla günlük fiyat değişikliği yerine şu biçimlerde operatörlere yansır: özel teklif, stop sale, kontenjan değişikliği. Online ve doğrudan satışta ise doğrudan günlük fiyata yansır (varsayım; hedef otelde doğrulanmalı).

Arma'daki forecast ekranı için öneriler (karar değil; gerçek iş akışı öğrenildikçe değerlendirilecek):

- Ay görünümünde gün gün çubuk: satılan, kontenjanda ayrılmış ama satılmamış, boş ve arızalı oda. Doluluk yüzdesi her günün üstünde.
- Kapasitenin aşıldığı ("short") günler kırmızı ve ayrı bir uyarı listesinde.
- Geçen yıl aynı gün ve geçen haftaya göre değişim (pickup).
- Bir güne tıklayınca o günün fiyat, stop sale ve kontenjan durumu görülebilir. Değişikliğin aynı ekrandan mı, ayrı bir ekrandan mı yapılacağı, aşağıdaki mekanizma ve hedef oteldeki iş bölümü öğrenilince kararlaştırılacak.
- Merkez ofis için otelleri ayrı ayrı ve birleşik gösteren görünüm. RMOS'ta "Özel Konsolide Şirketi" seçimi bunun karşılığı olabilir.

### Fiyat kararından uygulamaya: mekanizma

**Hedef otel bilgisi:** Fiyat kararı toplantıda sözel olarak veriliyor. Kararı sisteme ve acentelere işleyen ekran ya da kişi henüz bilinmiyor.

Sektör kaynaklarına göre karar, satış kanalına göre **iki ayrı yoldan** uygulanır.

#### A. Kontratlı satış (tur operatörleri): karar bir "değişiklik bildirimi" olur

Tur operatörünün fiyatı otelin değil, **operatörün kendi rezervasyon sisteminde** tanımlı. Otel fiyatı tek başına değiştiremez; değişikliği operatöre bildirir, operatör kendi sistemine yükler. Karar şu araçlardan birine dönüşür:

| Araç | Ne işe yarar | Tipik içerik |
| --- | --- | --- |
| **Stop sale / free sale (yeniden açma)** | Belirli tarihlerde satışı durdurmak veya yeniden açmak | Tarih aralığı, oda tipi, acente veya pazar |
| **Özel teklif (SPO)** | Kontrat fiyatına indirim veya kampanya eklemek | İndirim yüzdesi ya da yeni fiyat, erken rezervasyon, "7 kal 6 öde", ücretsiz çocuk; rezervasyon tarihi ve konaklama tarihi aralıkları; geçerli acenteler ve pazarlar |
| **Kontrat değişikliği** | Dönem fiyatlarını yeniden tanımlamak | Yeni fiyat tablosu ya da ek protokol |
| **Kontenjan değişikliği** | Acenteye ayrılan oda sayısını veya release süresini değiştirmek | Tarih, oda tipi, adet, release günü |

Akış:

1. Toplantıda karar verilir (ör. "Temmuz ikinci hafta stop sale, Ağustos sonu Alman pazarına %10 SPO").
2. Satış/kontrat sorumlusu kararı yukarıdaki araçlardan birine çevirir ve operatörlere gönderir:
   - **e-posta** (PDF veya Excel teklif ve stop sale formları);
   - **operatörün kendi sistemi**;
   - **otel-acente iletişim platformu**. Örneğin SanTSG'nin platformu stop sale ve free sale bildirimlerini acente, pazar ve oda tipine göre süzerek gönderiyor ve teslim raporu veriyor ([SanTSG](https://www.santsg.com/?p=14172)).

   Hangisinin kullanıldığı hedef otelde bilinmiyor.
3. Operatörün kontrat ekibi değişikliği kendi sistemine yükler. Türk incoming acentelerinin kullandığı Sejour gibi sistemlerde sezon kontratı, kontenjan, kontrat teklifleri, sezonluk özel teklifler, stop sale ve en az konaklama ayrı ayrı tanımlanıyor; çevrimiçi kontrat modülü ve XML ile fiyat, teklif ve stop sale aktarımı var ([Sejour](https://www.santsg.com/?p=14150), [SanTSG 2025 sunumu](https://www.santsg.com/wp-content/uploads/2026/05/2025-SAN-TSG-Presentation-February-2025.pdf)). Bu sistemde bildirimin acenteye ne zaman ulaştığını gösteren bir "bildirim tarihi" izleme ekranı da var ([sürüm notları](https://erp.santsg.com/whatisnew/sejour/en)).
4. Otel aynı değişikliği **kendi PMS'ine de** işler: kontrat fiyat tablosu, SPO tanımı, stop sale. Böylece gelen rezervasyonun tutarı doğru hesaplanır ve fiyat kontrolü yapılabilir. RMOS'ta acente satır menüsündeki "Tablo / Fiyat İşlemleri", "Kontenjan Girişi" ve "Stop Sale" muhtemelen bu iş için kullanılıyor (ürün gözlemi + varsayım).

Bilinmesi gereken incelikler:

- **Stop sale anında geçerli olmayabilir.** Yayımlanmış bir kontrat örneğinde stop sale için acentenin onayı isteniyor ve otel, stop sale gönderildikten sonraki 48 iş saati içinde gelen rezervasyonları kabul etmek zorunda; aksi halde tazminat doğuyor ([kontrat örneği](http://www.logictours.com/conditions/view/377)). Koşullar her kontratta farklı olabilir.
- **Garantili kontenjan** stop sale sırasında da satılabiliyor ([Tourpaq](https://manual.tourpaq.com/stop-sales/agreed-allotment-stop-sale)).
- **Teklifler üst üste binebilir:** Bir sistemde önce kontratın erken rezervasyon kuralı uygulanıyor, özel teklif bunun üstüne ekleniyor ([Tourpaq özel teklif kuralları](https://manual.tourpaq.com/hotel/hotel-creation/room-cost/special-offer-cost-rules)). Hangi indirimin hangisinin üstüne uygulandığı kontrata ve sisteme göre değişir.
- **Teklif kapsamı:** Bir teklif belirli operatörlerle sınırlandırılmazsa tüm operatörlere uygulanabiliyor ([Tourpaq özel teklif](https://manual.tourpaq.com/hotel/page-7/special-offer)).

#### B. Online ve doğrudan satış: karar günlük fiyat ızgarasına girilir, otomatik dağıtılır

1. Fiyat, bir fiyat planı ve tarih aralığı için PMS'teki ya da kanal yöneticisindeki **fiyat ızgarasında** değiştirilir ([SiteMinder ızgarası](https://help-platform.siteminder.com/en/articles/8674045-update-rates-availability-and-restrictions-in-the-inventory-grid)).
2. **Türetilmiş fiyat planları** ana fiyata bağlıdır. Ör. iade edilmez fiyat = ana fiyat −%10. Ana fiyat değişince türetilmişler kendiliğinden yeniden hesaplanıp gönderilir ([SiteMinder türetilmiş fiyat](https://help-platform.siteminder.com/en/articles/9367514-set-up-derived-rates)).
3. Değişiklik standart mesajlarla kanal yöneticisine, oradan online kanallara gider. Gönderilen birim: fiyat planı × tarih aralığı × kişi sayısı ([Smarthotel](https://specs.smarthotel.nl/pms/rates-and-availability)). Gönderim çoğu zaman eşzamansızdır; birkaç dakika sürebilir ve hata verebilir ([Cloudbeds](https://developers.cloudbeds.com/v1.2/docs/revenue-management-system-rms)).
4. Kısıtlar (satışa kapalı, girişe veya çıkışa kapalı, en az ve en çok gece) oda ve kanal bazında ayrı ayrı tanımlanabilir ([HotelRunner stop sell](https://support.hotelrunner.com/en/how-to-apply-stop-sell/)).
5. Fiyatın **tek bir yerde** değiştirilmesi gerekir: ya PMS ya kanal yöneticisi. İkisinde birden değiştirmek tutarsızlık yaratır ([Smarthotel rehberi](https://helpguide.smarthotel.nl/en/where-do-i-need-to-change-my-rates-availability-and-restrictions)).

#### Arma için çıkarımlar (tasarım taslağı, karar değil)

- **Karar kaydı:** Toplantıda alınan kararın kendisi bir kayıt olabilir: tarih aralığı, kapsam (oda tipi, acente, pazar, kanal), tür, gerekçe ve karar veren. Bugün sözel olan karar böylece izlenebilir olur. Bu bir öneri; hedef otelde ihtiyaç olup olmadığı sorulmalı.
- **Ayrı veri yapıları:**
  - stop sale ve free sale (gönderildi, onaylandı, geçerli olduğu an);
  - özel teklif (tür, iki tarih aralığı, kapsam, üst üste binme kuralı, onay);
  - kontenjan değişikliği;
  - günlük fiyat ve türetilmiş fiyat planı.
- **Giden bildirimler:** Stop sale ve teklifler için e-posta veya Excel/PDF form üretimi; kime, ne zaman gönderildi, onay geldi mi. Sonra platform veya XML bağlantısı. KBS ile aynı giden kutusu altyapısı.
- **Fiyat hesaplayıcı:** Kontrat fiyatı → erken rezervasyon → özel teklif sırası yapılandırılabilir olmalı; kurallar hedef otelin kontratlarından öğrenilecek.
- **Geçmiş:** Her değişiklik kim, ne zaman, eski değer, yeni değer ile saklanır. Fiyat uyuşmazlığı çıktığında hangi teklifin geçerli olduğunu kanıtlar.

Arma için kurallar:

- **Varsayım:** Rezervasyon alındığı andaki fiyat kilitlenir. Sonradan yapılan fiyat değişikliği mevcut rezervasyonları kendiliğinden değiştirmez; hedef otelde doğrulanmalı.
- Her fiyat değişikliği geçmişiyle tutulmalı: kim, ne zaman, hangi tarihler için, eski ve yeni değer. Fiyat uyuşmazlıklarını çözmek için gerekli.
- Fiyat, KDV ve konaklama vergisi ayrımıyla hesaplanmalı ([yasal yükümlülükler](yasal-yukumlulukler.md)).

## Arma bunları nasıl ele alacak

### Uygulama içindeki parçalar

1. **Acente kartı:** kod, ad, pazar, ülke, para birimi, ödeme şekli (acente kredisi / ön ödeme), resmi unvan ve vergi bilgileri (fatura için), aktif/pasif.
2. **Kontrat ve fiyat tablosu:** dönemler, oda tipi × pansiyon × kişi fiyatları, çocuk yaş bantları, en az konaklama, iptal koşulları, özel teklifler.
3. **Kontenjan, release, stop sale:** tarih × oda tipi × acente (veya kontrat grubu) bazında.
4. **Günlük fiyat ızgarası:** online ve doğrudan satış için; toplu değiştirme.
5. **Fiyat hesaplayıcı:** Rezervasyon girilince tutarı kontrattan veya günlük fiyattan hesaplar; elle fiyat girildiyse bunu işaretler.
6. **Müsaitlik hesabı:** toplam oda − satılan − arızalı − ayrılmış kontenjan. Acenteler kontenjandan sormadan satarken aynı odalar başka kanaldan da satılırsa **aşırı satış (overbooking)** riski doğar; hesap bunu görünür kılmalı.
7. **Gelen kutusu:** Dışarıdan gelen her mesaj ham haliyle saklanır. Ardından:
   - mesaj ayrıştırılır ve türü belirlenir (yeni, değişiklik, iptal);
   - eşleme tablolarıyla Arma kodlarına çevrilir (acentenin oda tipi kodu → Arma oda tipi, pansiyon kodları);
   - sorunlu mesaj insan onayı listesine düşer;
   - aynı mesaj iki kez gelirse kayıt iki kez açılmaz.
8. **Giden kutusu:** Kanal yöneticisine fiyat ve müsaitlik, acentelere stop sale. KBS ve e-Belge ile aynı altyapı ([yasal yükümlülükler](yasal-yukumlulukler.md)).

### Rezervasyon kaydına şimdiden eklenmesi gereken alanlar

Mevcut prototipte yok; ilgili modül gelmeden önce veri modeline eklenmeli:

- kaynak ve kanal;
- acente ve voucher numarası;
- dış sistem rezervasyon numarası;
- fiyat kaynağı (kontrat / günlük / elle) ve kullanılan fiyat tablosu;
- pansiyon tipi;
- para birimi;
- onay durumu (onaylı / bekleme listesi);
- çocuk yaşları;
- kişi bazında isimler;
- değişiklik geçmişi.

## Ek bir program gerekecek mi

| Parça | Kim sağlar |
| --- | --- |
| Kanal yöneticisi | **Dış hizmet**, otel abone olur. Kendi kanal yöneticimizi yazmak ayrı bir ürün ve her kanalla ayrı ortaklık demek; başlangıçta yapılmamalı. Arma bir kanal yöneticisiyle iki yönlü konuşur. |
| Tur operatörü bağlantısı | Rezervasyon aracısı (Resbox benzeri), operatörün kendi arayüzü veya XML. İlk aşamada voucher'dan **elle giriş** yeterli. |
| Entegrasyon katmanı (gelen/giden kutusu, eşleme, zamanlanmış işler) | **Arma'nın kendi sunucu parçası.** Otel bilgisayarına kurulan bir yan program değil; kullanıcının görmediği, sürekli çalışan bir arka plan servisi. Supabase'de zamanlanmış işler ve sunucu fonksiyonlarıyla başlanabilir. İleride kendi sunucu kararını etkiler. |

Gerçek bağlantılar için sağlayıcılarla **iş ortaklığı, test ortamı ve çoğu zaman sertifikasyon** gerekir ([sektör örneği](https://phptravels.com/tr/channel-managers-integration)). Yani iş yalnızca teknik değil; görüşme ve izin süreci de var.

## Önerilen sıra

Satışın ağırlıkla tur operatörü üzerinden olması, kontrat modülünü öne çeker. Ama ön büro omurgası her otel için şart.

0. **Şimdi:** Yukarıdaki rezervasyon alanları için veri modelinde yer açmak (modül yazmadan).
1. **Ön büro omurgası:** giriş/çıkış (kimlik ve KBS bildirimi dahil), folyo, gece kapanışı. Bu aşamada rezervasyonda **elle girilen gecelik fiyat** kullanılır; gece kapanışı oda ücretini bu fiyattan folyoya işler.
2. **Acente ve kontrat:** acente kartı, kontrat ve fiyat tablosu, kontenjan, release, stop sale, fiyat hesaplayıcı. Rezervasyon girişinde acente seçilince fiyat otomatik gelir; voucher numarası tutulur. Elle giriş bu aşamada tamamen işe yarar.
3. **Müsaitlik ve doluluk takvimi** (RMOS'taki Forecast ekranlarının karşılığı) ve günlük fiyat ızgarası.
4. **Gelen ve giden kutusu altyapısı**, önce simülasyonla.
5. **İlk gerçek bağlantı:** Hedef otellerin kullandığı aracı veya operatör yöntemi neyse o. Kullanılanı bilmeden seçim yapılmamalı.

## Sorulacak sorular

1. Hangi tur operatörleriyle çalışılıyor? Satışın yaklaşık ne kadarı tur operatörü, online kanal ve doğrudan satış?
2. Operatör rezervasyonları otele nasıl geliyor: e-posta/PDF voucher, operatörün sistemi, Resbox benzeri bir aracı, RMOS'un kendi bağlantısı?
3. Kontratlar RMOS'a kim tarafından, nasıl işleniyor? Özel teklif ve fiyat değişiklikleri nasıl geliyor (e-posta, Excel, sistem)?
4. Kontenjan ve release takibi nasıl yapılıyor? Stop sale operatörlere nasıl bildiriliyor?
5. Fiyat uyuşmazlığı ne sıklıkla çıkıyor, nasıl çözülüyor?
6. Kanal yöneticisi kullanılıyor mu, hangisi? Günlük fiyatı kim, hangi ekrandan değiştiriyor?
7. İç pazar ve dış pazar kontratları ayrı mı? Hangi para birimleri kullanılıyor, kur nasıl belirleniyor?
8. Aşırı satış (overbooking) yaşanıyor mu? Yaşanınca ne yapılıyor?
9. Fiyat toplantısındaki kararı kim uygulamaya geçiriyor (satış/kontrat sorumlusu, rezervasyon müdürü, başka biri)? Karar bir yere yazılıyor mu?
10. Stop sale ve özel teklifler operatörlere nasıl gönderiliyor (e-posta, Excel/PDF form, operatörün sistemi, bir iletişim platformu)? Operatörün aldığı nasıl teyit ediliyor?
11. Aynı değişiklik RMOS'a da giriliyor mu? Hangi ekrandan, kim giriyor?
12. Kontratlarda stop sale'in yürürlüğe girme süresi (ör. "48 iş saati") ve garantili kontenjan var mı?
13. Erken rezervasyon indirimi ile özel teklifler üst üste uygulanıyor mu? Hangi sırayla?
14. Online kanallarda fiyat nereden değiştiriliyor: RMOS mu, kanal yöneticisinin paneli mi?
