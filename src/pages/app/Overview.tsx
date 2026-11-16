import { Link, Navigate } from 'react-router';
import { useAccess } from '../../auth/AccessProvider';
import { ReservationBadge } from '../../components/Badges';
import { EmptyState, ErrorPanel, LoadingScreen } from '../../components/Feedback';
import { PageHeader } from '../../components/PageHeader';
import { fetchArrivalsAcrossHotels, fetchDaySummaries } from '../../lib/api';
import { addDays, formatLongDate, nightsBetween, relativeDayLabel, todayIn } from '../../lib/dates';
import { useAsync } from '../../lib/useAsync';
import { occupancyPercent, sumSummaries } from './metrics';

/** Merkez ofis toplu özeti: erişilebilen tüm otellerin bugünkü durumu yan yana ve toplam. */
export function Overview() {
  const { hotels, isMultiHotel } = useAccess();
  const today = todayIn(hotels[0]?.hotel.timezone ?? 'Europe/Istanbul');
  const summaries = useAsync(() => fetchDaySummaries(), []);
  const arrivals = useAsync(() => fetchArrivalsAcrossHotels(today, addDays(today, 2)), [today]);

  if (!isMultiHotel) return <Navigate to="/uygulama" replace />;
  if (summaries.loading && !summaries.data) return <LoadingScreen label="Toplu özet hazırlanıyor…" />;

  const rows = summaries.data ?? [];
  const total = sumSummaries(rows);
  const hotelName = new Map(hotels.map(({ hotel }) => [hotel.id, hotel]));

  return (
    <div className="page">
      <PageHeader
        eyebrow="Merkez ofis · toplu özet"
        title="Tüm oteller"
        description={`${formatLongDate(rows[0]?.business_day ?? today)} itibarıyla yetkili olduğunuz ${rows.length} otelin durumu.`}
      />
      {summaries.error ? <ErrorPanel error={summaries.error} onRetry={summaries.reload} /> : null}

      <div className="kpis kpis--4">
        <Kpi label="Bu gece doluluk (toplam)" value={`%${occupancyPercent(total)}`} sub={`${total.occupied_tonight} / ${total.sellable_rooms} satılabilir oda`} />
        <Kpi label="Bugün giriş" value={total.arrivals_today} sub="Tüm otellerde" />
        <Kpi label="Bugün çıkış" value={total.departures_today} sub="Tüm otellerde" />
        <Kpi label="Önümüzdeki 7 gün giriş" value={total.arrivals_next_7_days} sub="Onaylı rezervasyon" />
      </div>

      <section className="card">
        <div className="card__head">
          <h2>Otel karşılaştırması</h2>
        </div>
        <div className="table-wrap">
          <table className="table table--compare">
            <thead>
              <tr>
                <th scope="col">Otel</th>
                <th scope="col" className="num">Oda</th>
                <th scope="col" className="num">Arızalı</th>
                <th scope="col" className="num">Bu gece dolu</th>
                <th scope="col" className="num">Doluluk</th>
                <th scope="col" className="num">Bugün giriş</th>
                <th scope="col" className="num">Bugün çıkış</th>
                <th scope="col" className="num">Konaklamada</th>
                <th scope="col"><span className="sr-only">İşlem</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.hotel_id}>
                  <th scope="row" data-label="Otel">{r.hotel_name}</th>
                  <td className="num" data-label="Oda">{r.total_rooms}</td>
                  <td className="num" data-label="Arızalı">{r.out_of_order_rooms}</td>
                  <td className="num" data-label="Bu gece dolu">{r.occupied_tonight}</td>
                  <td className="num" data-label="Doluluk">
                    <span className="meter" aria-hidden="true">
                      <span style={{ width: `${occupancyPercent(r)}%` }} />
                    </span>
                    %{occupancyPercent(r)}
                  </td>
                  <td className="num" data-label="Bugün giriş">{r.arrivals_today}</td>
                  <td className="num" data-label="Bugün çıkış">{r.departures_today}</td>
                  <td className="num" data-label="Konaklamada">{r.in_house}</td>
                  <td className="actions">
                    <Link to={`/uygulama/otel/${r.hotel_code}`} className="btn btn--ghost btn--sm">
                      Oteli aç
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Toplam</th>
                <td className="num" data-label="Oda">{total.total_rooms}</td>
                <td className="num" data-label="Arızalı">{total.out_of_order_rooms}</td>
                <td className="num" data-label="Bu gece dolu">{total.occupied_tonight}</td>
                <td className="num" data-label="Doluluk">%{occupancyPercent(total)}</td>
                <td className="num" data-label="Bugün giriş">{total.arrivals_today}</td>
                <td className="num" data-label="Bugün çıkış">{total.departures_today}</td>
                <td className="num" data-label="Konaklamada">{total.in_house}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="card__head">
          <h2>Yaklaşan girişler · bugün ve sonraki iki gün</h2>
        </div>
        {arrivals.error ? (
          <ErrorPanel error={arrivals.error} onRetry={arrivals.reload} />
        ) : !arrivals.data?.length ? (
          <EmptyState title={arrivals.loading ? 'Yükleniyor…' : 'Bu aralıkta giriş yok.'} />
        ) : (
          <ul className="list">
            {arrivals.data.map((r) => (
              <li key={r.id} className="list__row">
                <span className="list__main">
                  <strong>{r.guest_name}</strong>
                  <small>
                    {hotelName.get(r.hotel_id)?.name ?? 'Otel'} · Oda {r.room.number} · {r.room.room_type.name}
                  </small>
                </span>
                <span className="list__meta">
                  {relativeDayLabel(r.check_in, today)} · {nightsBetween(r.check_in, r.check_out)} gece
                </span>
                <ReservationBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function Kpi({ label, value, sub, tone }: { label: string; value: string | number; sub?: string; tone?: string }) {
  return (
    <div className={`kpi ${tone ? `kpi--${tone}` : ''}`}>
      <span className="kpi__label">{label}</span>
      <span className="kpi__value">{value}</span>
      {sub && <span className="kpi__sub">{sub}</span>}
    </div>
  );
}
