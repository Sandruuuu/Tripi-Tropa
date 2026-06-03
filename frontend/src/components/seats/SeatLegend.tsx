export function SeatLegend() {
  const items = [
    { label: 'Tersedia', className: 'bg-white border-slate-300' },
    { label: 'Dipilih', className: 'bg-primary-600 border-primary-600' },
    { label: 'Terisi', className: 'bg-slate-200 border-slate-300' },
  ];

  return (
    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
      {items.map(({ label, className }) => (
        <div key={label} className="flex items-center gap-2">
          <span
            className={`h-6 w-6 rounded-md border ${className}`}
            aria-hidden
          />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
