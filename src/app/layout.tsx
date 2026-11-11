import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Teko } from "next/font/google";
import { BootLoader } from "@/components/layout/BootLoader";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { FloatingHud } from "@/components/layout/FloatingHud";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { id as dict } from "@/data/i18n/id";
import { profile } from "@/data/profile";
import { SITE_URL } from "@/lib/utils";
import "./globals.css";

const teko = Teko({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-teko",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: dict.meta.title,
  description: dict.meta.description,
  applicationName: `${profile.name} — Portofolio`,
  authors: [{ name: profile.name }],
  creator: profile.name,
  keywords: [
    "Zonatan Sihombing",
    "portofolio",
    "web developer Manado",
    "Laravel",
    "Filament",
    "computer vision",
    "Python",
    "UNIMA",
    "Teknik Informatika",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    alternateLocale: ["en_US"],
    url: "/",
    siteName: `${profile.name} — Portofolio`,
    title: dict.meta.title,
    description: dict.meta.description,
    // Gambar pratinjau dibuat otomatis oleh src/app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: dict.meta.title,
    description: dict.meta.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#08070d",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: SITE_URL,
  image: `${SITE_URL}${profile.photo}`,
  jobTitle: profile.role.id,
  email: `mailto:${profile.email}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Manado",
    addressRegion: "Sulawesi Utara",
    addressCountry: "ID",
  },
  alumniOf: { "@type": "CollegeOrUniversity", name: profile.university },
  knowsAbout: [
    "Web Development",
    "Laravel",
    "Filament",
    "Computer Vision",
    "Python",
    "OpenCV",
    "DevOps",
    "UI/UX Design",
    "Artificial Intelligence",
  ],
  sameAs: profile.socials.map((s) => s.url).filter(Boolean),
};

/** Dijalankan sebelum paint: lewati boot loader jika sesi ini sudah pernah boot / reduced motion. */
const bootScript = `try{if(sessionStorage.getItem('zs-booted')||matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('boot-skip')}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${teko.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <noscript>
          <style>{`#boot-loader{display:none!important}[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <div className="bg-atmosphere" aria-hidden />
        <div className="bg-noise" aria-hidden />
        <LanguageProvider>
          <MotionProvider>
            <a
              href="#main"
              className="clip-corner-sm bg-lime text-abyss fixed top-3 left-3 z-[110] -translate-y-24 px-4 py-2 font-mono text-xs font-semibold uppercase focus:translate-y-0"
            >
              {dict.a11y.skip}
            </a>
            <BootLoader />
            <Navbar />
            <main id="main">{children}</main>
            <Footer />
            <FloatingHud />
            <CustomCursor />
            <SmoothScroll />
          </MotionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
