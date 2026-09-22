interface TrendChartProps {
  data: { label: string; count: number }[];
}

export default function TrendChart({ data }: TrendChartProps) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-foreground-400">
        No clicks in the last 14 days.
      </div>
    );
  }

  return (
    <div className="flex items-end gap-1.5 h-40">
      {data.map((d, i) => {
        const height = Math.max(4, Math.round((d.count / max) * 112));
        return (
          <div
            key={i}
            className="flex-1 min-w-0 flex flex-col items-center justify-end gap-1.5 h-full"
            title={`${d.label}: ${d.count} click${d.count === 1 ? "" : "s"}`}
          >
            <span className="text-[10px] text-foreground-400 leading-none">
              {d.count > 0 ? d.count : ""}
            </span>
            <div
              className="w-full rounded-t-md bg-primary-500 hover:bg-primary-600 transition-colors"
              style={{ height: `${height}px` }}
            />
            <span className="text-[10px] text-foreground-500 whitespace-nowrap">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}