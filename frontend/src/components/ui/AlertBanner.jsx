import { FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle, FiX } from "react-icons/fi";

const STYLES = {
  error: {
    wrap: "bg-rose-50 border-rose-200 text-rose-700",
    btn: "text-rose-500 hover:text-rose-700",
    Icon: FiAlertCircle,
    role: "alert",
  },
  success: {
    wrap: "bg-emerald-50 border-emerald-200 text-emerald-700",
    btn: "text-emerald-600 hover:text-emerald-800",
    Icon: FiCheckCircle,
    role: "status",
  },
  warning: {
    wrap: "bg-amber-50 border-amber-200 text-amber-800",
    btn: "text-amber-600 hover:text-amber-800",
    Icon: FiAlertTriangle,
    role: "status",
  },
  info: {
    wrap: "bg-indigo-50 border-indigo-200 text-indigo-700",
    btn: "text-indigo-500 hover:text-indigo-700",
    Icon: FiInfo,
    role: "status",
  },
};

export default function AlertBanner({
  variant = "info",
  message,
  onDismiss,
  className = "",
}) {
  if (!message) return null;
  const cfg = STYLES[variant] || STYLES.info;
  const Icon = cfg.Icon;

  return (
    <div
      role={cfg.role}
      className={`border px-4 py-3 rounded-xl text-sm flex items-center justify-between gap-4 ${cfg.wrap} ${className}`}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <Icon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
        <span className="leading-snug">{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={`p-1 rounded-md transition-colors shrink-0 ${cfg.btn}`}
          aria-label="Dismiss notice"
        >
          <FiX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
