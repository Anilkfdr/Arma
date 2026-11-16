import { describe, expect, it } from 'vitest';
import { toUserMessage } from './errors';

describe('hata mesajları', () => {
  it('çakışan rezervasyon ve yetki hatalarını Türkçe açıklar', () => {
    expect(toUserMessage({ code: '23P01', message: 'conflicting key value violates exclusion constraint' })).toMatch(
      /başka bir aktif rezervasyona/,
    );
    expect(toUserMessage({ code: '42501', message: 'new row violates row-level security policy' })).toBe(
      'Bu işlem için yetkiniz yok.',
    );
  });

  it('hatalı giriş ve ağ hatasını ayırt eder', () => {
    expect(toUserMessage({ name: 'AuthApiError', message: 'Invalid login credentials', status: 400 })).toBe(
      'E-posta veya şifre hatalı.',
    );
    expect(toUserMessage(new TypeError('Failed to fetch'))).toMatch(/Sunucuya ulaşılamadı/);
  });

  it('veritabanı kuralının Türkçe mesajını olduğu gibi gösterir, bilinmeyen hatayı ham göstermez', () => {
    expect(toUserMessage({ code: 'P0001', message: 'Kişi sayısı oda kapasitesini (2) aşıyor.' })).toBe(
      'Kişi sayısı oda kapasitesini (2) aşıyor.',
    );
    expect(toUserMessage({ code: 'XX000', message: 'internal stack trace' })).toBe(
      'İşlem tamamlanamadı. Lütfen tekrar deneyin.',
    );
  });
});
