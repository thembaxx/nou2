import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "./register-sw";
import { Header, Footer } from "@/components/shell";
import { Providers } from "@/components/providers";
import { currentSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Carpur | Beyond the price tag", template: "%s | Carpur" },
  description:
    "A smarter South African automotive marketplace. Discover vehicles, compare ownership costs and understand your budget before you buy.",
  applicationName: "Carpur",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon-192.png" },
  openGraph: {
    title: "Carpur | Beyond the price tag",
    description: "Discover. Decide. Drive. A smarter automotive marketplace for South Africa.",
    type: "website",
    locale: "en_ZA",
    images: [{ url: "/images/hero.webp", width: 1600, height: 1000 }],
  },
};
export const viewport: Viewport = { themeColor: "#090b0e", width: "device-width", initialScale: 1 };
export default async function RootLayout({ children }: { children: React.ReactNode }) {
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
    <html lang="en-ZA">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Providers user={user} savedIds={saved.map((v) => v.listingId)}>
          <RegisterSW />
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
