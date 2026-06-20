import { Dumbbell, CheckCircle2, Target, ChevronRight, Star } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { RehabPhaseType, RehabExercise } from '@/types';

interface RehabPhasesProps {
  selectedPhase: RehabPhaseType | null;
  onSelectPhase: (phaseId: RehabPhaseType | null) => void;
  onSelectExercise: (exercise: RehabExercise) => void;
  onSwitchTab: (tab: 'exercises') => void;
}

const exerciseCategoryNames: Record<string, string> = {
  warmup: '热身',
  strength: '力量',
  cardio: '有氧',
  flexibility: '柔韧',
  breathing: '呼吸',
  'cool-down': '放松',
};

const phaseIndexMap: Record<RehabPhaseType, number> = {
  phase1: 1,
  phase2: 2,
  phase3: 3,
  phase4: 4,
};

export default function RehabPhases({
  selectedPhase,
  onSelectPhase,
  onSelectExercise,
  onSwitchTab,
}: RehabPhasesProps) {
  const { rehabPlans, activeRehabPlanId, getRehabProgress, getCurrentRehabPhase } = useAppStore();

  const activePlan = rehabPlans.find((p) => p.id === activeRehabPlanId);
  const progress = activeRehabPlanId ? getRehabProgress(activeRehabPlanId) : null;
  const currentPhase = activeRehabPlanId ? getCurrentRehabPhase(activeRehabPlanId) : null;

  if (!activePlan) {
    return (
      <div className="card p-6 text-center">
        <Dumbbell className="w-10 h-10 mx-auto mb-3 text-gray-300" />
        <p className="text-sm text-gray-400">暂无康复计划</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <Target className="w-5 h-5 text-violet-500" />
        康复阶段总览
      </h2>

      <div className="relative pl-8">
        <div className="absolute left-3 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-sky-300 via-teal-300 via-violet-300 to-fuchsia-300" />

        <div className="space-y-6">
          {activePlan.phases.map((phase) => {
            const isCurrent = currentPhase?.id === phase.id;
            const isCompleted = progress ? progress.phaseProgress[phase.id] >= 100 : false;
            const isExpanded = selectedPhase === phase.id;
            const phaseProgress = progress ? progress.phaseProgress[phase.id] : 0;

            return (
              <div key={phase.id} className="relative">
                <div className="absolute -left-5 top-1 z-10">
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : isCurrent ? (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 via-violet-400 to-fuchsia-400 shadow-lg" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-gray-400">
                        {phaseIndexMap[phase.id]}
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className={cn(
                    'ml-4 p-4 rounded-xl border transition-all cursor-pointer',
                    isExpanded
                      ? 'bg-white shadow-lg border-violet-200'
                      : 'bg-gradient-to-r from-white to-gray-50/80 border-gray-100 hover:shadow-md'
                  )}
                  onClick={() => onSelectPhase(isExpanded ? null : phase.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-base font-bold', phase.color)}>{phase.name}</span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white">
                          进行中
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{phaseProgress}%</span>
                  </div>

                  <p className="text-xs text-gray-500 mb-3">{phase.description}</p>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-sky-50 to-cyan-50 text-center">
                      <p className="text-sm font-bold text-sky-600">{phase.durationWeeks}</p>
                      <p className="text-[10px] text-gray-400">时长(周)</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-teal-50 to-emerald-50 text-center">
                      <p className="text-sm font-bold text-teal-600">{phase.weeklyFrequency}</p>
                      <p className="text-[10px] text-gray-400">频率(周)</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 text-center">
                      <p className="text-sm font-bold text-violet-600">{phase.exercises.length}</p>
                      <p className="text-[10px] text-gray-400">动作数</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {phase.goals.map((goal, i) => (
                      <span
                        key={i}
                        className={cn(
                          'px-2.5 py-0.5 text-[10px] font-medium rounded-full bg-gradient-to-r',
                          i % 4 === 0 && 'from-sky-100 to-cyan-100 text-sky-700',
                          i % 4 === 1 && 'from-teal-100 to-emerald-100 text-teal-700',
                          i % 4 === 2 && 'from-violet-100 to-purple-100 text-violet-700',
                          i % 4 === 3 && 'from-fuchsia-100 to-pink-100 text-fuchsia-700'
                        )}
                      >
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>

                {isExpanded && (
                  <div className="ml-4 mt-2 space-y-2">
                    {phase.exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectExercise(exercise);
                          onSwitchTab('exercises');
                        }}
                      >
                        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                          exercise.category === 'strength' && 'bg-gradient-to-br from-orange-100 to-amber-100',
                          exercise.category === 'breathing' && 'bg-gradient-to-br from-sky-100 to-cyan-100',
                          exercise.category === 'flexibility' && 'bg-gradient-to-br from-violet-100 to-purple-100',
                          exercise.category === 'cardio' && 'bg-gradient-to-br from-rose-100 to-pink-100',
                          exercise.category === 'warmup' && 'bg-gradient-to-br from-yellow-100 to-amber-100',
                          exercise.category === 'cool-down' && 'bg-gradient-to-br from-teal-100 to-emerald-100'
                        )}>
                          <Dumbbell className="w-4 h-4 text-gray-500" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{exercise.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            <span>{exerciseCategoryNames[exercise.category] || exercise.category}</span>
                            <span>·</span>
                            <span>{exercise.duration}分钟</span>
                            <span>·</span>
                            <span>{exercise.sets}组×{exercise.reps}次</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn(
                                'w-3 h-3',
                                s <= exercise.difficulty
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-gray-200'
                              )}
                            />
                          ))}
                        </div>

                        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
