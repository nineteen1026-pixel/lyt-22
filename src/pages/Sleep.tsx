import { useState } from 'react';
import { Moon, BarChart3, Plus, ArrowRight, TrendingUp, Calendar } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import SleepRecorder from '@/components/sleep/SleepRecorder';
import SleepCycleAnalysis from '@/components/sleep/SleepCycleAnalysis';

type TabKey = 'record' | 'analysis';

const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { key: 'record', label: '睡眠记录', icon: Moon, color: 'from-indigo-400 to-purple-400' },
  { key: 'analysis', label: '周期关联分析', icon: BarChart3, color: 'from-purple-400 to-pink-400' },
];

export default function Sleep() {
  const {
    sleepRecords,
    getSleepImpactAnalysis,
    getCyclePhaseForDate,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabKey>('record');

  const analysis = getSleepImpactAnalysis();
  const { overallScore, periodImpact } = analysis;

  const todayPhase = getCyclePhaseForDate(new Date().toISOString().split('T')[0]);
  const phaseNames: Record<string, string> = {
    period: '月经期',
    follicular: '卵泡期',
    ovulation: '排卵期',
    luteal: '黄体期',
    unknown: '周期分析中',
  };

  const phaseTips: Record<string, string> = {
    period: '注意保暖，保证充足睡眠，建议7-8小时',
    follicular: '精力旺盛，可适当运动，但不建议熬夜',
    ovulation: '身体代谢加快，注意营养均衡和规律作息',
    luteal: '经前期可能出现失眠，注意放松，避免咖啡因',
    unknown: '记录更多周期数据以获得个性化建议',
  };

  const moduleCards = [
    {
      key: 'record' as TabKey,
      label: '睡眠记录',
      desc: '记录每日睡眠时长、质量、盗汗等',
      count: sleepRecords.length,
      unit: '条记录',
      icon: Moon,
      color: 'text-indigo-600',
      bg: 'from-indigo-50 to-purple-50',
    },
    {
      key: 'analysis' as TabKey,
      label: '周期关联分析',
      desc: '分析睡眠对经期的影响与规律',
      count: analysis.phasePatterns.filter(p => p.sampleCount > 0).length,
      unit: '个周期阶段',
      icon: BarChart3,
      color: 'text-purple-600',
      bg: 'from-purple-50 to-pink-50',
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'moderate': return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'low': return 'text-emerald-500 bg-emerald-50 border-emerald-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high': return '明显影响';
      case 'moderate': return '中度影响';
      case 'low': return '轻微影响';
      default: return '数据不足';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'record':
        return <SleepRecorder />;
      case 'analysis':
        return <SleepCycleAnalysis />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center shadow-lg shadow-indigo-200/50">
            <Moon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">睡眠与周期</h1>
            <p className="text-gray-500">记录睡眠，洞察周期规律</p>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-white/80 text-sm mb-1">当前周期阶段</p>
            <h2 className="font-display text-2xl font-bold mb-2">
              {phaseNames[todayPhase.phase]}
            </h2>
            <p className="text-white/90 text-sm">
              {todayPhase.phase !== 'unknown' ? `周期第 ${todayPhase.cycleDay} 天` : ''}
              {phaseTips[todayPhase.phase]}
            </p>
          </div>

          <div className="flex gap-6">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="white"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${(overallScore / 100) * 175.93} 175.93`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">{overallScore}</span>
                </div>
              </div>
              <p className="text-xs text-white/80 mt-1">睡眠评分</p>
            </div>

            <div className="text-center">
              <div className={cn(
                'px-3 py-1.5 rounded-full border text-sm font-medium',
                getSeverityColor(periodImpact.severity)
              )}>
                {getSeverityLabel(periodImpact.severity)}
              </div>
              <p className="text-xs text-white/80 mt-2 max-w-[150px]">
                对周期的影响
              </p>
            </div>

            <div className="text-center">
              <p className="text-3xl mb-1">📝</p>
              <p className="text-xs text-white/80">睡眠记录</p>
              <p className="font-bold">{sleepRecords.length} 条</p>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'record' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {moduleCards.map((card) => (
            <button
              key={card.key}
              onClick={() => setActiveTab(card.key)}
              className={cn(
                'card p-5 text-left card-hover group bg-gradient-to-br',
                card.bg
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn('w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm', card.color)}>
                  <card.icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{card.label}</h3>
              <p className="text-xs text-gray-500 mb-3">{card.desc}</p>
              <p className="text-2xl font-bold text-gray-800">
                {card.count}
                <span className="text-sm font-normal text-gray-500 ml-1">{card.unit}</span>
              </p>
            </button>
          ))}

          <div className="card p-5 bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <h3 className="font-bold text-gray-800 mb-1">最近趋势</h3>
            <p className="text-xs text-gray-500 mb-3">近7天平均睡眠</p>
            <p className="text-2xl font-bold text-gray-800">
              {sleepRecords.length > 0
                ? (sleepRecords
                    .filter((r) => new Date(r.date) >= new Date(Date.now() - 7 * 86400000))
                    .reduce((sum, r) => sum + r.duration, 0) /
                    Math.max(1, sleepRecords.filter((r) => new Date(r.date) >= new Date(Date.now() - 7 * 86400000)).length)
                  ).toFixed(1)
                : '—'}
              <span className="text-sm font-normal text-gray-500 ml-1">小时/天</span>
            </p>
          </div>

          <div className="card p-5 bg-gradient-to-br from-amber-50 to-orange-50">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-amber-600">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <h3 className="font-bold text-gray-800 mb-1">连续记录</h3>
            <p className="text-xs text-gray-500 mb-3">保持记录好习惯</p>
            <p className="text-2xl font-bold text-gray-800">
              {(() => {
                if (sleepRecords.length === 0) return '—';
                const today = new Date();
                let streak = 0;
                for (let i = 0; i < 365; i++) {
                  const checkDate = new Date(today);
                  checkDate.setDate(checkDate.getDate() - i);
                  const dateStr = checkDate.toISOString().split('T')[0];
                  if (sleepRecords.some((r) => r.date === dateStr)) {
                    streak++;
                  } else if (i > 0) {
                    break;
                  }
                }
                return streak;
              })()}
              <span className="text-sm font-normal text-gray-500 ml-1">天</span>
            </p>
          </div>
        </div>
      )}

      <div className="card p-2 mb-6 overflow-x-auto">
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
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
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

      {renderTabContent()}
    </div>
  );
}
