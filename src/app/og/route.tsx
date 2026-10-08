import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

/**
 * Share-card images, generated per request.
 *
 *   /og                              the site card
 *   /og?title=...&subtitle=...       any page
 *
 * Declaring `twitter:card: summary_large_image` and shipping no image makes
 * every shared link render as a blank card. `socialMetadata()` points every
 * page here so that can't happen.
 */

export const runtime = "nodejs";

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(" ", max)).trimEnd() + "…";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = truncate(searchParams.get("title") ?? SITE_NAME, 90);
  const subtitle = truncate(searchParams.get("subtitle") ?? SITE_DESCRIPTION, 160);
  const titleSize = title.length < 30 ? 76 : title.length < 60 ? 60 : 48;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0a0a0a 0%, #171717 100%)",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#fafafa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 32 32">
              <path d="M18.5 7 10 18h5.5L13.5 25 22 14h-5.5z" fill="#0a0a0a" />
            </svg>
          </div>
          <div style={{ fontSize: 26, letterSpacing: 2, textTransform: "uppercase", opacity: 0.7 }}>
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: titleSize, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1 }}>
            {title}
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.4, opacity: 0.65, maxWidth: 960 }}>{subtitle}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
