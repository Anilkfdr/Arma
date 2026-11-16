// Supabase / PostgreSQL hatalarını kullanıcının anlayacağı Türkçe mesajlara çevirir.

interface ErrorLike {
  message?: string;
  code?: string;
  hint?: string | null;
  status?: number;
  name?: string;
}

export function toUserMessage(error: unknown): string {
  if (!error) return 'Bilinmeyen bir hata oluştu.';
  const e = error as ErrorLike;
  const message = e.message ?? String(error);

  if (e.name === 'TypeError' && /fetch/i.test(message)) {
    return 'Sunucuya ulaşılamadı. İnternet bağlantısını ve Supabase ayarlarını kontrol edin.';
  }
  if (/Failed to fetch|NetworkError|Load failed/i.test(message)) {
    return 'Sunucuya ulaşılamadı. İnternet bağlantısını ve Supabase ayarlarını kontrol edin.';
  }

  // Supabase Auth
  if (/Invalid login credentials/i.test(message)) return 'E-posta veya şifre hatalı.';
  if (/Email not confirmed/i.test(message)) return 'Bu hesabın e-posta adresi henüz doğrulanmamış.';
  if (/rate limit|too many requests/i.test(message) || e.status === 429) {
    return 'Çok fazla deneme yapıldı. Lütfen biraz bekleyip tekrar deneyin.';
  }
  if (/JWT expired|refresh token/i.test(message)) return 'Oturumunuzun süresi doldu. Lütfen yeniden giriş yapın.';

  // PostgreSQL
  switch (e.code) {
    case '23P01':
      return 'Seçilen oda bu tarihlerde başka bir aktif rezervasyona ayrılmış. Lütfen başka bir oda seçin.';
    case '42501':
      return 'Bu işlem için yetkiniz yok.';
    case '23514':
      return 'Girilen bilgiler geçersiz. Tarih aralığını ve kişi sayısını kontrol edin.';
    case '23503':
      return 'Seçilen kayıt bu otele ait değil.';
    case 'P0001':
      // Veritabanı tetikleyicisinin Türkçe mesajı doğrudan gösterilir.
      return message;
  }

  return 'İşlem tamamlanamadı. Lütfen tekrar deneyin.';
}
