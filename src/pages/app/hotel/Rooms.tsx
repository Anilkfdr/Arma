import { useMemo, useState } from 'react';
import { RoomStateBadge } from '../../../components/Badges';
import { EmptyState, ErrorPanel, LoadingScreen } from '../../../components/Feedback';
import { PageHeader } from '../../../components/PageHeader';
import { fetchReservations, fetchRooms } from '../../../lib/api';
import { formatLongDate, formatShortDate, todayIn } from '../../../lib/dates';
import { HOUSEKEEPING_LABEL } from '../../../lib/labels';
import { deriveRoomState, ROOM_STATE_ORDER, roomStateLabel, type RoomStateKind } from '../../../lib/roomStatus';
import { useAsync } from '../../../lib/useAsync';
import { useHotel } from '../HotelScope';

type Filter = 'hepsi' | RoomStateKind | 'kirli';

const STATE_HELP: Record<RoomStateKind, string> = {
  dolu: 'Misafir giriş yaptı, çıkışı ileri tarihte.',
  cikis_bugun: 'Misafirin çıkış günü bugün.',
  giris_bugun: 'Bugün gelmesi beklenen onaylı rezervasyon var.',
  gecikmis_giris: 'Giriş tarihi geçti, misafir henüz giriş yapmadı.',
  bos: 'Bu gece için rezervasyon yok.',
  satis_disi: 'Arıza veya bakım nedeniyle satılamaz.',
};

export function Rooms() {
  const { hotel } = useHotel();
  const today = todayIn(hotel.timezone);
  const rooms = useAsync(() => fetchRooms(hotel.id), [hotel.id]);
  const current = useAsync(
    () => fetchReservations(hotel.id, { checkOutFrom: today, checkInUntil: today, statuses: ['onayli', 'konaklamada'] }),
    [hotel.id, today],
  );
  const [filter, setFilter] = useState<Filter>('hepsi');

  const decorated = useMemo(
    () => (rooms.data ?? []).map((room) => ({ room, state: deriveRoomState(room, current.data ?? [], today) })),
    [rooms.data, current.data, today],
  );

  if ((rooms.loading && !rooms.data) || (current.loading && !current.data)) {
    return <LoadingScreen label="Odalar yükleniyor…" />;
  }

  const counts = new Map<Filter, number>([['hepsi', decorated.length]]);
  for (const { room, state } of decorated) {
    counts.set(state.kind, (counts.get(state.kind) ?? 0) + 1);
    if (room.housekeeping_status === 'kirli') counts.set('kirli', (counts.get('kirli') ?? 0) + 1);
  }

  const visible = decorated.filter(({ room, state }) =>
    filter === 'hepsi' ? true : filter === 'kirli' ? room.housekeeping_status === 'kirli' : state.kind === filter,
  );
  const floors = new Map<string, typeof visible>();
  for (const item of visible) {
    const key = item.room.floor == null ? 'Diğer' : `${item.room.floor}. kat`;
    floors.set(key, [...(floors.get(key) ?? []), item]);
  }

  const filters: { key: Filter; label: string }[] = [
    { key: 'hepsi', label: 'Tümü' },
    ...ROOM_STATE_ORDER.map((k) => ({ key: k as Filter, label: roomStateLabel(k) })),
    { key: 'kirli', label: 'Temizlik bekliyor' },
  ];

  return (
    <div className="page">
      <PageHeader
        eyebrow={formatLongDate(today)}
        title="Odalar"
        description="Her odanın bugünkü durumu rezervasyonlardan hesaplanır. Temizlik durumu kat hizmetleri bilgisidir ve ayrıca gösterilir."
      />
      {rooms.error ? <ErrorPanel error={rooms.error} onRetry={rooms.reload} /> : null}
      {current.error ? <ErrorPanel error={current.error} onRetry={current.reload} /> : null}

      <div className="chips" role="toolbar" aria-label="Oda durumuna göre süz">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`chip ${filter === f.key ? 'is-active' : ''} ${f.key !== 'hepsi' && f.key !== 'kirli' ? `chip--${f.key}` : ''}`}
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            disabled={!counts.get(f.key) && f.key !== 'hepsi'}
          >
            {f.label}
            <span className="chip__count">{counts.get(f.key) ?? 0}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState title="Bu süzgeçle eşleşen oda yok." />
      ) : (
        [...floors.entries()].map(([floor, items]) => (
          <section key={floor} className="floor">
            <h2 className="floor__title">{floor}</h2>
            <div className="room-grid">
              {items.map(({ room, state }) => (
                <article key={room.id} className={`room-card room-card--${state.kind}`}>
                  <header className="room-card__head">
                    <span className="room-card__no">{room.number}</span>
                    <RoomStateBadge kind={state.kind} />
                  </header>
                  <p className="room-card__type">
                    {room.room_type.name} · {room.room_type.capacity} kişilik
                  </p>
                  <div className="room-card__body">
                    {state.kind === 'satis_disi' ? (
                      <span>{room.out_of_order_reason ?? 'Satış dışı'}</span>
                    ) : state.reservation ? (
                      <>
                        <strong>{state.reservation.guest_name}</strong>
                        <span>
                          {formatShortDate(state.reservation.check_in)} – {formatShortDate(state.reservation.check_out)}
                        </span>
                      </>
                    ) : (
                      <span className="muted">Bu gece boş</span>
                    )}
                    {state.nextArrival && (
                      <span className="room-card__next">Ardından giriş: {state.nextArrival.guest_name}</span>
                    )}
                  </div>
                  <footer className={`room-card__hk room-card__hk--${room.housekeeping_status}`}>
                    {HOUSEKEEPING_LABEL[room.housekeeping_status]}
                  </footer>
                </article>
              ))}
            </div>
          </section>
        ))
      )}

      <details className="legend">
        <summary>Durumlar ne anlama geliyor?</summary>
        <dl>
          {ROOM_STATE_ORDER.map((k) => (
            <div key={k}>
              <dt>
                <RoomStateBadge kind={k} />
              </dt>
              <dd>{STATE_HELP[k]}</dd>
            </div>
          ))}
        </dl>
        <p className="hint">
          Arızalı (OOO, out of order) odalar satılabilir oda sayısından düşülür. Gerçek otellerde ayrıca “hizmet dışı”
          (OOS) gibi satışa açık kalan kısa süreli durumlar da bulunur; bu ayrım ileride eklenecek.
        </p>
      </details>
    </div>
  );
}
