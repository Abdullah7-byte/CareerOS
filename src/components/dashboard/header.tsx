"use client";

import {
  Menu,
  User,
  X,
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  FileCheck,
  Settings,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavItem, IconKey, getWorkspaceLabel } from "@/lib/config/navigation";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import LogoutButton from "@/app/dashboard/LogoutButton";

/** Maps the serializable icon key to its Lucide React component. */
const ICON_MAP: Record<IconKey, LucideIcon> = {
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  FileCheck,
  Settings,
};

interface HeaderProps {
  navItems: NavItem[];
  candidateIdentity?: {
    fullName: string | null;
    headline: string | null;
  };
  employerIdentity?: {
    organizationName: string | null;
    organizationWebsite: string | null;
    recruiterName: string | null;
    recruiterTitle: string | null;
  };
}

function AccountPopover({
  identity,
  settingsHref,
  initials,
}: {
  identity: { name: string; detail: string; context: string; organization?: string };
  settingsHref: string;
  initials: string;
}) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!popoverRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Open account menu"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white/80 text-[11px] font-semibold text-foreground shadow-[0_1px_0_rgba(20,24,21,0.02)] transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-60 rounded-xl border border-border bg-surface p-3 shadow-[0_10px_30px_rgba(17,17,17,0.1)]" role="menu">
          <p className="truncate text-sm font-semibold text-foreground">{identity.name}</p>
          <p className="truncate text-xs text-text-secondary">{identity.detail}</p>
          <p className="mt-2 truncate border-t border-border pt-2 text-xs font-medium text-text-muted">
            {identity.organization ?? identity.context}
          </p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <Link href={settingsHref} onClick={() => setOpen(false)} className="text-xs font-medium text-text-secondary hover:text-foreground">Settings</Link>
            <LogoutButton label="Sign out" className="text-xs font-medium text-text-secondary hover:text-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}

export function Header({ navItems, candidateIdentity, employerIdentity }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const settingsHref = navItems.some((item) => item.href.startsWith("/dashboard/candidate"))
    ? "/dashboard/candidate/settings"
    : "/dashboard/employer/settings";
  const workspaceLabel = getWorkspaceLabel(navItems);
  const recruiterInitials = (employerIdentity?.recruiterName || employerIdentity?.organizationName || "Employer")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const candidateInitials = (candidateIdentity?.fullName || "Candidate")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-[#f8f6f3]/90 px-4 sm:px-6 lg:px-8 backdrop-blur-[2px]">
        <div className="flex items-center gap-3 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="h-8 w-8 text-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="flex items-center gap-1.5 text-base font-bold tracking-tight text-foreground">
            <Image src="/careeros-logo.png" alt="CareerOS" width={32} height={32} className="h-8 w-8 shrink-0 object-contain" priority />
            <span className="leading-none opacity-[0.98]">CareerOS</span>
          </span>
        </div>

        <div className="hidden lg:flex flex-1 items-center gap-2">
          <span className="text-[11px] font-medium tracking-[0.12em] text-text-muted uppercase">
            {workspaceLabel}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {employerIdentity ? (
            <AccountPopover
              initials={recruiterInitials}
              settingsHref={settingsHref}
              identity={{
                name: employerIdentity.recruiterName || "Recruiter",
                detail: employerIdentity.recruiterTitle || "Hiring team",
                context: "Employer",
                organization: employerIdentity.organizationName || "Your organization",
              }}
            />
          ) : candidateIdentity ? (
            <AccountPopover
              initials={candidateInitials}
              settingsHref={settingsHref}
              identity={{
                name: candidateIdentity.fullName || "Candidate",
                detail: candidateIdentity.headline || "Career profile",
                context: "Candidate",
              }}
            />
          ) : (
            <Link
              href={settingsHref}
              aria-label="Open account settings"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white/80 text-xs font-semibold text-foreground shadow-[0_1px_0_rgba(20,24,21,0.02)] transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
            >
              <User className="h-4 w-4 text-text-secondary" />
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="motion-interactive fixed inset-0 bg-black/60 backdrop-blur-xs" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="motion-menu relative flex w-full max-w-xs flex-col bg-surface-dark text-white h-full border-r border-white/10">
            <div className="flex h-14 items-center justify-between px-5 border-b border-white/10">
              <span className="flex items-center gap-1.5 text-base font-bold tracking-tight text-white">
                <Image src="/careeros-logo.png" alt="CareerOS" width={32} height={32} className="h-8 w-8 shrink-0 object-contain invert" priority />
                <span className="leading-none opacity-[0.98]">CareerOS</span>
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard/candidate" && pathname.startsWith(`${item.href}/`));
                const Icon = ICON_MAP[item.icon];

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "motion-interactive flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                      isActive
                        ? "bg-white/10 text-white font-medium shadow-xs"
                        : "text-white/60 hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive ? "text-ai-accent" : "text-white/50")} />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
