import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Mono, Cinzel } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ConvexClientProvider } from "@/components/convex-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Divine Word — Free Online Bible",
    template: "%s | Divine Word",
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
  icons: {
    icon: [
      { url: "/icons/favicon_pack/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon_pack/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon_pack/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/favicon_pack/favicon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/icons/favicon_pack/favicon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/favicon_pack/favicon-256x256.png", sizes: "256x256", type: "image/png" },
    ],
    apple: [
      { url: "/icons/favicon_pack/apple-touch-icon-120x120.png", sizes: "120x120" },
      { url: "/icons/favicon_pack/apple-touch-icon-152x152.png", sizes: "152x152" },
      { url: "/icons/favicon_pack/apple-touch-icon-167x167.png", sizes: "167x167" },
      { url: "/icons/favicon_pack/apple-touch-icon-180x180.png", sizes: "180x180" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Divine Word — Free Online Bible",
    description:
      "Read the Bible in a beautiful, distraction-free experience. KJV, WEB, ASV translations.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://www.divineword.app/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "Divine Word",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Divine Word — Free Online Bible",
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
        <meta name="theme-color" content="#c9972b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Divine Word" />
        <meta name="msapplication-TileColor" content="#c9972b" />
        <meta name="msapplication-TileImage" content="/icons/favicon_pack/mstile-150x150.png" />
        <meta name="msapplication-square70x70logo" content="/icons/favicon_pack/mstile-70x70.png" />
        <meta name="msapplication-square150x150logo" content="/icons/favicon_pack/mstile-150x150.png" />
        <meta name="msapplication-square310x310logo" content="/icons/favicon_pack/mstile-310x310.png" />
      </head>
      <body className="min-h-full flex flex-col font-serif">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:font-medium"
        >
          Skip to content
        </a>
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            themes={["light", "dark", "sepia"]}
            enableSystem={false}
          >
            <TooltipProvider>
              <Navbar />
              <main id="main-content" className="flex-1">{children}</main>
              <Footer />
            </TooltipProvider>
            <ServiceWorkerRegister />
          </ThemeProvider>
        </ConvexClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
