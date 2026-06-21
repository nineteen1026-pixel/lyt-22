import { useState } from 'react';
import { Flower2, Heart, Sparkles, Leaf, ShieldCheck, BookOpen } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import HotFlashRecorder from '@/components/menopause/HotFlashRecorder';
import SleepMonitor from '@/components/menopause/SleepMonitor';
import HormoneLabTracker from '@/components/hormone/HormoneLabTracker';

const tabs = [
  { id: 'hotflash', label: '潮热记录', icon: '🔥' },
  { id: 'sleep', label: '睡眠监测', icon: '🌙' },
  { id: 'hormone', label: '激素化验追踪', icon: '📊' },
] as const;

type TabId = (typeof tabs)[number]['id'];

const healthTips = [
  { title: '饮食调理', desc: '多摄入豆制品、全谷物和深色蔬菜，补充植物雌激素。减少咖啡因和酒精摄入。', icon: <Leaf className="w-5 h-5" />, color: 'from-mint-400 to-emerald-500' },
  { title: '运动建议', desc: '每周3-5次中等强度运动，如快走、游泳、瑜伽，有助于缓解潮热和改善睡眠。', icon: <Sparkles className="w-5 h-5" />, color: 'from-lavender-400 to-purple-500' },
  { title: '心理关怀', desc: '更年期情绪波动是正常现象，尝试冥想、深呼吸等放松技巧，必要时寻求专业帮助。', icon: <Heart className="w-5 h-5" />, color: 'from-rose-400 to-pink-500' },
  { title: '定期检查', desc: '建议每年进行全面体检，包括骨密度检测、激素水平检查和乳腺筛查。', icon: <ShieldCheck className="w-5 h-5" />, color: 'from-sky-400 to-blue-500' },
];

export default function MenopauseCare() {
  const [activeTab, setActiveTab] = useState<TabId>('hotflash');
  const { cycleData, hotFlashRecords, sleepRecords, hormoneRecords, addHormoneRecord } = useAppStore();

  const daysSinceLastPeriod = cycleData.lastPeriodDate
    ? Math.floor((Date.now() - new Date(cycleData.lastPeriodDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lavender-400 to-purple-400 flex items-center justify-center shadow-lg shadow-lavender-200/50">
            <Flower2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">更年期照护</h1>
            <p className="text-gray-500">科学应对更年期，温柔呵护每一天</p>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-8 bg-gradient-to-r from-lavender-50 via-purple-50 to-pink-50">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white/80 flex items-center justify-center shadow-lg">
            <Flower2 className="w-10 h-10 text-lavender-400 floating" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">更年期是新的开始</h2>
            <p className="text-gray-500">
              更年期不是终点，而是人生新篇章。记录潮热、关注睡眠、了解激素变化，
              帮助你更好地理解自己的身体，从容应对每一天。
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-lavender-500">
              潮热 {hotFlashRecords.length}次
            </span>
            <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-indigo-500">
              睡眠 {sleepRecords.length}条
            </span>
            <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-fuchsia-500">
              激素化验 {hormoneRecords.length}次
            </span>
            {daysSinceLastPeriod !== null && (
              <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-rose-500">
                经期 {daysSinceLastPeriod}天前
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-gradient-to-r from-lavender-400 to-purple-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-lavender-50 border border-gray-100'
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="mb-8">
        {activeTab === 'hotflash' && <HotFlashRecorder />}
        {activeTab === 'sleep' && <SleepMonitor />}
        {activeTab === 'hormone' && (
          <HormoneLabTracker records={hormoneRecords} onAddRecord={addHormoneRecord} />
        )}
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-lavender-500" />
          健康建议
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {healthTips.map((tip) => (
            <div key={tip.title} className="card p-5 card-hover">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tip.color} flex items-center justify-center text-white shadow-md mb-3`}>
                {tip.icon}
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{tip.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 mt-8 bg-gradient-to-br from-lavender-50 to-purple-50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
            <Heart className="w-6 h-6 text-lavender-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-2">温馨提示</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              更年期是每个女性都会经历的自然生理过程。如果潮热严重影响日常生活，
              或出现持续失眠、情绪低落等症状，请及时就医。
              医生可能会根据具体情况建议激素替代疗法或其他治疗方案。
              保持积极心态，合理饮食，规律运动，你并不孤单。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
