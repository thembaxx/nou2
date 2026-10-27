import { AccountRecovery } from "@/components/account-recovery";
import { transactionalEmailConfigured } from "@/lib/transactional-email";
import Link from "next/link";
export const metadata = { title: "Reset password", robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token, error } = await searchParams;
  return <div className="page !max-w-xl">{token && token.length <= 2048 && !error ? <AccountRecovery available={transactionalEmailConfigured()} token={token} /> : <p className="notice">This reset link is missing or has expired. <Link href="/forgot-password">Request another link</Link>.</p>}</div>;
}
