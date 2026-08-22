import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { NavItem } from "@/lib/config/navigation";
import { PageTransition } from "./page-transition";

interface AppShellProps {
  children: ReactNode;
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

export function AppShell({ children, navItems, candidateIdentity, employerIdentity }: AppShellProps) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar navItems={navItems} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header navItems={navItems} candidateIdentity={candidateIdentity} employerIdentity={employerIdentity} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
