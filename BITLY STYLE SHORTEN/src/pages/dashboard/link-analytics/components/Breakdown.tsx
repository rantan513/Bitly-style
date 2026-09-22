export interface BreakdownItem {
  label: string;
  count: number;
}

interface BreakdownProps {
  title: string;
  icon: string;
  items: BreakdownItem[];
  total: number;
}

export default function Breakdown({ title, icon, items, total }: BreakdownProps) {
  return (
    <div className="bg-background-50 border border-background-200 rounded-lg p-5">
      <div className="flex items-center gap-2">
        <i className={`${icon} w-5 h-5 flex items-center justify-center text-foreground-500`}></i>
        <h2 className="font-heading text-lg text-foreground-950">{title}</h2>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-foreground-400">No data yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {items.map((item) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <li key={item.label}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-foreground-800 truncate">{item.label}</span>
                  <span className="text-foreground-500 whitespace-nowrap">
                    {item.count} <span className="text-xs">({pct}%)</span>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-background-100 overflow-hidden">
                  <div className="h-full rounded-full bg-accent-500" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}