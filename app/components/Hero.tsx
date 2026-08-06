export default function Hero() {
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center px-6">
      {/* Main Container */}
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 lg:flex-row">

        {/* Left Side */}
        <div className="flex-1 text-left">
          <div className="mb-4 inline-flex gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2">
            <span>AI Powered</span>
            <span>Resume Builder</span>
          </div>

          <h1 className="mb-6 max-w-4xl text-6xl font-bold tracking-tight">
            Your AI Career
            <span className="block text-cyan-400">
              Operating System
            </span>
          </h1>

          <p className="max-w-2xl text-lg text-slate-400">
            Build ATS-optimized resumes, discover better job opportunities,
            track every application, and accelerate your career with AI.
          </p>

          <div className="mt-10 flex justify-start gap-4">
            <button className="rounded-xl bg-cyan-500 px-6 py-3 text-white hover:bg-cyan-600">
              Get Started
            </button>

            <button className="rounded-xl border border-slate-600 px-6 py-3 text-white hover:bg-slate-800">
              Live Demo
            </button>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1">
          <div className="max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-semibold">Abdullah Aftab</h2>

            <p className="mt-1 text-slate-400">
              Full Stack Developer
            </p>

            <div className="mt-6 space-y-4">
              <div className="h-3 rounded bg-slate-700"></div>
              <div className="h-3 w-3/4 rounded bg-slate-700"></div>

              <div className="pt-2">
                <div className="mb-2 h-2 w-24 rounded bg-cyan-500"></div>
                <div className="h-3 rounded bg-slate-700"></div>
              </div>

              <div className="pt-2">
                <div className="mb-2 h-2 w-20 rounded bg-cyan-500"></div>
                <div className="h-3 rounded bg-slate-700"></div>
                <div className="mt-2 h-3 w-4/5 rounded bg-slate-700"></div>
              </div>

              <div className="pt-2">
                <div className="mb-2 h-2 w-28 rounded bg-cyan-500"></div>
                <div className="flex gap-2">
                  <div className="rounded-full bg-cyan-500 px-3 py-1 text-xs text-white">
                    React
                  </div>

                  <div className="rounded-full bg-cyan-500 px-3 py-1 text-xs text-white">
                    Next.js
                  </div>

                  <div className="rounded-full bg-cyan-500 px-3 py-1 text-xs text-white">
                    TypeScript
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}