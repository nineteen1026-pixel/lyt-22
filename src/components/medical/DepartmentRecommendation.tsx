import { useState } from 'react';
import { Search, ChevronRight, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import type { DepartmentRecommendation, LifeStage } from '@/types';

const departments: DepartmentRecommendation[] = [
  {
    id: 'dep-gyn',
    name: '妇科',
    category: '常规',
    description: '月经不调、痛经、妇科炎症、子宫肌瘤、卵巢囊肿等',
    commonSymptoms: ['月经异常', '下腹疼痛', '白带异常', '经期不适'],
    relatedLifeStages: ['teen', 'career', 'pregnancy-prep', 'menopause'],
    icon: '🏥',
    urgency: 'low',
  },
  {
    id: 'dep-obs',
    name: '产科/产检',
    category: '孕期',
    description: '孕期检查、胎儿监测、妊娠期管理、分娩计划',
    commonSymptoms: ['孕期不适', '胎动异常', '妊娠反应', '产检预约'],
    relatedLifeStages: ['pregnancy'],
    icon: '👶',
    urgency: 'low',
  },
  {
    id: 'dep-postpartum',
    name: '产后康复科',
    category: '产后',
    description: '盆底肌修复、腹直肌分离、产后抑郁、恶露异常',
    commonSymptoms: ['盆底不适', '腰痛', '恶露异常', '情绪低落'],
    relatedLifeStages: ['postpartum'],
    icon: '🌸',
    urgency: 'medium',
  },
  {
    id: 'dep-repro',
    name: '生殖医学科',
    category: '备孕',
    description: '不孕不育、排卵障碍、多囊卵巢、辅助生殖',
    commonSymptoms: ['备孕困难', '排卵异常', '激素异常', '反复流产'],
    relatedLifeStages: ['pregnancy-prep'],
    icon: '🔬',
    urgency: 'medium',
  },
  {
    id: 'dep-endo',
    name: '内分泌科',
    category: '常规',
    description: '激素失调、甲状腺疾病、多囊卵巢综合征、代谢异常',
    commonSymptoms: ['月经紊乱', '体重异常', '毛发增多', '疲劳嗜睡'],
    relatedLifeStages: ['teen', 'career', 'menopause'],
    icon: '⚖️',
    urgency: 'medium',
  },
  {
    id: 'dep-meno',
    name: '更年期专科',
    category: '更年期',
    description: '潮热盗汗、骨质疏松、情绪波动、激素替代治疗',
    commonSymptoms: ['潮热', '失眠', '情绪不稳', '关节疼痛'],
    relatedLifeStages: ['menopause'],
    icon: '🌿',
    urgency: 'low',
  },
  {
    id: 'dep-derm',
    name: '皮肤科',
    category: '常规',
    description: '激素相关痤疮、色素沉着、脱发、皮肤干燥',
    commonSymptoms: ['痤疮', '皮肤暗沉', '脱发', '过敏'],
    relatedLifeStages: ['teen', 'career', 'menopause'],
    icon: '✨',
    urgency: 'low',
  },
  {
    id: 'dep-psych',
    name: '心理科',
    category: '心理',
    description: '经前期综合征(PMS)、产后抑郁、焦虑、情绪障碍',
    commonSymptoms: ['情绪低落', '焦虑易怒', '失眠多梦', '注意力下降'],
    relatedLifeStages: ['career', 'postpartum', 'menopause'],
    icon: '💝',
    urgency: 'medium',
  },
  {
    id: 'dep-urgent',
    name: '急诊科',
    category: '急诊',
    description: '急性剧烈腹痛、大出血、高热、疑似宫外孕等紧急情况',
    commonSymptoms: ['剧烈腹痛', '大量出血', '高热不退', '晕厥'],
    relatedLifeStages: ['teen', 'career', 'pregnancy', 'postpartum', 'menopause'],
    icon: '🚨',
    urgency: 'high',
  },
];

const symptomKeywordMap: Record<string, string> = {
  '痛': 'dep-gyn',
  '月经': 'dep-gyn',
  '出血': 'dep-gyn',
  '白带': 'dep-gyn',
  '怀孕': 'dep-obs',
  '产检': 'dep-obs',
  '胎动': 'dep-obs',
  '盆底': 'dep-postpartum',
  '产后': 'dep-postpartum',
  '恶露': 'dep-postpartum',
  '备孕': 'dep-repro',
  '排卵': 'dep-repro',
  '不孕': 'dep-repro',
  '激素': 'dep-endo',
  '甲状腺': 'dep-endo',
  '潮热': 'dep-meno',
  '更年': 'dep-meno',
  '痤疮': 'dep-derm',
  '脱发': 'dep-derm',
  '抑郁': 'dep-psych',
  '焦虑': 'dep-psych',
  '情绪': 'dep-psych',
  '剧烈腹痛': 'dep-urgent',
  '大出血': 'dep-urgent',
  '高热': 'dep-urgent',
};

export default function DepartmentRecommendation() {
  const { lifeStage } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [recommendedId, setRecommendedId] = useState<string | null>(null);

  const categories = ['全部', '常规', '孕期', '产后', '备孕', '更年期', '心理', '急诊'];

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setRecommendedId(null);
      return;
    }
    for (const [keyword, depId] of Object.entries(symptomKeywordMap)) {
      if (searchQuery.includes(keyword)) {
        setRecommendedId(depId);
        return;
      }
    }
    setRecommendedId(null);
  };

  const filteredDepartments = departments.filter((dep) => {
    const matchesCategory = selectedCategory === '全部' || dep.category === selectedCategory;
    return matchesCategory;
  });

  const sortedDepartments = [...filteredDepartments].sort((a, b) => {
    if (recommendedId) {
      if (a.id === recommendedId) return -1;
      if (b.id === recommendedId) return 1;
    }
    const aMatch = a.relatedLifeStages.includes(lifeStage as LifeStage) ? 0 : 1;
    const bMatch = b.relatedLifeStages.includes(lifeStage as LifeStage) ? 0 : 1;
    return aMatch - bMatch;
  });

  const getUrgencyBadge = (urgency: DepartmentRecommendation['urgency']) => {
    switch (urgency) {
      case 'high':
        return <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">紧急</span>;
      case 'medium':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs rounded-full font-medium">建议</span>;
      case 'low':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-xs rounded-full font-medium">常规</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6 bg-gradient-to-br from-sky-50 to-blue-50">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Search className="w-5 h-5 text-sky-500" />
          症状自查
        </h3>
        <p className="text-sm text-gray-500 mb-4">输入您的症状，为您推荐合适的科室</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="如: 痛经、月经不调、潮热..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
          />
          <button
            onClick={handleSearch}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
          >
            查找
          </button>
        </div>
        {recommendedId && (
          <div className="mt-3 p-3 bg-white/70 rounded-xl flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-500" />
            <span className="text-sm text-gray-700">
              根据您的症状，推荐挂号：<strong className="text-sky-600">{departments.find((d) => d.id === recommendedId)?.name}</strong>
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              selectedCategory === cat
                ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-sky-50 border border-gray-100'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedDepartments.map((dep) => {
          const isRecommended = recommendedId === dep.id;
          const isLifeStageMatch = dep.relatedLifeStages.includes(lifeStage as LifeStage);
          return (
            <div
              key={dep.id}
              className={cn(
                'card p-5 card-hover transition-all',
                isRecommended && 'ring-2 ring-sky-400 shadow-lg',
                dep.urgency === 'high' && 'border-red-200 bg-gradient-to-br from-red-50 to-orange-50'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{dep.icon}</span>
                  <div>
                    <h4 className="font-bold text-gray-800">{dep.name}</h4>
                    <span className="text-xs text-gray-400">{dep.category}</span>
                  </div>
                </div>
                {getUrgencyBadge(dep.urgency)}
              </div>
              <p className="text-sm text-gray-600 mb-3">{dep.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {dep.commonSymptoms.map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                    {s}
                  </span>
                ))}
              </div>
              {isLifeStageMatch && (
                <div className="flex items-center gap-1 text-xs text-sky-600">
                  <Info className="w-3 h-3" />
                  适合当前生命阶段
                </div>
              )}
              {dep.urgency === 'high' && (
                <div className="flex items-center gap-1 text-xs text-red-500 mt-2">
                  <AlertTriangle className="w-3 h-3" />
                  出现紧急症状请立即就医
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
