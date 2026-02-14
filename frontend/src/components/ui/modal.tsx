import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  primaryLabel?: string;
  onPrimary?: () => void;
  footer?: ReactNode;
  children: ReactNode;
  widthClass?: string;
}

export function Modal({
  open,
  title,
  description,
  onClose,
  primaryLabel,
  onPrimary,
  footer,
  children,
  widthClass = 'max-w-2xl',
}: ModalProps) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-10">
      <div className={`w-full rounded-xl border bg-card p-6 shadow-2xl ${widthClass}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">{title}</h3>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>

        <div className="mt-4 space-y-4">{children}</div>

        <div className="mt-6 flex items-center justify-end gap-3">
          {footer}
          {primaryLabel && onPrimary ? (
            <Button onClick={onPrimary}>{primaryLabel}</Button>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
