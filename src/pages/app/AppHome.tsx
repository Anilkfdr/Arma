import { Link, Navigate } from 'react-router';
import { useAccess } from '../../auth/AccessProvider';
import { EmptyState, ErrorPanel, Spinner } from '../../components/Feedback';
import { PageHeader } from '../../components/PageHeader';
import { fetchDaySummaries } from '../../lib/api';
import { ROLE_LABEL } from '../../lib/labels';
import { useAsync } from '../../lib/useAsync';
import { occupancyPercent } from './metrics';

/** Girişten sonraki ilk ekran: tek otelde doğrudan panele, birden çok otelde seçim ekranına gider. */
export function AppHome() {
  const { hotels } = useAccess();

  if (hotels.length === 0) {
    return (
      <div className="page">
        <EmptyState title="Hesabınız henüz bir otele bağlı değil">
          Giriş başarılı, ancak hesabınız için otel yetkisi tanımlanmamış. Yöneticinizden yetki istemeniz gerekiyor.
        </EmptyState>
      </div>
    );
  }
  if (hotels.length === 1) return <Navigate to={`/uygulama/otel/${hotels[0]!.hotel.code}`} replace />;
  return <HotelPicker />;
}

function HotelPicker() {
  const { hotels } = useAccess();
  const summaries = useAsync(() => fetchDaySummaries(), []);
  const byHotel = new Map(summaries.data?.map((s) => [s.hotel_id, s]));

  return (
    <div className="page">
      <PageHeader
        eyebrow="Otel seçimi"
        title="Hangi otelde çalışacaksınız?"
        description="Hesabınız birden çok otele yetkili. Bir oteli açabilir veya tüm otellerin toplu özetine geçebilirsiniz."
      />
      {summaries.error ? <ErrorPanel error={summaries.error} onRetry={summaries.reload} /> : null}
      <div className="picker">
        {hotels.map(({ hotel, role }) => {
          const s = byHotel.get(hotel.id);
          return (
            <Link key={hotel.id} to={`/uygulama/otel/${hotel.code}`} className="picker__card">
              <span className="picker__top">
                <span className="picker__name">{hotel.name}</span>
                <span className="role-chip role-chip--light">{ROLE_LABEL[role]}</span>
              </span>
              {s ? (
                <span className="picker__stats">
                  <span>
                    <strong>%{occupancyPercent(s)}</strong> bu gece doluluk
                  </span>
                  <span>
                    <strong>{s.arrivals_today}</strong> bugün giriş
                  </span>
                  <span>
                    <strong>{s.total_rooms}</strong> oda
                  </span>
                </span>
              ) : (
                summaries.loading && <Spinner />
              )}
              <span className="picker__go">Oteli aç →</span>
            </Link>
          );
        })}
        <Link to="/uygulama/genel" className="picker__card picker__card--all">
          <span className="picker__top">
            <span className="picker__name">Tüm oteller</span>
          </span>
          <span className="picker__desc">Doluluk, giriş ve çıkışları otel otel karşılaştırın; toplamları görün.</span>
          <span className="picker__go">Toplu özete geç →</span>
        </Link>
      </div>
    </div>
  );
}
