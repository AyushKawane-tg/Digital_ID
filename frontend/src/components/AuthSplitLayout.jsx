import CompanyLogo from "./CompanyLogo.jsx";

const HIGHLIGHTS = [
  { value: "900+", label: "Companies trusted worldwide" },
  { value: "250+", label: "Experts across 4 CoEs" },
  { value: "20+", label: "Countries transformed" },
  { value: "99.9%", label: "Unified SLA coverage" },
];

const SERVICES = ["Cloud & IT", "AI Solutions", "DevOps", "Migration"];

function AuthBrandPanel() {
  return (
    <aside className="relative flex min-h-[320px] flex-col justify-between overflow-hidden bg-[#061833] px-8 py-10 text-white lg:min-h-screen lg:w-[48%] lg:px-12 lg:py-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 10% 20%, rgba(0,136,204,0.35), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 80%, rgba(14,165,233,0.22), transparent 50%), linear-gradient(160deg, #041226 0%, #0a2748 45%, #062a4a 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-16 top-24 h-64 w-64 rounded-full border border-sky-400/20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-10 bottom-20 h-40 w-40 rounded-full border border-cyan-300/15"
        aria-hidden
      />

      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-1.5 shadow-lg shadow-sky-900/40">
            <CompanyLogo className="h-11 w-11" />
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-white">teleGlobals</p>
            <p className="text-xs uppercase tracking-[0.18em] text-sky-200/80">International</p>
          </div>
        </div>

        <p className="mt-10 max-w-md text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-300">
          Consulting &amp; IT Services
        </p>
        <h1 className="mt-3 max-w-lg text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.6rem]">
          Infinite technology.
          <span className="block text-sky-300">Limitless growth.</span>
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300 sm:text-base">
          Built in India. Scaling enterprises globally with cloud, AI, and digital employee
          identity — secure, scannable, and always with you.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {SERVICES.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-sky-100 backdrop-blur"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-10">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {HIGHLIGHTS.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
            >
              <p className="text-2xl font-bold text-white">{item.value}</p>
              <p className="mt-1 text-[11px] leading-snug text-slate-300">{item.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-slate-400">
          HQ · Cerebrum IT Park, Kalyani Nagar, Pune ·{" "}
          <a href="https://teleglobals .com/" target="_blank" rel="noreferrer" className="text-sky-300 hover:underline">
            teleglobals.com
          </a>
        </p>
      </div>
    </aside>
  );
}

function AuthSplitLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7fb] lg:flex-row">
      <AuthBrandPanel />
      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="mb-4 flex items-center gap-2">
              <CompanyLogo className="h-10 w-10" />
              <span className="font-bold text-[#061833]">teleGlobals</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#061833] sm:text-3xl">{title}</h2>
          {subtitle ? <p className="mt-2 text-sm text-slate-600">{subtitle}</p> : null}
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </div>
  );
}

export default AuthSplitLayout;
export { AuthBrandPanel };
