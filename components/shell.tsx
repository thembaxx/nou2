"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useGarage } from "./providers";
import { authClient } from "@/lib/auth-client";
export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useGarage();
  const links = [
    ["/marketplace", "Discover"],
    ["/affordability", "Affordability"],
    ["/compare", "Compare"],
    ["/garage", "My garage"],
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090b0e]/95 backdrop-blur-lg">
      <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between px-5 md:px-12">
        <Link href="/" className="brand" aria-label="Carpur home">
          CARPUR<span>.</span>
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-7 text-sm lg:flex">
          {links.map(([href, label]) => (
            <Link
              aria-current={pathname === href ? "page" : undefined}
              className={pathname === href ? "text-white" : "text-slate-400 hover:text-white"}
              key={href}
              href={href}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href={user ? "/dashboard" : "/sign-in"}
            className="hidden text-xs text-slate-300 sm:block"
          >
            {user ? "Dashboard" : "Sign in"}
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/sell">
              Sell your car <ArrowUpRight />
            </Link>
          </Button>
          <button
            className="p-2 lg:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          aria-label="Mobile navigation"
          className="flex flex-col gap-5 border-t border-white/10 p-6 lg:hidden"
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
            CARPUR<span>.</span>
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
      <p className="mx-auto mt-8 max-w-[1500px] text-xs leading-relaxed text-slate-400">
        Carpur is an independent marketplace. Seller descriptions and prices are supplied by sellers
        and are unverified. Cost projections are estimates, not finance or insurance offers.
        Illustrative vehicles are explicitly labelled and cannot receive enquiries.
      </p>
      {error && <p role="alert">{error}</p>}
    </footer>
  );
}
