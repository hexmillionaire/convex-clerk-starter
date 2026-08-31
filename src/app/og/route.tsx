import { ImageResponse } from "next/og";
import { getBookBySlug } from "@/lib/bible-data";
import { getChapter, getVerse } from "@/lib/kjv";

/**
 * Share images.
 *
 * The site declared `twitter:card: summary_large_image` and then shipped no
 * image on any subpage, so every link posted anywhere rendered as a blank
 * card. Each page now gets its own, set in the site's own gold-and-serif
 * treatment, with the scripture as the subject.
 *
 *   /og?book=john&chapter=3&verse=16   a verse
 *   /og?book=john&chapter=3            a chapter
 *   /og?title=...&subtitle=...         anything else
 */

export const runtime = "nodejs";

const GOLD = "#c9972b";
const INK = "#211c14";
const PAPER = "#faf6ee";
const MUTED = "#6b6153";

/** Longer passages step down in size so they still fit the card. */
function bodySize(length: number): number {
  if (length < 120) return 60;
  if (length < 240) return 48;
  if (length < 400) return 38;
  return 30;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(" ", max)).trimEnd() + "…";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const bookSlug = searchParams.get("book");
  const chapterParam = parseInt(searchParams.get("chapter") ?? "", 10);
  const verseParam = parseInt(searchParams.get("verse") ?? "", 10);

  let eyebrow = "Divine Word";
  let body = searchParams.get("title") ?? "A free, beautiful, distraction-free Bible";
  let reference = searchParams.get("subtitle") ?? "King James Version";
  let quoted = false;

  const book = bookSlug ? getBookBySlug(bookSlug) : undefined;

  if (book && Number.isInteger(chapterParam)) {
    if (Number.isInteger(verseParam)) {
      const text = await getVerse(book.slug, chapterParam, verseParam);
      if (text) {
        body = truncate(text, 460);
        reference = `${book.name} ${chapterParam}:${verseParam}`;
        eyebrow = "King James Version";
        quoted = true;
      }
    } else {
      const verses = await getChapter(book.slug, chapterParam);
      if (verses?.length) {
        body = truncate(verses[0].text, 320);
        reference = `${book.name} ${chapterParam}`;
        eyebrow = `${verses.length} verses · King James Version`;
        quoted = true;
      }
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          padding: "72px 80px",
          // A warm vignette so the card doesn't read as flat off-white
          backgroundImage: `radial-gradient(circle at 50% 0%, #fffdf8 0%, ${PAPER} 55%, #f2ead9 100%)`,
        }}
      >
        {/* Rule + eyebrow */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", width: 96, height: 5, background: GOLD }} />
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            {eyebrow}
          </div>
        </div>

        {/* Scripture */}
        <div
          style={{
            display: "flex",
            fontSize: bodySize(body.length),
            lineHeight: 1.34,
            color: INK,
            fontStyle: quoted ? "italic" : "normal",
            maxWidth: 960,
          }}
        >
          {quoted ? `“${body}”` : body}
        </div>

        {/* Reference + wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", fontSize: 34, color: GOLD, letterSpacing: 1 }}>
            {reference}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", fontSize: 24, color: GOLD }}>✦</div>
            <div style={{ display: "flex", fontSize: 24, color: MUTED, letterSpacing: 2 }}>
              divineword.app
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        // The KJV doesn't change, so a given card is permanently valid.
        "Cache-Control": "public, immutable, no-transform, max-age=31536000",
      },
    }
  );
}
