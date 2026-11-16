import { describe, expect, it } from 'vitest';
import { deriveRoomState } from './roomStatus';
import type { Reservation, Room } from './types';

const room: Room = {
  id: 'oda-1',
  number: '101',
  floor: 1,
  housekeeping_status: 'temiz',
  out_of_order: false,
  out_of_order_reason: null,
  room_type: { id: 't', code: 'STD', name: 'Standart Oda', capacity: 2, sort_order: 1 },
};

function res(partial: Partial<Reservation>): Reservation {
  return {
    id: Math.random().toString(36),
    reservation_no: 1,
    hotel_id: 'h',
    guest_name: 'Örnek Misafir',
    adults: 2,
    check_in: '2026-11-15',
    check_out: '2026-11-18',
    status: 'onayli',
    note: null,
    created_at: '',
    room: { id: room.id, number: room.number, room_type: { code: 'STD', name: 'Standart Oda' } },
    ...partial,
  };
}

const today = '2026-11-16';

describe('oda durumu', () => {
  it('rezervasyonu olmayan oda boştur, iptal rezervasyon odayı doldurmaz', () => {
    expect(deriveRoomState(room, [], today).kind).toBe('bos');
    expect(deriveRoomState(room, [res({ status: 'iptal', check_in: today })], today).kind).toBe('bos');
  });

  it('konaklayan misafir: çıkışı bugünse "bugün çıkış", aynı gün gelecek misafiri de gösterir', () => {
    const leaving = res({ status: 'konaklamada', check_in: '2026-11-14', check_out: today });
    const arriving = res({ status: 'onayli', check_in: today, check_out: '2026-11-19', guest_name: 'Yeni' });
    const state = deriveRoomState(room, [leaving, arriving], today);
    expect(state.kind).toBe('cikis_bugun');
    expect(state.nextArrival?.guest_name).toBe('Yeni');
  });

  it('konaklayan misafir çıkışı ileri tarihliyse oda doludur', () => {
    expect(deriveRoomState(room, [res({ status: 'konaklamada' })], today).kind).toBe('dolu');
  });

  it('bugün girişi olan ve girişi gecikmiş onaylı rezervasyonları ayırır', () => {
    expect(deriveRoomState(room, [res({ check_in: today })], today).kind).toBe('giris_bugun');
    expect(deriveRoomState(room, [res({ check_in: '2026-11-15' })], today).kind).toBe('gecikmis_giris');
  });

  it('arızalı oda her durumda satış dışı görünür', () => {
    const broken = { ...room, out_of_order: true };
    expect(deriveRoomState(broken, [res({ status: 'konaklamada' })], today).kind).toBe('satis_disi');
  });
});
