import { useState, useEffect } from 'react';
import {
  Sparkles,
  Settings,
  Baby,
  Droplets,
  Dumbbell,
  Stethoscope,
  X,
  CalendarDays,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import PelvicFloorTraining from '@/components/postpartum/PelvicFloorTraining';
import LochiaTracker from '@/components/postpartum/LochiaTracker';
import BreastfeedingDiary from '@/components/postpartum/BreastfeedingDiary';
import CheckupReminder from '@/components/postpartum/CheckupReminder';

type TabKey = 'overview' | 'pelvic' | 'lochia' | 'feeding' | 'checkup';

const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { key: 'overview', label: '概览', icon: CalendarDays, color: 'from-fuchsia-400 via-pink-400 to-rose-400' },
  { key: 'pelvic', label: '盆底训练', icon: Dumbbell, color: 'from-teal-400 to-cyan-500' },
  { key: 'lochia', label: '恶露追踪', icon: Droplets, color: 'from-rose-400 to-pink-500' },
  { key: 'feeding', label: '哺乳日记', icon: Baby, color: 'from-fuchsia-400 to-pink-500' },
  { key: 'checkup', label: '复查提醒', icon: Stethoscope, color: 'from-indigo-400 to-violet-500' },
];

const recoveryKnowledge = [
  {
    id: 1,
    title: '产后恢复阶段',
    items: [
      '0-6周：产褥期，身体各系统恢复',
      '6周-3个月：盆底肌修复黄金期',
      '3-6个月：腹直肌分离修复',
      '6-12个月：整体体态调整',
    ],
    icon: '🌸',
  },
  {
    id: 2,
    title: '产后注意事项',
    items: [
      '充足休息，避免劳累',
      '均衡营养，适量饮水',
      '保持个人卫生',
      '适当活动，循序渐进',
      '保持心情舒畅',
    ],
    icon: '💖',
  },
];

export default function Postpartum() {
  const {
    postpartumData,
    pregnancyData,
    setPostpartumData,
    getDaysPostpartum,
    getDueDate,
    pelvicFloorRecords,
    lochiaRecords,
    breastfeedingRecords,
    postpartumCheckups,
    addPostpartumCheckup,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(postpartumData.deliveryDate);
  const [deliveryType, setDeliveryType] = useState(postpartumData.deliveryType);
  const [autoGenerateCheckups, setAutoGenerateCheckups] = useState(true);

  const daysPostpartum = getDaysPostpartum();
  const weeksPostpartum = Math.floor(daysPostpartum / 7);
  const dueDate = getDueDate();

  useEffect(() => {
    setDeliveryDate(postpartumData.deliveryDate);
    setDeliveryType(postpartumData.deliveryType);
  }, [postpartumData]);

  const handleSaveSettings = () => {
    const prevDate = postpartumData.deliveryDate;
    setPostpartumData({
      deliveryDate,
      deliveryType,
    });

    if (autoGenerateCheckups && deliveryDate && deliveryDate !== prevDate) {
      const existingTypes = new Set(postpartumCheckups.map((c) => c.type));
      const standardCheckups: { type: '6week' | '3month' | '6month' | '1year'; name: string; days: number }[] = [
        { type: '6week', name: '产后6周复查', days: 42 },
        { type: '3month', name: '产后3个月复查', days: 90 },
        { type: '6month', name: '产后6个月复查', days: 180 },
        { type: '1year', name: '产后1年复查', days: 365 },
      ];

      const baseDate = new Date(deliveryDate);
      standardCheckups.forEach((checkup) => {
        if (!existingTypes.has(checkup.type)) {
          const targetDate = new Date(baseDate);
          targetDate.setDate(targetDate.getDate() + checkup.days);
          addPostpartumCheckup({
            id: Math.random().toString(36).substr(2, 9),
            date: targetDate.toISOString().split('T')[0],
            type: checkup.type,
            typeName: checkup.name,
            completed: false,
          });
        }
      });
    }

    setShowSettingsModal(false);
  };

  const handleImportFromPregnancy = () => {
    if (dueDate) {
      setDeliveryDate(dueDate);
    } else if (pregnancyData.lastMenstrualPeriodDate) {
      const lmp = new Date(pregnancyData.lastMenstrualPeriodDate);
      lmp.setDate(lmp.getDate() + 280);
      setDeliveryDate(lmp.toISOString().split('T')[0]);
    }
  };

  const totalRecords =
    pelvicFloorRecords.length + lochiaRecords.length + breastfeedingRecords.length;
  const completedCheckups = postpartumCheckups.filter((c) => c.completed).length;
  const upcomingCheckups = postpartumCheckups.filter(
    (c) => !c.completed && new Date(c.date) >= new Date()
  ).length;

  const getDeliveryTypeLabel = () => {
    switch (postpartumData.deliveryType) {
      case 'vaginal':
        return '顺产';
      case 'cesarean':
        return '剖腹产';
      default:
        return '—';
    }
  };

  const moduleCards: { key: TabKey; label: string; desc: string; count: number; unit: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }[] = [
    {
      key: 'pelvic',
      label: '盆底训练打卡',
      desc: '凯格尔运动等恢复训练',
      count: pelvicFloorRecords.length,
      unit: '次训练',
      icon: Dumbbell,
      color: 'text-teal-600',
      bg: 'from-teal-50 to-cyan-50',
    },
    {
      key: 'lochia',
      label: '排恶露追踪',
      desc: '量、颜色、气味等记录',
      count: lochiaRecords.length,
      unit: '次记录',
      icon: Droplets,
      color: 'text-rose-600',
      bg: 'from-rose-50 to-pink-50',
    },
    {
      key: 'feeding',
      label: '哺乳日记',
      desc: '喂养方式、时长、奶量',
      count: breastfeedingRecords.length,
      unit: '次喂养',
      icon: Baby,
      color: 'text-fuchsia-600',
      bg: 'from-fuchsia-50 to-pink-50',
    },
    {
      key: 'checkup',
      label: '复查提醒',
      desc: '6周、3月、6月、1年复查',
      count: upcomingCheckups,
      unit: '项待查',
      icon: Stethoscope,
      color: 'text-indigo-600',
      bg: 'from-indigo-50 to-violet-50',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pelvic':
        return <PelvicFloorTraining />;
      case 'lochia':
        return <LochiaTracker />;
      case 'feeding':
        return <BreastfeedingDiary />;
      case 'checkup':
        return <CheckupReminder />;
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-teal-500" />
                  最近盆底训练
                </h3>
                {pelvicFloorRecords.length > 0 ? (
                  <div className="space-y-2">
                    {[...pelvicFloorRecords]
                      .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
                      .slice(0, 3)
                      .map((r) => (
                        <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-white/70">
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {r.exerciseType === 'kegel'
                                ? '凯格尔运动'
                                : r.exerciseType === 'squeeze'
                                ? '收缩训练'
                                : r.exerciseType === 'breathing'
                                ? '呼吸训练'
                                : r.exerciseType === 'biofeedback'
                                ? '生物反馈'
                                : '其他训练'}
                            </p>
                            <p className="text-xs text-gray-500">{r.date} {r.time}</p>
                          </div>
                          <span className="text-sm font-bold text-teal-600">{r.duration}分钟</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">暂无训练记录</p>
                )}
                <button
                  onClick={() => setActiveTab('pelvic')}
                  className="mt-4 text-sm text-teal-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
                >
                  查看全部 <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="card p-6 bg-gradient-to-br from-fuchsia-50 to-pink-50">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Baby className="w-5 h-5 text-fuchsia-500" />
                  最近哺乳记录
                </h3>
                {breastfeedingRecords.length > 0 ? (
                  <div className="space-y-2">
                    {[...breastfeedingRecords]
                      .sort((a, b) => {
                        const aTime = new Date(`${a.date}T${a.startTime}`).getTime();
                        const bTime = new Date(`${b.date}T${b.startTime}`).getTime();
                        return bTime - aTime;
                      })
                      .slice(0, 3)
                      .map((r) => (
                        <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-white/70">
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {r.type === 'breast'
                                ? '🤱 亲喂'
                                : r.type === 'pumped'
                                ? '🍼 瓶喂母乳'
                                : r.type === 'formula'
                                ? '🥛 配方奶'
                                : '✨ 混合'}
                              {r.side ? ` · ${r.side === 'left' ? '左侧' : r.side === 'right' ? '右侧' : '双侧'}` : ''}
                            </p>
                            <p className="text-xs text-gray-500">{r.date} {r.startTime}</p>
                          </div>
                          <span className="text-sm font-bold text-fuchsia-600">{r.duration}分钟</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">暂无哺乳记录</p>
                )}
                <button
                  onClick={() => setActiveTab('feeding')}
                  className="mt-4 text-sm text-fuchsia-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
                >
                  查看全部 <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recoveryKnowledge.map((item) => (
                <div key={item.id} className="card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{item.icon}</span>
                    <h3 className="font-bold text-gray-800">{item.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {item.items.map((subItem, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-pink-400 mt-0.5">•</span>
                        {subItem}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-400 via-pink-400 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-200/50">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-800">产后恢复</h1>
              <p className="text-gray-500">温柔守护，科学恢复</p>
            </div>
          </div>
          <button
            onClick={() => {
              setDeliveryDate(postpartumData.deliveryDate);
              setDeliveryType(postpartumData.deliveryType);
              setAutoGenerateCheckups(postpartumCheckups.length < 2);
              setShowSettingsModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">分娩设置</span>
          </button>
        </div>
      </div>

      <div className="card p-6 mb-6 bg-gradient-to-r from-fuchsia-400 via-pink-400 to-rose-400 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-white/80 text-sm mb-1">产后第</p>
            <h2 className="font-display text-4xl font-bold mb-2">
              {daysPostpartum > 0 ? `${daysPostpartum} 天` : '请设置分娩日期'}
            </h2>
            <p className="text-white/90">
              {daysPostpartum > 0
                ? `约 ${weeksPostpartum} 周 ${daysPostpartum % 7} 天 · 恢复进行中 💕`
                : '点击右上角设置分娩日期，开启恢复追踪'}
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-3xl mb-1">👶</div>
              <p className="text-xs text-white/80">分娩方式</p>
              <p className="font-bold">{getDeliveryTypeLabel()}</p>
              {postpartumData.deliveryDate && (
                <p className="text-xs text-white/70">{postpartumData.deliveryDate}</p>
              )}
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">📝</div>
              <p className="text-xs text-white/80">健康记录</p>
              <p className="font-bold">{totalRecords} 条</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">✅</div>
              <p className="text-xs text-white/80">复查完成</p>
              <p className="font-bold">{completedCheckups} / {postpartumCheckups.length}</p>
            </div>
          </div>
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

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">分娩信息设置</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              {(dueDate || pregnancyData.lastMenstrualPeriodDate) &&
                !postpartumData.deliveryDate && (
                  <button
                    onClick={handleImportFromPregnancy}
                    className="w-full p-4 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 text-left hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-2 text-sky-700 font-medium mb-1">
                      <Baby className="w-4 h-4" />
                      <span>从孕期数据带入</span>
                    </div>
                    <p className="text-xs text-sky-600">
                      {dueDate
                        ? `预产期: ${dueDate}，点击以此作为分娩日期`
                        : `根据末次月经计算预产期并带入`}
                    </p>
                  </button>
                )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">分娩日期</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">设置后会自动计算产后天数</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">分娩方式</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'vaginal', label: '顺产' },
                    { value: 'cesarean', label: '剖腹产' },
                    { value: 'unknown', label: '未知' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDeliveryType(opt.value as typeof deliveryType)}
                      className={cn(
                        'py-2.5 rounded-xl text-sm font-medium transition-all',
                        deliveryType === opt.value
                          ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-md'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoGen"
                  checked={autoGenerateCheckups}
                  onChange={(e) => setAutoGenerateCheckups(e.target.checked)}
                  className="w-4 h-4 accent-pink-500"
                />
                <label htmlFor="autoGen" className="text-sm text-gray-700">
                  自动生成标准复查计划（6周、3月、6月、1年）
                </label>
              </div>

              <div className="p-4 bg-pink-50 rounded-xl">
                <p className="text-sm text-gray-600">
                  <strong>💡 小提示：</strong>准确的分娩日期有助于科学安排复查计划和康复训练。
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowSettingsModal(false)} className="flex-1 btn-secondary">
                  取消
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 bg-gradient-to-r from-fuchsia-400 via-pink-400 to-rose-400 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  保存设置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
