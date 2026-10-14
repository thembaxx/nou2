"use client";
import Link from "next/link";
import { ThemeToggle, ThemePreferenceControl } from "./theme-preferences";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { ListIcon } from "@phosphor-icons/react/dist/ssr/List";
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { Button } from "./ui/button";
import { useGarage } from "./providers";
import { VisualPreferenceControl, useDevicePreferences } from "./device-preferences";
export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useGarage();
  const { tier, saveData } = useDevicePreferences();
  const links = [
    ["/marketplace", "New Cars"],
    ["/marketplace?inventory=sellers&condition=USED", "Used Cars"],
    ["/affordability", "Affordability"],
    ["/compare", "Compare"],
    ["/garage", "My Garage"],
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 site-header">
      <div className="header-inner mx-auto flex max-w-[1760px] items-center justify-between gap-3">
        <Link href="/" className="brand" aria-label="Carpur home">
          Carpur<span>.</span>
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-7 text-sm lg:flex">
          {links.map(([href, label]) => (
            <Link
              prefetch={tier === "enhanced" && !saveData ? undefined : false}
              aria-current={pathname === href ? "page" : undefined}
              className={pathname === href ? "text-white" : "text-slate-400 hover:text-white"}
              key={href}
              href={href}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-3">
          <ThemeToggle />
          <Link
            href={user ? "/dashboard" : "/sign-in"}
            className="hidden text-xs text-slate-300 sm:block"
          >
            {user ? "Dashboard" : "Sign in"}
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/sell">
              <span className="hidden min-[360px]:inline">Sell Your Car</span>
              <span className="min-[360px]:hidden">Sell</span>
              <ArrowUpRightIcon aria-hidden="true" focusable="false" />
            </Link>
          </Button>
          <button
            className="flex size-11 shrink-0 items-center justify-center rounded-xl lg:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <XIcon aria-hidden="true" focusable="false" size={24} />
            ) : (
              <ListIcon aria-hidden="true" focusable="false" size={24} />
            )}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="mobile-nav flex flex-col gap-2 border-t border-white/10 p-6 lg:hidden"
        >
          {[...links, [user ? "/dashboard" : "/sign-in", user ? "Dashboard" : "Sign in"]].map(
            ([href, label]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>
                {label}
              </Link>
            ),
          )}
        </nav>
      )}
    </header>
  );
}
export function Footer() {
  const { user } = useGarage();
  const [error, setError] = useState("");
  return (
    <footer className="border-t border-white/15 px-6 py-12 md:px-16">
      <div className="mx-auto flex max-w-[1500px] flex-wrap justify-between gap-8">
        <div>
          <Link href="/" className="brand">
            Carpur<span>.</span>
          </Link>
          <p className="mt-3 text-xs text-slate-400">
            Beyond the price tag. Built for South Africa.
          </p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-slate-300">
          <Link href="/sources">Data & assumptions</Link>
          <Link href="/privacy">Privacy & safety</Link>
          {user && (
            <button
              onClick={async () => {
                const { authClient } = await import("@/lib/auth-client");
                const result = await authClient.signOut();
                if (result.error) setError("Could not sign out. Try again.");
                else window.location.assign("/");
              }}
            >
              Sign out
            </button>
          )}
        </div>
      </div>
      <div className="mx-auto mt-8 flex flex-wrap gap-5 max-w-[1500px]">
        <ThemePreferenceControl />
        <VisualPreferenceControl />
      </div>
      <p className="mx-auto mt-8 max-w-[1500px] text-xs leading-relaxed text-slate-400">
        Carpur is an independent marketplace. Seller descriptions and prices are supplied by sellers
        and are unverified. Cost projections are estimates, not finance or insurance offers.
        Illustrative vehicles are explicitly labelled and cannot receive enquiries.
      </p>
      {error && <p role="alert">{error}</p>}
    </footer>
  );
}
