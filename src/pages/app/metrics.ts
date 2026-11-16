import type { HotelDaySummary } from '../../lib/types';

/** Doluluk = bu gece dolu/ayrılmış oda ÷ satılabilir oda (arızalı odalar hariç). */
export function occupancyPercent(s: Pick<HotelDaySummary, 'occupied_tonight' | 'sellable_rooms'>) {
  if (!s.sellable_rooms) return 0;
  return Math.round((s.occupied_tonight / s.sellable_rooms) * 100);
}

export function sumSummaries(rows: HotelDaySummary[]) {
  return rows.reduce(
    (acc, r) => ({
      total_rooms: acc.total_rooms + r.total_rooms,
      out_of_order_rooms: acc.out_of_order_rooms + r.out_of_order_rooms,
      sellable_rooms: acc.sellable_rooms + r.sellable_rooms,
      occupied_tonight: acc.occupied_tonight + r.occupied_tonight,
      arrivals_today: acc.arrivals_today + r.arrivals_today,
      departures_today: acc.departures_today + r.departures_today,
      in_house: acc.in_house + r.in_house,
      arrivals_next_7_days: acc.arrivals_next_7_days + r.arrivals_next_7_days,
    }),
    {
      total_rooms: 0,
      out_of_order_rooms: 0,
      sellable_rooms: 0,
      occupied_tonight: 0,
      arrivals_today: 0,
      departures_today: 0,
      in_house: 0,
      arrivals_next_7_days: 0,
    },
  );
}
