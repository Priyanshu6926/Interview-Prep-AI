import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  BookOpenText,
  Code2,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  User,
  UsersRound,
  X
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import appLogo from "../assets/app-logo.png";

const navItems = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/sessions/new", label: "New Session", icon: PlusCircle },
  { to: "/app/coding-lab", label: "Coding Lab", icon: Code2 },
  { to: "/app/mock-rooms", label: "Mock Rooms", icon: UsersRound },
  { to: "/app/resources", label: "Lectures", icon: BookOpenText }
];

function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,243,211,0.95),_rgba(248,250,252,0.92)_32%,_rgba(248,250,252,1)_68%)] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-4 glass-panel p-4 sm:p-6">
        <header className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-soft">
                <img src={appLogo} alt="Interview Prep AI logo" className="h-9 w-9 object-contain" />
              </div>
              <div>
                <Link to="/app" className="text-2xl font-semibold tracking-tight text-slate-950">
                  Interview Prep AI
                </Link>
                <p className="text-xs sm:text-sm text-slate-500">Practice, review, and improve with AI coaching.</p>
              </div>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 lg:hidden shadow-soft"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden flex-wrap items-center gap-3 lg:flex">
            <nav className="flex flex-wrap gap-1.5 xl:gap-2">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/app"}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-medium transition ${
                      isActive ? "bg-slate-950 text-white shadow-soft" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-white px-3 py-1.5 shadow-soft">
              <Link
                to="/app/profile"
                className="flex items-center gap-2 text-slate-800 hover:text-brand-600 transition"
                title="Account Settings"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {user?.name?.slice(0, 2).toUpperCase() || "IP"}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-semibold leading-tight text-slate-900">{user?.name?.split(" ")[0] || "User"}</p>
                  <p className="text-[10px] text-slate-400">Settings</p>
                </div>
              </Link>
              <div className="h-5 w-px bg-slate-200" />
              <button
                onClick={logout}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-rose-600 transition p-1"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mobile Collapsible Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-soft lg:hidden animate-in fade-in slide-in-from-top-2">
              <nav className="flex flex-col gap-1.5">
                {navItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/app"}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                        isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </NavLink>
                ))}
                <NavLink
                  to="/app/profile"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                      isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  <User className="h-4 w-4" />
                  Account Profile
                </NavLink>
              </nav>

              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                    {user?.name?.slice(0, 2).toUpperCase() || "IP"}
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{user?.name || "Candidate"}</p>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </header>

        <main className={location.pathname === "/app" ? "flex-1" : "flex-1"}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;

