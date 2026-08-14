import { AlertTriangle, X } from "lucide-react";
import clsx from "clsx";

function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  isDestructive = true,
  loading = false,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        onClick={!loading ? onCancel : undefined}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-[28px] border border-white/60 bg-white p-6 shadow-2xl transition-all animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between">
          <div
            className={clsx(
              "flex h-12 w-12 items-center justify-center rounded-2xl",
              isDestructive ? "bg-rose-50 text-rose-600" : "bg-brand-50 text-brand-600"
            )}
          >
            <AlertTriangle className="h-6 w-6" />
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="secondary-button"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={clsx(
              "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white transition",
              isDestructive
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-slate-950 hover:bg-slate-800",
              loading && "opacity-70 cursor-not-allowed"
            )}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
