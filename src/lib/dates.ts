// Tarihler "YYYY-MM-DD" metni olarak taşınır; saat dilimi kaymasını önlemek için
// hesaplar UTC gün üzerinden yapılır. "Bugün", otelin saat dilimine göre belirlenir.

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string) {
  if (!ISO_DATE.test(value)) return false;
  const d = toUtcDate(value);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function toUtcDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!));
}

/** Verilen saat dilimindeki bugünün tarihi (ör. otelin bulunduğu yer). */
export function todayIn(timeZone: string, now: Date = new Date()) {
  // en-CA yerel ayarı YYYY-MM-DD biçiminde yazar.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function addDays(iso: string, days: number) {
  const d = toUtcDate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Konaklama gecesi sayısı: çıkış günü sayılmaz. */
export function nightsBetween(checkIn: string, checkOut: string) {
  return Math.round((toUtcDate(checkOut).getTime() - toUtcDate(checkIn).getTime()) / 86_400_000);
}

/** [aStart, aEnd) ile [bStart, bEnd) gece aralıkları kesişiyor mu? */
export function stayOverlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && bStart < aEnd;
}

const shortFormat = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const longFormat = new Intl.DateTimeFormat('tr-TR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const weekdayFormat = new Intl.DateTimeFormat('tr-TR', { weekday: 'short', timeZone: 'UTC' });

export function formatShortDate(iso: string) {
  return shortFormat.format(toUtcDate(iso));
}

export function formatLongDate(iso: string) {
  return longFormat.format(toUtcDate(iso));
}

export function formatWeekday(iso: string) {
  return weekdayFormat.format(toUtcDate(iso));
}

/** Bugüne göre okunur gün ifadesi: "Bugün", "Yarın", "Dün" veya kısa tarih. */
export function relativeDayLabel(iso: string, today: string) {
  const diff = nightsBetween(today, iso);
  if (diff === 0) return 'Bugün';
  if (diff === 1) return 'Yarın';
  if (diff === -1) return 'Dün';
  return formatShortDate(iso);
}
