"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  FileCheck,
  Settings,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavItem, IconKey, getModeLabel } from "@/lib/config/navigation";

/** Maps the serializable icon key to its Lucide React component. */
const ICON_MAP: Record<IconKey, LucideIcon> = {
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  FileCheck,
  Settings,
};

interface SidebarProps {
  navItems: NavItem[];
}

export function Sidebar({ navItems }: SidebarProps) {
  const pathname = usePathname();
  const modeLabel = getModeLabel(navItems);

  return (
    <div className="hidden lg:flex w-60 flex-col border-r border-white/8 bg-[#1d2926] text-white h-full select-none shadow-[inset_-1px_0_0_rgba(255,255,255,0.02)]">
      <div className="flex h-16 items-center justify-between border-b border-white/8 px-5">
        <div className="flex items-center gap-1.5">
          <Image src="/careeros-logo.png" alt="CareerOS" width={32} height={32} className="h-8 w-8 shrink-0 object-contain invert" priority />
          <span className="leading-none text-base font-semibold tracking-tight text-white opacity-[0.98]">CareerOS</span>
        </div>
        <span className="rounded bg-white/8 px-1.5 py-0.5 text-[10px] font-mono font-medium text-white/65">
          PRO
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard/candidate" &&
              item.href !== "/dashboard/employer" &&
              pathname.startsWith(`${item.href}/`));
          const Icon = ICON_MAP[item.icon];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "motion-interactive group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ring-1 ring-inset transition-colors",
                isActive
                  ? "bg-white/[0.06] text-white ring-white/10 shadow-[0_1px_0_rgba(0,0,0,0.12)]"
                  : "text-white/60 ring-transparent hover:bg-white/[0.02] hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors duration-150",
                  isActive ? "text-white" : "text-white/50 group-hover:text-white"
                )}
              />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-between border-t border-white/8 px-4 py-3 text-[11px] text-white/50">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400/80" />
          <span className="font-medium text-white/70">{modeLabel}</span>
        </div>
      </div>
    </div>
  );
}
