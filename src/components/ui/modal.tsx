"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function Modal({ open, onClose, title, children }: ModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const titleId = "modal-title";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2
            id={titleId}
            className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
          >
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            ✕
          </button>
        </div>
        <div className="text-sm text-zinc-700 dark:text-zinc-300">
          {children}
        </div>
      </div>
    </div>
  );
}
