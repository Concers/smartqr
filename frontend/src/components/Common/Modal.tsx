import React from 'react';
import { Button } from './Button';

export type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 sm:p-6">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />

        <div className="relative w-full max-w-lg max-h-[90vh] rounded-lg bg-white shadow-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
            <div className="text-base font-semibold text-slate-900">{title}</div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Kapat
            </Button>
          </div>

          <div className="px-4 py-4 flex-1 overflow-y-auto">{children}</div>

          {footer ? <div className="border-t px-4 py-3 shrink-0">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
