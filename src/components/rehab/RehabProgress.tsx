import { useMemo } from 'react';
import { CheckCircle2, Circle, Target, TrendingUp, Flame, Activity, ListChecks, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import ProgressRing from '@/components/reports/ProgressRing';

const DAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

const phaseIconColors: Record<string, string> = {
  phase1: 'text-sky-600',
  phase2: 'text-teal-600',
  phase3: 'text-violet-600',
  phase4: 'text-fuchsia-600',
};

export default function RehabProgress() {
  const {
    rehabPlans,
    activeRehabPlanId,
    getRehabProgress,
    getCurrentRehabPhase,
    getWeeklyRehabStats,
    getRehabBodyMetricTrend,
  } = useAppStore();

  const planId = activeRehabPlanId;
  const plan = rehabPlans.find((p) => p.id === planId) ?? null;

  const progress = useMemo(() => planId ? getRehabProgress(planId) : null, [planId, getRehabProgress]);
  const currentPhase = useMemo(() => planId ? getCurrentRehabPhase(planId) : null, [planId, getCurrentRehabPhase]);
  const weeklyStats = useMemo(() => planId ? getWeeklyRehabStats(planId) : null, [planId, getWeeklyRehabStats]);
  const bodyTrend = useMemo(() => planId ? getRehabBodyMetricTrend(planId) : [], [planId, getRehabBodyMetricTrend]);

  const overallProgress = useMemo(() => {
    if (!progress || !plan) return 0;
    const phases = plan.phases;
    if (phases.length === 0) return 0;
    const total = phases.reduce((sum, p) => sum + (progress.phaseProgress[p.id] ?? 0), 0);
    return Math.round(total / phases.length);
  }, [progress, plan]);

  const weekDays = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);

    const completedDateSet = new Set(weeklyStats?.completedDays ?? []);
    const todayStr = now.toISOString().split('T')[0];

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      return {
        dateStr,
        dayNum: d.getDate(),
        label: DAY_LABELS[(i + 1) % 7],
        isToday: dateStr === todayStr,
        isFuture: d > now,
        isCompleted: completedDateSet.has(dateStr),
      };
    });
  }, [weeklyStats]);

  if (!planId || !plan) {
    return (
      <div className="card p-8 text-center">
        <Circle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-400">暂无康复计划</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 bg-gradient-to-br from-sky-50 to-cyan-50">
          <h3 className="font-display text-lg font-bold text-gray-800 mb-4 text-center">整体进度</h3>
          <div className="flex justify-center">
            <div className="relative">
              <ProgressRing
                score={overallProgress}
                size={140}
                strokeWidth={12}
                gradient="from-sky-400 to-cyan-500"
                label="完成率"
                sublabel={`${progress?.totalCheckins ?? 0} 次打卡`}
              />
            </div>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-emerald-500" />
            <h3 className="font-display text-lg font-bold text-gray-800">打卡统计</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/70">
              <span className="text-sm text-gray-500">连续打卡</span>
              <span className="font-bold text-emerald-600">{progress?.weeklyStreak ?? 0} 天</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/70">
              <span className="text-sm text-gray-500">累计打卡</span>
              <span className="font-bold text-emerald-600">{progress?.totalCheckins ?? 0} 次</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/70">
              <span className="text-sm text-gray-500">本周训练</span>
              <span className="font-bold text-emerald-600">{weeklyStats?.totalMinutes ?? 0} 分钟</span>
            </div>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-violet-50 to-purple-50">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-violet-500" />
            <h3 className="font-display text-lg font-bold text-gray-800">当前阶段</h3>
          </div>
          {currentPhase ? (
            <div className="space-y-3">
              <div>
                <p className={cn('font-bold text-lg', currentPhase.color)}>{currentPhase.name}</p>
                <p className="text-sm text-gray-500 mt-1">{currentPhase.description}</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">阶段进度</span>
                  <span className="text-xs font-medium text-violet-600">
                    {progress?.phaseProgress[currentPhase.id] ?? 0}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-white/70 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full bg-gradient-to-r', currentPhase.gradient)}
                    style={{ width: `${progress?.phaseProgress[currentPhase.id] ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">暂无阶段信息</p>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-sky-500" />
          <h3 className="font-display text-lg font-bold text-gray-800">身体指标趋势</h3>
        </div>
        {bodyTrend.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100">
                  <th className="text-left py-2 font-medium">日期</th>
                  <th className="text-right py-2 font-medium">体重(kg)</th>
                  <th className="text-right py-2 font-medium">盆底肌评分</th>
                  <th className="text-right py-2 font-medium">腹直肌分离(指)</th>
                </tr>
              </thead>
              <tbody>
                {bodyTrend.map((row, idx) => {
                  const prev = idx > 0 ? bodyTrend[idx - 1] : null;
                  const weightTrend = prev?.weight != null && row.weight != null
                    ? row.weight - prev.weight : null;
                  const pelvicTrend = prev?.pelvicFloorScore != null && row.pelvicFloorScore != null
                    ? row.pelvicFloorScore - prev.pelvicFloorScore : null;
                  const drTrend = prev?.diastasisRecti != null && row.diastasisRecti != null
                    ? row.diastasisRecti - prev.diastasisRecti : null;

                  return (
                    <tr key={row.date} className="border-b border-gray-50 last:border-0">
                      <td className="py-2.5 text-gray-700">{row.date}</td>
                      <td className="py-2.5 text-right">
                        <span className="text-gray-700">{row.weight ?? '—'}</span>
                        {weightTrend != null && weightTrend !== 0 && (
                          <span className={cn('ml-1 inline-flex items-center text-xs', weightTrend < 0 ? 'text-emerald-500' : 'text-rose-500')}>
                            {weightTrend < 0 ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {Math.abs(weightTrend).toFixed(1)}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="text-gray-700">{row.pelvicFloorScore ?? '—'}</span>
                        {pelvicTrend != null && pelvicTrend !== 0 && (
                          <span className={cn('ml-1 inline-flex items-center text-xs', pelvicTrend > 0 ? 'text-emerald-500' : 'text-rose-500')}>
                            {pelvicTrend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(pelvicTrend)}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="text-gray-700">{row.diastasisRecti ?? '—'}</span>
                        {drTrend != null && drTrend !== 0 && (
                          <span className={cn('ml-1 inline-flex items-center text-xs', drTrend < 0 ? 'text-emerald-500' : 'text-rose-500')}>
                            {drTrend < 0 ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {Math.abs(drTrend).toFixed(1)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">暂无身体指标数据，请在打卡时记录</p>
        )}
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          <h3 className="font-display text-lg font-bold text-gray-800">本周训练日历</h3>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div key={day.dateStr} className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">{day.label}</span>
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                  day.isCompleted && 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md',
                  !day.isCompleted && day.isToday && 'ring-2 ring-sky-300 text-sky-600 font-bold',
                  !day.isCompleted && !day.isToday && !day.isFuture && 'bg-gray-100 text-gray-600',
                  day.isFuture && 'text-gray-300'
                )}
              >
                {day.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : day.dayNum}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <ListChecks className="w-5 h-5 text-violet-500" />
          <h3 className="font-display text-lg font-bold text-gray-800">各阶段完成情况</h3>
        </div>
        <div className="space-y-4">
          {plan.phases.map((phase) => {
            const pct = progress?.phaseProgress[phase.id] ?? 0;
            const isActive = currentPhase?.id === phase.id;
            return (
              <div key={phase.id} className="flex items-start gap-3">
                <div className={cn('w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0', phaseIconColors[phase.id] ?? 'text-gray-500')}>
                  <Circle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800 text-sm">{phase.name}</span>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gradient-to-r from-sky-400 to-cyan-500 text-white">
                        进行中
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    {phase.durationWeeks}周 · {phase.exercises.length}个动作
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full bg-gradient-to-r', phase.gradient)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-500 w-10 text-right">{pct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
