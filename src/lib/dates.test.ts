import { describe, expect, it } from 'vitest';
import { addDays, isIsoDate, nightsBetween, relativeDayLabel, stayOverlaps, todayIn } from './dates';

describe('tarih yardımcıları', () => {
  it('gece sayısında çıkış günü sayılmaz; ay ve yıl geçişleri doğru hesaplanır', () => {
    expect(nightsBetween('2026-11-16', '2026-11-17')).toBe(1);
    expect(nightsBetween('2026-12-30', '2027-01-02')).toBe(3);
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });

  it('çıkış günü yeni girişle çakışmaz', () => {
    expect(stayOverlaps('2026-11-16', '2026-11-18', '2026-11-18', '2026-11-20')).toBe(false);
    expect(stayOverlaps('2026-11-16', '2026-11-18', '2026-11-17', '2026-11-19')).toBe(true);
  });

  it('bugün, otelin saat dilimine göre belirlenir', () => {
    // UTC 22:30 → İstanbul'da ertesi gün 01:30
    const now = new Date('2026-11-16T22:30:00Z');
    expect(todayIn('UTC', now)).toBe('2026-11-16');
    expect(todayIn('Europe/Istanbul', now)).toBe('2026-11-17');
  });

  it('geçersiz tarihleri ayırt eder ve göreli gün etiketi üretir', () => {
    expect(isIsoDate('2026-02-30')).toBe(false);
    expect(isIsoDate('2026-11-16')).toBe(true);
    expect(relativeDayLabel('2026-11-17', '2026-11-16')).toBe('Yarın');
  });
});
