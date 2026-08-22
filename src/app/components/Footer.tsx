import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="px-6 py-7 sm:px-10">
      <div className="flex items-center justify-between border-t border-black/[0.07] pt-6">
        <Logo />
        <div className="text-[11px] text-text-muted">
          © {new Date().getFullYear()} CareerOS
        </div>
      </div>
    </footer>
  );
}
