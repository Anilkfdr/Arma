// Supabase veri erişimi. Tüm sorgular oturumdaki kullanıcının yetkisiyle çalışır;
// hangi otelin verisinin döneceğine veritabanındaki RLS politikaları karar verir.
import { getSupabase } from './supabase';
import type {
  AvailableRoom,
  HotelAccess,
  HotelDaySummary,
  Reservation,
  ReservationStatus,
  Room,
} from './types';

const RESERVATION_FIELDS =
  'id, reservation_no, hotel_id, guest_name, adults, check_in, check_out, status, note, created_at, room:rooms(id, number, room_type:room_types(code, name))';

export async function fetchMyHotels(): Promise<HotelAccess[]> {
  const { data, error } = await getSupabase()
    .from('hotel_members')
    .select('role, hotel:hotels(id, code, name, timezone, currency, organization:organizations(id, name))');
  if (error) throw error;
  return (data as unknown as HotelAccess[])
    .filter((row) => row.hotel)
    .sort((a, b) => a.hotel.name.localeCompare(b.hotel.name, 'tr'));
}

export async function fetchDaySummaries(hotelId?: string): Promise<HotelDaySummary[]> {
  const { data, error } = await getSupabase().rpc('hotel_day_summary', hotelId ? { p_hotel_id: hotelId } : {});
  if (error) throw error;
  return data as HotelDaySummary[];
}

export async function fetchRooms(hotelId: string): Promise<Room[]> {
  const { data, error } = await getSupabase()
    .from('rooms')
    .select(
      'id, number, floor, housekeeping_status, out_of_order, out_of_order_reason, room_type:room_types(id, code, name, capacity, sort_order)',
    )
    .eq('hotel_id', hotelId);
  if (error) throw error;
  return (data as unknown as Room[]).sort(
    (a, b) => a.number.length - b.number.length || a.number.localeCompare(b.number, 'tr'),
  );
}

interface ReservationQuery {
  /** Bu tarihte veya sonrasında çıkışı olanlar */
  checkOutFrom?: string;
  /** Bu tarihte veya öncesinde girişi olanlar */
  checkInUntil?: string;
  statuses?: ReservationStatus[];
  limit?: number;
}

export async function fetchReservations(hotelId: string, query: ReservationQuery = {}): Promise<Reservation[]> {
  let request = getSupabase()
    .from('reservations')
    .select(RESERVATION_FIELDS)
    .eq('hotel_id', hotelId)
    .order('check_in', { ascending: true })
    .order('reservation_no', { ascending: true });
  if (query.checkOutFrom) request = request.gte('check_out', query.checkOutFrom);
  if (query.checkInUntil) request = request.lte('check_in', query.checkInUntil);
  if (query.statuses) request = request.in('status', query.statuses);
  if (query.limit) request = request.limit(query.limit);
  const { data, error } = await request;
  if (error) throw error;
  return data as unknown as Reservation[];
}

/** Erişilebilen tüm otellerde belirli tarih aralığında girişi olan onaylı rezervasyonlar. */
export async function fetchArrivalsAcrossHotels(from: string, until: string): Promise<Reservation[]> {
  const { data, error } = await getSupabase()
    .from('reservations')
    .select(RESERVATION_FIELDS)
    .eq('status', 'onayli')
    .gte('check_in', from)
    .lte('check_in', until)
    .order('check_in', { ascending: true })
    .limit(50);
  if (error) throw error;
  return data as unknown as Reservation[];
}

export async function fetchAvailableRooms(
  hotelId: string,
  checkIn: string,
  checkOut: string,
  adults: number,
): Promise<AvailableRoom[]> {
  const { data, error } = await getSupabase().rpc('available_rooms', {
    p_hotel_id: hotelId,
    p_check_in: checkIn,
    p_check_out: checkOut,
    p_adults: adults,
  });
  if (error) throw error;
  return data as AvailableRoom[];
}

export interface NewReservationInput {
  hotel_id: string;
  room_id: string;
  guest_name: string;
  adults: number;
  check_in: string;
  check_out: string;
  note: string | null;
}

export async function createReservation(input: NewReservationInput) {
  const { data, error } = await getSupabase()
    .from('reservations')
    .insert(input)
    .select('id, reservation_no')
    .single();
  if (error) throw error;
  return data as { id: string; reservation_no: number };
}

export async function cancelReservation(id: string) {
  const { data, error } = await getSupabase()
    .from('reservations')
    .update({ status: 'iptal' })
    .eq('id', id)
    .select('id');
  if (error) throw error;
  if (!data || data.length === 0) {
    throw Object.assign(new Error('Kayıt bulunamadı veya yetkiniz yok.'), { code: '42501' });
  }
}
