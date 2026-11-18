export default function EmptyState({
  icon: Icon,
  title,
  description,
  action = null,
  dashed = false,
  className = "",
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-10 text-center ${
        dashed ? "border border-dashed border-slate-200" : "border border-slate-200 shadow-sm"
      } ${className}`}
    >
      {Icon && (
        <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
      )}
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {description && (
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
