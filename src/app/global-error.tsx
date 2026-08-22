"use client"; // Error boundaries must be Client Components

// Root-level fallback for errors thrown in the root layout itself (rare) and
// as the last-resort catch-all beneath any route segment that has no closer
// error.tsx of its own. This replaces the entire document when active, so it
// must define its own <html>/<body> — Next does NOT include globals.css or
// the app's fonts here, which is why this uses inline styles rather than the
// app's usual Tailwind classes (see Next's docs on global-error.js).
export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          background: "#fbfaf7",
          color: "#1a2420",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            textAlign: "center",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "32px 24px",
            boxShadow: "0 8px 24px -8px rgba(10,40,35,0.12)",
          }}
        >
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#052622", margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: "12px", fontSize: "14px", lineHeight: 1.6, color: "#475569" }}>
            We hit an unexpected error loading this page. Please try again, or
            contact the Trust if the problem continues.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: "20px",
              display: "inline-block",
              borderRadius: "9999px",
              background: "#0f6355",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "14px",
              padding: "10px 24px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
