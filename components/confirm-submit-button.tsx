"use client";

import React from "react";

export default function ConfirmSubmitButton(props: {
  confirmMessage: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const { confirmMessage, style, disabled, children } = props;

  return (
    <button
      type="submit"
      style={style}
      disabled={disabled}
      onClick={(e) => {
        const ok = confirm(confirmMessage);
        if (!ok) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
