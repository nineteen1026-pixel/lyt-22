import { cn } from '@/lib/utils';

interface BarDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarDataPoint[];
  height?: number;
  maxValue?: number;
  horizontal?: boolean;
  showValues?: boolean;
  valueFormat?: (value: number) => string;
  labelFormat?: (label: string) => string;
  className?: string;
}

export default function BarChart({
  data,
  height = 200,
  maxValue,
  horizontal = false,
  showValues = true,
  valueFormat,
  labelFormat,
  className,
}: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center text-gray-400 text-sm', className)} style={{ height }}>
        暂无数据
      </div>
    );
  }

  const max = maxValue ?? Math.max(...data.map((d) => d.value)) * 1.15;
  const defaultColors = ['#ec4899', '#f59e0b', '#10b981', '#6366f1', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

  if (horizontal) {
    return (
      <div className={cn('w-full space-y-2', className)}>
        {data.map((d, i) => {
          const pct = Math.min(100, (d.value / max) * 100);
          const color = d.color || defaultColors[i % defaultColors.length];
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-20 shrink-0 truncate">
                {labelFormat ? labelFormat(d.label) : d.label}
              </span>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
                {showValues && (
                  <span className="absolute inset-0 flex items-center px-2 text-xs font-medium text-white drop-shadow">
                    {valueFormat ? valueFormat(d.value) : d.value}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const barWidth = 100 / data.length;

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        {data.map((d, i) => {
          const h = Math.min(90, (d.value / max) * 80);
          const x = i * barWidth + barWidth * 0.2;
          const y = 90 - h;
          const w = barWidth * 0.6;
          const color = d.color || defaultColors[i % defaultColors.length];
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx="1"
                fill={color}
                className="transition-all duration-700 ease-out"
              />
              {showValues && (
                <text
                  x={x + w / 2}
                  y={y - 2}
                  textAnchor="middle"
                  fontSize="3.5"
                  fill="#374151"
                  fontWeight="500"
                >
                  {valueFormat ? valueFormat(d.value) : d.value}
                </text>
              )}
              <text
                x={x + w / 2}
                y={97}
                textAnchor="middle"
                fontSize="3"
                fill="#6b7280"
              >
                {labelFormat ? labelFormat(d.label) : d.label.length > 4 ? d.label.slice(0, 4) : d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
