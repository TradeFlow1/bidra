"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: 24, fontFamily: "system-ui" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Something went wrong</h1>
          <p style={{ marginTop: 8, color: "#444" }}>An unexpected error occurred. You can try again.</p>
          <button onClick={() => reset()} style={{ marginTop: 12, padding: "8px 12px", border: "1px solid #111", borderRadius: 8 }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
