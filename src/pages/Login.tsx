import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthProvider';
import { Spinner } from '../components/Feedback';
import { Logo } from '../components/Logo';
import { toUserMessage } from '../lib/errors';

export function Login() {
  const { status, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const target = from && from.startsWith('/uygulama') ? from : '/uygulama';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === 'signedIn') return <Navigate to={target} replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    if (!email.trim() || !password) {
      setError('E-posta ve şifre gerekli.');
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate(target, { replace: true });
    } catch (err) {
      setError(toUserMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="auth">
      <aside className="auth__brand">
        <div className="auth__arches" aria-hidden="true">
          <span />
          <span />
        </div>
        <Link to="/" className="auth__logo-link" aria-label="Arma ana sayfa">
          <Logo className="auth__logo" />
        </Link>
        <div className="auth__brand-copy">
          <h2>Çalışan girişi</h2>
          <p>
            Giriş yaptıktan sonra yalnızca yetkili olduğunuz otelleri görürsünüz. Merkez ofis hesapları birden çok
            oteli seçebilir.
          </p>
        </div>
        <p className="auth__brand-foot">Prototip sürüm · kurgusal veri</p>
      </aside>

      <main className="auth__panel">
        <div className="auth__card">
          <Link to="/" className="auth__back">
            ← Ana sayfa
          </Link>
          <Logo className="auth__logo-mobile" />
          <h1>Arma’ya giriş</h1>
          <p className="auth__lead">Size verilen çalışan hesabıyla giriş yapın.</p>

          {status === 'unconfigured' ? (
            <div className="notice notice--warn" role="alert">
              <strong>Kurulum tamamlanmamış.</strong>
              <span>
                Supabase bağlantı ayarları bulunamadı. <code>.env.local</code> dosyasını doldurup geliştirme
                sunucusunu yeniden başlatın.
              </span>
            </div>
          ) : (
            <form className="form" onSubmit={handleSubmit} noValidate>
              <label className="field">
                <span className="field__label">E-posta</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  required
                  autoFocus
                />
              </label>
              <label className="field">
                <span className="field__label">Şifre</span>
                <span className="field__with-action">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                    required
                  />
                  <button
                    type="button"
                    className="field__action"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? 'Gizle' : 'Göster'}
                  </button>
                </span>
              </label>

              {error && (
                <div className="notice notice--error" role="alert">
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={submitting}>
                {submitting ? <Spinner label="Giriş yapılıyor…" /> : 'Giriş yap'}
              </button>
            </form>
          )}

          <p className="auth__hint">
            Bu prototipte herkese açık hesap oluşturma yoktur. Hesaplar yönetici tarafından açılır.
          </p>
        </div>
      </main>
    </div>
  );
}
