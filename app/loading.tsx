export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3">
        <div className="dot-typing" aria-hidden>
          <span /><span /><span />
        </div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Loading
        </div>
      </div>
    </div>
  );
}
