import { Link } from "react-router-dom";
import { ArrowLeft, Home, Sparkles } from "lucide-react";
import appLogo from "../assets/app-logo.png";

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,243,211,0.95),_rgba(248,250,252,0.92)_32%,_rgba(248,250,252,1)_68%)] px-4 text-center">
      <div className="mx-auto max-w-lg space-y-6 glass-panel p-8 sm:p-12 shadow-soft">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-soft">
          <img src={appLogo} alt="Interview Prep AI" className="h-12 w-12 object-contain" />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
          <Sparkles className="h-3.5 w-3.5" />
          404 Error
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Page Not Found</h1>
        <p className="text-sm leading-7 text-slate-600">
          The interview track or practice room you are looking for does not exist or may have been moved.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/app" className="primary-button inline-flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="secondary-button inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
