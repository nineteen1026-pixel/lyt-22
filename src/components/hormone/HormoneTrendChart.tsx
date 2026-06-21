import { useMemo, useState } from 'react';
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import LineChart from '@/components/reports/LineChart';
import type { HormoneIndicator, HormonePhase, HormoneReferenceRange, HormoneTrendPoint } from '@/types';

interface HormoneTrendChartProps {
  data: HormoneTrendPoint[];
  indicators: HormoneIndicator[];
  referenceRanges?: HormoneReferenceRange[];
  height?: number;
  showReferenceRange?: boolean;
  showPhaseMarkers?: boolean;
  className?: string;
}

const indicatorInfo: Record<HormoneIndicator, { name: string; unit: string; color: string }> = {
  estradiol: { name: '雌二醇 (E2)', unit: 'pg/mL', color: '#ec4899' },
  progesterone: { name: '孕酮 (P)', unit: 'ng/mL', color: '#8b5cf6' },
  fsh: { name: '促卵泡激素 (FSH)', unit: 'mIU/mL', color: '#f59e0b' },
  lh: { name: '促黄体生成素 (LH)', unit: 'mIU/mL', color: '#06b6d4' },
  testosterone: { name: '睾酮 (T)', unit: 'ng/dL', color: '#ef4444' },
  prolactin: { name: '泌乳素 (PRL)', unit: 'ng/mL', color: '#10b981' },
  amh: { name: '抗缪勒管激素 (AMH)', unit: 'ng/mL', color: '#6366f1' },
  tsh: { name: '促甲状腺激素 (TSH)', unit: 'mIU/L', color: '#14b8a6' },
  ft3: { name: '游离三碘甲状腺原氨酸 (FT3)', unit: 'pg/mL', color: '#f97316' },
  ft4: { name: '游离甲状腺素 (FT4)', unit: 'ng/dL', color: '#84cc16' },
  dhea: { name: '脱氢表雄酮 (DHEA)', unit: 'μg/dL', color: '#a855f7' },
  cortisol: { name: '皮质醇', unit: 'μg/dL', color: '#0ea5e9' },
};

const phaseInfo: Record<HormonePhase, { name: string; color: string; bgColor: string }> = {
  follicular: { name: '卵泡期', color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.08)' },
  ovulatory: { name: '排卵期', color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.08)' },
  luteal: { name: '黄体期', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.08)' },
  perimenopausal: { name: '围绝经期', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.08)' },
  postmenopausal: { name: '绝经后', color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.08)' },
  pregnancy: { name: '妊娠期', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.08)' },
  postpartum: { name: '产后', color: '#f43f5e', bgColor: 'rgba(244, 63, 94, 0.08)' },
};

export default function HormoneTrendChart({
  data,
  indicators,
  referenceRanges = [],
  height = 300,
  showReferenceRange = true,
  showPhaseMarkers = true,
  className,
}: HormoneTrendChartProps) {
  const [selectedIndicators, setSelectedIndicators] = useState<HormoneIndicator[]>(
    indicators.slice(0, 2)
  );
  const [showNormalRange, setShowNormalRange] = useState(showReferenceRange);

  const chartData = useMemo(() => {
    if (selectedIndicators.length === 0) return [];
    return data.map((point) => {
      const firstIndicator = selectedIndicators[0];
      const secondIndicator = selectedIndicators[1];
      return {
        label: point.date,
        value: point.values[firstIndicator] ?? 0,
        value2: secondIndicator ? point.values[secondIndicator] ?? 0 : undefined,
      };
    });
  }, [data, selectedIndicators]);

  const validDataCount = useMemo(() => {
    if (selectedIndicators.length === 0) return 0;
    return chartData.filter((d) => d.value > 0 || (d.value2 !== undefined && d.value2 > 0)).length;
  }, [chartData, selectedIndicators.length]);

  const toggleIndicator = (indicator: HormoneIndicator) => {
    setSelectedIndicators((prev) => {
      if (prev.includes(indicator)) {
        if (prev.length <= 1) return prev;
        return prev.filter((i) => i !== indicator);
      }
      if (prev.length >= 2) {
        return [prev[1], indicator];
      }
      return [...prev, indicator];
    });
  };

  const getReferenceRange = (indicator: HormoneIndicator, phase?: HormonePhase) => {
    if (!phase) {
      return referenceRanges.find((r) => r.indicator === indicator && r.phase === 'general');
    }
    return (
      referenceRanges.find((r) => r.indicator === indicator && r.phase === phase) ||
      referenceRanges.find((r) => r.indicator === indicator && r.phase === 'general')
    );
  };

  const currentPhase = data.length > 0 ? data[data.length - 1].phase : undefined;

  const getTrendDirection = (indicator: HormoneIndicator) => {
    const validValues = data
      .map((d) => d.values[indicator])
      .filter((v): v is number => v !== undefined && v > 0);
    if (validValues.length < 2) return 'stable';
    const last = validValues[validValues.length - 1];
    const prev = validValues[validValues.length - 2];
    if (last > prev * 1.05) return 'up';
    if (last < prev * 0.95) return 'down';
    return 'stable';
  };

  const firstIndicator = selectedIndicators[0];
  const secondIndicator = selectedIndicators[1];
  const firstColor = firstIndicator ? indicatorInfo[firstIndicator].color : '#ec4899';
  const secondColor = secondIndicator ? indicatorInfo[secondIndicator].color : '#8b5cf6';

  const phaseRanges = useMemo(() => {
    if (!showPhaseMarkers || data.length === 0) return [];
    const ranges: { startIndex: number; endIndex: number; phase: HormonePhase }[] = [];
    let currentPhaseVal: HormonePhase | undefined;
    let startIndex = 0;

    data.forEach((point, index) => {
      if (point.phase !== currentPhaseVal) {
        if (currentPhaseVal !== undefined) {
          ranges.push({ startIndex, endIndex: index - 1, phase: currentPhaseVal });
        }
        currentPhaseVal = point.phase;
        startIndex = index;
      }
    });
    if (currentPhaseVal !== undefined) {
      ranges.push({ startIndex, endIndex: data.length - 1, phase: currentPhaseVal });
    }
    return ranges;
  }, [data, showPhaseMarkers]);

  return (
    <div className={cn('card p-6', className)}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-fuchsia-500" />
            激素变化趋势图
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            选择指标查看变化趋势，最多同时对比2项
          </p>
        </div>
        {currentPhase && (
          <div
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: phaseInfo[currentPhase].bgColor,
              color: phaseInfo[currentPhase].color,
            }}
          >
            当前阶段：{phaseInfo[currentPhase].name}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {indicators.map((indicator) => {
          const info = indicatorInfo[indicator];
          const isSelected = selectedIndicators.includes(indicator);
          const trend = getTrendDirection(indicator);
          return (
            <button
              key={indicator}
              onClick={() => toggleIndicator(indicator)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all',
                isSelected
                  ? 'bg-gray-800 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: info.color }}
              />
              <span className="font-medium">{info.name.split(' ')[0]}</span>
              {trend !== 'stable' && (
                <span className="ml-1">
                  {trend === 'up' ? (
                    <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {showNormalRange && currentPhase && (
        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-600">参考范围（{phaseInfo[currentPhase].name}）</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {selectedIndicators.map((indicator) => {
              const range = getReferenceRange(indicator, currentPhase);
              const info = indicatorInfo[indicator];
              if (!range) return null;
              return (
                <div key={indicator} className="text-xs">
                  <span className="text-gray-500">{info.name.split(' ')[0]}：</span>
                  <span className="font-medium text-gray-700">
                    {range.min} - {range.max} {info.unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {validDataCount > 0 ? (
        <LineChart
          data={chartData}
          height={height}
          color={firstColor}
          color2={secondColor}
          showArea={true}
          showDots={true}
          showGrid={true}
          legend1={firstIndicator ? indicatorInfo[firstIndicator].name : ''}
          legend2={secondIndicator ? indicatorInfo[secondIndicator].name : ''}
          valueFormat={(v) => v.toFixed(1)}
        />
      ) : (
        <div
          className="flex flex-col items-center justify-center text-gray-400"
          style={{ height }}
        >
          <TrendingUp className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">暂无激素数据</p>
          <p className="text-xs mt-1">录入化验数据后查看趋势</p>
        </div>
      )}

      {phaseRanges.length > 1 && showPhaseMarkers && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-3">周期阶段分布</p>
          <div className="flex h-2 rounded-full overflow-hidden">
            {phaseRanges.map((range, idx) => {
              const totalPoints = data.length;
              const width = ((range.endIndex - range.startIndex + 1) / totalPoints) * 100;
              return (
                <div
                  key={idx}
                  className="h-full transition-all"
                  style={{
                    width: `${width}%`,
                    backgroundColor: phaseInfo[range.phase].color,
                  }}
                  title={phaseInfo[range.phase].name}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            {phaseRanges.map((range, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: phaseInfo[range.phase].color }}
                />
                <span className="text-xs text-gray-600">{phaseInfo[range.phase].name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-end">
        <button
          onClick={() => setShowNormalRange(!showNormalRange)}
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <Info className="w-3.5 h-3.5" />
          {showNormalRange ? '隐藏' : '显示'}参考范围
        </button>
      </div>
    </div>
  );
}
