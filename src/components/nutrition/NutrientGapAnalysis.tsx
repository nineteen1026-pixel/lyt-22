import { useState } from 'react';
import {
  TrendingUp,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Info,
  Pill,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import { useNutritionStore } from '@/store/useNutritionStore';
import { cn } from '@/lib/utils';

const lifeStageLabels: Record<string, string> = {
  teen: '少女期',
  career: '职场期',
  'pregnancy-prep': '备孕期',
  pregnancy: '孕期',
  postpartum: '产后恢复',
  menopause: '更年期',
};

const foodSources: Record<string, string[]> = {
  protein: ['鸡胸肉', '鱼类', '鸡蛋', '牛奶', '豆制品'],
  calcium: ['牛奶', '酸奶', '芝士', '豆腐', '绿叶蔬菜'],
  iron: ['红肉', '菠菜', '豆类', '红肉', '坚果'],
  vitamin_c: ['橙子', '猕猴桃', '草莓', '西兰花', '彩椒'],
  vitamin_d: ['三文鱼', '蛋黄', '蘑菇', '牛奶', '晒太阳'],
  folic_acid: ['菠菜', '西兰花', '豆类', '橙子', '牛油果'],
  omega3: ['三文鱼', '亚麻籽', '核桃', '奇亚籽', '深海鱼'],
  fiber: ['燕麦', '豆类', '水果', '蔬菜', '全谷物'],
};

const nutrientTips: Record<string, string> = {
  protein: '蛋白质是身体的基础营养素，有助于肌肉修复和免疫力提升。建议每餐都摄入优质蛋白质。',
  calcium: '钙是骨骼健康的关键，青少年和更年期女性需要特别注意补充。建议搭配维生素D促进吸收。',
  iron: '铁有助于红细胞生成，预防缺铁性贫血。建议搭配维生素C一起食用，提高吸收率。',
  vitamin_c: '维生素C是强效抗氧化剂，有助于免疫力提升和铁的吸收。建议每天摄入新鲜水果蔬菜。',
  vitamin_d: '维生素D有助于钙的吸收和骨骼健康。建议适当晒太阳，促进皮肤合成。',
  folic_acid: '叶酸对细胞分裂和DNA合成非常重要，备孕期和孕早期女性需要额外补充。',
  omega3: 'Omega-3有助于心血管健康和脑部发育。建议每周吃2-3次深海鱼。',
  fiber: '膳食纤维有助于肠道健康和血糖控制。建议多吃全谷物、豆类、水果蔬菜。',
};

export default function NutrientGapAnalysis() {
  const { selectedLifeStage, getNutrientGapAnalysis, getWeeklyNutritionTrend } = useNutritionStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedNutrient, setExpandedNutrient] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const gapAnalysis = getNutrientGapAnalysis(selectedDate);
  const weeklyTrend = getWeeklyNutritionTrend();

  const categories = [
    { key: 'all', label: '全部' },
    { key: 'vitamin', label: '维生素' },
    { key: 'mineral', label: '矿物质' },
    { key: 'macronutrient', label: '宏量营养素' },
  ];

  const filteredAnalysis = selectedCategory === 'all'
    ? gapAnalysis
    : gapAnalysis.filter((n) => n.category === selectedCategory);

  const lowNutrients = gapAnalysis.filter((n) => n.percentage < 80);
  const adequateNutrients = gapAnalysis.filter((n) => n.percentage >= 80 && n.percentage <= 120);
  const excessNutrients = gapAnalysis.filter((n) => n.percentage > 120);

  const getStatusIcon = (percentage: number) => {
    if (percentage < 50) return { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50', label: '严重不足' };
    if (percentage < 80) return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', label: '轻度不足' };
    if (percentage > 120) return { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50', label: '摄入过量' };
    return { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', label: '摄入充足' };
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return 'from-rose-400 to-rose-500';
    if (percentage < 80) return 'from-amber-400 to-amber-500';
    if (percentage > 120) return 'from-orange-400 to-orange-500';
    return 'from-emerald-400 to-emerald-500';
  };

  const maxCalories = Math.max(...weeklyTrend.map((d) => d.calories), 2000);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                selectedCategory === cat.key
                  ? 'bg-gradient-to-r from-violet-400 to-purple-400 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
        <p className="text-sm text-violet-700">
          💡 当前阶段：<strong>{lifeStageLabels[selectedLifeStage]}</strong>，
          {lowNutrients.length > 0
            ? `有 ${lowNutrients.length} 种营养素需要重点补充`
            : '今日营养素摄入均衡，继续保持！'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 bg-gradient-to-br from-rose-50 to-pink-50">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <span className="text-sm font-medium text-gray-700">需要补充</span>
          </div>
          <p className="text-3xl font-bold text-rose-600">{lowNutrients.length}</p>
          <p className="text-xs text-gray-500">种营养素</p>
        </div>
        <div className="card p-5 bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium text-gray-700">摄入充足</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{adequateNutrients.length}</p>
          <p className="text-xs text-gray-500">种营养素</p>
        </div>
        <div className="card p-5 bg-gradient-to-br from-orange-50 to-amber-50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">摄入过量</span>
          </div>
          <p className="text-3xl font-bold text-orange-600">{excessNutrients.length}</p>
          <p className="text-xs text-gray-500">种营养素</p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-violet-500" />
          本周热量趋势
        </h3>
        <div className="space-y-3">
          {weeklyTrend.map((day) => (
            <div key={day.date} className="flex items-center gap-4">
              <span className="text-xs text-gray-500 w-20">
                {new Date(day.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
              </span>
              <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-200 to-purple-200" style={{ width: '50%' }} />
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full transition-all"
                  style={{ width: `${Math.min((day.calories / maxCalories) * 100, 100)}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-0.5 h-full bg-rose-300"
                  style={{ left: '50%' }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 w-24 text-right">{day.calories} kcal</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-400 to-purple-400" />
            <span className="text-xs text-gray-500">实际摄入</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-3 bg-rose-300" />
            <span className="text-xs text-gray-500">推荐值 (2000kcal)</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Info className="w-5 h-5 text-violet-500" />
          营养素详细分析
        </h3>
        {filteredAnalysis.map((item) => {
          const status = getStatusIcon(item.percentage);
          const StatusIcon = status.icon;
          const isExpanded = expandedNutrient === item.nutrientId;
          const sources = foodSources[item.nutrientId] || [];
          const tip = nutrientTips[item.nutrientId] || '';

          return (
            <div
              key={item.nutrientId}
              className="card overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedNutrient(isExpanded ? null : item.nutrientId)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', status.bg)}>
                      <StatusIcon className={cn('w-5 h-5', status.color)} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{item.nutrientName}</h4>
                      <p className="text-xs text-gray-500">{status.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">
                        {item.current}{item.unit} / {item.rda}{item.unit}
                      </p>
                      <p className={cn('text-xs font-medium', status.color)}>
                        {item.percentage}%
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full bg-gradient-to-r rounded-full transition-all', getProgressColor(item.percentage))}
                    style={{ width: `${Math.min(item.percentage, 120)}%` }}
                  />
                </div>
                {item.gap > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    还差 <span className="font-medium text-rose-500">{item.gap.toFixed(1)}{item.unit}</span> 达到推荐摄入量
                  </p>
                )}
              </div>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-violet-500" />
                      营养小贴士
                    </h5>
                    <p className="text-sm text-gray-600">{tip}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-emerald-500" />
                      推荐食物来源
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {sources.map((source, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                  {item.gap > 0 && (
                    <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                      <h5 className="text-sm font-medium text-rose-700 mb-2">💡 补充建议</h5>
                      <p className="text-sm text-rose-600">
                        建议每天额外补充约 <strong>{item.gap.toFixed(1)}{item.unit}</strong> 的{item.nutrientName}，
                        可以通过增加 {sources[0]}、{sources[1]} 等食物来补充。
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {lowNutrients.length > 0 && (
        <div className="card p-6 bg-gradient-to-br from-violet-50 to-purple-50">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-violet-500" />
            明日改进建议
          </h3>
          <div className="space-y-3">
            {lowNutrients.slice(0, 3).map((item, idx) => {
              const sources = foodSources[item.nutrientId] || [];
              return (
                <div key={item.nutrientId} className="flex items-start gap-3 p-3 bg-white/70 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      增加{item.nutrientName}摄入
                    </p>
                    <p className="text-xs text-gray-500">
                      建议多吃{sources.slice(0, 3).join('、')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
