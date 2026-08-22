import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";

export default function Navbar() {
  return (
    <nav className="px-5 pt-5 sm:px-8 sm:pt-8 lg:px-10">
      <div className="flex items-center justify-between">
        <Logo />

        <div className="flex items-center gap-3 sm:gap-5">
          <Link href="/login" className="text-xs font-medium text-text-secondary transition-colors hover:text-foreground">
            Sign In
          </Link>
          <Link href="/register">
            <Button size="sm" className="h-8 rounded-full px-3.5 text-xs sm:px-4">Get started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
