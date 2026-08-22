import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-1.5 text-[15px] font-bold tracking-[-0.04em] text-foreground", className)}>
      <Image src="/careeros-logo.png" alt="CareerOS" width={32} height={32} className="h-8 w-8 shrink-0 object-contain" priority />
      <span className="leading-none opacity-[0.98]">CareerOS</span>
    </Link>
  );
}
