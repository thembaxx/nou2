import { AuthForm } from "@/components/auth-form";
import { authConfigured } from "@/lib/auth";
import Link from "next/link";
export const metadata = { title: "Sign in", robots: { index: false, follow: false } };
export default function Page() {
  return (
    <div className="page !max-w-xl">
      <p className="eyebrow mb-4">Your Carpur</p>
      <h1 className="page-title mb-8">
        LET’S GET
        <br />
        YOU MOVING.
      </h1>
      <AuthForm available={authConfigured()} />
      <Link href="/privacy" className="mt-6 inline-block text-sm text-blue-300">
        Privacy & marketplace terms
      </Link>
    </div>
  );
}
