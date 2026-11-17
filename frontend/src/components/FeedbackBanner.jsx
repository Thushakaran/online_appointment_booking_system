import {
  FiAlertCircle,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiX,
} from "react-icons/fi";

const VARIANT_MAP = {
  error: {
    container: "bg-rose-50 border-rose-200 text-rose-800",
    iconColor: "text-rose-600",
    Icon: FiAlertCircle,
  },
  success: {
    container: "bg-emerald-50 border-emerald-200 text-emerald-800",
    iconColor: "text-emerald-600",
    Icon: FiCheckCircle,
  },
  warning: {
    container: "bg-amber-50 border-amber-200 text-amber-800",
    iconColor: "text-amber-600",
    Icon: FiAlertTriangle,
  },
  info: {
    container: "bg-indigo-50 border-indigo-200 text-indigo-800",
    iconColor: "text-indigo-600",
    Icon: FiInfo,
  },
};

export default function FeedbackBanner({
  variant = "info",
  message,
  onDismiss,
  className = "",
}) {
  if (!message) return null;

  const { container, iconColor, Icon } = VARIANT_MAP[variant] || VARIANT_MAP.info;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex items-start justify-between gap-3 px-4 py-3 rounded-lg border text-sm ${container} ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} aria-hidden="true" />
        <span className="leading-relaxed">{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="p-0.5 rounded hover:bg-black/5 transition-colors shrink-0"
        >
          <FiX className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
