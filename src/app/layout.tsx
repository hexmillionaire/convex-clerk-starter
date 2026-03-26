import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Mono, Cinzel } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ServiceWorkerRegister } from "@/components/sw-register";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400"],
});

const cinzel = Cinzel({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "The Word — Free Online Bible",
    template: "%s | The Word",
  },
  description:
    "A free, beautiful, distraction-free Bible website. Read scripture in KJV, WEB, and ASV with study tools, bookmarks, and reading plans.",
  keywords: [
    "Bible",
    "KJV",
    "scripture",
    "free Bible",
    "online Bible",
    "Bible reading",
    "verse of the day",
  ],
  openGraph: {
    title: "The Word — Free Online Bible",
    description:
      "Read the Bible in a beautiful, distraction-free experience. KJV, WEB, ASV translations.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Word — Free Online Bible",
    description:
      "Read the Bible in a beautiful, distraction-free experience.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cormorant.variable} ${dmMono.variable} ${cinzel.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#c9972b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col font-serif">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          themes={["light", "dark", "sepia"]}
          enableSystem={false}
        >
          <TooltipProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </TooltipProvider>
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
