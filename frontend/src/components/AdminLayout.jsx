import { Link } from "react-router-dom";
import CompanyLogo from "./CompanyLogo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function AdminLayout({ title, subtitle, action, children }) {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <header className="sticky top-0 z-30 border-b border-[#0a2748]/80 bg-[#061833] text-white shadow-lg shadow-slate-900/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1.5">
              <CompanyLogo className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide text-white">teleGlobals</p>
              <p className="text-[11px] uppercase tracking-[0.14em] text-sky-200/80">
                Digital Employee ID
              </p>
            </div>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden text-xs text-sky-100/80 sm:inline">{user?.email}</span>
            <Link
              to="/admin/company"
              className="rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm font-semibold hover:bg-white/10"
            >
              Company
            </Link>
            <Link
              to="/admin/employees/new"
              className="rounded-lg bg-[#0088cc] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0074ad]"
            >
              + Add Employee
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm font-semibold hover:bg-white/10"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0088cc]">
              Admin console
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#061833]">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
          </div>
          {action}
        </div>
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
