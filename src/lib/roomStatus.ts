import type { Reservation, Room } from './types';

export type RoomStateKind = 'satis_disi' | 'cikis_bugun' | 'dolu' | 'giris_bugun' | 'gecikmis_giris' | 'bos';

export interface RoomState {
  kind: RoomStateKind;
  label: string;
  /** Odadaki veya beklenen misafir rezervasyonu */
  reservation: Reservation | null;
  /** Aynı gün çıkışın ardından gelecek giriş */
  nextArrival: Reservation | null;
}

const LABEL: Record<RoomStateKind, string> = {
  satis_disi: 'Arızalı / satış dışı',
  cikis_bugun: 'Bugün çıkış',
  dolu: 'Dolu',
  giris_bugun: 'Bugün giriş',
  gecikmis_giris: 'Giriş bekleniyor',
  bos: 'Boş',
};

export const ROOM_STATE_ORDER: RoomStateKind[] = [
  'dolu',
  'cikis_bugun',
  'giris_bugun',
  'gecikmis_giris',
  'bos',
  'satis_disi',
];

export function roomStateLabel(kind: RoomStateKind) {
  return LABEL[kind];
}

/**
 * Odanın bugünkü durumunu, o odaya ait aktif rezervasyonlardan türetir.
 * Öncelik: arızalı > konaklayan misafir (bugün çıkış / dolu) > bugün giriş > gecikmiş giriş > boş.
 * "Gecikmiş giriş": giriş tarihi geçmiş ama misafir henüz giriş yapmamış onaylı rezervasyon
 * (gerçek otellerde no-show/gelmedi süreci gece kapanışında ele alınır — henüz kapsam dışı).
 */
export function deriveRoomState(room: Room, reservations: Reservation[], today: string): RoomState {
  const active = reservations.filter(
    (r) => r.room.id === room.id && (r.status === 'onayli' || r.status === 'konaklamada'),
  );
  const arrivalToday = active.find((r) => r.status === 'onayli' && r.check_in === today) ?? null;

  if (room.out_of_order) {
    return { kind: 'satis_disi', label: LABEL.satis_disi, reservation: null, nextArrival: null };
  }

  const inHouse = active.find((r) => r.status === 'konaklamada' && r.check_in <= today && r.check_out >= today);
  if (inHouse) {
    const kind = inHouse.check_out === today ? 'cikis_bugun' : 'dolu';
    return {
      kind,
      label: LABEL[kind],
      reservation: inHouse,
      nextArrival: kind === 'cikis_bugun' ? arrivalToday : null,
    };
  }

  if (arrivalToday) {
    return { kind: 'giris_bugun', label: LABEL.giris_bugun, reservation: arrivalToday, nextArrival: null };
  }

  const overdue = active.find((r) => r.status === 'onayli' && r.check_in < today && r.check_out > today);
  if (overdue) {
    return { kind: 'gecikmis_giris', label: LABEL.gecikmis_giris, reservation: overdue, nextArrival: null };
  }

  return { kind: 'bos', label: LABEL.bos, reservation: null, nextArrival: null };
}
