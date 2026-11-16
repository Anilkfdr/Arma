# RMOS PMS ekran envanteri (kamuya açık görsellerden)

Tarih: 16 Kasım 2026. Kaynak: [RMOS Web PMS ürün sayfası](https://rmosweb.com/products/rmos-web-pms) üzerindeki büyütülebilir uygulama görselleri. Bu belge **sonraki modüller için başvuru envanteridir**; mevcut ilk prototipin kapsamını genişletmez.

Okuma kuralları:

- **Gözlem:** Görselde doğrudan görülen alan, sütun, düğme veya menü öğesi.
- **Varsayım:** Görselden çıkarılan ama doğrulanmamış davranış. Ekran görüntüsü tıklama sonuçlarını, doğrulama kurallarını ve yetkileri göstermez.
- Görsellerde kişi, acente ve firma adları ile vergi numaraları görünüyor. Bunlar bu belgeye **aktarılmadı**. Görsellerin kendisi de repoya kopyalanmadı; yalnızca bağlantı verildi.
- Görseller bir tanıtım/test ortamından alınmış olabilir. Ailenin kullandığı kurulumda ekranlar, menüler ve ayarlar farklı olabilir.

## Ortak arayüz kalıpları (altı ekranda da görülen)

| Gözlem | Not |
| --- | --- |
| Üst çubukta kullanıcı adının yanında ayrı bir **"Ön Büro Tarihi"** gösteriliyor | Takvim gününden ayrı bir iş tarihi kavramının varlığını destekler. Arma prototipi şimdilik takvim gününü kullanıyor ([varsayımlar](prototip-varsayimlari.md)) |
| Sol menünün üstünde **"Şirket"** seçici | Tek arayüzden birden çok şirket/tesis seçimi. Varsayım: Arma'daki otel seçicinin karşılığı |
| Menü içinde arama, her menü öğesinde **favori yıldızı** | Sık kullanılan ekranlara hızlı erişim |
| Menü grupları: Acenta & Satış, Kanal Yönetimi, Rezervasyon, Resepsiyon, Ön Kasa, Kat Hizmetleri, Santral İşlemleri, Gece İşlemleri, Raporlar, Tanımlamalar | Ön büro ürününün modül sınırları için başlangıç listesi |
| Tablolarda her sütunun altında **filtre satırı**, sağ kenarda "Sütunlar" ve "Filtreler" panelleri | Yoğun veri tabloları; sütun seçimi kullanıcıya bırakılmış |
| Satır sağ tık menülerinde **"Şablon Dizayn"** ve **"Excel Olarak Dışa Aktar"** | Yazdırma şablonu tasarımı ve dışa aktarma çoğu listede ortak |

## 1. Room Rack (oda panosu)

Görsel: [pms-room-rack.webp](https://rmosweb.com/screens/pms-room-rack.webp) · Sayfa bölümü: Front Office Yönetimi

**Gözlem**

- Odalar katlara göre gruplanmış ("Kat: Z", "Kat: 0", "Kat: 1"…). Her oda, numarası yazılı renkli küçük bir kutu.
- Üstte renk açıklaması ve sayılar: Hepsi, Dolu, Boş Temiz, Repeat, Boş Kapalı, Arızalı.
- Filtreler: oda arama, "Kat/Apart" seçimi, "Detaylı Filtre"; dört farklı görünüm düğmesi (ızgara boyutları ve liste).
- Aynı menüde ayrıca "Detay Room Rack", "Dolu Boş Listesi" ve "Blokaj İşlemleri" var.

**Varsayım / bilinmeyen**

- "Repeat" ve "Boş Kapalı" durumlarının anlamı görselden çıkmıyor (tekrar gelen misafir mi, satışa kapalı oda mı?).
- Oda kutusuna tıklayınca ne açıldığı (rezervasyon, misafir, folyo) bilinmiyor.
- Bir oda hem dolu hem kirli olduğunda hangi rengin öncelikli olduğu bilinmiyor.
- "Apart" ifadesi, bazı tesislerde oda yerine apart/bina gruplaması yapıldığını düşündürüyor.

**Arma'daki karşılığı:** Prototipteki "Odalar" sayfası benzer işi daha az odayla, kart görünümünde yapıyor. Sonraki adaylar: sıkı kutu görünümü, durum sayaçlı açıklama, kat/bina filtresi, liste görünümü.

## 2. Rezervasyon girişi

Görsel: [pms-reservation-entry.webp](https://rmosweb.com/screens/pms-reservation-entry.webp) · Sayfa bölümü: Rezervasyon Yönetimi

**Gözlem**

- Üst işlem çubuğu: Yeni Kayıt, Düzeltme, İptal, Önizleme, Rezervasyon Raporu.
- Konaklama alanları: rezervasyon kimliği, rezervasyon (oda) sayısı, giriş tarihi ve saati, geceleme, çıkış tarihi ve saati, alış tarihi, sistem tarihi.
- Satış alanları: acente, istenen konum, verilen konum, yatak tipi, voucher, kur kodu, pansiyon, ülke, müşteri tipi, pazar, blokaj, kişi sayısı.
- Kişi alanları: yetişkin, çocuk, free; ayrıca bebek yatağı ve 0-2, 3-6, 7-10, 11-14 yaş grupları.
- Fiyat alanları: fiyat otomatik/manuel seçimi, tablo kodu, günlük brüt / indirim / net, iki ayrı özel indirim (yüzde veya tutar seçimli görünüyor), günlük/toplam fiyat seçimi, toplam brüt / indirim / net, satış şekli. Sağda günlere göre fiyat dökümü tablosu.
- Diğer: döviz şekli, ödeme tipi, kurun günlük/aylık alınması, Confirmed/Waiting, Source, Channel, VIP kodu, telefon, e-posta, kontrol durumu, rezervasyon notu ve ayrı acente notu.
- Altta kişi başına satırlar: hitap, ad, soyad, doğum tarihi, yaş, müşteri numarası.
- Sağ alt sekmeler: Rezervasyon, İsim Kontrolü, Hesaplamalar, Hotel Durumu.

**Varsayım / bilinmeyen**

- "Fiyat O/M: Otomatik" ve "Tablo Kodu", fiyatın acente kontratındaki fiyat tablosundan otomatik hesaplandığını düşündürüyor; hesap kuralları (çocuk yaş bandı, pansiyon, indirim sırası) bilinmiyor.
- "İstenen Konum" ile "Verilen Konum" büyük olasılıkla istenen ve verilen oda tipi; doğrulanmalı.
- "Rez. Sayısı", tek kayıtla birden çok oda açılabildiğini düşündürüyor.
- "Free" kişi sayısının (ücretsiz kişi) fiyata etkisi bilinmiyor. "Dönüş 1 / Dönüş 2" alanlarının anlamı görselden çıkmıyor.
- "Confirmed/Waiting", bekleme listesinin rezervasyon durumunun bir parçası olduğunu gösteriyor.
- "İsim Kontrolü" sekmesi mükerrer misafir veya kara liste kontrolü olabilir.

**Arma'daki karşılığı:** Prototip yalnızca misafir adı, yetişkin sayısı, tarih aralığı ve oda alıyor. Acente, fiyat, pansiyon, döviz, çocuk yaşları, kişi bazlı isimler, kaynak/kanal ve onay/bekleme durumu sonraki modüllere ait.

## 3. Acente ve kontrat

Görsel: [pms-agency.webp](https://rmosweb.com/screens/pms-agency.webp) · Ekran başlığı: Kontrat Girişi · Sayfa bölümü: Satış ve Acente Yönetimi

**Gözlem**

- Acente listesi sütunları: acente kodu, acente adı, acente grubu, pazar, hareket, ülke, pansiyon, müşteri tipi, kur, forecast grubu, kontrat grubu, resmi ad, vergi dairesi, vergi numarası.
- "Pasif Acentaları Göster" anahtarı; ekleme, yazdırma ve dışa aktarma düğmeleri.
- Satır menüsü: Acenta Düzenle, Acenta Sil, Tablo / Fiyat İşlemleri, Kontenjan Girişi, Stop Sale, Forecast (Garantili Satış), Şablon Dizayn, Excel'e aktar.
- Menüde "Kanal Yönetimi" ayrı bir grup; "Gece İşlemleri" altında "Room Posting İşlemleri" ve "Gün Sonu İşlemleri" görünüyor.

**Varsayım / bilinmeyen**

- Fiyat tablosu, kontenjan, stop sale ve garantili satış acente üzerinden yönetiliyor; kontratın acente başına mı, kontrat grubu başına mı tutulduğu bilinmiyor.
- Acente kodlarındaki ek harfler (ör. "-A", "-R", "-P"), aynı acentenin farklı pazar veya kontrat varyantları olabilir.
- "Hareket" sütunu rezervasyon sayısı olabilir.
- Resmi ad ve vergi alanları, acenteye fatura kesildiğini (acente kredi faturası) destekliyor.

**Arma'daki karşılığı:** Yok. Acente/kontrat, kapsam haritasındaki "acente ve kontrat" adımına ait.

## 4. Check-in / check-out listeleri

Görsel: [pms-checkin.webp](https://rmosweb.com/screens/pms-checkin.webp) · Sayfa bölümü: Front Office Yönetimi

**Gözlem**

- Sekmeler: Check-In Olacaklar, Check-In Olanlar, Check-Out Olacaklar, Check-Out Olanlar, Boş Oda Listesi, Konaklayan Misafirler.
- Sütunlar: rezervasyon no, oda, isimler (odadaki tüm kişiler hitaplarıyla tek hücrede), M/D, ödeme, I/H, borç, alacak, bakiye, acente (acenteye göre renkli), giriş tarihi, geceleme, çıkış tarihi, konum, VIP.
- Ödeme sütununda "ACENTA KREDİ" değeri görülüyor.
- Satır menüsü: Geri Al, Folio, Proforma, Detay Update, Not, Beraberindekiler, Hk İşlemleri, Şablon Dizayn, Excel'e aktar.
- Bazı satırlar sarıyla vurgulanmış.

**Varsayım / bilinmeyen**

- Ödemenin acenteye fatura edildiği konaklamalar (acente kredisi), çıkışta misafirden tahsil edilmeyebilir; bakiyenin hangi koşulda sıfırlanması gerektiği bilinmiyor.
- "Geri Al" seçeneği, yapılmış bir giriş veya çıkışın geri alınabildiğini gösteriyor; hangi koşulda ve kimin yetkisiyle yapılabildiği bilinmiyor.
- M/D ve I/H kısaltmalarının ve sarı vurgunun anlamı görselden çıkmıyor.
- Giriş işleminin kendisi (kimlik okuma, oda verme, KBS bildirimi) bu görselde yok; menüde "Kimlik Bilgileri", "Jandarma Bildirim" ve "KBS & AKBS" ayrı öğeler.

**Arma'daki karşılığı:** Prototip panelinde "Bugün gelecek / ayrılacak misafirler" listeleri var ama giriş/çıkış işlemi yok. Kapsam haritasına göre sıradaki adım bu.

## 5. Folyo

Görsel: [pms-folio.webp](https://rmosweb.com/screens/pms-folio.webp) · Ekran başlığı: Folio İşlemleri · Sayfa bölümü: Faturalama / Ön Kasa

**Gözlem**

- Üstte seçili rezervasyonun numarası, misafiri ve tarih aralığı; "Room / Extra" ve "Inhouse / History" seçimleri.
- İşlem alanları: oda no, departman tipi, departman, departman grubu, ödeme tipi, merkez/exch, rezervasyon no, döviz, döviz tutarı, kur, TL karşılığı, çek no.
- Toplamlar: TL borç, alacak, bakiye; döviz borç, alacak, bakiye; bakiyenin birden çok para birimindeki karşılıkları.
- Hareket tablosu: tarih, açıklama, B/A (borç/alacak), TL borç / alacak / bakiye, döviz borç / alacak / bakiye ve kur kodu; altta toplam satırı.
- Görseldeki örnekte her gece için ayrı bir oda geliri satırı var ve açıklamada KDV oranı yazıyor.
- Sağda konaklayan rezervasyonların listesi. Menüde: Kur İşlemleri, Folio İşlemleri, Kasa İşlemleri, Hesap / Folio Transfer, Kart Tanımı, Ekstra Folio Açma, Late C-out İşlemleri, Fatura İşlemleri.

**Varsayım / bilinmeyen**

- Gecelik oda geliri satırları büyük olasılıkla gece işlemlerindeki "Room Posting" ile otomatik işleniyor ([sektör örneği](https://docs.oracle.com/en/industries/hospitality/opera-cloud/21.5/ocsuh/c_endofday_procedures.htm)).
- "Room / Extra", oda ücretleri ile ekstra harcamaların ayrı folyolarda tutulduğunu düşündürüyor (ör. acente odayı öder, ekstraları misafir öder).
- Her hareketin TL ve döviz olarak birlikte tutulması, kurun hareket anında sabitlendiğini düşündürüyor; kur kaynağı ve günlük/aylık kur kuralı bilinmiyor.
- Departman ve departman grubu, gelirin muhasebe ve rapor tarafında sınıflandırıldığını gösteriyor.

**Arma'daki karşılığı:** Yok. Folyo ve ön kasa kapsam haritasında sıradaki uçtan uca akışın parçası. Para birimi alanı (`hotels.currency`) şimdiden şemada var.

## 6. HK Rack (kat hizmetleri oda durumu)

Görsel: [pms-hk-rack.webp](https://rmosweb.com/screens/pms-hk-rack.webp) · Sayfa bölümü: Housekeeping (Kat Hizmetleri)

**Gözlem**

- Filtreler: başlangıç ve bitiş tarihi, kat görevlisi (Maid), kat şefi; yazdırma; "Uyuşmazlık" ve "Arızalı Odalar" düğmeleri.
- Durum açıklaması ve sayılar: Hepsi, COMP, C-İN, C-OUT, VR (Temiz), OOO (Arızalı), OD (Dolu Kirli), OCC (Dolu Temiz).
- Odalar Room Rack'e benzer şekilde katlara göre renkli kutular hâlinde.
- Kat Hizmetleri menüsü: HK Oda İşlemleri, HK Rack, Kayıp Eşya İşlemleri.

**Varsayım / bilinmeyen**

- Kat hizmetleri durumu, doluluk ve temizlik bilgisini birleştiriyor (boş-hazır, dolu-kirli, dolu-temiz, arızalı). Arma prototipindeki "temiz / temizlik bekliyor" bundan daha basit.
- "Uyuşmazlık", ön büronun ve kat hizmetlerinin aynı oda için farklı durum bildirdiği odaları gösteriyor olabilir (sektörde "room discrepancy").
- COMP muhtemelen ücretsiz (complimentary) konaklama; doğrulanmalı.
- Odaların kat görevlilerine ve kat şeflerine nasıl atandığı, durumun mobilden mi güncellendiği bilinmiyor. Ürün sayfası mobil kullanımdan söz ediyor.

**Arma'daki karşılığı:** Prototip yalnızca temiz/kirli ve arızalı bilgisini tutuyor. Kat hizmetleri modülü sonraki dilim.

## 7. Forecast (Grafik Forecast ve Tarih Forecast)

Görseller: [pms-graphic-forecast.webp](https://rmosweb.com/screens/pms-graphic-forecast.webp), [pms-date-forecast.webp](https://rmosweb.com/screens/pms-date-forecast.webp) · Sayfa bölümü: Forecast ve Doluluk Analizleri

**Gözlem: Grafik Forecast**

- Filtreler: ay seçimi, başlangıç ve bitiş tarihi, sistem tarihi, alış tarihi, döviz kodu; "Önceki Yıl" ve "Grafik/Tablo" anahtarları; "Özel Konsolide Şirketi" seçimi.
- Ayın her günü için yığılmış çubuk grafik:
  - kırmızı: dolu odalar;
  - yeşil: boş odalar;
  - üstte turuncu bant: günlük doluluk yüzdesi;
  - açıklamada ayrıca "geçmiş yıl dolu odalar".
- Üstte aylık oda ve yatak doluluğu halka grafikleri; yetişkin, çocuk, ücretsiz kişi, toplam kişi, tahmin ve "son durum" sayaçları.
- Gelir özeti KDV hariç ve KDV dahil olarak ayrı: tahmini gelir, ortalama oda fiyatı, kişi başı ortalama.
- "Forecast Raporları" menüsü: Grafik, Giriş & Çıkış, Acenta, Ülke, Konum, Konum Mevcut, Gelir, Pansiyon, Acenta Özet, Bilboard, Yıllık ve Tarih Forecast, Kitchen Forecast.

**Gözlem: Tarih Forecast**

- Filtreler: giriş ve çıkış tarihi, acente seçimi, pansiyon seçimi, konsolide şirket.
- Gün gün tablo sütunları: tarih, mevcut (satılabilir oda), oda (satılan), yetişkin, çocuk, free, pax, forecast, son durum, yüzde, kalan, son yüzde ve "Kon1"–"Kon5" ile bunların yüzdeleri.
- Örnekte "mevcut" oda sayısı ayın bir gününden sonra değişiyor; satılabilir kapasitenin tarihe göre farklı olabildiğini gösteriyor.

**Hedef otel bilgisi (geçmişe dönük doğrudan gözlem)**

- Fiyat toplantılarında Forecast ekranı açılıyor.
- Ayın her günü için doluluk çubuk grafikle inceleniyor ve fiyat gün gün dolulukla yeniden belirleniyor.
- Satılan odanın kapasiteyi aştığı günler ("short'a girmek") ekranda görsel olarak öne çıkıyor.

**Varsayım / bilinmeyen**

- "Short", satılan oda sayısının satılabilir kapasiteyi aşması (aşırı satış, overbooking) anlamında otel jargonu olarak kullanılıyor. Tarih Forecast'taki "kalan" sütununun bu günlerde eksiye düşmesi beklenir. Örnek görselde short gün yok; nasıl renklendirildiği doğrulanmalı.
- "Kon1–Kon5" sütunları kontenjan grupları veya kontrat grupları olabilir.
- "Forecast" ve "Tahmin" sütunlarının neyi tahmin ettiği bilinmiyor: beklenen ek satış mı, kontenjanın kullanılmayan kısmı mı?
- "Alış Tarihi" filtresi, belirli bir tarihe kadar alınmış rezervasyonlarla geçmiş durumu görmeye (pickup analizi) yarıyor olabilir.
- Fiyat değişikliği bu ekrandan değil, kontrat ve fiyat ekranlarından yapılıyor olabilir. Toplantıda iki ekran arasında gidip gelinip gelinmediği bilinmiyor.

**Arma'daki karşılığı:** Yok. [Acente ve kanal akışı](acente-ve-kanal-akisi.md) belgesinde 3. adım olarak planlandı. Olası iyileştirmeler (öneri, karar değil): forecast'tan ilgili fiyat veya stop sale işlemine hızlı geçiş; merkez ofis için otelleri birleştiren görünüm.

## Sayfada olup bu envantere detaylı girmeyen görseller

Akıllı Misafir Arama, Satış Raporları, Kasa Raporu, Room Posting (Gece İşlemleri), Acenta Kredi Fatura, Housekeeping Oda İşlemleri, Misafir Listesi ve gösterge paneli görselleri aynı sayfada bulunuyor. Görsel adresleri `https://rmosweb.com/screens/pms-*.webp` biçiminde. İlgili modüle geçildiğinde ayrıca incelenmeli.

## Bu envanterden çıkan sorular

1. Room Rack'teki "Repeat" ve "Boş Kapalı" ne anlama geliyor? Odaya tıklayınca hangi ekran açılıyor?
2. Rezervasyonda fiyat hep kontrattan otomatik mi geliyor? Elle fiyat ne sıklıkla, kim tarafından giriliyor?
3. "İstenen Konum" ve "Verilen Konum" ne için kullanılıyor? Tek kayıtta birden çok oda açılıyor mu?
4. Acente kredili konaklamalarda çıkışta misafirden ne tahsil ediliyor? Oda ve ekstra folyoları nasıl ayrılıyor?
5. Gece işlemlerinde (Room Posting, Gün Sonu) hangi adımlar sırayla yapılıyor? Kim yapıyor?
6. Kat hizmetleri durumları kim tarafından, hangi cihazdan güncelleniyor? "Uyuşmazlık" listesi nasıl çözülüyor?
7. Giriş-çıkış "Geri Al" işlemi hangi durumlarda kullanılıyor?
