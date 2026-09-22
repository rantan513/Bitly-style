import type { DashboardLink } from "./LinksList";

interface StatsSummaryProps {
  links: DashboardLink[];
}

export default function StatsSummary({ links }: StatsSummaryProps) {
  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, l) => sum + (l.total_clicks ?? 0), 0);
  const activeLinks = links.filter((l) => l.active).length;

  const stats = [
    { icon: "ri-link-m", value: totalLinks, label: "Total links" },
    { icon: "ri-bar-chart-2-line", value: totalClicks, label: "Total clicks" },
    { icon: "ri-checkbox-circle-line", value: activeLinks, label: "Active links" },
  ];

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-background-50 border border-background-200 rounded-lg p-4 flex items-center gap-3"
        >
          <span className="w-10 h-10 rounded-lg bg-background-100 flex items-center justify-center shrink-0">
            <i className={`${s.icon} text-lg text-foreground-500 w-10 h-10 flex items-center justify-center`}></i>
          </span>
          <div>
            <div className="font-heading text-2xl text-foreground-950 leading-none">{s.value}</div>
            <div className="text-xs text-foreground-500 mt-1">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}