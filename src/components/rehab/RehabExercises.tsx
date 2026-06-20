import { useMemo } from 'react';
import { Dumbbell, Target, Award, AlertTriangle, CheckCircle2, Play, Star } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { RehabExercise } from '@/types';

interface RehabExercisesProps {
  selectedExercise: RehabExercise | null;
  onSelectExercise: (exercise: RehabExercise | null) => void;
  onOpenCheckin: (exerciseId: string) => void;
}

const exerciseCategoryNames: Record<string, string> = {
  warmup: '热身', strength: '力量', cardio: '有氧',
  flexibility: '柔韧', breathing: '呼吸', 'cool-down': '放松',
};

function formatRest(seconds: number): string {
  return seconds >= 60
    ? `${Math.floor(seconds / 60)}分钟`
    : `${seconds}秒`;
}

export default function RehabExercises({
  selectedExercise,
  onSelectExercise,
  onOpenCheckin,
}: RehabExercisesProps) {
  const { rehabPlans, activeRehabPlanId, getCurrentRehabPhase } = useAppStore();

  const activePlan = useMemo(
    () => rehabPlans.find((p) => p.id === activeRehabPlanId) || rehabPlans[0],
    [rehabPlans, activeRehabPlanId]
  );

  const currentPhase = useMemo(
    () => (activePlan ? getCurrentRehabPhase(activePlan.id) : null),
    [activePlan, getCurrentRehabPhase]
  );

  const exercises = currentPhase?.exercises || [];

  if (selectedExercise) {
    return (
      <div className="card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <button
              onClick={() => onSelectExercise(null)}
              className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
            >
              ← 返回动作列表
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedExercise.name}</h3>
            <div className="flex items-center gap-3">
              <span className="text-xs px-2.5 py-1 bg-sky-100 text-sky-600 rounded-full font-medium">
                {exerciseCategoryNames[selectedExercise.category]}
              </span>
              <span className="text-xs text-gray-500">{selectedExercise.duration} 分钟</span>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-4 h-4',
                      i < selectedExercise.difficulty ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                    )}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1">难度</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onOpenCheckin(selectedExercise.id)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            标记完成
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-sky-50 to-cyan-50 p-5 rounded-2xl">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-sky-500" />
                动作说明
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">{selectedExercise.description}</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                训练小贴士
              </h4>
              <ul className="space-y-2">
                {selectedExercise.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {selectedExercise.precautions && selectedExercise.precautions.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  注意事项
                </h4>
                <ul className="space-y-2">
                  {selectedExercise.precautions.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-amber-400 mt-0.5">!</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 p-4 rounded-2xl text-center">
                <p className="text-xs text-gray-500 mb-1">组数</p>
                <p className="text-2xl font-bold text-gray-800">{selectedExercise.sets}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl text-center">
                <p className="text-xs text-gray-500 mb-1">每组次数</p>
                <p className="text-2xl font-bold text-gray-800">{selectedExercise.reps}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl text-center">
                <p className="text-xs text-gray-500 mb-1">组间休息</p>
                <p className="text-2xl font-bold text-gray-800">{formatRest(selectedExercise.restSeconds)}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-400 p-6 rounded-2xl text-white">
              <h4 className="font-bold mb-2">预计总时长</h4>
              <p className="text-4xl font-display font-bold mb-2">{selectedExercise.duration} 分钟</p>
              <p className="text-white/80 text-sm">
                包含 {selectedExercise.sets} 组训练和组间休息时间
              </p>
            </div>

            <button
              onClick={() => onOpenCheckin(selectedExercise.id)}
              className="w-full py-4 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              开始训练并打卡
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-violet-500" />
            当前阶段训练动作
            {currentPhase && (
              <span className={cn('text-sm font-normal', currentPhase.color)}>
                · {currentPhase.name}
              </span>
            )}
          </h3>
        </div>

        {exercises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.map((ex) => (
              <div
                key={ex.id}
                className="group p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-violet-200 transition-all cursor-pointer"
                onClick={() => onSelectExercise(ex)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-3.5 h-3.5',
                          i < ex.difficulty ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <h4 className="font-bold text-gray-800 mb-1 group-hover:text-violet-600 transition-colors">
                  {ex.name}
                </h4>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{ex.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-violet-100 text-violet-600 rounded-full">
                    {exerciseCategoryNames[ex.category]}
                  </span>
                  <span className="text-xs text-gray-500">{ex.duration}分钟</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">当前阶段暂无训练动作</p>
        )}
      </div>
    </div>
  );
}
