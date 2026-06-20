import { useMemo } from 'react';
import { Dumbbell, CheckCircle2, Clock, Flame, Target, TrendingUp, Plus, Play, ChevronRight, Award, HeartPulse, Activity } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import ProgressRing from '@/components/reports/ProgressRing';
import type { RehabExercise } from '@/types';

interface RehabOverviewProps {
  onSwitchTab: (tab: 'overview' | 'phases' | 'exercises' | 'checkin' | 'progress') => void;
  onSelectExercise: (exercise: RehabExercise) => void;
  onOpenCheckin: () => void;
  onOpenNewPlan: () => void;
}

const moodLabels: Record<string, { label: string; emoji: string; color: string }> = {
  good: { label: '很棒', emoji: '😊', color: 'text-emerald-500' },
  normal: { label: '一般', emoji: '🙂', color: 'text-sky-500' },
  tired: { label: '疲惫', emoji: '😩', color: 'text-amber-500' },
  bad: { label: '不佳', emoji: '😣', color: 'text-rose-500' },
};

const phaseGradientMap: Record<string, string> = {
  phase1: 'from-sky-400 to-cyan-500',
  phase2: 'from-teal-400 to-emerald-500',
  phase3: 'from-violet-400 to-purple-500',
  phase4: 'from-fuchsia-400 to-pink-500',
};

export default function RehabOverview({ onSwitchTab, onSelectExercise, onOpenCheckin, onOpenNewPlan }: RehabOverviewProps) {
  const {
    rehabPlans,
    activeRehabPlanId,
    getRehabProgress,
    getCurrentRehabPhase,
    getWeeklyRehabStats,
    getRehabCheckinsByPlan,
    getRehabMilestonesByPlan,
  } = useAppStore();

  const activePlan = useMemo(
    () => rehabPlans.find((p) => p.id === activeRehabPlanId) || rehabPlans[0],
    [rehabPlans, activeRehabPlanId]
  );

  const progress = useMemo(
    () => (activePlan ? getRehabProgress(activePlan.id) : null),
    [activePlan, getRehabProgress]
  );

  const currentPhase = useMemo(
    () => (activePlan ? getCurrentRehabPhase(activePlan.id) : null),
    [activePlan, getCurrentRehabPhase]
  );

  const weeklyStats = useMemo(
    () => (activePlan ? getWeeklyRehabStats(activePlan.id) : null),
    [activePlan, getWeeklyRehabStats]
  );

  const planCheckins = useMemo(
    () => (activePlan ? getRehabCheckinsByPlan(activePlan.id) : []),
    [activePlan, getRehabCheckinsByPlan]
  );

  const milestones = useMemo(
    () => (activePlan ? getRehabMilestonesByPlan(activePlan.id) : []),
    [activePlan, getRehabMilestonesByPlan]
  );

  const overallProgress = progress
    ? Math.round(
        Object.values(progress.phaseProgress).reduce((a, b) => a + b, 0) /
          Object.values(progress.phaseProgress).length
      )
    : 0;

  return (
    <div className="space-y-6">
      <div className="card p-6 bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-500 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-white/80 text-sm mb-1">当前训练计划</p>
            <h2 className="font-display text-3xl font-bold mb-2">{activePlan?.name || '暂无计划'}</h2>
            <p className="text-white/90">
              {currentPhase ? `${currentPhase.name} · 进行中 🏋️‍♀️` : '开始创建你的康复计划吧'}
            </p>
            {activePlan && (
              <p className="text-white/70 text-sm mt-2">
                开始于 {activePlan.startDate}
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <ProgressRing
                score={overallProgress}
                size={100}
                strokeWidth={8}
                label="总进度"
                sublabel={`${overallProgress}%`}
              />
            </div>
            <div className="flex flex-col justify-center gap-3">
              <button
                onClick={onOpenCheckin}
                className="flex items-center gap-2 px-5 py-3 bg-white text-teal-600 rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                今日打卡
              </button>
              <button
                onClick={onOpenNewPlan}
                className="flex items-center gap-2 px-5 py-3 bg-white/20 text-white border border-white/30 rounded-full font-medium hover:bg-white/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                新建计划
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 bg-gradient-to-br from-rose-50 to-pink-50">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Flame className="w-5 h-5 text-rose-500" />
            </div>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xs text-gray-500 mb-1">连续打卡</p>
          <p className="text-2xl font-bold text-gray-800">
            {progress?.weeklyStreak || 0}
            <span className="text-sm font-normal text-gray-500 ml-1">天</span>
          </p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs text-gray-500 mb-1">总打卡次数</p>
          <p className="text-2xl font-bold text-gray-800">
            {progress?.totalCheckins || 0}
            <span className="text-sm font-normal text-gray-500 ml-1">次</span>
          </p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-violet-50 to-purple-50">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Clock className="w-5 h-5 text-violet-500" />
            </div>
            <TrendingUp className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-xs text-gray-500 mb-1">本周训练分钟</p>
          <p className="text-2xl font-bold text-gray-800">
            {weeklyStats?.totalMinutes || 0}
            <span className="text-sm font-normal text-gray-500 ml-1">分钟</span>
          </p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <HeartPulse className="w-5 h-5 text-amber-500" />
            </div>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xs text-gray-500 mb-1">本周平均疼痛</p>
          <p className="text-2xl font-bold text-gray-800">
            {weeklyStats?.avgPain || 0}
            <span className="text-sm font-normal text-gray-500 ml-1">/ 10</span>
          </p>
        </div>
      </div>

      {milestones.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              里程碑
            </h3>
            <span className="text-xs text-gray-400">
              {milestones.filter((m) => m.achieved).length} / {milestones.length} 已达成
            </span>
          </div>
          <div className="space-y-3">
            {milestones.map((milestone) => {
              const milestoneProgress = milestone.targetValue > 0
                ? Math.min(100, Math.round((milestone.currentValue / milestone.targetValue) * 100))
                : 0;
              const gradient = phaseGradientMap[milestone.phaseId] || 'from-sky-400 to-cyan-500';
              return (
                <div
                  key={milestone.id}
                  className={cn(
                    'p-4 rounded-xl transition-all',
                    milestone.achieved
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100'
                      : 'bg-gray-50 border border-gray-100'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{milestone.icon}</span>
                      <span className={cn('text-sm font-medium', milestone.achieved ? 'text-emerald-700' : 'text-gray-700')}>
                        {milestone.title}
                      </span>
                    </div>
                    {milestone.achieved ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <span className="text-xs text-gray-400">{milestoneProgress}%</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{milestone.description}</p>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full bg-gradient-to-r rounded-full transition-all duration-1000',
                        milestone.achieved ? 'from-emerald-400 to-teal-500' : gradient
                      )}
                      style={{ width: `${milestoneProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-gray-400">
                      {milestone.currentValue} / {milestone.targetValue} {milestone.unit}
                    </span>
                    {milestone.achieved && milestone.achievedDate && (
                      <span className="text-[10px] text-emerald-500">{milestone.achievedDate} 达成</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {currentPhase && (
        <div className="card p-6 bg-gradient-to-br from-sky-50 to-cyan-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Target className="w-5 h-5 text-sky-500" />
              {currentPhase.name}
            </h3>
            <button
              onClick={() => onSwitchTab('phases')}
              className="text-sm text-sky-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              查看详情 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">{currentPhase.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white/70 p-4 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">阶段目标</p>
              <div className="flex flex-wrap gap-1">
                {currentPhase.goals.slice(0, 2).map((goal, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-sky-100 text-sky-600 rounded-full">
                    {goal}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white/70 p-4 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">训练频率</p>
              <p className="text-lg font-bold text-gray-800">每周 {currentPhase.weeklyFrequency} 次</p>
            </div>
            <div className="bg-white/70 p-4 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">训练动作</p>
              <p className="text-lg font-bold text-gray-800">{currentPhase.exercises.length} 个动作</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600">今日推荐训练：</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {currentPhase.exercises.slice(0, 3).map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    onSelectExercise(ex);
                    onSwitchTab('exercises');
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-sky-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{ex.name}</p>
                    <p className="text-xs text-gray-500">{ex.duration}分钟 · {ex.sets}组{ex.reps}次</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-500" />
            阶段进度
          </h3>
          <div className="space-y-4">
            {activePlan?.phases.map((phase) => {
              const phaseProg = progress?.phaseProgress[phase.id] || 0;
              const isCurrent = currentPhase?.id === phase.id;
              return (
                <div key={phase.id} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {phaseProg >= 100 ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : isCurrent ? (
                        <div className={cn('w-5 h-5 rounded-full bg-gradient-to-r', phase.gradient)} />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                      )}
                      <span className={cn('text-sm font-medium', isCurrent ? phase.color : 'text-gray-700')}>
                        {phase.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{phaseProg}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden ml-7">
                    <div
                      className={cn('h-full bg-gradient-to-r rounded-full transition-all duration-1000', phase.gradient)}
                      style={{ width: `${phaseProg}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            最近打卡
          </h3>
          {planCheckins.length > 0 ? (
            <div className="space-y-2">
              {planCheckins.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center text-lg">
                      {moodLabels[record.mood].emoji}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {record.completedExercises.length} 个动作 · {record.totalDuration} 分钟
                      </p>
                      <p className="text-xs text-gray-500">{record.date} {record.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">疼痛</p>
                    <p className="text-sm font-bold text-gray-700">{record.painLevel}/10</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">暂无打卡记录，开始今天的训练吧！</p>
          )}
        </div>
      </div>
    </div>
  );
}
