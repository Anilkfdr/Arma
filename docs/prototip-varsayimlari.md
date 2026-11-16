# İlk prototip: varsayımlar ve doğrulanacak sorular

Tarih: 16 Kasım 2026. Bu belge, ilk prototipte iş kuralı bilinmediği için **varsayımla** verilen kararları ve ileride otel çalışanlarına sorulacak soruları listeler. Buradaki maddeler kesin gereksinim değildir; cevap alındıkça güncellenmelidir.

Kaynak etiketleri: **Sektör kaynağı** (yayımlanmış ürün dokümanı), **Varsayım** (doğrulanmadı).

## Terimler (sade dille)

- **Rezervasyon:** Misafirin belirli tarihlerde otelde kalmak üzere yer ayırtması.
- **Giriş tarihi (check-in):** Misafirin otele geleceği gün. **Çıkış tarihi (check-out):** Ayrılacağı gün. Çıkış günü gece sayılmaz: 16–19 Kasım = 3 gece.
- **Konaklamada (in-house):** Misafirin giriş yapmış ve otelde kalıyor olması.
- **Arızalı / satış dışı (OOO, out of order):** Arıza veya bakım nedeniyle satılamayan oda.
- **Doluluk:** Bu gece dolu veya ayrılmış odaların satılabilir odalara oranı.
- **İş tarihi ve gece kapanışı (night audit):** Otel yazılımında günün kayıtlarının kontrol edilip kapatıldığı ve iş tarihinin bir sonraki güne geçtiği işlem.

## Prototipte verilen kararlar

| Konu | Prototipteki davranış | Dayanak |
| --- | --- | --- |
| "Bugün" | Otelin saat dilimindeki takvim günü | Varsayım. Sektörde iş tarihi gece kapanışıyla ilerler; takvim günüyle aynı olmayabilir ([OPERA Cloud iş tarihi](https://docs.oracle.com/en/industries/hospitality/opera-cloud/24.1/ocsuh/t_toolbox_managing_business_date.htm), [gece kapanışı](https://docs.oracle.com/en/industries/hospitality/opera-cloud/21.5/ocsuh/c_endofday_procedures.htm)) |
| Arızalı oda ve doluluk | Arızalı odalar satılabilir oda sayısından düşülür | Sektör kaynağı: OPERA'da OOO odalar envanterden düşer, OOS (hizmet dışı) odalar envanterde kalır ([OOO/OOS](https://docs.oracle.com/en/industries/hospitality/opera-cloud/24.1/ocsuh/c_configuration_codes_out_of_order_out_of_service.htm)). Prototipte yalnızca OOO var |
| Bu gece doluluğu | Bugün girişi beklenen onaylı rezervasyonlar da dolu sayılır | Varsayım (ayrılmış oda = satılamaz) |
| Oda ataması | Rezervasyon oluşturulurken oda seçilir | Varsayım. Birçok otelde rezervasyon oda tipine alınıp oda sonradan atanabilir |
| Aynı gün değişim | Çıkış günü aynı odaya yeni giriş yapılabilir | Gece bazlı hesap ([giriş, çıkış) aralığı) |
| Rezervasyon durumları | Onaylı, Konaklamada, Çıkış yaptı, İptal | Varsayım. Opsiyonlu, bekleme listesi, gelmedi (no-show) gibi durumlar henüz yok |
| İptal | Gerekçe ve ceza olmadan iptal; kayıt silinmez | Varsayım |
| Gecikmiş giriş | Giriş tarihi geçmiş onaylı rezervasyon "Giriş bekleniyor" görünür | Varsayım. Gerçekte gece kapanışında "gelmedi" sürecine girebilir |
| Kat hizmetleri | Yalnızca Temiz / Temizlik bekliyor | Varsayım. Gerçek otellerde kontrol edildi, dolu-kirli gibi ek durumlar olabilir |
| Misafir bilgisi | Yalnızca ad soyad ve yetişkin sayısı | Varsayım. Misafir kartı, çocuk, uyruk ve kimlik bildirimi sonraki dilim |
| Rezervasyon numarası | Tüm oteller için tek artan sıra | Varsayım |
| En uzun konaklama | 90 gece | Varsayım (teknik sınır) |
| Roller | Ön büro, yönetici, merkez ofis, izleyici; merkez ofis rezervasyon yapabilir | Varsayım |

## Otel çalışanlarına sorulacak sorular

Ön büro:

1. Rezervasyon alınırken oda hemen mi atanıyor, yoksa oda tipine alınıp giriş günü mü atanıyor?
2. Kesinleşmemiş (opsiyonlu) rezervasyon tutuluyor mu? Ne kadar süre geçerli kalıyor?
3. Gelmeyen misafir (no-show) nasıl ve ne zaman işaretleniyor? Oda ne zaman yeniden satışa açılıyor?
4. İptalde gerekçe, ceza veya onay gerekiyor mu? İptal edilen rezervasyon geri alınabiliyor mu?
5. Rezervasyon numaraları otele özel mi? Acentenin numarası ayrıca tutuluyor mu?
6. Erken giriş ve geç çıkış nasıl kaydediliyor? Ek ücret doğuruyor mu?

Gün sonu ve raporlar:

7. Gece kapanışı hangi saatte, kim tarafından yapılıyor? Kapanış yapılmadan ertesi güne geçilebiliyor mu?
8. Yönetimin her sabah baktığı rakamlar neler (doluluk, oda başı gelir, giriş-çıkış listesi vb.)?

Kat hizmetleri ve teknik:

9. Oda temizlik durumları hangi aşamalardan geçiyor? Kontrol (supervisor) adımı var mı?
10. Arızalı oda ile kısa süreli hizmet dışı oda ayrımı yapılıyor mu? Arıza kaydını kim açıp kapatıyor?

Yetki ve merkez ofis:

11. Merkez ofis otellerin rezervasyonlarını kendisi giriyor mu, yalnızca izliyor mu?
12. Bir çalışan birden çok otelde çalışabiliyor mu? Gece görevlisi, kat şefi, muhasebe gibi rollerin her biri hangi ekranları görüyor?
