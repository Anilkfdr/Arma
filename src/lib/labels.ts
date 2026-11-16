import type { HotelRole, HousekeepingStatus, ReservationStatus } from './types';

export const ROLE_LABEL: Record<HotelRole, string> = {
  yonetici: 'Otel yöneticisi',
  resepsiyon: 'Ön büro',
  merkez_ofis: 'Merkez ofis',
  izleyici: 'Yalnızca görüntüleme',
};

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  onayli: 'Onaylı',
  konaklamada: 'Konaklamada',
  cikis_yapti: 'Çıkış yaptı',
  iptal: 'İptal',
};

export const RESERVATION_STATUS_HINT: Record<ReservationStatus, string> = {
  onayli: 'Rezervasyon onaylandı, misafir henüz giriş yapmadı.',
  konaklamada: 'Misafir giriş yaptı ve otelde kalıyor.',
  cikis_yapti: 'Misafir çıkış yaptı.',
  iptal: 'Rezervasyon iptal edildi; oda bu tarihler için yeniden satılabilir.',
};

export const HOUSEKEEPING_LABEL: Record<HousekeepingStatus, string> = {
  temiz: 'Temiz',
  kirli: 'Temizlik bekliyor',
};

export function canWriteReservations(role: HotelRole) {
  return role === 'yonetici' || role === 'resepsiyon' || role === 'merkez_ofis';
}
