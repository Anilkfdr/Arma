import type { ReactNode } from 'react';
import { toUserMessage } from '../lib/errors';
import { Logo } from './Logo';

export function Spinner({ label }: { label?: string }) {
  return (
    <span className="spinner" role="status" aria-live="polite">
      <span className="spinner__ring" aria-hidden="true" />
      {label ? <span className="spinner__label">{label}</span> : <span className="sr-only">Yükleniyor</span>}
    </span>
  );
}

export function LoadingScreen({ label = 'Yükleniyor…' }: { label?: string }) {
  return (
    <div className="page-center">
      <Spinner label={label} />
    </div>
  );
}

export function FullPageMessage({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="page-center">
      <div className="message-card">
        <Logo className="message-card__logo" />
        <h1>{title}</h1>
        <p>{children}</p>
        {action}
      </div>
    </div>
  );
}

export function ErrorPanel({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="notice notice--error" role="alert">
      <strong>Veriler yüklenemedi.</strong>
      <span>{toUserMessage(error)}</span>
      {onRetry && (
        <button type="button" className="btn btn--ghost btn--sm" onClick={onRetry}>
          Tekrar dene
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <p className="empty__title">{title}</p>
      {children && <p className="empty__body">{children}</p>}
    </div>
  );
}
