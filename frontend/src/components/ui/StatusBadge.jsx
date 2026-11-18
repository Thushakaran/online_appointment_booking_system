import {
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAward,
  FiShield,
  FiUser,
  FiBriefcase,
} from "react-icons/fi";

const STATUS_STYLES = {
  CONFIRMED: {
    bg: "bg-emerald-50/90 text-emerald-700 border-emerald-200/80",
    label: "Confirmed",
    Icon: FiCheckCircle,
  },
  AVAILABLE: {
    bg: "bg-emerald-50/90 text-emerald-700 border-emerald-200/80",
    label: "Available",
    Icon: FiCheckCircle,
  },
  ACTIVE: {
    bg: "bg-emerald-50/90 text-emerald-700 border-emerald-200/80",
    label: "Active",
    Icon: FiCheckCircle,
  },
  COMPLETED: {
    bg: "bg-violet-50/90 text-violet-700 border-violet-200/80",
    label: "Completed",
    Icon: FiAward,
  },
  PENDING: {
    bg: "bg-amber-50/90 text-amber-700 border-amber-200/80",
    label: "Pending",
    Icon: FiClock,
  },
  SETUP: {
    bg: "bg-amber-50/90 text-amber-700 border-amber-200/80",
    label: "Setup Needed",
    Icon: FiClock,
  },
  CANCELLED: {
    bg: "bg-rose-50/90 text-rose-700 border-rose-200/80",
    label: "Cancelled",
    Icon: FiXCircle,
  },
  BOOKED: {
    bg: "bg-violet-50/90 text-violet-700 border-violet-200/80",
    label: "Booked",
    Icon: FiClock,
  },
  ADMIN: {
    bg: "bg-purple-50/90 text-purple-700 border-purple-200/80",
    label: "Admin",
    Icon: FiShield,
  },
  PROVIDER: {
    bg: "bg-violet-50/90 text-violet-700 border-violet-200/80",
    label: "Provider",
    Icon: FiBriefcase,
  },
  USER: {
    bg: "bg-slate-100/90 text-slate-700 border-slate-200/80",
    label: "Client",
    Icon: FiUser,
  },
};

export default function StatusBadge({ status, label: customLabel }) {
  const key = String(status || "PENDING").toUpperCase();
  const config = STATUS_STYLES[key] || {
    bg: "bg-slate-100 text-slate-700 border-slate-200",
    label: key,
    Icon: FiClock,
  };
  const { bg, label, Icon } = config;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium whitespace-nowrap shrink-0 shadow-[0_1px_1px_rgba(15,23,42,0.02)] ${bg}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{customLabel || label}</span>
    </span>
  );
}
