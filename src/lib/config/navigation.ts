// NOTE: Icon keys are plain strings so this config is fully serializable and
// safe to pass from a Server Component to a Client Component as a prop.
// The actual Lucide icon components are resolved on the client side in Sidebar.

export type IconKey =
  | "LayoutDashboard"
  | "FileText"
  | "Briefcase"
  | "Users"
  | "FileCheck"
  | "Settings";

export interface NavItem {
  title: string;
  href: string;
  icon: IconKey;
}

export function isEmployerNavigation(navItems: NavItem[]) {
  return navItems.some((item) => item.href.startsWith("/dashboard/employer"));
}

export function getWorkspaceLabel(navItems: NavItem[]) {
  return isEmployerNavigation(navItems) ? "Platform / Employer Workspace" : "Platform / Candidate Workspace";
}

export function getModeLabel(navItems: NavItem[]) {
  return isEmployerNavigation(navItems) ? "Employer Mode" : "Candidate Mode";
}

export const candidateNavigation: NavItem[] = [
  { title: "Dashboard", href: "/dashboard/candidate", icon: "LayoutDashboard" },
  { title: "Resume Builder", href: "/dashboard/candidate/resume", icon: "FileText" },
  { title: "Job Board", href: "/dashboard/candidate/jobs", icon: "Briefcase" },
  { title: "Applications", href: "/dashboard/candidate/applications", icon: "FileCheck" },
  { title: "Settings", href: "/dashboard/candidate/settings", icon: "Settings" },
];

export const recruiterNavigation: NavItem[] = [
  { title: "Dashboard", href: "/dashboard/employer", icon: "LayoutDashboard" },
  { title: "Manage Jobs", href: "/dashboard/employer/jobs", icon: "Briefcase" },
  { title: "Candidates", href: "/dashboard/employer/candidates", icon: "Users" },
  { title: "Settings", href: "/dashboard/employer/settings", icon: "Settings" },
];
