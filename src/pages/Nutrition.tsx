import { useState } from 'react';
import {
  UtensilsCrossed,
  BookOpen,
  ClipboardList,
  BarChart3,
  CalendarDays,
  ArrowRight,
  Flame,
  Beef,
  Wheat,
  Droplets,
} from 'lucide-react';
import { useNutritionStore } from '@/store/useNutritionStore';
import { cn } from '@/lib/utils';
import RecipeRecommendation from '@/components/nutrition/RecipeRecommendation';
import IntakeTracker from '@/components/nutrition/IntakeTracker';
import NutrientGapAnalysis from '@/components/nutrition/NutrientGapAnalysis';
import LifeStageSelector from '@/components/nutrition/LifeStageSelector';

type TabKey = 'overview' | 'recipes' | 'intake' | 'analysis';

const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { key: 'overview', label: '概览', icon: CalendarDays, color: 'from-emerald-400 via-teal-400 to-cyan-400' },
  { key: 'recipes', label: '食谱推荐', icon: BookOpen, color: 'from-orange-400 via-amber-400 to-yellow-400' },
  { key: 'intake', label: '摄入记录', icon: ClipboardList, color: 'from-rose-400 via-pink-400 to-fuchsia-400' },
  { key: 'analysis', label: '缺口分析', icon: BarChart3, color: 'from-violet-400 via-purple-400 to-indigo-400' },
];

const lifeStageLabels: Record<string, string> = {
  teen: '少女期',
  career: '职场期',
  'pregnancy-prep': '备孕期',
  pregnancy: '孕期',
  postpartum: '产后恢复',
  menopause: '更年期',
};

export default function Nutrition() {
  const {
    selectedLifeStage,
    getDailyNutritionSummary,
    getWeeklyNutritionTrend,
    getNutrientGapAnalysis,
    getRecipesByLifeStage,
    foodIntakeRecords,
  } = useNutritionStore();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const today = new Date().toISOString().split('T')[0];
  const todaySummary = getDailyNutritionSummary(today);
  const weeklyTrend = getWeeklyNutritionTrend();
  const gapAnalysis = getNutrientGapAnalysis(today);
  const stageRecipes = getRecipesByLifeStage(selectedLifeStage);
  const todayRecords = foodIntakeRecords.filter((r) => r.date === today);

  const lowNutrients = gapAnalysis.filter((n) => n.percentage < 80).slice(0, 3);

  const moduleCards: { key: TabKey; label: string; desc: string; count: number; unit: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }[] = [
    {
      key: 'recipes',
      label: '专属食谱',
      desc: '为您的人生阶段定制',
      count: stageRecipes.length,
      unit: '道推荐',
      icon: BookOpen,
      color: 'text-orange-600',
      bg: 'from-orange-50 to-amber-50',
    },
    {
      key: 'intake',
      label: '今日记录',
      desc: '记录每一餐的营养',
      count: todayRecords.length,
      unit: '条记录',
      icon: ClipboardList,
      color: 'text-rose-600',
      bg: 'from-rose-50 to-pink-50',
    },
    {
      key: 'analysis',
      label: '营养缺口',
      desc: '分析营养素摄入情况',
      count: lowNutrients.length,
      unit: '项待补充',
      icon: BarChart3,
      color: 'text-violet-600',
      bg: 'from-violet-50 to-purple-50',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'recipes':
        return <RecipeRecommendation />;
      case 'intake':
        return <IntakeTracker />;
      case 'analysis':
        return <NutrientGapAnalysis />;
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
            </div>

            <div className="card p-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-emerald-500" />
                今日营养摄入
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/80 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{todaySummary.totalCalories}</p>
                  <p className="text-xs text-gray-500">卡路里 (kcal)</p>
                </div>
                <div className="bg-white/80 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-2">
                    <Beef className="w-5 h-5 text-rose-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{todaySummary.totalProtein}</p>
                  <p className="text-xs text-gray-500">蛋白质 (g)</p>
                </div>
                <div className="bg-white/80 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                    <Wheat className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{todaySummary.totalCarbs}</p>
                  <p className="text-xs text-gray-500">碳水 (g)</p>
                </div>
                <div className="bg-white/80 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{todaySummary.totalFat}</p>
                  <p className="text-xs text-gray-500">脂肪 (g)</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-violet-500" />
                  本周摄入趋势
                </h3>
                <div className="space-y-3">
                  {weeklyTrend.map((day) => (
                    <div key={day.date} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-16">
                        {new Date(day.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all"
                          style={{ width: `${Math.min((day.calories / 2000) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-16 text-right">{day.calories} kcal</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6 bg-gradient-to-br from-rose-50 to-pink-50">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500" />
                  需重点补充
                </h3>
                {lowNutrients.length > 0 ? (
                  <div className="space-y-3">
                    {lowNutrients.map((n) => (
                      <div key={n.nutrientId} className="bg-white/80 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800">{n.nutrientName}</span>
                          <span className={cn(
                            'text-sm font-bold',
                            n.percentage < 50 ? 'text-rose-500' : 'text-amber-500'
                          )}>
                            {n.percentage}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              n.percentage < 50 ? 'bg-rose-400' : 'bg-amber-400'
                            )}
                            style={{ width: `${Math.min(n.percentage, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          已摄入 {n.current}{n.unit} / 推荐 {n.rda}{n.unit}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🎉</div>
                    <p className="text-sm text-gray-500">今日营养摄入均衡，继续保持！</p>
                  </div>
                )}
                <button
                  onClick={() => setActiveTab('analysis')}
                  className="mt-4 text-sm text-violet-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
                >
                  查看详细分析 <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="card p-6 bg-gradient-to-br from-orange-50 to-amber-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-500" />
                  为您推荐的食谱
                </h3>
                <button
                  onClick={() => setActiveTab('recipes')}
                  className="text-sm text-orange-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
                >
                  查看全部 <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stageRecipes.slice(0, 3).map((recipe) => (
                  <div key={recipe.id} className="bg-white/80 rounded-xl overflow-hidden card-hover">
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-medium text-gray-800 mb-1">{recipe.name}</h4>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{recipe.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>⏱️ {recipe.cookTime}分钟</span>
                        <span>🔥 {recipe.calories}kcal</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-200/50">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-800">营养膳食</h1>
              <p className="text-gray-500">
                当前阶段：{lifeStageLabels[selectedLifeStage]} · 科学饮食，健康生活
              </p>
            </div>
          </div>
          <LifeStageSelector />
        </div>
      </div>

      <div className="card p-6 mb-6 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <p className="text-white/80 text-sm mb-1">今日营养评分</p>
          <h2 className="font-display text-4xl font-bold mb-2">
            {todaySummary.totalCalories > 0 ? Math.round((todaySummary.totalCalories / 2000) * 100) : 0} 分
          </h2>
          <p className="text-white/90">
            {todaySummary.totalCalories > 0
              ? `已摄入 ${todaySummary.totalCalories} 卡路里，目标 2000 卡路里`
              : '还没有记录饮食，快来记录今天的第一餐吧~'}
          </p>
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
