import { createBrowserRouter, createHashRouter, Link, type RouteObject } from 'react-router';
import { FullPageMessage } from './components/Feedback';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { AppHome } from './pages/app/AppHome';
import { AppLayout } from './pages/app/AppLayout';
import { HotelScope } from './pages/app/HotelScope';
import { Overview } from './pages/app/Overview';
import { Dashboard } from './pages/app/hotel/Dashboard';
import { NewReservation } from './pages/app/hotel/NewReservation';
import { Reservations } from './pages/app/hotel/Reservations';
import { Rooms } from './pages/app/hotel/Rooms';

function NotFound() {
  return (
    <FullPageMessage
      title="Sayfa bulunamadı"
      action={
        <Link to="/" className="btn btn--primary">
          Ana sayfaya dön
        </Link>
      }
    >
      Aradığınız adres mevcut değil.
    </FullPageMessage>
  );
}

const routes: RouteObject[] = [
  { path: '/', element: <Landing /> },
  { path: '/giris', element: <Login /> },
  {
    path: '/uygulama',
    element: <AppLayout />,
    children: [
      { index: true, element: <AppHome /> },
      { path: 'genel', element: <Overview /> },
      {
        path: 'otel/:hotelCode',
        element: <HotelScope />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'odalar', element: <Rooms /> },
          { path: 'rezervasyonlar', element: <Reservations /> },
          { path: 'rezervasyonlar/yeni', element: <NewReservation /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
  { path: '*', element: <NotFound /> },
];

// Web: temiz adresler (browser). İleride Electron'da dosyadan yüklerken "hash" kullanılabilir.
export const router =
  import.meta.env.VITE_ROUTER_MODE === 'hash' ? createHashRouter(routes) : createBrowserRouter(routes);
