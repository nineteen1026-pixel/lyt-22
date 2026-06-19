import {
  Pill,
  Sparkles,
  ArrowRight,
  Heart,
  Baby,
  Flower2,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import MedicationCenter from '@/components/medication/MedicationCenter';

export default function Medication() {
  const {
    medicationReminders,
    medicationRecords,
    getTodayMedicationSchedule,
    getMedicationAdherence,
    cycleData,
    prenatalCheckups,
  } = useAppStore();

  const adherence = getMedicationAdherence();
  const todaySchedule = getTodayMedicationSchedule();
  const today = new Date().toISOString().split('T')[0];

  const pendingSchedule = todaySchedule.filter((s) => !s.record?.taken && !s.record?.skipped);
  const completedSchedule = todaySchedule.filter((s) => s.record?.taken);

  const dysmenorrheaCount = medicationReminders.filter((r) => r.category === 'dysmenorrhea' && r.active).length;
  const pregnancyCount = medicationReminders.filter((r) => r.category === 'pregnancy' && r.active).length;
  const ovulationCount = medicationReminders.filter((r) => r.category === 'ovulation' && r.active).length;

  const upcomingCheckups = prenatalCheckups.filter((c) => !c.completed).length;

  const categoryCards = [
    {
      key: 'dysmenorrhea' as const,
      label: '痛经药管理',
      desc: '布洛芬、止痛片等',
      count: dysmenorrheaCount,
      unit: '项提醒',
      icon: Heart,
      color: 'text-rose-600',
      bg: 'from-rose-50 to-pink-50',
      linkedLabel: `经期周期 ${cycleData.cycleLength}天`,
    },
    {
      key: 'pregnancy' as const,
      label: '孕期药管理',
      desc: '叶酸、钙片、铁剂等',
      count: pregnancyCount,
      unit: '项提醒',
      icon: Baby,
      color: 'text-sky-600',
      bg: 'from-sky-50 to-blue-50',
      linkedLabel: upcomingCheckups > 0 ? `${upcomingCheckups}项产检待查` : '暂无待查产检',
    },
    {
      key: 'ovulation' as const,
      label: '促排药管理',
      desc: '来曲唑、促排针等',
      count: ovulationCount,
      unit: '项提醒',
      icon: Flower2,
      color: 'text-amber-600',
      bg: 'from-amber-50 to-orange-50',
      linkedLabel: '需遵医嘱严格按时',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-200/50">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">用药提醒中心</h1>
            <p className="text-gray-500">按时服药，科学管理，健康守护</p>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6 bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-white/80 text-sm mb-1">今日服药进度</p>
            <h2 className="font-display text-4xl font-bold mb-2">
              {completedSchedule.length}/{todaySchedule.length}
            </h2>
            <p className="text-white/90">
              依从率 {adherence.rate}% · {pendingSchedule.length > 0 ? `还有${pendingSchedule.length}次待服` : '今日已全部完成 🎉'}
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-3xl mb-1">💊</div>
              <p className="text-xs text-white/80">用药总数</p>
              <p className="font-bold">{medicationReminders.length}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">✅</div>
              <p className="text-xs text-white/80">今日已服</p>
              <p className="font-bold">{completedSchedule.length}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">📋</div>
              <p className="text-xs text-white/80">服药记录</p>
              <p className="font-bold">{medicationRecords.length}</p>
            </div>
          </div>
        </div>
      </div>

      {pendingSchedule.length > 0 && (
        <div className="card p-5 mb-6 border-l-4 border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-gray-800">待服药物</h3>
          </div>
          <div className="space-y-2">
            {pendingSchedule.slice(0, 4).map((item, idx) => {
              const categoryConfig = {
                dysmenorrhea: { color: 'text-rose-500', bg: 'bg-rose-100' },
                pregnancy: { color: 'text-sky-500', bg: 'bg-sky-100' },
                ovulation: { color: 'text-amber-500', bg: 'bg-amber-100' },
              };
              const catStyle = categoryConfig[item.reminder.category];
              return (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-white/70 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', catStyle.bg, catStyle.color)}>
                      {item.time}
                    </span>
                    <span className="text-sm font-medium text-gray-800">{item.reminder.name}</span>
                    <span className="text-xs text-gray-400">{item.reminder.dosage}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {categoryCards.map((card) => (
          <div key={card.key} className={cn('card p-5 bg-gradient-to-br', card.bg)}>
            <div className="flex items-start justify-between mb-3">
              <div className={cn('w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm', card.color)}>
                <card.icon className="w-5 h-5" />
              </div>
              <CheckCircle2 className={cn('w-5 h-5', card.count > 0 ? card.color : 'text-gray-300')} />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">{card.label}</h3>
            <p className="text-xs text-gray-500 mb-1">{card.desc}</p>
            <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {card.linkedLabel}
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {card.count}
              <span className="text-sm font-normal text-gray-500 ml-1">{card.unit}</span>
            </p>
          </div>
        ))}
      </div>

      <MedicationCenter />
    </div>
  );
}
