export default function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">
      <div>
        <p className="text-sm text-slate-500">Welcome back</p>
        <h2 className="text-base font-semibold text-slate-900 md:text-lg">
          AI Study Assistant
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          + New
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          U
        </div>
      </div>
    </header>
  );
}
