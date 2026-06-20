import { useState } from 'react';
import { CheckCircle2, Plus, X, HeartPulse, Activity } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { RehabCheckin } from '@/types';

const moodLabels: Record<RehabCheckin['mood'], { label: string; emoji: string; color: string }> = {
  good: { label: '很棒', emoji: '😊', color: 'text-emerald-500' },
  normal: { label: '一般', emoji: '🙂', color: 'text-sky-500' },
  tired: { label: '疲惫', emoji: '😩', color: 'text-amber-500' },
  bad: { label: '不佳', emoji: '😣', color: 'text-rose-500' },
};

const painLabels = ['无痛', '轻微', '中等', '剧烈'];

export default function RehabCheckin() {
  const {
    rehabPlans,
    activeRehabPlanId,
    addRehabCheckin,
    addRehabBodyMetric,
    getCurrentRehabPhase,
    getRehabCheckinsByPlan,
  } = useAppStore();

  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkinForm, setCheckinForm] = useState({
    completedExercises: [] as string[],
    totalDuration: 30,
    painLevel: 0,
    fatigueLevel: 2,
    mood: 'good' as RehabCheckin['mood'],
    notes: '',
    bodyMetrics: {
      weight: '' as string,
      pelvicFloorScore: '' as string,
      diastasisRecti: '' as string,
    },
  });

  const activePlan = rehabPlans.find((p) => p.id === activeRehabPlanId);
  const currentPhase = activeRehabPlanId ? getCurrentRehabPhase(activeRehabPlanId) : null;
  const checkins = activeRehabPlanId ? getRehabCheckinsByPlan(activeRehabPlanId) : [];

  const sortedCheckins = [...checkins].sort(
    (a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)
  );

  const toggleExercise = (exerciseId: string) => {
    setCheckinForm((prev) => ({
      ...prev,
      completedExercises: prev.completedExercises.includes(exerciseId)
        ? prev.completedExercises.filter((id) => id !== exerciseId)
        : [...prev.completedExercises, exerciseId],
    }));
  };

  const handleSubmit = () => {
    if (!activeRehabPlanId || !currentPhase) return;

    const now = new Date();
    addRehabCheckin({
      planId: activeRehabPlanId,
      phaseId: currentPhase.id,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      completedExercises: checkinForm.completedExercises,
      totalDuration: checkinForm.totalDuration,
      painLevel: checkinForm.painLevel,
      fatigueLevel: checkinForm.fatigueLevel,
      mood: checkinForm.mood,
      bodyMetrics:
        checkinForm.bodyMetrics.weight ||
        checkinForm.bodyMetrics.pelvicFloorScore ||
        checkinForm.bodyMetrics.diastasisRecti
          ? {
              weight: checkinForm.bodyMetrics.weight
                ? Number(checkinForm.bodyMetrics.weight)
                : undefined,
              pelvicFloorScore: checkinForm.bodyMetrics.pelvicFloorScore
                ? Number(checkinForm.bodyMetrics.pelvicFloorScore)
                : undefined,
              diastasisRecti: checkinForm.bodyMetrics.diastasisRecti
                ? Number(checkinForm.bodyMetrics.diastasisRecti)
                : undefined,
            }
          : undefined,
      notes: checkinForm.notes || undefined,
    });

    if (
      checkinForm.bodyMetrics.weight ||
      checkinForm.bodyMetrics.pelvicFloorScore ||
      checkinForm.bodyMetrics.diastasisRecti
    ) {
      addRehabBodyMetric({
        planId: activeRehabPlanId,
        date: new Date().toISOString().split('T')[0],
        weight: checkinForm.bodyMetrics.weight
          ? Number(checkinForm.bodyMetrics.weight)
          : undefined,
        pelvicFloorScore: checkinForm.bodyMetrics.pelvicFloorScore
          ? Number(checkinForm.bodyMetrics.pelvicFloorScore)
          : undefined,
        diastasisRecti: checkinForm.bodyMetrics.diastasisRecti
          ? Number(checkinForm.bodyMetrics.diastasisRecti)
          : undefined,
      });
    }

    setCheckinForm({
      completedExercises: [],
      totalDuration: 30,
      painLevel: 0,
      fatigueLevel: 2,
      mood: 'good',
      notes: '',
      bodyMetrics: { weight: '', pelvicFloorScore: '', diastasisRecti: '' },
    });
    setShowCheckinModal(false);
  };

  const getPhaseName = (phaseId: string) => {
    const plan = activePlan;
    if (!plan) return '';
    const phase = plan.phases.find((p) => p.id === phaseId);
    return phase?.name || '';
  };

  const getPhaseGradient = (phaseId: string) => {
    const plan = activePlan;
    if (!plan) return 'from-gray-400 to-gray-500';
    const phase = plan.phases.find((p) => p.id === phaseId);
    return phase?.gradient || 'from-gray-400 to-gray-500';
  };

  const getPainLabel = (level: number) => {
    if (level === 0) return painLabels[0];
    if (level <= 3) return painLabels[1];
    if (level <= 6) return painLabels[2];
    return painLabels[3];
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">打卡记录</h2>
        <button
          onClick={() => setShowCheckinModal(true)}
          className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          新建打卡
        </button>
      </div>

      {sortedCheckins.length > 0 ? (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {sortedCheckins.map((checkin) => {
            const mood = moodLabels[checkin.mood];
            return (
              <div
                key={checkin.id}
                className="p-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-white/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-lg shrink-0',
                        getPhaseGradient(checkin.phaseId)
                      )}
                    >
                      {mood.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-medium text-gray-800">
                          {checkin.date}
                        </span>
                        <span className="text-xs text-gray-400">{checkin.time}</span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-medium text-white bg-gradient-to-r',
                            getPhaseGradient(checkin.phaseId)
                          )}
                        >
                          {getPhaseName(checkin.phaseId)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-1">
                        <span>完成 {checkin.completedExercises.length} 个动作</span>
                        <span>时长 {checkin.totalDuration} 分钟</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-rose-500">疼痛 {checkin.painLevel}/10</span>
                        <span className="text-amber-500">疲劳 {checkin.fatigueLevel}/5</span>
                        <span className={mood.color}>
                          {mood.emoji} {mood.label}
                        </span>
                      </div>
                      {checkin.notes && (
                        <p className="text-xs text-gray-400 mt-1">{checkin.notes}</p>
                      )}
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-pink-400 shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-pink-300" />
          </div>
          <p className="text-gray-400 text-sm mb-4">还没有打卡记录</p>
          <button
            onClick={() => setShowCheckinModal(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
          >
            开始第一次打卡
          </button>
        </div>
      )}

      {showCheckinModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">今日训练打卡</h2>
              <button
                onClick={() => setShowCheckinModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  完成的动作
                </label>
                {currentPhase ? (
                  <div className="space-y-2">
                    {currentPhase.exercises.map((exercise) => (
                      <label
                        key={exercise.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all',
                          checkinForm.completedExercises.includes(exercise.id)
                            ? 'bg-rose-50 ring-2 ring-rose-400'
                            : 'bg-gray-50 hover:bg-gray-100'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checkinForm.completedExercises.includes(exercise.id)}
                          onChange={() => toggleExercise(exercise.id)}
                          className="w-4 h-4 accent-rose-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{exercise.name}</p>
                          <p className="text-xs text-gray-400">
                            {exercise.duration}分钟 · {exercise.sets}组 · 每组{exercise.reps}次
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">暂无可选动作</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  训练总时长: {checkinForm.totalDuration} 分钟
                </label>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={checkinForm.totalDuration}
                  onChange={(e) =>
                    setCheckinForm((prev) => ({
                      ...prev,
                      totalDuration: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-rose-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>5分钟</span>
                  <span>120分钟</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  疼痛程度: {checkinForm.painLevel}/10 · {getPainLabel(checkinForm.painLevel)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={checkinForm.painLevel}
                  onChange={(e) =>
                    setCheckinForm((prev) => ({
                      ...prev,
                      painLevel: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-rose-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>无痛</span>
                  <span>轻微</span>
                  <span>中等</span>
                  <span>剧烈</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  疲劳程度: {checkinForm.fatigueLevel}/5
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={checkinForm.fatigueLevel}
                  onChange={(e) =>
                    setCheckinForm((prev) => ({
                      ...prev,
                      fatigueLevel: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1</span>
                  <span>5</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">今日状态</label>
                <div className="grid grid-cols-4 gap-2">
                  {(
                    Object.entries(moodLabels) as [RehabCheckin['mood'], typeof moodLabels[RehabCheckin['mood']]][]
                  ).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() =>
                        setCheckinForm((prev) => ({ ...prev, mood: key }))
                      }
                      className={cn(
                        'p-3 rounded-xl text-center transition-all',
                        checkinForm.mood === key
                          ? 'bg-sky-50 ring-2 ring-sky-400 shadow-md'
                          : 'bg-gray-50 hover:bg-gray-100'
                      )}
                    >
                      <span className="text-xl block mb-1">{val.emoji}</span>
                      <span
                        className={cn(
                          'text-xs font-medium',
                          checkinForm.mood === key ? 'text-sky-600' : 'text-gray-500'
                        )}
                      >
                        {val.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <HeartPulse className="w-4 h-4 text-pink-400" />
                  身体指标
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      type="number"
                      placeholder="体重 (kg)"
                      value={checkinForm.bodyMetrics.weight}
                      onChange={(e) =>
                        setCheckinForm((prev) => ({
                          ...prev,
                          bodyMetrics: {
                            ...prev.bodyMetrics,
                            weight: e.target.value,
                          },
                        }))
                      }
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <HeartPulse className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="盆底肌评分 (0-100)"
                      value={checkinForm.bodyMetrics.pelvicFloorScore}
                      onChange={(e) =>
                        setCheckinForm((prev) => ({
                          ...prev,
                          bodyMetrics: {
                            ...prev.bodyMetrics,
                            pelvicFloorScore: e.target.value,
                          },
                        }))
                      }
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="腹直肌分离 (指)"
                      value={checkinForm.bodyMetrics.diastasisRecti}
                      onChange={(e) =>
                        setCheckinForm((prev) => ({
                          ...prev,
                          bodyMetrics: {
                            ...prev.bodyMetrics,
                            diastasisRecti: e.target.value,
                          },
                        }))
                      }
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">备注</label>
                <textarea
                  value={checkinForm.notes}
                  onChange={(e) =>
                    setCheckinForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="记录今日训练感受..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCheckinModal(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-rose-400 to-pink-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  确认打卡
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
