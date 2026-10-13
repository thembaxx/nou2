import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <div className="page">
      <p className="eyebrow mb-4">Vehicle or page unavailable</p>
      <h1 className="page-title mb-6">
        A Different
        <br />
        Road Ahead.
      </h1>
      <p className="mb-8 text-slate-400">
        This vehicle may have been sold or the page may no longer exist.
      </p>
      <Button asChild>
        <Link href="/marketplace">Explore vehicles</Link>
      </Button>
    </div>
  );
}
