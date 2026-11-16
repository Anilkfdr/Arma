import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ReservationBadge } from '../../../components/Badges';
import { EmptyState, ErrorPanel, LoadingScreen } from '../../../components/Feedback';
import { PageHeader } from '../../../components/PageHeader';
import { fetchDaySummaries, fetchReservations } from '../../../lib/api';
import { addDays, formatLongDate, formatShortDate, nightsBetween, relativeDayLabel, todayIn } from '../../../lib/dates';
import { canWriteReservations } from '../../../lib/labels';
import type { Reservation } from '../../../lib/types';
import { useAsync } from '../../../lib/useAsync';
import { useHotel } from '../HotelScope';
import { occupancyPercent } from '../metrics';
import { Kpi } from '../Overview';

export function Dashboard() {
  const { hotel, role } = useHotel();
  const today = todayIn(hotel.timezone);
  const summary = useAsync(() => fetchDaySummaries(hotel.id), [hotel.id]);
  const nearby = useAsync(
    () =>
      fetchReservations(hotel.id, {
        checkOutFrom: today,
        checkInUntil: addDays(today, 7),
        statuses: ['onayli', 'konaklamada'],
      }),
    [hotel.id, today],
  );

  if (summary.loading && !summary.data) return <LoadingScreen label="Panel hazırlanıyor…" />;
  const s = summary.data?.[0];
  const day = s?.business_day ?? today;
  const rows = nearby.data ?? [];
  const arrivals = rows.filter((r) => r.status === 'onayli' && r.check_in === day);
  const departures = rows.filter((r) => r.status === 'konaklamada' && r.check_out === day);
  const upcoming = rows.filter((r) => r.status === 'onayli' && r.check_in > day);
  const base = `/uygulama/otel/${hotel.code}`;

  return (
    <div className="page">
      <PageHeader
        eyebrow={formatLongDate(day)}
        title={hotel.name}
        description="Otelin bugünkü özeti. Rakamlar veritabanındaki rezervasyon ve oda kayıtlarından hesaplanır."
        actions={
          canWriteReservations(role) && (
            <Link to={`${base}/rezervasyonlar/yeni`} className="btn btn--primary">
              + Yeni rezervasyon
            </Link>
          )
        }
      />

      {summary.error ? <ErrorPanel error={summary.error} onRetry={summary.reload} /> : null}

      {s && (
        <div className="kpis">
          <Kpi
            label="Bu gece doluluk"
            value={`%${occupancyPercent(s)}`}
            sub={`${s.occupied_tonight} / ${s.sellable_rooms} satılabilir oda`}
            tone="navy"
          />
          <Kpi label="Bugün giriş" value={s.arrivals_today} sub="Beklenen ve gelen misafir" tone="amber" />
          <Kpi label="Bugün çıkış" value={s.departures_today} sub="Ayrılacak misafir" tone="violet" />
          <Kpi label="Konaklamada" value={s.in_house} sub="Şu an oteldeki rezervasyon" />
          <Kpi
            label="Arızalı / satış dışı"
            value={s.out_of_order_rooms}
            sub={`Toplam ${s.total_rooms} odadan düşülür`}
            tone="red"
          />
          <Kpi label="7 gün içinde giriş" value={s.arrivals_next_7_days} sub="Onaylı rezervasyon" />
        </div>
      )}

      <p className="hint">
        <strong>Doluluk</strong>, bu gece için dolu veya ayrılmış odaların satılabilir odalara oranıdır; arızalı odalar
        hesaba katılmaz. <strong>Gün</strong> şimdilik otelin saat dilimindeki takvim günüdür (gece kapanışı henüz
        yok).
      </p>

      {nearby.error ? <ErrorPanel error={nearby.error} onRetry={nearby.reload} /> : null}

      <div className="two-col">
        <ReservationList
          title="Bugün gelecek misafirler"
          empty="Bugün için beklenen giriş yok."
          items={arrivals}
          meta={(r) => `${nightsBetween(r.check_in, r.check_out)} gece · çıkış ${formatShortDate(r.check_out)}`}
          loading={nearby.loading}
        />
        <ReservationList
          title="Bugün ayrılacak misafirler"
          empty="Bugün çıkış yapacak misafir yok."
          items={departures}
          meta={(r) => `${formatShortDate(r.check_in)} girişli · ${r.adults} kişi`}
          loading={nearby.loading}
        />
      </div>

      <ReservationList
        title="Önümüzdeki 7 gün içindeki girişler"
        empty="Önümüzdeki 7 gün için onaylı giriş yok."
        items={upcoming}
        meta={(r) => `${relativeDayLabel(r.check_in, day)} · ${nightsBetween(r.check_in, r.check_out)} gece`}
        loading={nearby.loading}
        footer={
          <Link to={`${base}/rezervasyonlar`} className="link">
            Tüm rezervasyonlar →
          </Link>
        }
      />
    </div>
  );
}

function ReservationList({
  title,
  items,
  empty,
  meta,
  loading,
  footer,
}: {
  title: string;
  items: Reservation[];
  empty: string;
  meta: (r: Reservation) => string;
  loading: boolean;
  footer?: ReactNode;
}) {
  return (
    <section className="card">
      <div className="card__head">
        <h2>{title}</h2>
        <span className="count">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <EmptyState title={loading ? 'Yükleniyor…' : empty} />
      ) : (
        <ul className="list">
          {items.map((r) => (
            <li key={r.id} className="list__row">
              <span className="room-pill">{r.room.number}</span>
              <span className="list__main">
                <strong>{r.guest_name}</strong>
                <small>{r.room.room_type.name}</small>
              </span>
              <span className="list__meta">{meta(r)}</span>
              <ReservationBadge status={r.status} />
            </li>
          ))}
        </ul>
      )}
      {footer && <div className="card__foot">{footer}</div>}
    </section>
  );
}
