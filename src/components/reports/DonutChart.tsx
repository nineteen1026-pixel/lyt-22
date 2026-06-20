import { cn } from '@/lib/utils';

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  thickness?: number;
  className?: string;
  showLegend?: boolean;
  centerLabel?: string;
  centerValue?: string;
}

export default function DonutChart({
  data,
  size = 160,
  thickness = 24,
  className,
  showLegend = true,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0 || data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center text-gray-400 text-sm', className)} style={{ height: size }}>
        暂无数据
      </div>
    );
  }

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;
  const segments = data.map((d) => {
    const fraction = d.value / total;
    const dashLength = fraction * circumference;
    const dashOffset = -cumulative * circumference;
    cumulative += fraction;
    return {
      ...d,
      fraction,
      dashLength,
      dashOffset,
    };
  });

  return (
    <div className={cn('flex items-center gap-6', className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={thickness}
          />
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${seg.dashLength} ${circumference}`}
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <span className="text-2xl font-bold text-gray-800">{centerValue}</span>
          )}
          {centerLabel && (
            <span className="text-xs text-gray-500 mt-1">{centerLabel}</span>
          )}
        </div>
      </div>

      {showLegend && (
        <div className="flex-1 space-y-2">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-xs text-gray-600 flex-1 truncate">{seg.label}</span>
              <span className="text-xs font-medium text-gray-800">
                {seg.value} <span className="text-gray-400">({Math.round(seg.fraction * 100)}%)</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
