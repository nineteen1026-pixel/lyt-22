import { cn } from '@/lib/utils';

interface DataPoint {
  label: string;
  value: number;
  value2?: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  color2?: string;
  showArea?: boolean;
  showDots?: boolean;
  showGrid?: boolean;
  yAxisMax?: number;
  yAxisMin?: number;
  className?: string;
  labelFormat?: (label: string) => string;
  valueFormat?: (value: number) => string;
  legend1?: string;
  legend2?: string;
}

export default function LineChart({
  data,
  height = 200,
  color = '#ec4899',
  color2 = '#8b5cf6',
  showArea = true,
  showDots = true,
  showGrid = true,
  yAxisMax,
  yAxisMin = 0,
  className,
  labelFormat,
  valueFormat,
  legend1,
  legend2,
}: LineChartProps) {
  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center text-gray-400 text-sm', className)} style={{ height }}>
        暂无数据
      </div>
    );
  }

  const values = data.flatMap((d) => [d.value, d.value2 || 0].filter((v) => v !== undefined));
  const maxVal = yAxisMax ?? Math.max(...values) * 1.1;
  const minVal = yAxisMin;
  const range = maxVal - minVal || 1;
  const width = 100;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const xStep = data.length > 1 ? chartWidth / (data.length - 1) : 0;

  const getX = (i: number) => padding.left + i * xStep;
  const getY = (v: number) => padding.top + chartHeight - ((v - minVal) / range) * chartHeight;

  const path1 = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.value)}`)
    .join(' ');

  const areaPath1 =
    showArea && data.length > 1
      ? `${path1} L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${getX(0)} ${padding.top + chartHeight} Z`
      : '';

  const hasSecondLine = data.some((d) => d.value2 !== undefined);
  const path2 = hasSecondLine
    ? data
        .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.value2 || 0)}`)
        .join(' ')
    : '';

  const areaPath2 =
    showArea && hasSecondLine && data.length > 1
      ? `${path2} L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${getX(0)} ${padding.top + chartHeight} Z`
      : '';

  const yTicks = 4;
  const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = minVal + (range * i) / yTicks;
    return {
      y: padding.top + chartHeight - (i / yTicks) * chartHeight,
      value: val,
    };
  });

  const formatDate = (label: string) => {
    if (labelFormat) return labelFormat(label);
    if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
      const parts = label.split('-');
      return `${parts[1]}/${parts[2]}`;
    }
    return label;
  };

  return (
    <div className={cn('w-full', className)}>
      {(legend1 || (legend2 && hasSecondLine)) && (
        <div className="flex items-center gap-4 mb-3 text-xs">
          {legend1 && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-gray-600">{legend1}</span>
            </div>
          )}
          {legend2 && hasSecondLine && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: color2 }} />
              <span className="text-gray-600">{legend2}</span>
            </div>
          )}
        </div>
      )}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        {showGrid &&
          gridLines.map((line, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={line.y}
                x2={width - padding.right}
                y2={line.y}
                stroke="#f3f4f6"
                strokeWidth="0.5"
              />
              <text
                x={padding.left - 4}
                y={line.y + 1.5}
                textAnchor="end"
                fontSize="3"
                fill="#9ca3af"
              >
                {valueFormat ? valueFormat(line.value) : Math.round(line.value)}
              </text>
            </g>
          ))}

        {showArea && areaPath1 && (
          <path d={areaPath1} fill={color} fillOpacity="0.1" />
        )}
        {showArea && areaPath2 && (
          <path d={areaPath2} fill={color2} fillOpacity="0.1" />
        )}

        <path d={path1} fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" />
        {path2 && <path d={path2} fill="none" stroke={color2} strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" />}

        {showDots &&
          data.map((d, i) => (
            <g key={i}>
              <circle cx={getX(i)} cy={getY(d.value)} r="1.5" fill="white" stroke={color} strokeWidth="0.8" />
              {hasSecondLine && d.value2 !== undefined && (
                <circle cx={getX(i)} cy={getY(d.value2)} r="1.5" fill="white" stroke={color2} strokeWidth="0.8" />
              )}
            </g>
          ))}

        {data.map((d, i) => {
          if (data.length > 8 && i % Math.ceil(data.length / 6) !== 0 && i !== data.length - 1) return null;
          return (
            <text
              key={i}
              x={getX(i)}
              y={height - padding.bottom + 10}
              textAnchor="middle"
              fontSize="3"
              fill="#6b7280"
            >
              {formatDate(d.label)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
