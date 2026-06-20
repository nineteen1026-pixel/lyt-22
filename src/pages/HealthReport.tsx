import { useState, useRef } from 'react';
import {
  BarChart3,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Moon,
  UtensilsCrossed,
  Flower2,
  Pill,
  Smile,
  Heart,
  Leaf,
  AlertTriangle,
  Info,
  CheckCircle2,
  Printer,
} from 'lucide-react';
import type { ReportRange } from '@/types';
import { useHealthReport } from '@/hooks/useHealthReport';
import { cn } from '@/lib/utils';
import ProgressRing from '@/components/reports/ProgressRing';
import LineChart from '@/components/reports/LineChart';
import BarChart from '@/components/reports/BarChart';
import DonutChart from '@/components/reports/DonutChart';

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  sleep: Moon,
  nutrition: UtensilsCrossed,
  cycle: Flower2,
  medication: Pill,
  mood: Smile,
  pain: Heart,
  postpartum: Leaf,
  menopause: Flower2,
};

const categoryLabels: Record<string, string> = {
  dysmenorrhea: '痛经',
  pregnancy: '孕期',
  ovulation: '排卵',
};

export default function HealthReport() {
  const [range, setRange] = useState<ReportRange>('week');
  const report = useHealthReport(range);
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    window.print();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 via-pink-400 to-lavender-500 flex items-center justify-center shadow-lg shadow-pink-200/50">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-800">健康报告中心</h1>
              <p className="text-gray-500 text-sm">
                {report.startDate} ~ {report.endDate} · {range === 'week' ? '周报' : '月报'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            <div className="card p-1 flex gap-1">
              <button
                onClick={() => setRange('week')}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5',
                  range === 'week'
                    ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-50'
                )}
              >
                <Calendar className="w-4 h-4" />
                周报
              </button>
              <button
                onClick={() => setRange('month')}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5',
                  range === 'month'
                    ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-50'
                )}
              >
                <Calendar className="w-4 h-4" />
                月报
              </button>
            </div>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all print:hidden"
            >
              <Download className="w-4 h-4" />
              导出 PDF
            </button>
          </div>
        </div>
      </div>

      <div ref={reportRef}>
        <section className="card p-6 md:p-8 mb-6 bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/20 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <ProgressRing
                score={report.overallScore}
                size={160}
                strokeWidth={14}
                label="综合健康分"
                sublabel={`${report.moduleScores.length} 项指标`}
              />
            </div>

            <div className="flex-1">
              <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">
                {report.overallScore >= 80
                  ? '健康状态良好 💕'
                  : report.overallScore >= 60
                  ? '继续加油哦 ✨'
                  : '需要更多关注 💪'}
              </h2>
              <p className="text-gray-600 mb-6">
                本报告汇总了 {report.startDate} 至 {report.endDate} 的健康数据，
                涵盖 {report.moduleScores.length} 个健康维度的综合评估。
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {report.moduleScores.map((m) => {
                  return (
                    <div key={m.module} className="bg-white/70 backdrop-blur rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{m.icon}</span>
                        <span className="text-xs font-medium text-gray-600">{m.moduleName}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span
                          className={cn(
                            'text-xl font-bold',
                            m.score >= 80
                              ? 'text-emerald-500'
                              : m.score >= 60
                              ? 'text-amber-500'
                              : 'text-rose-500'
                          )}
                        >
                          {m.score}
                        </span>
                        {m.trend !== 'stable' && (
                          <span
                            className={cn(
                              'text-xs flex items-center gap-0.5',
                              m.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'
                            )}
                          >
                            {m.trend === 'up' ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {Math.abs(m.trendValue)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {report.keyInsights.length > 0 && (
          <section className="mb-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-pink-500" />
              关键洞察
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.keyInsights.map((insight, i) => (
                <div
                  key={i}
                  className={cn(
                    'card p-5 border-l-4',
                    insight.type === 'warning' && 'border-amber-400 bg-amber-50/50',
                    insight.type === 'info' && 'border-sky-400 bg-sky-50/50',
                    insight.type === 'good' && 'border-emerald-400 bg-emerald-50/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{insight.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {insight.type === 'warning' && (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        )}
                        {insight.type === 'info' && <Info className="w-4 h-4 text-sky-500" />}
                        {insight.type === 'good' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        )}
                        <h4 className="font-semibold text-gray-800 text-sm">{insight.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {report.sleep && (
            <section className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-500" />
                  睡眠健康
                </h3>
                <span
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full font-medium',
                    report.sleep.avgQuality >= 4
                      ? 'bg-emerald-100 text-emerald-600'
                      : report.sleep.avgQuality >= 3
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-rose-100 text-rose-600'
                  )}
                >
                  {report.sleep.avgQuality >= 4 ? '良好' : report.sleep.avgQuality >= 3 ? '一般' : '待改善'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-indigo-50 rounded-xl">
                  <p className="text-2xl font-bold text-indigo-600">{report.sleep.avgDuration}h</p>
                  <p className="text-xs text-gray-500 mt-0.5">平均时长</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-xl">
                  <p className="text-2xl font-bold text-purple-600">{report.sleep.avgQuality}/5</p>
                  <p className="text-xs text-gray-500 mt-0.5">平均质量</p>
                </div>
                <div className="text-center p-3 bg-pink-50 rounded-xl">
                  <p className="text-2xl font-bold text-pink-600">{report.sleep.avgInterruptions}</p>
                  <p className="text-xs text-gray-500 mt-0.5">夜间中断</p>
                </div>
              </div>

              <LineChart
                data={report.sleep.weeklyTrend.map((d) => ({
                  label: d.date,
                  value: d.duration,
                  value2: d.quality * 2,
                }))}
                color="#6366f1"
                color2="#ec4899"
                legend1="睡眠时长(h)"
                legend2="睡眠质量(x2)"
                height={180}
              />
            </section>
          )}

          {report.nutrition && (
            <section className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-emerald-500" />
                  营养膳食
                </h3>
                <span
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full font-medium',
                    Math.abs(report.nutrition.avgCalories - report.nutrition.calorieTarget) /
                      report.nutrition.calorieTarget <
                      0.2
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-amber-100 text-amber-600'
                  )}
                >
                  {Math.abs(report.nutrition.avgCalories - report.nutrition.calorieTarget) /
                    report.nutrition.calorieTarget <
                  0.2
                    ? '达标'
                    : '偏离目标'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <p className="text-2xl font-bold text-emerald-600">{report.nutrition.avgCalories}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    日均热量 / {report.nutrition.calorieTarget}kcal
                  </p>
                </div>
                <div className="text-center p-3 bg-teal-50 rounded-xl">
                  <p className="text-2xl font-bold text-teal-600">{report.nutrition.avgProtein}g</p>
                  <p className="text-xs text-gray-500 mt-0.5">平均蛋白质</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-bold text-gray-700">{report.nutrition.avgCarbs}g</p>
                  <p className="text-[10px] text-gray-500">碳水</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-bold text-gray-700">{report.nutrition.avgFat}g</p>
                  <p className="text-[10px] text-gray-500">脂肪</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-bold text-gray-700">{report.nutrition.totalRecords}</p>
                  <p className="text-[10px] text-gray-500">记录数</p>
                </div>
              </div>

              <LineChart
                data={report.nutrition.weeklyTrend.map((d) => ({
                  label: d.date,
                  value: d.calories,
                }))}
                color="#10b981"
                legend1="热量摄入(kcal)"
                height={150}
              />

              {report.nutrition.topGaps.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-600 mb-2">营养素缺口</p>
                  <div className="space-y-1.5">
                    {report.nutrition.topGaps.slice(0, 3).map((g, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-700 w-16 truncate">{g.nutrientName}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                            style={{ width: `${Math.min(100, g.percentage)}%` }}
                          />
                        </div>
                        <span className="text-gray-500 w-12 text-right">{g.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {report.cycle && (
            <section className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Flower2 className="w-5 h-5 text-pink-500" />
                  周期健康
                </h3>
                <span
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full font-medium',
                    report.cycle.regularityScore >= 70
                      ? 'bg-emerald-100 text-emerald-600'
                      : report.cycle.regularityScore >= 50
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-rose-100 text-rose-600'
                  )}
                >
                  规律性 {report.cycle.regularityScore}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-pink-50 rounded-xl">
                  <p className="text-2xl font-bold text-pink-600">{report.cycle.avgCycleLength}</p>
                  <p className="text-xs text-gray-500 mt-0.5">平均周期(天)</p>
                </div>
                <div className="text-center p-3 bg-rose-50 rounded-xl">
                  <p className="text-2xl font-bold text-rose-600">{report.cycle.avgPeriodLength}</p>
                  <p className="text-xs text-gray-500 mt-0.5">经期天数</p>
                </div>
                <div className="text-center p-3 bg-fuchsia-50 rounded-xl">
                  <p className="text-2xl font-bold text-fuchsia-600">{report.cycle.periodDays}</p>
                  <p className="text-xs text-gray-500 mt-0.5">记录天数</p>
                </div>
              </div>

              {report.cycle.commonSymptoms.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">常见症状</p>
                  <BarChart
                    horizontal
                    data={report.cycle.commonSymptoms.map((s) => ({
                      label: s.symptom,
                      value: s.count,
                    }))}
                    height={120}
                  />
                </div>
              )}
            </section>
          )}

          {report.postpartum && (
            <section className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-fuchsia-500" />
                  产后恢复
                </h3>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-fuchsia-100 text-fuchsia-600">
                  {report.postpartum.completedCheckups}/{report.postpartum.totalCheckups} 复查
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-3 bg-fuchsia-50 rounded-xl">
                  <p className="text-2xl font-bold text-fuchsia-600">
                    {report.postpartum.totalPelvicFloorSessions}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">盆底训练次数</p>
                </div>
                <div className="text-center p-3 bg-pink-50 rounded-xl">
                  <p className="text-2xl font-bold text-pink-600">
                    {report.postpartum.avgPelvicFloorDuration}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">平均时长(分钟)</p>
                </div>
                <div className="text-center p-3 bg-rose-50 rounded-xl">
                  <p className="text-2xl font-bold text-rose-600">
                    {report.postpartum.totalBreastfeedingSessions}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">哺乳次数</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-xl">
                  <p className="text-2xl font-bold text-red-600">{report.postpartum.lochiaRecordsCount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">恶露记录</p>
                </div>
              </div>

              {report.postpartum.pelvicFloorTrend.length > 0 && (
                <LineChart
                  data={report.postpartum.pelvicFloorTrend.map((d) => ({
                    label: d.date,
                    value: d.totalDuration,
                  }))}
                  color="#d946ef"
                  legend1="训练时长(分钟)"
                  height={140}
                />
              )}
            </section>
          )}

          {report.medication && (
            <section className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-sky-500" />
                  用药依从
                </h3>
                <span
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full font-medium',
                    report.medication.adherenceRate >= 80
                      ? 'bg-emerald-100 text-emerald-600'
                      : report.medication.adherenceRate >= 60
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-rose-100 text-rose-600'
                  )}
                >
                  依从率 {report.medication.adherenceRate}%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-sky-50 rounded-xl">
                  <p className="text-2xl font-bold text-sky-600">{report.medication.activeReminders}</p>
                  <p className="text-xs text-gray-500 mt-0.5">活跃提醒</p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <p className="text-2xl font-bold text-emerald-600">{report.medication.totalTaken}</p>
                  <p className="text-xs text-gray-500 mt-0.5">已服用</p>
                </div>
                <div className="text-center p-3 bg-rose-50 rounded-xl">
                  <p className="text-2xl font-bold text-rose-600">{report.medication.totalSkipped}</p>
                  <p className="text-xs text-gray-500 mt-0.5">已跳过</p>
                </div>
              </div>

              {report.medication.adherenceByCategory.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">分类依从率</p>
                  <BarChart
                    horizontal
                    data={report.medication.adherenceByCategory.map((c) => ({
                      label: categoryLabels[c.category] || c.category,
                      value: c.rate,
                      color: c.rate >= 80 ? '#10b981' : c.rate >= 60 ? '#f59e0b' : '#f43f5e',
                    }))}
                    valueFormat={(v) => `${v}%`}
                    maxValue={100}
                    height={80}
                  />
                </div>
              )}
            </section>
          )}

          {report.mood && (
            <section className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Smile className="w-5 h-5 text-peach-500" />
                  情绪状态
                </h3>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-orange-100 text-orange-600">
                  强度 {report.mood.avgIntensity}/10
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {report.mood.moodDistribution.length > 0 && (
                  <DonutChart
                    data={report.mood.moodDistribution.map((m, i) => ({
                      label: m.mood,
                      value: m.count,
                      color: ['#fb923c', '#f472b6', '#a78bfa', '#34d399', '#60a5fa', '#f87171'][i % 6],
                    }))}
                    size={120}
                    thickness={18}
                    centerValue={String(report.mood.totalRecords)}
                    centerLabel="条记录"
                  />
                )}

                {report.mood.recentMoodTrend.length > 0 && (
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600 mb-2">情绪强度趋势</p>
                    <LineChart
                      data={report.mood.recentMoodTrend.map((d) => ({
                        label: d.date,
                        value: d.intensity,
                      }))}
                      color="#fb923c"
                      height={120}
                      yAxisMax={10}
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          {report.pain && (
            <section className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  疼痛管理
                </h3>
                <span
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full font-medium',
                    report.pain.avgLevel < 4
                      ? 'bg-emerald-100 text-emerald-600'
                      : report.pain.avgLevel < 6
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-rose-100 text-rose-600'
                  )}
                >
                  平均 {report.pain.avgLevel}/10
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-rose-50 rounded-xl">
                  <p className="text-2xl font-bold text-rose-600">{report.pain.painDays}</p>
                  <p className="text-xs text-gray-500 mt-0.5">疼痛天数</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-xl">
                  <p className="text-2xl font-bold text-red-600">{report.pain.severePainDays}</p>
                  <p className="text-xs text-gray-500 mt-0.5">重度疼痛</p>
                </div>
                <div className="text-center p-3 bg-pink-50 rounded-xl">
                  <p className="text-2xl font-bold text-pink-600">{report.pain.totalRecords}</p>
                  <p className="text-xs text-gray-500 mt-0.5">记录总数</p>
                </div>
              </div>

              {report.pain.levelDistribution.length > 0 && (
                <BarChart
                  data={report.pain.levelDistribution.map((d) => ({
                    label: `${d.level}级`,
                    value: d.count,
                  }))}
                  height={120}
                />
              )}
            </section>
          )}

          {report.menopause && (
            <section className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Flower2 className="w-5 h-5 text-purple-500" />
                  更年期
                </h3>
                <span
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full font-medium',
                    report.menopause.avgHotFlashSeverity < 1.5
                      ? 'bg-emerald-100 text-emerald-600'
                      : report.menopause.avgHotFlashSeverity < 2.5
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-rose-100 text-rose-600'
                  )}
                >
                  潮热 {report.menopause.avgHotFlashSeverity}/3
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-purple-50 rounded-xl">
                  <p className="text-2xl font-bold text-purple-600">
                    {report.menopause.totalHotFlashRecords}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">潮热次数</p>
                </div>
                <div className="text-center p-3 bg-lavender-50 rounded-xl">
                  <p className="text-2xl font-bold text-lavender-600">
                    {report.menopause.avgHotFlashDuration}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">平均时长(分)</p>
                </div>
                <div className="text-center p-3 bg-violet-50 rounded-xl">
                  <p className="text-2xl font-bold text-violet-600">
                    {report.menopause.hormoneRecordsCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">激素检测</p>
                </div>
              </div>

              {report.menopause.hotFlashTrend.length > 0 && (
                <LineChart
                  data={report.menopause.hotFlashTrend.map((d) => ({
                    label: d.date,
                    value: d.count,
                  }))}
                  color="#8b5cf6"
                  legend1="潮热次数"
                  height={140}
                />
              )}

              {report.menopause.latestHormones && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    最新激素数据 ({report.menopause.latestHormones.date})
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {report.menopause.latestHormones.estrogen !== undefined && (
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm font-bold text-gray-700">
                          {report.menopause.latestHormones.estrogen}
                        </p>
                        <p className="text-[10px] text-gray-500">雌激素</p>
                      </div>
                    )}
                    {report.menopause.latestHormones.progesterone !== undefined && (
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm font-bold text-gray-700">
                          {report.menopause.latestHormones.progesterone}
                        </p>
                        <p className="text-[10px] text-gray-500">孕酮</p>
                      </div>
                    )}
                    {report.menopause.latestHormones.fsh !== undefined && (
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm font-bold text-gray-700">
                          {report.menopause.latestHormones.fsh}
                        </p>
                        <p className="text-[10px] text-gray-500">FSH</p>
                      </div>
                    )}
                    {report.menopause.latestHormones.lh !== undefined && (
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm font-bold text-gray-700">
                          {report.menopause.latestHormones.lh}
                        </p>
                        <p className="text-[10px] text-gray-500">LH</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        <section className="mt-8 text-center text-xs text-gray-400 print:text-gray-600">
          <p>报告生成时间：{new Date(report.generatedAt).toLocaleString('zh-CN')}</p>
          <p className="mt-1">💕 她的周期 · 健康报告中心</p>
        </section>
      </div>

      <div className="print:hidden fixed bottom-6 right-6">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-3 bg-gray-800 text-white rounded-full shadow-xl hover:bg-gray-700 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span className="text-sm font-medium">打印 / 保存 PDF</span>
        </button>
      </div>

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white; }
          .card { break-inside: avoid; box-shadow: none !important; border: 1px solid #e5e7eb !important; }
          section { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
