import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { EmptyState, ErrorPanel, Spinner } from '../../../components/Feedback';
import { PageHeader } from '../../../components/PageHeader';
import { createReservation, fetchAvailableRooms } from '../../../lib/api';
import { addDays, formatLongDate, isIsoDate, nightsBetween, todayIn } from '../../../lib/dates';
import { toUserMessage } from '../../../lib/errors';
import { canWriteReservations, HOUSEKEEPING_LABEL } from '../../../lib/labels';
import type { AvailableRoom } from '../../../lib/types';
import { useAsync } from '../../../lib/useAsync';
import { useHotel } from '../HotelScope';

const MAX_NIGHTS = 90;

export function NewReservation() {
  const { hotel, role } = useHotel();
  const navigate = useNavigate();
  const today = todayIn(hotel.timezone);
  const base = `/uygulama/otel/${hotel.code}`;

  const [guestName, setGuestName] = useState('');
  const [adults, setAdults] = useState(2);
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(addDays(today, 1));
  const [roomId, setRoomId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const dateError = (() => {
    if (!isIsoDate(checkIn) || !isIsoDate(checkOut)) return 'Geçerli bir giriş ve çıkış tarihi seçin.';
    if (checkIn < today) return 'Giriş tarihi bugünden önce olamaz.';
    if (checkOut <= checkIn) return 'Çıkış tarihi giriş tarihinden sonra olmalı.';
    if (nightsBetween(checkIn, checkOut) > MAX_NIGHTS) return `Bir rezervasyon en fazla ${MAX_NIGHTS} gece olabilir.`;
    return null;
  })();
  const nights = dateError ? 0 : nightsBetween(checkIn, checkOut);

  const availability = useAsync(
    () => (dateError ? Promise.resolve<AvailableRoom[]>([]) : fetchAvailableRooms(hotel.id, checkIn, checkOut, adults)),
    [hotel.id, checkIn, checkOut, adults, dateError],
  );
  const rooms = availability.data ?? [];

  // Tarih veya kişi değişip seçili oda artık uygun değilse seçimi kaldır.
  useEffect(() => {
    if (roomId && availability.data && !availability.data.some((r) => r.room_id === roomId)) setRoomId(null);
  }, [availability.data, roomId]);

  const byType = useMemo(() => {
    const groups = new Map<string, { name: string; capacity: number; rooms: AvailableRoom[] }>();
    for (const r of rooms) {
      const g = groups.get(r.room_type_id) ?? { name: r.room_type_name, capacity: r.capacity, rooms: [] };
      g.rooms.push(r);
      groups.set(r.room_type_id, g);
    }
    return [...groups.values()];
  }, [rooms]);

  if (!canWriteReservations(role)) {
    return (
      <div className="page">
        <EmptyState title="Rezervasyon oluşturma yetkiniz yok">
          Hesabınız bu otelde yalnızca görüntüleme yetkisine sahip. <Link to={base}>Panele dönün</Link>.
        </EmptyState>
      </div>
    );
  }

  const nameError = guestName.trim().length < 2 ? 'Misafirin adını ve soyadını yazın.' : null;
  const roomError = !roomId ? 'Uygun odalardan birini seçin.' : null;
  const selected = rooms.find((r) => r.room_id === roomId);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    setSubmitError(null);
    if (nameError || dateError || roomError || submitting) return;
    setSubmitting(true);
    try {
      const saved = await createReservation({
        hotel_id: hotel.id,
        room_id: roomId!,
        guest_name: guestName.trim(),
        adults,
        check_in: checkIn,
        check_out: checkOut,
        note: note.trim() || null,
      });
      navigate(`${base}/rezervasyonlar`, {
        state: { createdId: saved.id, createdNo: saved.reservation_no, guest: guestName.trim() },
      });
    } catch (err) {
      setSubmitError(toUserMessage(err));
      // Oda bu arada başka bir kayda verildiyse güncel listeyi getir.
      if ((err as { code?: string }).code === '23P01') {
        setRoomId(null);
        availability.reload();
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow={hotel.name}
        title="Yeni rezervasyon"
        description="Misafir bilgisi ve tarihleri girin; yalnızca bu tarihlerde boş, satışa açık ve kişi sayısına uygun odalar listelenir."
      />

      <form className="reservation-form" onSubmit={handleSubmit} noValidate>
        <div className="reservation-form__main">
          <section className="card">
            <div className="card__head">
              <h2>
                <span className="step">1</span> Misafir ve tarihler
              </h2>
            </div>
            <div className="form-grid">
              <label className="field field--wide">
                <span className="field__label">Misafir adı soyadı</span>
                <input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  maxLength={120}
                  autoComplete="off"
                  placeholder="Örn. Deniz Örnek (kurgusal)"
                  aria-invalid={touched && !!nameError}
                  aria-describedby="guest-help"
                />
                <span id="guest-help" className={`field__help ${touched && nameError ? 'is-error' : ''}`}>
                  {touched && nameError ? nameError : 'Prototipte yalnızca kurgusal isim kullanın.'}
                </span>
              </label>
              <label className="field">
                <span className="field__label">Giriş tarihi</span>
                <input
                  type="date"
                  value={checkIn}
                  min={today}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCheckIn(v);
                    if (isIsoDate(v) && checkOut <= v) setCheckOut(addDays(v, 1));
                  }}
                />
              </label>
              <label className="field">
                <span className="field__label">Çıkış tarihi</span>
                <input
                  type="date"
                  value={checkOut}
                  min={isIsoDate(checkIn) ? addDays(checkIn, 1) : today}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field__label">Yetişkin sayısı</span>
                <select value={adults} onChange={(e) => setAdults(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} kişi
                    </option>
                  ))}
                </select>
              </label>
              <div className="field field--info">
                <span className="field__label">Konaklama</span>
                <strong>{dateError ? '—' : `${nights} gece`}</strong>
              </div>
            </div>
            {dateError && (
              <div className="notice notice--warn" role="alert">
                {dateError}
              </div>
            )}
          </section>

          <section className="card">
            <div className="card__head">
              <h2>
                <span className="step">2</span> Uygun oda
              </h2>
              {availability.loading ? <Spinner /> : <span className="count">{rooms.length} oda uygun</span>}
            </div>
            {availability.error ? (
              <ErrorPanel error={availability.error} onRetry={availability.reload} />
            ) : dateError ? (
              <EmptyState title="Önce geçerli bir tarih aralığı seçin." />
            ) : !availability.loading && rooms.length === 0 ? (
              <EmptyState title="Bu tarihlerde uygun oda yok.">
                Farklı tarih veya kişi sayısı deneyin. Arızalı odalar ve bu tarihlerde dolu odalar listelenmez.
              </EmptyState>
            ) : (
              <fieldset className="room-choice" disabled={availability.loading || submitting}>
                <legend className="sr-only">Oda seçimi</legend>
                {byType.map((group) => (
                  <div key={group.name} className="room-choice__group">
                    <p className="room-choice__type">
                      {group.name} <small>· en fazla {group.capacity} kişi</small>
                    </p>
                    <div className="room-choice__options">
                      {group.rooms.map((r) => (
                        <label key={r.room_id} className={`room-option ${roomId === r.room_id ? 'is-selected' : ''}`}>
                          <input
                            type="radio"
                            name="room"
                            value={r.room_id}
                            checked={roomId === r.room_id}
                            onChange={() => setRoomId(r.room_id)}
                          />
                          <span className="room-option__no">{r.room_number}</span>
                          <span className="room-option__meta">
                            {r.floor != null ? `${r.floor}. kat` : ''}
                            {r.housekeeping_status === 'kirli' && checkIn === today
                              ? ` · ${HOUSEKEEPING_LABEL.kirli}`
                              : ''}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </fieldset>
            )}
            {touched && roomError && !dateError && <p className="field__help is-error">{roomError}</p>}
          </section>

          <section className="card">
            <div className="card__head">
              <h2>
                <span className="step">3</span> Not <small className="muted">(isteğe bağlı)</small>
              </h2>
            </div>
            <label className="field">
              <span className="sr-only">Not</span>
              <textarea
                rows={3}
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Örn. geç giriş, bebek yatağı isteği"
              />
            </label>
          </section>
        </div>

        <aside className="reservation-form__summary">
          <div className="card summary">
            <h2>Özet</h2>
            <dl>
              <div>
                <dt>Otel</dt>
                <dd>{hotel.name}</dd>
              </div>
              <div>
                <dt>Misafir</dt>
                <dd>{guestName.trim() || '—'}</dd>
              </div>
              <div>
                <dt>Giriş</dt>
                <dd>{isIsoDate(checkIn) ? formatLongDate(checkIn) : '—'}</dd>
              </div>
              <div>
                <dt>Çıkış</dt>
                <dd>{isIsoDate(checkOut) ? formatLongDate(checkOut) : '—'}</dd>
              </div>
              <div>
                <dt>Süre</dt>
                <dd>{nights ? `${nights} gece · ${adults} kişi` : '—'}</dd>
              </div>
              <div>
                <dt>Oda</dt>
                <dd>{selected ? `${selected.room_number} · ${selected.room_type_name}` : '—'}</dd>
              </div>
            </dl>
            {submitError && (
              <div className="notice notice--error" role="alert">
                {submitError}
              </div>
            )}
            <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={submitting}>
              {submitting ? <Spinner label="Kaydediliyor…" /> : 'Rezervasyonu kaydet'}
            </button>
            <Link to={`${base}/rezervasyonlar`} className="btn btn--quiet btn--block">
              Vazgeç
            </Link>
            <p className="hint">
              Fiyat, acente ve ödeme bilgileri bu prototipte henüz yok. Rezervasyon “Onaylı” durumda oluşturulur.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
