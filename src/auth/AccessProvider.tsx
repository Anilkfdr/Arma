import { createContext, useContext, type ReactNode } from 'react';
import { ErrorPanel, LoadingScreen } from '../components/Feedback';
import { fetchMyHotels } from '../lib/api';
import type { HotelAccess } from '../lib/types';
import { useAsync } from '../lib/useAsync';
import { useAuth } from './AuthProvider';

interface AccessContextValue {
  hotels: HotelAccess[];
  isMultiHotel: boolean;
  findByCode: (code: string | undefined) => HotelAccess | undefined;
}

const AccessContext = createContext<AccessContextValue | null>(null);

/**
 * Oturumdaki kullanıcının üyesi olduğu otelleri yükler. Arayüz bu listeyi gezinme için
 * kullanır; asıl erişim sınırı veritabanındaki RLS politikalarıdır.
 */
export function AccessProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { data, error, loading, reload } = useAsync(fetchMyHotels, [userId]);

  if (loading && !data) return <LoadingScreen label="Yetkili oteller yükleniyor…" />;
  if (error) {
    return (
      <div className="page-center">
        <ErrorPanel error={error} onRetry={reload} />
      </div>
    );
  }

  const hotels = data ?? [];
  const value: AccessContextValue = {
    hotels,
    isMultiHotel: hotels.length > 1,
    findByCode: (code) => hotels.find((h) => h.hotel.code === code),
  };
  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess() {
  const ctx = useContext(AccessContext);
  if (!ctx) throw new Error('useAccess, AccessProvider içinde kullanılmalı.');
  return ctx;
}
