export default function SchedulesLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="h-80 animate-pulse rounded-xl bg-slate-200" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
