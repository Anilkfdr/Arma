# Otel yazılımını etkileyen yasal ve kamusal yükümlülükler

Tarih: 16 Kasım 2026. Bu liste, bir otelin Arma'ya geçebilmesi için yazılımın karşılaması gereken zorunlu bağlantıları ve kuralları toplar. Ekranlar ne kadar iyi olursa olsun, buradaki zorunluluklar karşılanmadan bir otel sistemi gerçek işletmede kullanamaz.

**Hukuki veya mali görüş değildir.** Kaynakların bir kısmı ikincil (haber, mali bilgi sitesi, hukuk bürosu yazısı). Uygulamaya geçmeden önce resmi metin, mali müşavir ve gerektiğinde avukatla doğrulanmalı. Oranlar ve tarihler sık değişiyor.

Kaynak güveni: **Resmi** (kurum sitesi, mevzuat metni) · **İkincil** (haber, sektör yazısı) · **Doğrulanmadı**.

## Özet

| Yükümlülük | Kurum | Yazılıma etkisi | Arma'da ilgili modül | Kaynak güveni |
| --- | --- | --- | --- | --- |
| Konaklayan kimlik bildirimi (KBS) | Emniyet veya Jandarma | Girişte kimlik toplama, giriş/çıkışta otomatik bildirim, hata takibi | Giriş / çıkış | Resmi + ikincil |
| Çalışan kimlik bildirimi (KBS) | Emniyet veya Jandarma | Personelin işe giriş/çıkış bildirimi | İleride personel modülü | İkincil |
| Merkezi Turizm Veri Tabanı | Kültür ve Turizm Bakanlığı / TGA | Otel verilerinin PMS'ten Bakanlık API'sine günlük gönderimi | Gece kapanışı / raporlar | İkincil |
| e-Fatura ve e-Arşiv fatura | Gelir İdaresi (GİB) | Folyodan elektronik fatura; özel entegratör bağlantısı | Folyo / fatura | İkincil |
| KDV oranları | GİB | Folyo kalemi bazında KDV oranı | Folyo | İkincil + özelge |
| Konaklama vergisi | GİB | Ayrı kalem, tarih aralıklı oran, aylık beyan dökümü | Folyo / fatura / raporlar | Resmi + ikincil |
| Turizm payı | GİB / TGA | Aylık net satış dökümü | Raporlar / muhasebe | İkincil |
| Kişisel verilerin korunması (KVKK) | KVK Kurumu | Kimlik verisi sınırlaması, saklama süresi, erişim kaydı | Tüm sistem | Resmi + ikincil |
| Yiyecek-içecek fiyat kuralları, e-Adisyon | Ticaret Bakanlığı, GİB | Restoran fiyat listeleri ve ek ücretler; e-Adisyon olası | İleride POS | İkincil / doğrulanmadı |

## 1. Konaklayan kimlik bildirimi (KBS)

- **Dayanak:** [1774 sayılı Kimlik Bildirme Kanunu](https://www.lexpera.com.tr/mevzuat/kanunlar/kimlik-bildirme-kanunu-1774). Konaklama tesisleri, kalan kişilerin kimliklerini genel kolluğa bildirmekle yükümlü.
- **Kime:** Tesisin bulunduğu yerin kolluk sorumluluğuna göre Emniyet (EGM KBS) veya Jandarma (KBS Tesis). RMOS menüsünde "Jandarma Bildirim" ve "KBS & AKBS" ayrı öğeler olarak görünüyor ([ekran envanteri](rmos-ekran-envanteri.md)).
- **Otel yazılımıyla bağlantı (Resmi):** Jandarma'nın [KBS Tesis 2 yenilikler notu](https://www.jandarma.gov.tr/kurumlar/jandarma.gov.tr/Jandarma/Uygulamalar/KBS/KBS_Tesis_2_Yenilikler.pdf):
  - otel otomasyon programlarının web servis üzerinden bildirim yapabildiğini anlatıyor;
  - her giriş ve çıkışta tüm listenin değil, yalnızca o misafirin bildirildiğini söylüyor.

  [Uygulama dokümanına](https://www.jandarma.gov.tr/kurumlar/jandarma.gov.tr/Jandarma/Uygulamalar/KBS/KBS_Tesis_2_Uygulama_TD.pdf) göre tesis yetkilisi önce bağlı jandarma birimiyle geçişi yapıyor, sonra e-Devlet ile girip web servis bilgilerini tanımlıyor. Belgeler 2018 tarihli.
- **AKBS (Doğrulanmadı):** Açılımı bulunamadı. Bir yazılım firmasının [katalogu](https://www.akinsoft.com.tr/programlar/e-katalog/pdf/otel-5.pdf) AKBS gönderimi için otel raporlarından XML dosyası üretildiğinden söz ediyor.

**Yazılım gereksinimleri (taslak)**

1. Girişte kimlik alanları: T.C. kimlik no veya pasaport, uyruk, ad soyad, doğum tarihi vb. Kesin alan listesi güncel şartnameden alınmalı.
2. Giriş, çıkış ve oda değişikliğinde otomatik bildirim kaydı. Bildirimler bir **giden kutusunda** tutulur (bekliyor / gönderildi / hata, deneme sayısı, son hata mesajı).
3. Hatalı bildirimler için liste ve "yeniden gönder" düğmesi. RMOS'taki bildirim ekranının işlevsel karşılığı bu olmalı.
4. Tesis kullanıcı adı ve şifresi gibi bilgiler yalnızca sunucuda tutulur; gönderimi tarayıcı değil sunucu yapar.
5. Gerçek tesis bilgisi olmadan test edilemez. Prototipte açıkça "simülasyon" etiketli sahte gönderici kullanılmalı.

**Açık noktalar:** Konaklayanlar için güncel bildirim süresi (bulunan "24 saat" ifadesi eski bir metinde ve çalışanlara ilişkin), güncel web servis şartnamesi, oda değişikliğinin ayrıca bildirilip bildirilmediği, yabancı misafirler için ek alanlar.

## 2. Çalışan kimlik bildirimi (KBS)

- Aynı kanun kapsamında konaklama tesisleri, çalışan personelin kimliğini de işe girişte ve ayrılışta bildiriyor. Bildirimsiz personel çalıştırmak idari para cezası doğuruyor; tutar yıllık güncelleniyor ([İş yerlerinin kimlik bildirme yükümlülüğü](https://www.ekonomigazetesi.com/kose-yazisi/isyerlerinin-kimlik-bildirme-yukumlulugu-45470), İkincil).
- Arma'nın şimdiki kapsamında değil. Personel/İK modülü geldiğinde aynı giden kutusu altyapısı kullanılabilir.

## 3. Merkezi Turizm Veri Tabanı (Kültür ve Turizm Bakanlığı)

- Bakanlığın 2026/1 sayılı genelgesiyle konaklama tesislerinin verilerini standart biçimde Bakanlığa göndermesi zorunlu hale geldi ([genelge haberi](https://www.alomaliye.com/2026/05/21/merkezi-turizm-veri-tabaninin-kullanilmasi-hakkinda-genelge/), [ilk duyuru](https://www.alomaliye.com/2026/05/06/konaklama-tesisleri-icin-merkezi-turizm-veri-tabani-entegrasyonu-zorunlu-hale-getirildi/), İkincil).
- **Gönderim sıklığı:** PMS ile otomatik entegre tesisler veriyi günlük gönderiyor. Elle giriş yapanlar aylık, her ayın 15'ine kadar gönderiyor. 2025 verilerinin toplu gönderimi de isteniyor.
- **Tarih:** İlk son tarih 15 Mayıs 2026 idi. Otelciler Birliği TÜROB, geçiş tarihinin [15 Haziran 2026'ya ertelendiğini](https://www.turob.com/tr/haberler/2026/show/2425/merkezi-turizm-veri-tabani-gecis-tarihi-15-haziran-2026-olarak-duzenlendi) duyurdu. İki tarih de geçti.
- **Teknik:** Haberlere göre veri setleri ve API dokümanı `tga.gov.tr/tesis-entegrasyon` sayfasında. Bu sayfa bu araştırmada doğrudan incelenmedi.

**Yazılıma etkisi:** Bir PMS sağlayıcısı olarak Arma'nın da bu API'ye günlük veri göndermesi gerekecek. Muhtemelen gece kapanışından sonra çalışan bir iş olacak. Veri setleri tanımlanmadan modelin bu verileri üretip üretemediği bilinemez. İlk iş Bakanlığın teknik dokümanını incelemek.

## 4. e-Fatura ve e-Arşiv fatura

- Kültür ve Turizm Bakanlığı belgeli veya belediye ruhsatlı konaklama tesisleri, ciro şartı aranmadan **1 Temmuz 2022'den beri** e-Fatura ve e-Arşiv faturaya geçmek zorunda. Alıcı e-Fatura kullanıcısıysa e-Fatura, değilse (yabancı misafirler dahil) e-Arşiv düzenleniyor ([Sovos](https://sovos.com/tr/blog/kdv/turizm-sektorunde-e-belge-gecisi-icin-son-tarih-1-temmuz-2022/), [Paraşüt](https://www.parasut.com/blog/oteller-icin-e-fatura-kullanimi), İkincil).
- **Yazılıma etkisi:** Folyodan fatura üretimi ve bir özel entegratör (e-Belge sağlayıcısı) bağlantısı. RMOS menüsünde "Folio Fatura", "Acenta Kredi Fatura" ve "Fatura Kontrol Sistemi" görünüyor. Teknik çerçeve: [dış sistem haritası](dis-sistem-veri-akislari.md).

## 5. KDV

- Geceleme hizmetinde KDV oranı **%10** ([alomaliye özelge yazısı, Şubat 2026](https://www.alomaliye.com/2026/02/23/basit-konaklama-turizm-isletmeleri-icin-geceleme-hizmetlerinde-kdv-orani/), İkincil). Alkollü içecek gibi geceleme dışı kalemler farklı orana tabi olabilir.
- RMOS folyo ekranındaki "Oda Geliri %10" satırı bununla tutarlı.
- **Yazılıma etkisi:** KDV oranı folyo kalemi (gelir türü / departman) bazında tutulmalı; tek sabit oran yeterli değil.

## 6. Konaklama vergisi

- **Dayanak:** 7194 sayılı Kanun. Kanuni oran **%2**. Cumhurbaşkanı oranı yarıya indirebilir veya iki katına çıkarabilir.
- **2026:** 11263 sayılı Cumhurbaşkanı Kararı ile **1 Mayıs – 31 Aralık 2026** arasında **%1**. Oran hizmetin sunulduğu tarihe göre belirleniyor ([Cottgroup](https://cottgroup.com/tr/mevzuat/item/konaklama-vergisi-orani-1-e-dusuruldu), İkincil).
- **Matrah:** KDV hariç bedel. Pansiyon konsepti kapsamındaki yeme-içme ve aktivite hizmetleri matraha dahil; otelde kalmayanlara restoranda verilen yemek dahil değil. Kaynaklara göre faturada ayrı kalem olarak gösteriliyor ([hukuk bürosu yazısı](https://bilalalyar.av.tr/konaklama-vergisi-avukati-2026/), İkincil).
- **Beyan:** Aylık dönemler halinde, tesisin bağlı olduğu vergi dairesine ([GİB beyanname kılavuzu](https://intvrg.gib.gov.tr/KONAKLAMA_VERGISI_BEYANNAMESI_DUZENLEME_KILAVUZU.pdf), Resmi).

**Yazılıma etkisi:**
- Vergi oranları **yürürlük tarihli bir tabloda** tutulmalı ve hesap hizmet tarihine göre yapılmalı. Oran yılda birden çok kez değişebiliyor.
- Folyo ve faturada ayrı satır olarak görünmeli.
- Aylık beyan için döküm üretilmeli.
- Konaklayan ile konaklamayan misafir satışları ayrılabilmeli.

## 7. Turizm payı

- **Dayanak:** 7183 sayılı Kanun (Türkiye Turizm Tanıtım ve Geliştirme Ajansı).
- **Oran:** Konaklama tesisleri için net satış ve kira gelirinin **binde 7,5**'i. Bakanlık belgesi olmayan, yalnızca belediye ruhsatlı tesisler de kapsamda.
- **Beyan:** Aylık; takip eden ayın sonuna kadar. Kasım 2025 döneminden itibaren e-Beyan sisteminde ([e-Beyan duyurusu](https://www.alomaliye.com/2025/12/01/turizm-payi-beyannamesi-yeni-e-beyan-sisteminde-uygulamaya-acildi/), [usul ve esaslar](https://alomaliye.com/2019/11/04/turizm-payinin-beyani-ve-tahsili/), İkincil).

**Yazılıma etkisi:** Doğrudan bir bağlantı gerektirmiyor, ama aylık net satış raporu muhasebe modülünün sorumluluğunda olacak.

## 8. Kişisel verilerin korunması (KVKK)

- **Kimlik fotokopisi:** Kişisel Verileri Koruma Kurulu'nun turizm sektörüne ilişkin [ilke kararı](https://www.kvkk.gov.tr/Icerik/8554/turizm-ve-otelcilik-sektorunde-konaklama-hizmeti-alan-kisilerin-t-c-kimlik-belgesi-fotokopisinin-kaydedilmesi-hakkinda-ilke-karari) (Resmî Gazete, Aralık 2025): kimlik bilgileri kayda alınabilir, ama kimlik belgesinin fotokopisinin alınıp saklanması kanunen istenmiyor. Bu yüzden Arma kimlik görüntüsü saklamamalı.
- **VERBİS:** Kayıt yükümlülüğü çalışan sayısı ve bilanço eşiklerine bağlı; eşikler 2025'te yeniden düzenlendi ([açıklama](https://www.erdem-erdem.av.tr/bilgi-bankasi/verbis-kayit-yukumlulugune-iliskin-yeni-istisnalarin-uygulama-esaslari-aciklandi), İkincil). Kayıtta her işleme faaliyeti için azami saklama süresi bildiriliyor.
- **Yazılıma etkisi:**
  - En az veri ilkesi; kimlik alanlarına rol bazlı erişim.
  - Kimlik verisine kimin baktığını gösteren erişim kaydı.
  - Tanımlı saklama süresi sonunda silme veya anonimleştirme.
  - Arma bir hizmet sağlayıcı olarak muhtemelen "veri işleyen" konumunda olacak; otel ise veri sorumlusu. Sözleşme ve aydınlatma metinleri gerekecek.

## 9. Yiyecek-içecek ve POS ile ilgili kurallar (ileride)

- **Fiyat listeleri:** Fiyat Etiketi Yönetmeliği'ndeki 2025–2026 değişiklikleri:
  - kriterleri belirlenen lokanta ve kafelerin fiyat listelerini Bakanlık sistemine aktarmasını istiyor;
  - servis, kuver ve masa ücreti gibi ek ücretleri sınırlıyor ([Ticaret Bakanlığı](https://ticaret.gov.tr/haberler/ticaret-bakanligi-tarafindan-fiyat-etiketi-yonetmeliginde-degisiklik-yapildi), [servis ücreti yasağı](https://www.alomaliye.com/2026/01/30/restoranlarda-servis-kuver-ve-masa-ucreti-yasaklandi/amp/)).

  Otel restoranlarının kapsamda olup olmadığı doğrulanmadı.
- **e-Adisyon:** GİB, masaya servis yapan işletmelere bildirimle e-Adisyon zorunluluğu getirebiliyor ([e-Adisyon kılavuzu haberi](https://sovos.com/tr/blog/kdv/e-adisyon-donemi-basliyor-beklenen-kilavuz-yayimlandi/), İkincil). Oteller için genel bir zorunluluk bulunamadı.
- Bunlar restoran POS modülüne geçildiğinde yeniden araştırılmalı.

## Arma için tasarım ilkeleri

1. **Ortak giden kutusu:** KBS, Merkezi Turizm Veri Tabanı ve e-Belge gibi dış bildirimler aynı altyapıyı kullanır: kayıt, durum, yeniden deneme, hata mesajı, elle yeniden gönderme ve denetim kaydı.
2. **Tarihli kurallar:** Vergi oranları, harç ve paylar yürürlük başlangıç ve bitiş tarihiyle tutulur. Hesap, işlemin değil hizmetin tarihine göre yapılır.
3. **Gizli bilgiler sunucuda:** Tesis şifreleri ve entegratör anahtarları tarayıcıya hiç gönderilmez.
4. **Kişisel veri sınırlı:** Kimlik verisi en az alanla, rol bazlı erişimle, saklama süresiyle tutulur; erişim kaydı tutulur.
5. **Simülasyon açıkça işaretli:** Gerçek bağlantı bilgisi gelene kadar dış sistemler test göndericisiyle gösterilir ve arayüzde öyle etiketlenir.

## Sorulacak sorular (otel çalışanı / mali müşavir)

1. Oteller KBS'de Emniyet'e mi, Jandarma'ya mı bağlı? Bildirim bugün RMOS'tan otomatik mi gidiyor? Hata olduğunda kim, nasıl fark ediyor?
2. Merkezi Turizm Veri Tabanı entegrasyonu RMOS üzerinden yapıldı mı? Hangi veriler, hangi sıklıkla gidiyor?
3. Hangi e-Belge özel entegratörü kullanılıyor? Faturayı kim, hangi anda kesiyor (çıkışta mı, toplu mu)?
4. Konaklama vergisi ve turizm payı beyannamelerini kim hazırlıyor? Hangi rapordan besleniyor?
5. Otel restoranları dışarıdan gelen misafire de hizmet veriyor mu? (Konaklama vergisi ayrımı ve fiyat listesi kuralları için.)
6. Misafir kimlik verileri ne kadar süre saklanıyor? VERBİS kaydı ve saklama-imha politikası var mı?
