export default function VideoBackground({ children }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900">
      {children}
    </div>
  );
}
