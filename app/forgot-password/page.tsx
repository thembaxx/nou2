import { AccountRecovery } from "@/components/account-recovery";
import { transactionalEmailConfigured } from "@/lib/transactional-email";
export const metadata = { title: "Recover your account", robots: { index: false, follow: false } };
export default function Page() { return <div className="page !max-w-xl"><AccountRecovery available={transactionalEmailConfigured()} /></div>; }
