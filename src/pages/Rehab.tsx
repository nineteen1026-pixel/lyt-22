import { useState } from 'react';
import {
  Dumbbell,
  CalendarDays,
  CheckCircle2,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import RehabOverview from '@/components/rehab/RehabOverview';
import RehabPhases from '@/components/rehab/RehabPhases';
import RehabExercises from '@/components/rehab/RehabExercises';
import RehabCheckin from '@/components/rehab/RehabCheckin';
import RehabProgress from '@/components/rehab/RehabProgress';
import type { RehabPhaseType, RehabExercise, RehabPlan } from '@/types';

type TabKey = 'overview' | 'phases' | 'exercises' | 'checkin' | 'progress';

const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { key: 'overview', label: '概览', icon: CalendarDays, color: 'from-sky-400 to-cyan-500' },
  { key: 'phases', label: '阶段计划', icon: Target, color: 'from-teal-400 to-emerald-500' },
  { key: 'exercises', label: '训练动作', icon: Dumbbell, color: 'from-violet-400 to-purple-500' },
  { key: 'checkin', label: '打卡记录', icon: CheckCircle2, color: 'from-rose-400 to-pink-500' },
  { key: 'progress', label: '进度追踪', icon: TrendingUp, color: 'from-amber-400 to-orange-500' },
];

export default function Rehab() {
  const {
    rehabPlans,
    activeRehabPlanId,
    createRehabPlan,
    setActiveRehabPlan,
    getDefaultRehabPlan,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<RehabPhaseType | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<RehabExercise | null>(null);
  const [newPlanType, setNewPlanType] = useState<RehabPlan['type']>('postpartum');

  const handleCreatePlan = () => {
    const defaultPlan = getDefaultRehabPlan(newPlanType);
    createRehabPlan(defaultPlan);
    setShowNewPlanModal(false);
  };

  const handleSwitchTab = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab !== 'exercises') {
      setSelectedExercise(null);
    }
  };

  const handleSelectExercise = (exercise: RehabExercise) => {
    setSelectedExercise(exercise);
    setActiveTab('exercises');
  };

  const handleOpenCheckinFromExercise = () => {
    setActiveTab('checkin');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <RehabOverview
            onSwitchTab={handleSwitchTab}
            onSelectExercise={handleSelectExercise}
            onOpenCheckin={() => setActiveTab('checkin')}
            onOpenNewPlan={() => setShowNewPlanModal(true)}
          />
        );
      case 'phases':
        return (
          <RehabPhases
            selectedPhase={selectedPhase}
            onSelectPhase={setSelectedPhase}
            onSelectExercise={handleSelectExercise}
            onSwitchTab={() => setActiveTab('exercises')}
          />
        );
      case 'exercises':
        return (
          <RehabExercises
            selectedExercise={selectedExercise}
            onSelectExercise={setSelectedExercise}
            onOpenCheckin={handleOpenCheckinFromExercise}
          />
        );
      case 'checkin':
        return <RehabCheckin />;
      case 'progress':
        return <RehabProgress />;
      default:
        return (
          <RehabOverview
            onSwitchTab={handleSwitchTab}
            onSelectExercise={handleSelectExercise}
            onOpenCheckin={() => setActiveTab('checkin')}
            onOpenNewPlan={() => setShowNewPlanModal(true)}
          />
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-400 flex items-center justify-center shadow-lg shadow-sky-200/50">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-800">运动康复计划</h1>
              <p className="text-gray-500">科学训练，循序渐进恢复</p>
            </div>
          </div>
          {rehabPlans.length > 1 && (
            <select
              value={activeRehabPlanId || ''}
              onChange={(e) => setActiveRehabPlan(e.target.value || null)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
            >
              {rehabPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="card p-2 mb-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleSwitchTab(tab.key)}
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

      {showNewPlanModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">新建康复计划</h2>
              <button
                onClick={() => setShowNewPlanModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">选择计划类型</label>
                <div className="space-y-2">
                  {[
                    { value: 'postpartum', label: '产后综合康复', desc: '适合产后妈妈的完整康复方案', icon: '🤱' },
                    { value: 'pelvic-floor', label: '盆底肌专项', desc: '专注盆底肌恢复训练', icon: '💪' },
                    { value: 'core', label: '核心肌群康复', desc: '腹直肌分离及核心恢复', icon: '🎯' },
                    { value: 'general', label: '通用康复计划', desc: '适合大多数人的康复方案', icon: '🏃‍♀️' },
                    { value: 'custom', label: '自定义计划', desc: '根据个人需求定制', icon: '✨' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setNewPlanType(opt.value as typeof newPlanType)}
                      className={cn(
                        'w-full p-4 rounded-xl text-left transition-all flex items-center gap-3',
                        newPlanType === opt.value
                          ? 'bg-gradient-to-r from-sky-50 to-cyan-50 border-2 border-sky-200'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      )}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <p className="font-medium text-gray-800">{opt.label}</p>
                        <p className="text-xs text-gray-500">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowNewPlanModal(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleCreatePlan}
                  className="flex-1 bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  创建计划
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
