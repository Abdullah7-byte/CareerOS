export default function Navbar() {
  return (
    <nav>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="text-2xl font-bold tracking-tight">CareerOS</div>

        {/* Navigation */}
        <div className="flex gap-8 text-slate-300">
          <span className="cursor-pointer transition hover:text-white">Features</span>
          <span className="cursor-pointer transition hover:text-white">Pricing</span>
          <span className="cursor-pointer transition hover:text-white">About</span>
          <span className="cursor-pointer transition hover:text-white">Contact</span>
        </div>

        {/* Action */}
        <div>
          <button className="rounded-xl bg-cyan-500 px-5 py-2 text-white transition hover:bg-cyan-600">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}