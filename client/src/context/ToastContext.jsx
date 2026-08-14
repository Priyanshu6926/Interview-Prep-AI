import { createContext, useCallback, useContext, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import clsx from "clsx";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = "info", title, message, duration = 4000 }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (message, title = "Success") => addToast({ type: "success", title, message }),
    error: (message, title = "Error") => addToast({ type: "error", title, message, duration: 6000 }),
    info: (message, title = "Info") => addToast({ type: "info", title, message }),
    warning: (message, title = "Notice") => addToast({ type: "warning", title, message, duration: 5000 })
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={clsx(
              "pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur transition-all duration-300 animate-in fade-in slide-in-from-bottom-5",
              item.type === "success" && "border-emerald-200 bg-emerald-50/95 text-emerald-950",
              item.type === "error" && "border-rose-200 bg-rose-50/95 text-rose-950",
              item.type === "warning" && "border-amber-200 bg-amber-50/95 text-amber-950",
              item.type === "info" && "border-slate-200 bg-white/95 text-slate-900 shadow-soft"
            )}
          >
            {item.type === "success" && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />}
            {item.type === "error" && <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />}
            {item.type === "warning" && <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />}
            {item.type === "info" && <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />}

            <div className="flex-1 text-sm">
              {item.title && <p className="font-semibold">{item.title}</p>}
              <p className={clsx("text-xs leading-5", item.title ? "mt-0.5 text-slate-600" : "text-slate-800")}>
                {item.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(item.id)}
              className="text-slate-400 hover:text-slate-600 transition"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
