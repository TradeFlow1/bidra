﻿"use client";

import React, { useRef, useState } from "react";
import BdModal from "@/components/bd-modal";

export default function ConfirmSubmitButton({
  children,
  confirmMessage,
  onConfirm,
  className,
  style,
  disabled,
}: {
  children: React.ReactNode;
  confirmMessage: string;
  onConfirm?: () => void | Promise<void>;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function doConfirm() {
    setBusy(true);
    try {
      if (onConfirm) {
        await onConfirm();
      } else {
        // Back-compat: when used inside a <form>, submit after confirmation.
        const form = btnRef.current
          ? (btnRef.current.closest("form") as HTMLFormElement | null)
          : null;

        if (form) {
          try {
            (form as any).requestSubmit ? (form as any).requestSubmit() : form.submit();
          } catch {
            try { form.submit(); } catch {}
          }
        }
      }

      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={className}
        style={style}
        disabled={!!disabled || busy}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>

      <BdModal
        open={open}
        title="Please confirm"
        onClose={() => (busy ? null : setOpen(false))}
        onConfirm={doConfirm}
        confirmText={busy ? "Working…" : "Confirm"}
        cancelText="Cancel"
        confirmDisabled={busy}
      >
        {confirmMessage}
      </BdModal>
    </>
  );
}
