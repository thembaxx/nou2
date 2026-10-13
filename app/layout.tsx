import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import RegisterSW from "./register-sw";
import { Header, Footer } from "@/components/shell";
import { Providers } from "@/components/providers";
import { currentSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Carpur | Find Your Next Car", template: "%s | Carpur" },
  description:
    "A smarter South African automotive marketplace. Discover vehicles, compare ownership costs and understand your budget before you buy.",
  applicationName: "Carpur",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon-192.png" },
  openGraph: {
    title: "Carpur | Find Your Next Car",
    description: "Discover. Decide. Drive. A smarter automotive marketplace for South Africa.",
    type: "website",
    locale: "en_ZA",
    images: [{ url: "/images/hero.webp", width: 1600, height: 1000 }],
  },
};
export const viewport: Viewport = {
  themeColor: "#090b0e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialSaveData = (await headers()).get("Save-Data") === "on";
  const session = await currentSession().catch(() => null);
  const user = session
    ? { id: session.user.id, name: session.user.name, email: session.user.email }
    : null;
  const saved = user
    ? await getDb()
        .savedVehicle.findMany({ where: { userId: user.id }, select: { listingId: true } })
        .catch(() => [])
    : [];
  return (
    <html
      lang="en-ZA"
      data-visual-tier={initialSaveData ? "reduced" : "standard"}
      data-motion="light"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("carpur-theme-v1");var r=t==="light"||t==="dark"?t:matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=r;document.documentElement.style.colorScheme=r;}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Providers
          user={user}
          savedIds={saved.map((v) => v.listingId)}
          initialSaveData={initialSaveData}
        >
          <RegisterSW />
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
