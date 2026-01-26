"use client";

import React from "react";

type Props = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onClose: () => void;
  confirmDisabled?: boolean;
};

export default function BdModal({
  open,
  title,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onClose,
  confirmDisabled,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-md bd-card p-5 shadow-xl">
        <div className="text-lg font-extrabold bd-ink">{title}</div>
        <div className="mt-3 text-sm bd-ink2">{children}</div>

        <div className="mt-5 flex flex-wrap gap-2 justify-end">
          <button type="button" className="bd-btn bd-btn-ghost" onClick={onClose}>
            {cancelText}
          </button>
          {onConfirm ? (
            <button
              type="button"
              className="bd-btn bd-btn-primary"
              onClick={onConfirm}
              disabled={!!confirmDisabled}
            >
              {confirmText}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
