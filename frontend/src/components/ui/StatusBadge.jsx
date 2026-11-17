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
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Confirmed",
    Icon: FiCheckCircle,
  },
  AVAILABLE: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Available",
    Icon: FiCheckCircle,
  },
  ACTIVE: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Active",
    Icon: FiCheckCircle,
  },
  COMPLETED: {
    bg: "bg-sky-50 text-sky-700 border-sky-200",
    label: "Completed",
    Icon: FiAward,
  },
  PENDING: {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Pending",
    Icon: FiClock,
  },
  SETUP: {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Setup Needed",
    Icon: FiClock,
  },
  CANCELLED: {
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    label: "Cancelled",
    Icon: FiXCircle,
  },
  BOOKED: {
    bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    label: "Booked",
    Icon: FiClock,
  },
  ADMIN: {
    bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    label: "Admin",
    Icon: FiShield,
  },
  PROVIDER: {
    bg: "bg-sky-50 text-sky-700 border-sky-200",
    label: "Provider",
    Icon: FiBriefcase,
  },
  USER: {
    bg: "bg-slate-100 text-slate-700 border-slate-200",
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium whitespace-nowrap shrink-0 ${bg}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{customLabel || label}</span>
    </span>
  );
}
