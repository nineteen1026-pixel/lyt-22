import { useState } from 'react';
import {
  Heart,
  Leaf,
  Flame,
  Droplets,
  Music,
  Moon,
  Dumbbell,
  Apple,
  Star,
  Clock,
  ChevronRight,
  Sparkles,
  Pill,
  ArrowRight,
  Plus,
  X,
  AlertOctagon,
  History,
  Cross,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';
import type { PainRecord } from '@/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const symptomOptions = ['下腹部绞痛', '腰酸', '头痛', '恶心', '乳房胀痛', '乏力', '腹泻', '情绪低落'];

interface ReliefMethod {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: string;
  effectiveness: number;
  steps: string[];
  icon: React.ReactNode;
  color: string;
}

const reliefMethods: ReliefMethod[] = [
  {
    id: '1',
    name: '热敷疗法',
    category: '物理缓解',
    description: '通过温热刺激放松子宫肌肉，促进血液循环，有效缓解痛经。',
    duration: '15-30分钟',
    effectiveness: 4,
    steps: [
      '准备热水袋或暖宝宝',
      '温度控制在40-45°C为宜',
      '放置在下腹部疼痛位置',
      '每次热敷15-30分钟',
    ],
    icon: <Flame className="w-6 h-6" />,
    color: 'from-orange-400 to-red-400',
  },
  {
    id: '2',
    name: '红糖姜茶',
    category: '食疗调理',
    description: '生姜温经散寒，红糖益气补血，是缓解痛经的经典良方。',
    duration: '即时饮用',
    effectiveness: 3,
    steps: [
      '准备生姜3-5片，红糖适量',
      '加入500ml清水煮沸',
      '转小火煮10-15分钟',
      '趁热饮用效果更佳',
    ],
    icon: <Droplets className="w-6 h-6" />,
    color: 'from-amber-400 to-orange-500',
  },
  {
    id: '3',
    name: '瑜伽放松',
    category: '运动缓解',
    description: '轻柔的瑜伽动作可以拉伸腹部肌肉，缓解经期不适。',
    duration: '15-20分钟',
    effectiveness: 4,
    steps: [
      '选择安静温暖的环境',
      '穿宽松舒适的衣服',
      '进行猫牛式、婴儿式等轻柔动作',
      '配合深呼吸，放松身心',
    ],
    icon: <Dumbbell className="w-6 h-6" />,
    color: 'from-purple-400 to-pink-500',
  },
  {
    id: '4',
    name: '足部按摩',
    category: '物理缓解',
    description: '足部有许多与子宫相关的穴位，按摩可有效缓解痛经。',
    duration: '10-15分钟',
    effectiveness: 3,
    steps: [
      '用温水泡脚10分钟',
      '按摩脚底涌泉穴',
      '按揉脚踝内侧三阴交',
      '双脚交替进行',
    ],
    icon: <Star className="w-6 h-6" />,
    color: 'from-teal-400 to-cyan-500',
  },
  {
    id: '5',
    name: '音乐冥想',
    category: '心理调节',
    description: '舒缓的音乐和冥想可以转移注意力，减轻疼痛感受。',
    duration: '15-30分钟',
    effectiveness: 3,
    steps: [
      '找一个安静舒适的地方',
      '播放舒缓的轻音乐',
      '闭上眼睛，深呼吸',
      '想象疼痛慢慢消失',
    ],
    icon: <Music className="w-6 h-6" />,
    color: 'from-indigo-400 to-purple-500',
  },
  {
    id: '6',
    name: '充足睡眠',
    category: '生活调理',
    description: '良好的睡眠有助于身体恢复，减轻经期不适感。',
    duration: '7-9小时',
    effectiveness: 4,
    steps: [
      '保持规律作息',
      '睡前避免使用电子设备',
      '保持卧室温暖舒适',
      '可使用抱枕垫在腰下',
    ],
    icon: <Moon className="w-6 h-6" />,
    color: 'from-blue-400 to-indigo-500',
  },
];

const dietaryAdvice = [
  { name: '推荐食物', items: ['红枣', '桂圆', '红糖', '生姜', '核桃', '红豆'], good: true },
  { name: '避免食物', items: ['冰淇淋', '冷饮', '咖啡', '浓茶', '辛辣食物', '酒精'], good: false },
];

export default function ReliefPage() {
  const [selectedMethod, setSelectedMethod] = useState<ReliefMethod | null>(null);
  const [activeCategory, setActiveCategory] = useState('全部');
  const today = new Date().toISOString().split('T')[0];

  const navigate = useNavigate();
  const {
    medicationReminders,
    medicationRecords,
    getTodayMedicationSchedule,
    painRecords,
    addPainRecord,
    getTodayPainLevel,
    visitRecords,
  } = useAppStore();

  const [showPainModal, setShowPainModal] = useState(false);
  const [newPain, setNewPain] = useState<Partial<PainRecord>>({
    date: today,
    time: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
    level: 5,
    symptoms: '',
    notes: '',
  });

  const todayPainLevel = getTodayPainLevel();
  const todayPainRecords = painRecords.filter((r) => r.date === today).sort((a, b) => b.time.localeCompare(a.time));

  const handleSavePain = () => {
    addPainRecord({
      id: generateId(),
      date: newPain.date || today,
      time: newPain.time || `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
      level: newPain.level || 0,
      symptoms: newPain.symptoms || undefined,
      notes: newPain.notes || undefined,
    });
    setShowPainModal(false);
    setNewPain({
      date: today,
      time: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
      level: 5,
      symptoms: '',
      notes: '',
    });
  };

  const dysmenorrheaReminders = medicationReminders.filter((r) => r.category === 'dysmenorrhea' && r.active);
  const dysmenorrheaSchedule = getTodayMedicationSchedule().filter((s) => s.reminder.category === 'dysmenorrhea');
  const pendingPills = dysmenorrheaSchedule.filter((s) => !s.record?.taken && !s.record?.skipped);
  const takenPills = dysmenorrheaSchedule.filter((s) => s.record?.taken);

  const categories = ['全部', '物理缓解', '食疗调理', '运动缓解', '心理调节', '生活调理'];

  const filteredMethods = activeCategory === '全部'
    ? reliefMethods
    : reliefMethods.filter((m) => m.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-red-400 flex items-center justify-center shadow-lg shadow-rose-200/50">
            <Heart className="w-6 h-6 text-white" fill="white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">痛经舒缓</h1>
            <p className="text-gray-500">多维度舒缓方法，让那几天不再难熬</p>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-8 bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white/80 flex items-center justify-center shadow-lg">
            <Sparkles className="w-10 h-10 text-rose-400" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">缓解痛经，从今天开始</h2>
            <p className="text-gray-500">
              痛经是很多女性的困扰，但通过科学的方法可以有效缓解。
              试试这些经过验证的舒缓方法，找到最适合你的那一个。
            </p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-rose-500">
              安全有效
            </span>
            <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-purple-500">
              科学验证
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-5 bg-gradient-to-br from-rose-50 to-red-50 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <AlertOctagon className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">今日疼痛等级</h3>
                <p className="text-xs text-gray-500">记录痛经疼痛，自动调整用药提醒</p>
              </div>
            </div>
            <button
              onClick={() => setShowPainModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full text-xs font-medium shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              记录疼痛
            </button>
          </div>
          <div className="flex items-end gap-6">
            <div>
              <p className="text-5xl font-display font-bold text-rose-500">
                {todayPainLevel > 0 ? todayPainLevel : '-'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {todayPainLevel === 0
                  ? '暂无记录'
                  : todayPainLevel <= 3
                  ? '轻度疼痛'
                  : todayPainLevel <= 6
                  ? '中度疼痛'
                  : todayPainLevel <= 8
                  ? '重度疼痛'
                  : '剧烈疼痛'}
              </p>
            </div>
            <div className="flex-1 h-3 rounded-full bg-white overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-300 via-red-400 to-red-600 transition-all"
                style={{ width: `${todayPainLevel * 10}%` }}
              />
            </div>
          </div>
          {todayPainRecords.length > 0 && (
            <div className="mt-4 pt-4 border-t border-rose-100/60">
              <div className="flex items-center gap-2 mb-2">
                <History className="w-4 h-4 text-gray-400" />
                <p className="text-xs text-gray-500">今日疼痛记录</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {todayPainRecords.slice(0, 6).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-xs"
                    title={r.symptoms || r.notes}
                  >
                    <span className="font-bold text-rose-500">{r.level}</span>
                    <span className="text-gray-400">{r.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card p-5 bg-gradient-to-br from-lavender-50 to-violet-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">用药联动</h3>
              <p className="text-xs text-gray-500">根据疼痛等级提醒</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            {dysmenorrheaReminders.length === 0
              ? '暂无痛经用药设置，可在用药中心添加并关联疼痛等级。'
              : `已设置 ${dysmenorrheaReminders.length} 项痛经用药，疼痛达到阈值时自动提醒。`}
          </p>
        </div>
      </div>

      <div className="card p-5 mb-8 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-400 flex items-center justify-center">
              <Cross className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">就医助手</h3>
              <p className="text-xs text-gray-500">
                记录痛经相关就诊 · 查看科室推荐 · 检查单管理
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/medical-assistant')}
            className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
          >
            查看 <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        {visitRecords.filter(r => r.linkedPainRecordIds && r.linkedPainRecordIds.length > 0).length > 0 && (
          <div className="mt-4 pt-4 border-t border-rose-100">
            <p className="text-xs text-gray-500 mb-2">关联的就诊记录</p>
            <div className="space-y-2">
              {visitRecords
                .filter(r => r.linkedPainRecordIds && r.linkedPainRecordIds.length > 0)
                .slice(0, 2)
                .map(record => {
                  const linkedPainCount = record.linkedPainRecordIds?.length || 0;
                  return (
                    <div key={record.id} className="flex items-center justify-between p-2 rounded-lg bg-white/70">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {record.department}
                          {record.diagnosis && (
                            <span className="ml-2 text-xs text-rose-500">({record.diagnosis})</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {record.date} · {record.hospital} · 关联 {linkedPainCount} 条疼痛记录
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              activeCategory === category
                ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-rose-50 border border-gray-100'
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredMethods.map((method) => (
          <div
            key={method.id}
            className="card p-6 card-hover cursor-pointer group"
            onClick={() => setSelectedMethod(method)}
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center shadow-lg mb-4 text-white group-hover:scale-110 transition-transform`}>
              {method.icon}
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-800">{method.name}</h3>
              <span className="text-xs px-2 py-1 bg-rose-50 text-rose-500 rounded-full">
                {method.category}
              </span>
            </div>
            
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
              {method.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">{method.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-3.5 h-3.5',
                      i < method.effectiveness ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
                    )}
                  />
                ))}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-rose-500 font-medium">查看详情</span>
              <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dietaryAdvice.map((advice) => (
          <div key={advice.name} className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                advice.good ? 'bg-mint-100' : 'bg-rose-100'
              )}>
                <Apple className={cn('w-5 h-5', advice.good ? 'text-mint-600' : 'text-rose-500')} />
              </div>
              <h3 className="font-bold text-gray-800">{advice.name}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {advice.items.map((item) => (
                <span
                  key={item}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium',
                    advice.good
                      ? 'bg-mint-50 text-mint-600 border border-mint-200'
                      : 'bg-rose-50 text-rose-500 border border-rose-200'
                  )}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {dysmenorrheaReminders.length > 0 && (
        <div className="card p-6 mt-8 bg-gradient-to-br from-rose-50 to-pink-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Pill className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">痛经用药提醒</h3>
                <p className="text-xs text-gray-500">今日 {takenPills.length}/{dysmenorrheaSchedule.length} 已服</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/medication')}
              className="text-sm text-rose-500 font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              用药中心 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {pendingPills.length > 0 ? (
            <div className="space-y-2">
              {pendingPills.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/70 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-gray-800">{item.reminder.name}</span>
                    <span className="text-xs text-gray-400">{item.reminder.dosage}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">{item.time} 待服</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-2">暂无待服药物 🎉</p>
          )}
        </div>
      )}

      <div className="card p-6 mt-8 bg-gradient-to-br from-lavender-50 to-purple-50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
            <Leaf className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-2">温馨提示</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              如果痛经严重影响日常生活，或伴有大量出血、剧烈疼痛等症状，
              请及时就医，排除子宫内膜异位症、子宫肌瘤等疾病的可能。
              每个人的身体状况不同，适合的缓解方法也不同，建议多尝试，找到最适合自己的方式。
            </p>
          </div>
        </div>
      </div>

      {showPainModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-500" />
                记录痛经疼痛
              </h2>
              <button
                onClick={() => setShowPainModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">疼痛等级</label>
                  <span className="text-2xl font-bold text-rose-500">{newPain.level}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newPain.level || 1}
                  onChange={(e) => setNewPain({ ...newPain, level: Number(e.target.value) })}
                  className="w-full accent-rose-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1 无痛</span>
                  <span>5 中度</span>
                  <span>10 剧烈</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">日期</label>
                  <input
                    type="date"
                    value={newPain.date || today}
                    onChange={(e) => setNewPain({ ...newPain, date: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">时间</label>
                  <input
                    type="time"
                    value={newPain.time || ''}
                    onChange={(e) => setNewPain({ ...newPain, time: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">伴随症状</label>
                <div className="flex flex-wrap gap-2">
                  {symptomOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        const current = newPain.symptoms ? newPain.symptoms.split('、') : [];
                        const idx = current.indexOf(s);
                        const next = idx >= 0 ? current.filter((x) => x !== s) : [...current, s];
                        setNewPain({ ...newPain, symptoms: next.length > 0 ? next.join('、') : undefined });
                      }}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                        newPain.symptoms?.includes(s)
                          ? 'bg-rose-100 text-rose-600 ring-1 ring-rose-300'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">备注 (可选)</label>
                <textarea
                  value={newPain.notes || ''}
                  onChange={(e) => setNewPain({ ...newPain, notes: e.target.value })}
                  placeholder="如: 熬夜后加重、受凉后开始痛等"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowPainModal(false)} className="flex-1 btn-secondary">
                  取消
                </button>
                <button
                  onClick={handleSavePain}
                  disabled={!newPain.level || newPain.level < 1}
                  className="flex-1 bg-gradient-to-r from-rose-400 to-pink-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMethod && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedMethod.color} flex items-center justify-center shadow-lg text-white`}>
                  {selectedMethod.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedMethod.name}</h2>
                  <p className="text-sm text-gray-500">{selectedMethod.category}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMethod(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-600 mb-6">{selectedMethod.description}</p>

            <div className="flex gap-4 mb-6">
              <div className="flex-1 p-3 bg-gray-50 rounded-xl text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                <p className="text-xs text-gray-500">时长</p>
                <p className="font-bold text-gray-800">{selectedMethod.duration}</p>
              </div>
              <div className="flex-1 p-3 bg-gray-50 rounded-xl text-center">
                <Star className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
                <p className="text-xs text-gray-500">效果</p>
                <div className="flex justify-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-3.5 h-3.5',
                        i < selectedMethod.effectiveness ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-3">具体步骤</h3>
              <ol className="space-y-3">
                {selectedMethod.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-white text-xs flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-gray-600">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <button
              onClick={() => setSelectedMethod(null)}
              className="w-full mt-6 btn-primary"
            >
              知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
