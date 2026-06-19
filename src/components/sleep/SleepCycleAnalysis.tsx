import { useState, useMemo } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  Moon,
  Calendar,
  BarChart3,
  PieChart,
  Lightbulb,
  Clock,
  Droplets,
  AlertCircle,
  ArrowRight,
  Star,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { SleepRecommendation, PhaseSleepStatistics } from '@/types';

const phaseColors: Record<string, string> = {
  period: 'from-pink-400 to-rose-500',
  follicular: 'from-sky-400 to-blue-500',
  ovulation: 'from-amber-400 to-orange-500',
  luteal: 'from-purple-400 to-violet-500',
};

const phaseBgColors: Record<string, string> = {
  period: 'from-pink-50 to-rose-50',
  follicular: 'from-sky-50 to-blue-50',
  ovulation: 'from-amber-50 to-orange-50',
  luteal: 'from-purple-50 to-violet-50',
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  schedule: Clock,
  environment: Moon,
  lifestyle: Lightbulb,
  medical: AlertCircle,
};

export default function SleepCycleAnalysis() {
  const { getSleepImpactAnalysis, getSleepRecommendations } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'phases' | 'correlation' | 'recommendations'>('overview');

  const analysis = useMemo(() => {
    const result = getSleepImpactAnalysis();
    result.recommendations = getSleepRecommendations(result);
    return result;
  }, [getSleepImpactAnalysis, getSleepRecommendations]);

  const { overallScore, periodImpact, phasePatterns, keyInsights, recommendations, correlationData, weeklyTrend } = analysis;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'from-emerald-400 to-teal-500';
    if (score >= 60) return 'from-amber-400 to-orange-500';
    if (score >= 40) return 'from-orange-400 to-red-500';
    return 'from-red-400 to-rose-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500 bg-red-50';
      case 'moderate': return 'text-amber-500 bg-amber-50';
      case 'low': return 'text-emerald-500 bg-emerald-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high': return '高';
      case 'moderate': return '中';
      case 'low': return '低';
      default: return '—';
    }
  };

  const renderPhaseBarChart = () => {
    const maxDuration = 10;
    return (
      <div className="space-y-4">
        {phasePatterns.filter((p) => p.sampleCount > 0).map((phase) => (
          <div key={phase.phase} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{phase.phaseName}</span>
              <div className="flex items-center gap-4">
                <span className="text-indigo-600 font-medium">{phase.avgDuration}h</span>
                <span className="text-purple-600 font-medium">{phase.avgQuality}/5</span>
                <span className="text-gray-400 text-xs">n={phase.sampleCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                <div
                  className={cn('h-full rounded-full bg-gradient-to-r', phaseColors[phase.phase])}
                  style={{ width: `${(phase.avgDuration / maxDuration) * 100}%` }}
                />
                <div
                  className="absolute top-0 h-full w-1 bg-yellow-400"
                  style={{ left: `${(8 / maxDuration) * 100}%` }}
                  title="理想睡眠时长(8h)"
                />
              </div>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3 text-indigo-400" />
                盗汗 {phase.nightSweatRate.toFixed(0)}%
              </span>
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-400" />
                中断 {phase.avgInterruptions}次
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderQualityRadarChart = () => {
    const validPhases = phasePatterns.filter((p) => p.sampleCount > 0);
    if (validPhases.length === 0) {
      return <p className="text-center text-gray-400 py-8">暂无数据</p>;
    }

    const maxQuality = 5;
    const centerX = 120;
    const centerY = 120;
    const radius = 90;

    const getPoint = (index: number, value: number, total: number) => {
      const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
      const r = (value / maxQuality) * radius;
      return {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
        labelX: centerX + (radius + 20) * Math.cos(angle),
        labelY: centerY + (radius + 20) * Math.sin(angle),
      };
    };

    const dataPoints = validPhases.map((phase, i) => ({
      ...getPoint(i, phase.avgQuality, validPhases.length),
      phase,
    }));

    const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

    const gridLevels = [1, 2, 3, 4, 5];

    return (
      <div className="flex justify-center">
        <svg width="280" height="280" viewBox="0 0 280 280">
          {gridLevels.map((level) => {
            const r = (level / maxQuality) * radius;
            const points = validPhases.map((_, i) => {
              const angle = (i / validPhases.length) * 2 * Math.PI - Math.PI / 2;
              return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
            }).join(' ');
            return (
              <polygon
                key={level}
                points={points}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}

          {validPhases.map((_, i) => {
            const angle = (i / validPhases.length) * 2 * Math.PI - Math.PI / 2;
            return (
              <line
                key={i}
                x1={centerX}
                y1={centerY}
                x2={centerX + radius * Math.cos(angle)}
                y2={centerY + radius * Math.sin(angle)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}

          <polygon
            points={polygonPoints}
            fill="rgba(99, 102, 241, 0.2)"
            stroke="rgb(99, 102, 241)"
            strokeWidth="2"
          />

          {dataPoints.map((point, i) => (
            <g key={i}>
              <circle cx={point.x} cy={point.y} r="5" fill="rgb(99, 102, 241)" />
              <text
                x={point.labelX}
                y={point.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-gray-600 font-medium"
              >
                {point.phase.phaseName}
              </text>
              <text
                x={point.x}
                y={point.y - 10}
                textAnchor="middle"
                className="text-xs fill-indigo-600 font-bold"
              >
                {point.phase.avgQuality}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  const renderCorrelationChart = () => {
    const data = correlationData.slice(-14);
    if (data.length === 0) {
      return <p className="text-center text-gray-400 py-8">暂无数据</p>;
    }

    const maxDuration = 10;
    const chartHeight = 160;

    return (
      <div className="relative">
        <div className="flex items-end gap-1" style={{ height: `${chartHeight}px` }}>
          {data.map((item) => (
            <div key={item.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center gap-0.5" style={{ height: `${chartHeight - 30}px` }}>
                <div
                  className={cn(
                    'w-1/2 rounded-t transition-all',
                    item.isPeriod
                      ? 'bg-gradient-to-t from-pink-400 to-rose-400'
                      : 'bg-gradient-to-t from-indigo-400 to-purple-400'
                  )}
                  style={{ height: `${(item.duration / maxDuration) * 100}%` }}
                  title={`${item.date}: ${item.duration}h`}
                />
                <div
                  className={cn(
                    'w-1/2 rounded-t transition-all',
                    item.quality >= 4
                      ? 'bg-gradient-to-t from-emerald-400 to-teal-400'
                      : item.quality >= 3
                      ? 'bg-gradient-to-t from-amber-400 to-orange-400'
                      : 'bg-gradient-to-t from-red-400 to-rose-400'
                  )}
                  style={{ height: `${(item.quality / 5) * 100}%` }}
                  title={`${item.date}: 质量${item.quality}/5`}
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-gray-400">{item.date.slice(5)}</span>
                {item.periodDay && (
                  <span className="text-[9px] text-pink-500 font-medium">D{item.periodDay}</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-6 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gradient-to-t from-indigo-400 to-purple-400" />
            睡眠时长
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gradient-to-t from-emerald-400 to-teal-400" />
            睡眠质量
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gradient-to-t from-pink-400 to-rose-400" />
            月经期
          </span>
        </div>
      </div>
    );
  };

  const renderRecommendationCard = (rec: SleepRecommendation) => {
    const IconComponent = categoryIcons[rec.category] || Lightbulb;
    return (
      <div
        key={rec.id}
        className={cn(
          'card p-5 transition-all hover:shadow-lg',
          rec.priority === 'high' ? 'border-l-4 border-l-red-400' :
          rec.priority === 'medium' ? 'border-l-4 border-l-amber-400' :
          'border-l-4 border-l-emerald-400'
        )}
      >
        <div className="flex items-start gap-4">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
            rec.priority === 'high' ? 'bg-red-100 text-red-500' :
            rec.priority === 'medium' ? 'bg-amber-100 text-amber-500' :
            'bg-emerald-100 text-emerald-500'
          )}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-gray-800">{rec.title}</h4>
              {rec.relatedPhase && (
                <span className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r text-white',
                  phaseColors[rec.relatedPhase]
                )}>
                  {phasePatterns.find(p => p.phase === rec.relatedPhase)?.phaseName}
                </span>
              )}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {rec.categoryName}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{rec.description}</p>

            <div className="space-y-2">
              <h5 className="text-xs font-medium text-gray-700">可执行步骤：</h5>
              <ul className="space-y-1">
                {rec.actionableSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" />
                预期效果：{rec.expectedBenefit}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-400" />
                见效时间：{rec.timeToEffect}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { key: 'overview' as const, label: '总览', icon: BarChart3 },
    { key: 'phases' as const, label: '周期阶段', icon: PieChart },
    { key: 'correlation' as const, label: '相关性', icon: TrendingUp },
    { key: 'recommendations' as const, label: '改善建议', icon: Lightbulb },
  ];

  return (
    <div className="space-y-6">
      <div className="card p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Moon className="w-6 h-6" />
              睡眠与周期关联分析
            </h2>
            <p className="text-white/80 text-sm">
              基于 {correlationData.length} 条睡眠记录和 {analysis.phasePatterns.reduce((s, p) => s + p.sampleCount, 0)} 个周期数据
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="white"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(overallScore / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{overallScore}</span>
                  <span className="text-[10px] text-white/70">睡眠评分</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className={cn(
                'px-4 py-2 rounded-full font-medium',
                getSeverityColor(periodImpact.severity)
              )}>
                对周期影响：{getSeverityLabel(periodImpact.severity)}
              </div>
              <p className="text-xs text-white/70 mt-2 max-w-[200px]">
                {periodImpact.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 bg-gradient-to-br from-pink-50 to-rose-50">
          <p className="text-xs text-gray-500 mb-1">周期长度变异</p>
          <p className="text-2xl font-bold text-rose-500">
            {periodImpact.cycleLengthVariation > 0 ? `±${periodImpact.cycleLengthVariation}天` : '—'}
          </p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-amber-50 to-orange-50">
          <p className="text-xs text-gray-500 mb-1">经期长度变异</p>
          <p className="text-2xl font-bold text-orange-500">
            {periodImpact.periodLengthVariation > 0 ? `±${periodImpact.periodLengthVariation}天` : '—'}
          </p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
          <p className="text-xs text-gray-500 mb-1">疼痛相关性</p>
          <p className="text-2xl font-bold text-purple-500">
            {periodImpact.painLevelCorrelation > 0 ? `${periodImpact.painLevelCorrelation}%` : '—'}
          </p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-emerald-50 to-teal-50">
          <p className="text-xs text-gray-500 mb-1">有效周期数</p>
          <p className="text-2xl font-bold text-teal-500">
            {phasePatterns.filter(p => p.sampleCount > 0).length}
          </p>
        </div>
      </div>

      <div className="card p-4 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-400 to-purple-400 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              关键洞察
            </h3>
            <div className="space-y-3">
              {keyInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-xl',
                    insight.type === 'warning' ? 'bg-amber-50 border border-amber-100' :
                    insight.type === 'good' ? 'bg-emerald-50 border border-emerald-100' :
                    'bg-blue-50 border border-blue-100'
                  )}
                >
                  <span className="text-xl">{insight.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      'font-medium mb-0.5',
                      insight.type === 'warning' ? 'text-amber-700' :
                      insight.type === 'good' ? 'text-emerald-700' :
                      'text-blue-700'
                    )}>
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-500" />
              各阶段睡眠质量对比
            </h3>
            {renderQualityRadarChart()}
          </div>
        </div>
      )}

      {activeTab === 'phases' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              各周期阶段睡眠时长
            </h3>
            {renderPhaseBarChart()}
          </div>

          <div className="space-y-4">
            {phasePatterns.filter((p) => p.sampleCount > 0).map((phase) => (
              <div
                key={phase.phase}
                className={cn('card p-5 bg-gradient-to-br', phaseBgColors[phase.phase])}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    <span className={cn(
                      'w-8 h-8 rounded-lg bg-gradient-to-r flex items-center justify-center text-white text-sm',
                      phaseColors[phase.phase]
                    )}>
                      {phase.phaseName.slice(0, 1)}
                    </span>
                    {phase.phaseName}
                  </h4>
                  <span className="text-xs text-gray-500">样本量: {phase.sampleCount}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-lg bg-white/50">
                    <p className="text-xl font-bold text-indigo-600">{phase.avgDuration}h</p>
                    <p className="text-[10px] text-gray-500">平均时长</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/50">
                    <p className="text-xl font-bold text-purple-600">{phase.avgQuality}</p>
                    <p className="text-[10px] text-gray-500">平均质量</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/50">
                    <p className="text-xl font-bold text-pink-600">{phase.nightSweatRate}%</p>
                    <p className="text-[10px] text-gray-500">盗汗率</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'correlation' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              近14天睡眠与周期关联
            </h3>
            {renderCorrelationChart()}
          </div>

          {weeklyTrend.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                每周平均睡眠趋势
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">周起始</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">平均时长</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">平均质量</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">平均中断</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">经期</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyTrend.map((week) => (
                      <tr key={week.date} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{week.date}</td>
                        <td className="py-3 px-4 text-center text-indigo-600 font-medium">{week.avgDuration}h</td>
                        <td className="py-3 px-4 text-center">
                          <span className={cn(
                            'font-medium',
                            week.avgQuality >= 4 ? 'text-emerald-600' :
                            week.avgQuality >= 3 ? 'text-amber-600' : 'text-red-600'
                          )}>
                            {week.avgQuality}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">{week.avgInterruptions}次</td>
                        <td className="py-3 px-4 text-center">
                          {week.periodStart ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-pink-100 text-pink-600">
                              <Droplets className="w-3 h-3" />
                              {week.periodStart}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              个性化改善建议
            </h3>
            <span className="text-sm text-gray-500">
              共 {recommendations.length} 条建议
            </span>
          </div>

          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {recommendations.map(renderRecommendationCard)}
            </div>
          ) : (
            <div className="card p-8 text-center text-gray-400">
              <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">记录更多睡眠和周期数据后，将为您生成个性化改善建议</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
