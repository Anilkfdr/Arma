import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { FullPageMessage, LoadingScreen } from '../components/Feedback';
import { useAuth } from './AuthProvider';

/** Korunan sayfalar: oturum yoksa giriş sayfasına, döndükten sonra istenen adrese yönlendirir. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'unconfigured') {
    return (
      <FullPageMessage title="Kurulum tamamlanmamış">
        Supabase bağlantı ayarları bulunamadı. <code>.env.local</code> dosyasına{' '}
        <code>VITE_SUPABASE_URL</code> ve <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> değerlerini girip geliştirme
        sunucusunu yeniden başlatın.
      </FullPageMessage>
    );
  }
  if (status === 'loading') return <LoadingScreen label="Oturum kontrol ediliyor…" />;
  if (status === 'signedOut') {
    return <Navigate to="/giris" replace state={{ from: location.pathname + location.search }} />;
  }
  return <>{children}</>;
}
