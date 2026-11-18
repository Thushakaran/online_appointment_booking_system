import { useCallback, useMemo, useState } from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";
import { ToastContext } from "./toastContext";

let toastCounter = 0;

const VARIANT_STYLES = {
  success: {
    container: "bg-white border-emerald-200 text-slate-900 shadow-lg",
    iconWrap: "bg-emerald-50 text-emerald-600",
    Icon: FiCheckCircle,
  },
  error: {
    container: "bg-white border-rose-200 text-slate-900 shadow-lg",
    iconWrap: "bg-rose-50 text-rose-600",
    Icon: FiAlertCircle,
  },
  info: {
    container: "bg-white border-indigo-200 text-slate-900 shadow-lg",
    iconWrap: "bg-indigo-50 text-indigo-600",
    Icon: FiInfo,
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (message, options = {}) => {
      if (!message) return;
      const { variant = "info", duration = 4200, title = "" } = options;
      const id = ++toastCounter;
      setToasts((prev) => [...prev.slice(-3), { id, message, variant, title }]);
      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
      return id;
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      show: push,
      success: (message, opts = {}) => push(message, { ...opts, variant: "success" }),
      error: (message, opts = {}) => push(message, { ...opts, variant: "error", duration: 5500 }),
      info: (message, opts = {}) => push(message, { ...opts, variant: "info" }),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 right-4 z-[70] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
      >
        {toasts.map((toast) => {
          const style = VARIANT_STYLES[toast.variant] || VARIANT_STYLES.info;
          const Icon = style.Icon;
          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto rounded-xl border p-3.5 flex items-start gap-3 transition-all ${style.container}`}
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.iconWrap}`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                {toast.title && (
                  <p className="text-xs font-semibold text-slate-900 mb-0.5">
                    {toast.title}
                  </p>
                )}
                <p className="text-sm text-slate-700 leading-snug">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                aria-label="Dismiss notification"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
