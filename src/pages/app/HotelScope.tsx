import { Link, Outlet, useOutletContext, useParams } from 'react-router';
import { useAccess } from '../../auth/AccessProvider';
import { EmptyState } from '../../components/Feedback';
import type { HotelAccess } from '../../lib/types';

/**
 * Adresteki otel kodunu kullanıcının üyelikleriyle eşleştirir. Üyelik yoksa sayfa açılmaz.
 * Bu yalnızca gezinme kolaylığıdır: adres elle değiştirilse bile veritabanı (RLS) başka
 * otelin kayıtlarını döndürmez.
 */
export function HotelScope() {
  const { hotelCode } = useParams();
  const { findByCode } = useAccess();
  const access = findByCode(hotelCode);

  if (!access) {
    return (
      <div className="page">
        <EmptyState title="Bu otele erişim yetkiniz yok">
          Adres yanlış olabilir ya da hesabınız bu otele bağlı değil. <Link to="/uygulama">Yetkili otellerinize dönün</Link>.
        </EmptyState>
      </div>
    );
  }
  return <Outlet context={access} />;
}

export function useHotel() {
  return useOutletContext<HotelAccess>();
}
