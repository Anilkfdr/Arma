import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useMatch, useNavigate } from 'react-router';
import { AccessProvider, useAccess } from '../../auth/AccessProvider';
import { useAuth } from '../../auth/AuthProvider';
import { RequireAuth } from '../../auth/RequireAuth';
import { Logo } from '../../components/Logo';
import { canWriteReservations, ROLE_LABEL } from '../../lib/labels';

export function AppLayout() {
  return (
    <RequireAuth>
      <AccessProvider>
        <Shell />
      </AccessProvider>
    </RequireAuth>
  );
}

function NavIcon({ name }: { name: 'panel' | 'rooms' | 'list' | 'plus' | 'all' | 'hotel' }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true" {...p}>
      {name === 'panel' && <path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-3H4zM14 7h6V4h-6z" />}
      {name === 'rooms' && (
        <>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </>
      )}
      {name === 'list' && <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />}
      {name === 'plus' && <path d="M12 5v14M5 12h14" />}
      {name === 'all' && <path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5" />}
      {name === 'hotel' && <path d="M4 20V6l8-3 8 3v14M9 20v-4h6v4M8 9h.01M12 9h.01M16 9h.01M8 13h.01M12 13h.01M16 13h.01" />}
    </svg>
  );
}

function Shell() {
  const { session, signOut } = useAuth();
  const { hotels, isMultiHotel, findByCode } = useAccess();
  const location = useLocation();
  const navigate = useNavigate();
  const match = useMatch('/uygulama/otel/:hotelCode/*');
  const current = findByCode(match?.params.hotelCode);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const displayName =
    (session?.user.user_metadata?.full_name as string | undefined) ?? session?.user.email ?? 'Kullanıcı';

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      navigate('/giris', { replace: true });
    }
  }

  function switchHotel(code: string) {
    if (!code) return;
    if (code === '__all') {
      navigate('/uygulama/genel');
      return;
    }
    // Aynı alt sayfada kal (ör. odalar → diğer otelin odaları).
    const rest = match?.params['*'] ?? '';
    const section = rest.startsWith('rezervasyonlar') ? 'rezervasyonlar' : rest.startsWith('odalar') ? 'odalar' : '';
    navigate(`/uygulama/otel/${code}${section ? `/${section}` : ''}`);
  }

  const base = current ? `/uygulama/otel/${current.hotel.code}` : null;

  return (
    <div className={`shell ${menuOpen ? 'shell--menu-open' : ''}`}>
      <header className="topbar">
        <button
          type="button"
          className="topbar__menu"
          aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          aria-expanded={menuOpen}
          aria-controls="app-sidebar"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
        <Link to="/uygulama" className="topbar__brand" aria-label="Arma uygulama ana ekranı">
          <Logo className="topbar__logo" />
        </Link>
        <span className="topbar__hotel">{current?.hotel.name ?? (isMultiHotel ? 'Tüm oteller' : '')}</span>
      </header>

      <aside id="app-sidebar" className="sidebar" aria-label="Uygulama menüsü">
        <Link to="/uygulama" className="sidebar__brand" aria-label="Arma uygulama ana ekranı">
          <Logo className="sidebar__logo" />
        </Link>

        {hotels.length > 0 && (
          <div className="sidebar__hotel">
            <span className="sidebar__caption">Çalışılan otel</span>
            {isMultiHotel ? (
              <select
                className="sidebar__select"
                value={current?.hotel.code ?? (location.pathname.startsWith('/uygulama/genel') ? '__all' : '')}
                onChange={(e) => switchHotel(e.target.value)}
                aria-label="Otel seç"
              >
                {!current && !location.pathname.startsWith('/uygulama/genel') && <option value="">Otel seçin…</option>}
                <option value="__all">Tüm oteller (toplu)</option>
                {hotels.map(({ hotel }) => (
                  <option key={hotel.id} value={hotel.code}>
                    {hotel.name}
                  </option>
                ))}
              </select>
            ) : (
              <strong className="sidebar__hotel-name">{hotels[0]!.hotel.name}</strong>
            )}
            {current && <span className="role-chip">{ROLE_LABEL[current.role]}</span>}
          </div>
        )}

        <nav className="sidebar__nav" aria-label="Bölümler">
          {base && current ? (
            <>
              <NavLink to={base} end className="nav-link">
                <NavIcon name="panel" /> Panel
              </NavLink>
              <NavLink to={`${base}/odalar`} className="nav-link">
                <NavIcon name="rooms" /> Odalar
              </NavLink>
              <NavLink to={`${base}/rezervasyonlar`} end className="nav-link">
                <NavIcon name="list" /> Rezervasyonlar
              </NavLink>
              {canWriteReservations(current.role) && (
                <NavLink to={`${base}/rezervasyonlar/yeni`} className="nav-link nav-link--accent">
                  <NavIcon name="plus" /> Yeni rezervasyon
                </NavLink>
              )}
            </>
          ) : (
            hotels.map(({ hotel }) => (
              <NavLink key={hotel.id} to={`/uygulama/otel/${hotel.code}`} className="nav-link">
                <NavIcon name="hotel" /> {hotel.name}
              </NavLink>
            ))
          )}
          {isMultiHotel && (
            <>
              <span className="sidebar__divider" />
              <NavLink to="/uygulama/genel" className="nav-link">
                <NavIcon name="all" /> Tüm oteller
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar__user">
          <span className="sidebar__avatar" aria-hidden="true">
            {displayName.slice(0, 1).toLocaleUpperCase('tr')}
          </span>
          <span className="sidebar__who">
            <strong>{displayName}</strong>
            <small>{session?.user.email}</small>
          </span>
          <button type="button" className="btn btn--ghost-light btn--sm" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? 'Çıkılıyor…' : 'Çıkış yap'}
          </button>
        </div>
      </aside>

      <button
        type="button"
        className="shell__scrim"
        aria-label="Menüyü kapat"
        tabIndex={-1}
        onClick={() => setMenuOpen(false)}
      />

      <main className="main" id="icerik">
        <Outlet />
      </main>
    </div>
  );
}
