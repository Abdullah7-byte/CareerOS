export default function Footer() {
  return (
    <footer className="border-t border-slate-800 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">CareerOS</div>

          <div className="flex gap-6 text-slate-400">
            <span className="cursor-pointer transition hover:text-white">About</span>
            <span className="cursor-pointer transition hover:text-white">Features</span>
            <span className="cursor-pointer transition hover:text-white">Contact</span>
          </div>
        </div>

        <div className="mt-8 text-sm text-slate-500">
          © 2026 CareerOS
        </div>
      </div>
    </footer>
  );
}