import { useEffect } from "react";

export default function Modal({
  open,
  onClose,
  labelledBy,
  maxWidth = "max-w-lg",
  disableClose = false,
  children,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !disableClose && onClose) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, disableClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onClick={(event) => {
        if (event.target === event.currentTarget && !disableClose && onClose) {
          onClose();
        }
      }}
    >
      <div
        className={`bg-white border border-slate-200 rounded-2xl shadow-xl ${maxWidth} w-full overflow-hidden`}
      >
        {children}
      </div>
    </div>
  );
}
