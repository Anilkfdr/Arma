// Veritabanı satırlarının arayüzde kullanılan biçimleri (bkz. supabase/migrations).

export type HotelRole = 'yonetici' | 'resepsiyon' | 'merkez_ofis' | 'izleyici';
export type ReservationStatus = 'onayli' | 'konaklamada' | 'cikis_yapti' | 'iptal';
export type HousekeepingStatus = 'temiz' | 'kirli';

export interface Hotel {
  id: string;
  code: string;
  name: string;
  timezone: string;
  currency: string;
  organization: { id: string; name: string } | null;
}

export interface HotelAccess {
  hotel: Hotel;
  role: HotelRole;
}

export interface RoomType {
  id: string;
  code: string;
  name: string;
  capacity: number;
  sort_order: number;
}

export interface Room {
  id: string;
  number: string;
  floor: number | null;
  housekeeping_status: HousekeepingStatus;
  out_of_order: boolean;
  out_of_order_reason: string | null;
  room_type: RoomType;
}

export interface Reservation {
  id: string;
  reservation_no: number;
  hotel_id: string;
  guest_name: string;
  adults: number;
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD (çıkış günü, gece sayılmaz)
  status: ReservationStatus;
  note: string | null;
  created_at: string;
  room: { id: string; number: string; room_type: { code: string; name: string } };
}

export interface HotelDaySummary {
  hotel_id: string;
  hotel_code: string;
  hotel_name: string;
  business_day: string;
  total_rooms: number;
  out_of_order_rooms: number;
  sellable_rooms: number;
  occupied_tonight: number;
  arrivals_today: number;
  departures_today: number;
  in_house: number;
  arrivals_next_7_days: number;
}

export interface AvailableRoom {
  room_id: string;
  room_number: string;
  floor: number | null;
  room_type_id: string;
  room_type_code: string;
  room_type_name: string;
  capacity: number;
  housekeeping_status: HousekeepingStatus;
}
