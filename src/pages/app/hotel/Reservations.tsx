import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { ReservationBadge } from '../../../components/Badges';
import { EmptyState, ErrorPanel, LoadingScreen } from '../../../components/Feedback';
import { PageHeader } from '../../../components/PageHeader';
import { cancelReservation, fetchReservations } from '../../../lib/api';
import { formatShortDate, formatWeekday, nightsBetween, todayIn } from '../../../lib/dates';
import { toUserMessage } from '../../../lib/errors';
import { canWriteReservations } from '../../../lib/labels';
import type { Reservation } from '../../../lib/types';
import { useAsync } from '../../../lib/useAsync';
import { useHotel } from '../HotelScope';

type Tab = 'aktif' | 'giris' | 'cikis' | 'gecmis' | 'hepsi';

const TABS: { key: Tab; label: string }[] = [
  { key: 'aktif', label: 'Aktif ve gelecek' },
  { key: 'giris', label: 'Bugün giriş' },
  { key: 'cikis', label: 'Bugün çıkış' },
  { key: 'gecmis', label: 'Geçmiş ve iptal' },
  { key: 'hepsi', label: 'Tümü' },
];

function matchesTab(r: Reservation, tab: Tab, today: string) {
  const active = r.status === 'onayli' || r.status === 'konaklamada';
  switch (tab) {
    case 'aktif':
      return active && r.check_out >= today;
    case 'giris':
      return r.status !== 'iptal' && r.check_in === today;
    case 'cikis':
      return r.status !== 'iptal' && r.check_out === today;
    case 'gecmis':
      return r.status === 'iptal' || r.status === 'cikis_yapti' || r.check_out < today;
    case 'hepsi':
      return true;
  }
}

// Türkçe büyük/küçük harf duyarsız arama (İ/ı dahil).
const norm = (s: string) => s.toLocaleLowerCase('tr').normalize('NFC');

export function Reservations() {
  const { hotel, role } = useHotel();
  const location = useLocation();
  const created = (location.state as { createdId?: string; createdNo?: number; guest?: string } | null) ?? null;
  const today = todayIn(hotel.timezone);
  const canWrite = canWriteReservations(role);

  const list = useAsync(() => fetchReservations(hotel.id), [hotel.id]);
  const [tab, setTab] = useState<Tab>('aktif');
  const [query, setQuery] = useState('');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    created?.createdNo ? `#${created.createdNo} numaralı rezervasyon (${created.guest}) kaydedildi.` : null,
  );

  const rows = useMemo(() => {
    const q = norm(query.trim());
    return (list.data ?? [])
      .filter((r) => matchesTab(r, tab, today))
      .filter((r) => !q || norm(r.guest_name).includes(q) || r.room.number.includes(q) || String(r.reservation_no) === q);
  }, [list.data, tab, today, query]);

  async function handleCancel(r: Reservation) {
    setBusyId(r.id);
    setActionError(null);
    try {
      await cancelReservation(r.id);
      setNotice(`#${r.reservation_no} numaralı rezervasyon iptal edildi; oda bu tarihler için yeniden satılabilir.`);
      setConfirmingId(null);
      list.reload();
    } catch (err) {
      setActionError(toUserMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  if (list.loading && !list.data) return <LoadingScreen label="Rezervasyonlar yükleniyor…" />;

  return (
    <div className="page">
      <PageHeader
        eyebrow={hotel.name}
        title="Rezervasyonlar"
        description="Giriş tarihi, misafirin otele geleceği gün; çıkış tarihi ayrılacağı gündür. Çıkış günü konaklama gecesi sayılmaz."
        actions={
          canWrite && (
            <Link to={`/uygulama/otel/${hotel.code}/rezervasyonlar/yeni`} className="btn btn--primary">
              + Yeni rezervasyon
            </Link>
          )
        }
      />

      {notice && (
        <div className="notice notice--success" role="status">
          <span>{notice}</span>
          <button type="button" className="notice__close" onClick={() => setNotice(null)} aria-label="Bildirimi kapat">
            ×
          </button>
        </div>
      )}
      {actionError && (
        <div className="notice notice--error" role="alert">
          {actionError}
        </div>
      )}
      {list.error ? <ErrorPanel error={list.error} onRetry={list.reload} /> : null}

      <div className="toolbar">
        <div className="segmented" role="tablist" aria-label="Rezervasyon süzgeci">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={tab === t.key ? 'is-active' : ''}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              <span className="segmented__count">
                {(list.data ?? []).filter((r) => matchesTab(r, t.key, today)).length}
              </span>
            </button>
          ))}
        </div>
        <label className="search">
          <span className="sr-only">Misafir, oda veya rezervasyon no ara</span>
          <input
            type="search"
            placeholder="Misafir, oda no veya rez. no ara"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <section className="card card--flush">
        {rows.length === 0 ? (
          <EmptyState title="Bu süzgeçle eşleşen rezervasyon yok." />
        ) : (
          <div className="table-wrap">
            <table className="table table--reservations">
              <thead>
                <tr>
                  <th scope="col">No</th>
                  <th scope="col">Misafir</th>
                  <th scope="col">Oda</th>
                  <th scope="col">Giriş</th>
                  <th scope="col">Çıkış</th>
                  <th scope="col" className="num">Gece</th>
                  <th scope="col" className="num">Kişi</th>
                  <th scope="col">Durum</th>
                  {canWrite && (
                    <th scope="col">
                      <span className="sr-only">İşlem</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className={created?.createdId === r.id ? 'is-new' : undefined}>
                    <td data-label="No" className="mono">
                      #{r.reservation_no}
                    </td>
                    <th scope="row" data-label="Misafir">
                      {r.guest_name}
                      {r.note && <small className="cell-note">{r.note}</small>}
                    </th>
                    <td data-label="Oda">
                      <span>
                        <span className="room-pill">{r.room.number}</span> {r.room.room_type.name}
                      </span>
                    </td>
                    <td data-label="Giriş">
                      <span>
                        {formatShortDate(r.check_in)} <small className="muted">{formatWeekday(r.check_in)}</small>
                      </span>
                    </td>
                    <td data-label="Çıkış">
                      <span>
                        {formatShortDate(r.check_out)} <small className="muted">{formatWeekday(r.check_out)}</small>
                      </span>
                    </td>
                    <td data-label="Gece" className="num">
                      {nightsBetween(r.check_in, r.check_out)}
                    </td>
                    <td data-label="Kişi" className="num">
                      {r.adults}
                    </td>
                    <td data-label="Durum">
                      <ReservationBadge status={r.status} />
                    </td>
                    {canWrite && (
                      <td className="actions">
                        {r.status === 'onayli' &&
                          (confirmingId === r.id ? (
                            <span className="confirm">
                              <span>İptal edilsin mi?</span>
                              <button
                                type="button"
                                className="btn btn--danger btn--sm"
                                onClick={() => handleCancel(r)}
                                disabled={busyId === r.id}
                              >
                                {busyId === r.id ? 'İptal ediliyor…' : 'Evet, iptal et'}
                              </button>
                              <button
                                type="button"
                                className="btn btn--ghost btn--sm"
                                onClick={() => setConfirmingId(null)}
                                disabled={busyId === r.id}
                              >
                                Vazgeç
                              </button>
                            </span>
                          ) : (
                            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setConfirmingId(r.id)}>
                              İptal et
                            </button>
                          ))}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
