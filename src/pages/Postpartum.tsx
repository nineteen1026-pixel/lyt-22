import { useState } from 'react';
import { Sparkles, Settings, Baby, Calendar, Droplets, Dumbbell, Stethoscope, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import PelvicFloorTraining from '@/components/postpartum/PelvicFloorTraining';
import LochiaTracker from '@/components/postpartum/LochiaTracker';
import BreastfeedingDiary from '@/components/postpartum/BreastfeedingDiary';
import CheckupReminder from '@/components/postpartum/CheckupReminder';

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

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function Postpartum() {
  const {
    postpartumData,
    setPostpartumData,
    getDaysPostpartum,
    pelvicFloorRecords,
    lochiaRecords,
    breastfeedingRecords,
    postpartumCheckups,
  } = useAppStore();

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(postpartumData.deliveryDate);
  const [deliveryType, setDeliveryType] = useState(postpartumData.deliveryType);

  const daysPostpartum = getDaysPostpartum();
  const weeksPostpartum = Math.floor(daysPostpartum / 7);

  const handleSaveSettings = () => {
    setPostpartumData({
      deliveryDate,
      deliveryType,
    });
    setShowSettingsModal(false);
  };

  const totalRecords =
    pelvicFloorRecords.length + lochiaRecords.length + breastfeedingRecords.length;
  const completedCheckups = postpartumCheckups.filter((c) => c.completed).length;

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
              setShowSettingsModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">分娩设置</span>
          </button>
        </div>
      </div>

      <div className="card p-6 mb-8 bg-gradient-to-r from-fuchsia-400 via-pink-400 to-rose-400 text-white relative overflow-hidden">
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
              <p className="font-bold">{completedCheckups} 次</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">盆底训练</p>
              <p className="text-xl font-bold text-gray-800">{pelvicFloorRecords.length} 次</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">恶露追踪</p>
              <p className="text-xl font-bold text-gray-800">{lochiaRecords.length} 次</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fuchsia-100 flex items-center justify-center">
              <Baby className="w-5 h-5 text-fuchsia-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">哺乳日记</p>
              <p className="text-xl font-bold text-gray-800">{breastfeedingRecords.length} 次</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">复查提醒</p>
              <p className="text-xl font-bold text-gray-800">{postpartumCheckups.length} 项</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PelvicFloorTraining />
          <LochiaTracker />
        </div>

        <div className="space-y-6">
          <BreastfeedingDiary />
          <CheckupReminder />
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

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
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
                      className={
                        'py-2.5 rounded-xl text-sm font-medium transition-all ' +
                        (deliveryType === opt.value
                          ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-md'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100')
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
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
