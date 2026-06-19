import { useState } from 'react';
import {
  Pill,
  Plus,
  X,
  Clock,
  CheckCircle2,
  Circle,
  Bell,
  BellOff,
  Trash2,
  AlertCircle,
  Heart,
  Baby,
  Flower2,
  ChevronDown,
  ChevronUp,
  Link2,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { MedicationCategory, MedicationReminder } from '@/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const categoryConfig: Record<MedicationCategory, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string; gradient: string }> = {
  dysmenorrhea: {
    label: '痛经药',
    icon: Heart,
    color: 'text-rose-500',
    bg: 'from-rose-50 to-pink-50',
    border: 'border-rose-200',
    gradient: 'from-rose-400 to-pink-500',
  },
  pregnancy: {
    label: '孕期药',
    icon: Baby,
    color: 'text-sky-500',
    bg: 'from-sky-50 to-blue-50',
    border: 'border-sky-200',
    gradient: 'from-sky-400 to-blue-500',
  },
  ovulation: {
    label: '促排药',
    icon: Flower2,
    color: 'text-amber-500',
    bg: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
    gradient: 'from-amber-400 to-orange-500',
  },
};

const frequencyOptions = [
  '每日1次',
  '每日2次',
  '每日3次',
  '隔日1次',
  '每周1次',
  '按需服用',
];

const commonTimesMap: Record<string, string[]> = {
  '每日1次': ['09:00'],
  '每日2次': ['08:00', '20:00'],
  '每日3次': ['08:00', '14:00', '20:00'],
  '隔日1次': ['09:00'],
  '每周1次': ['09:00'],
  '按需服用': [],
};

export default function MedicationCenter() {
  const {
    medicationReminders,
    medicationRecords,
    addMedicationReminder,
    updateMedicationReminder,
    deleteMedicationReminder,
    addMedicationRecord,
    getMedicationAdherence,
    prenatalCheckups,
  } = useAppStore();

  const [activeCategory, setActiveCategory] = useState<MedicationCategory | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showRecordModal, setShowRecordModal] = useState<{ reminderId: string; time: string } | null>(null);
  const [recordSideEffects, setRecordSideEffects] = useState('');
  const [recordNotes, setRecordNotes] = useState('');

  const [newReminder, setNewReminder] = useState<Partial<MedicationReminder>>({
    category: 'dysmenorrhea',
    name: '',
    dosage: '',
    frequency: '每日1次',
    times: ['09:00'],
    startDate: new Date().toISOString().split('T')[0],
    active: true,
  });

  const adherence = getMedicationAdherence();

  const filteredReminders = activeCategory === 'all'
    ? medicationReminders
    : medicationReminders.filter((r) => r.category === activeCategory);

  const activeReminders = filteredReminders.filter((r) => r.active);
  const inactiveReminders = filteredReminders.filter((r) => !r.active);

  const today = new Date().toISOString().split('T')[0];

  const getTodayRecordsForReminder = (reminderId: string) =>
    medicationRecords.filter((r) => r.reminderId === reminderId && r.date === today);

  const getTakenCount = (reminderId: string) =>
    getTodayRecordsForReminder(reminderId).filter((r) => r.taken).length;

  const isTimeTaken = (reminderId: string, time: string) =>
    medicationRecords.some((r) => r.reminderId === reminderId && r.date === today && r.time === time && r.taken);

  const isTimeSkipped = (reminderId: string, time: string) =>
    medicationRecords.some((r) => r.reminderId === reminderId && r.date === today && r.time === time && r.skipped);

  const handleFrequencyChange = (freq: string) => {
    const times = commonTimesMap[freq] || [];
    setNewReminder({ ...newReminder, frequency: freq, times });
  };

  const handleAddTime = () => {
    const times = [...(newReminder.times || []), '12:00'];
    setNewReminder({ ...newReminder, times });
  };

  const handleRemoveTime = (idx: number) => {
    const times = (newReminder.times || []).filter((_, i) => i !== idx);
    setNewReminder({ ...newReminder, times });
  };

  const handleTimeChange = (idx: number, value: string) => {
    const times = [...(newReminder.times || [])];
    times[idx] = value;
    setNewReminder({ ...newReminder, times });
  };

  const handleSaveReminder = () => {
    if (newReminder.name && newReminder.dosage && newReminder.times && newReminder.times.length > 0) {
      addMedicationReminder({
        id: generateId(),
        category: newReminder.category || 'dysmenorrhea',
        name: newReminder.name,
        dosage: newReminder.dosage,
        frequency: newReminder.frequency || '每日1次',
        times: newReminder.times,
        startDate: newReminder.startDate || today,
        endDate: newReminder.endDate,
        notes: newReminder.notes,
        active: true,
        linkedPainLevel: newReminder.linkedPainLevel,
        linkedCheckupId: newReminder.linkedCheckupId,
      });
      setShowAddModal(false);
      setNewReminder({
        category: 'dysmenorrhea',
        name: '',
        dosage: '',
        frequency: '每日1次',
        times: ['09:00'],
        startDate: today,
        active: true,
      });
    }
  };

  const handleTakeMedicine = (reminderId: string, time: string) => {
    const existing = medicationRecords.find(
      (r) => r.reminderId === reminderId && r.date === today && r.time === time
    );
    if (!existing) {
      addMedicationRecord({
        id: generateId(),
        reminderId,
        date: today,
        time,
        taken: true,
        skipped: false,
      });
    }
    setShowRecordModal(null);
    setRecordSideEffects('');
    setRecordNotes('');
  };

  const handleSkipMedicine = (reminderId: string, time: string) => {
    const existing = medicationRecords.find(
      (r) => r.reminderId === reminderId && r.date === today && r.time === time
    );
    if (!existing) {
      addMedicationRecord({
        id: generateId(),
        reminderId,
        date: today,
        time,
        taken: false,
        skipped: true,
        notes: recordNotes || '跳过',
      });
    }
    setShowRecordModal(null);
    setRecordSideEffects('');
    setRecordNotes('');
  };

  const handleToggleActive = (id: string, currentActive: boolean) => {
    updateMedicationReminder(id, { active: !currentActive });
  };

  const getNextTime = (reminder: MedicationReminder) => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const upcomingTimes = reminder.times.filter((t) => t > currentTime);
    if (upcomingTimes.length > 0) {
      const next = upcomingTimes[0];
      const taken = isTimeTaken(reminder.id, next);
      return { time: next, taken, label: taken ? '已服' : '待服' };
    }
    const takenCount = getTakenCount(reminder.id);
    if (takenCount > 0) {
      return { time: null, taken: true, label: `已服${takenCount}次` };
    }
    return { time: null, taken: false, label: '今日未服' };
  };

  const getLinkedCheckupName = (checkupId?: string) => {
    if (!checkupId) return null;
    const checkup = prenatalCheckups.find((c) => c.id === checkupId);
    return checkup ? checkup.type : null;
  };

  const renderReminderCard = (reminder: MedicationReminder) => {
    const config = categoryConfig[reminder.category];
    const nextTimeInfo = getNextTime(reminder);
    const takenCount = getTakenCount(reminder.id);
    const isExpanded = expandedId === reminder.id;
    const isWithinDateRange = !reminder.endDate || reminder.endDate >= today;
    const linkedCheckup = getLinkedCheckupName(reminder.linkedCheckupId);

    return (
      <div
        key={reminder.id}
        className={cn(
          'p-4 rounded-xl border transition-all',
          reminder.active && isWithinDateRange
            ? `bg-gradient-to-r ${config.bg} ${config.border}`
            : 'bg-gray-50 border-gray-200 opacity-60'
        )}
      >
        <div
          className="flex items-start justify-between cursor-pointer"
          onClick={() => setExpandedId(isExpanded ? null : reminder.id)}
        >
          <div className="flex items-start gap-3 flex-1">
            <div className={cn('w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0', config.color)}>
              <config.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-gray-800">{reminder.name}</h4>
                <span className={cn('px-2 py-0.5 text-xs rounded-full', `bg-gradient-to-r ${config.gradient} text-white`)}>
                  {config.label}
                </span>
                {!reminder.active && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-500">已停用</span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {reminder.dosage} · {reminder.frequency}
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {reminder.times.join(' / ')}
                </span>
                {nextTimeInfo.time && (
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    nextTimeInfo.taken
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-amber-100 text-amber-600'
                  )}>
                    {nextTimeInfo.label}
                  </span>
                )}
              </div>
              {linkedCheckup && (
                <div className="flex items-center gap-1 mt-1">
                  <Link2 className="w-3 h-3 text-sky-400" />
                  <span className="text-xs text-sky-500">关联产检: {linkedCheckup}</span>
                </div>
              )}
              {reminder.linkedPainLevel && reminder.category === 'dysmenorrhea' && (
                <div className="flex items-center gap-1 mt-1">
                  <Link2 className="w-3 h-3 text-rose-400" />
                  <span className="text-xs text-rose-500">疼痛等级 ≥{reminder.linkedPainLevel} 时提醒</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {reminder.active && isWithinDateRange && (
              <span className="text-xs font-bold text-emerald-500">
                {takenCount}/{reminder.times.length}
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-white/50 space-y-4">
            <div>
              <h5 className="text-xs font-medium text-gray-500 mb-2">今日服药状态</h5>
              <div className="flex flex-wrap gap-2">
                {reminder.times.map((time) => {
                  const taken = isTimeTaken(reminder.id, time);
                  const skipped = isTimeSkipped(reminder.id, time);
                  return (
                    <div
                      key={time}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl text-sm',
                        taken
                          ? 'bg-emerald-100 text-emerald-700'
                          : skipped
                          ? 'bg-gray-100 text-gray-400 line-through'
                          : 'bg-white shadow-sm border border-gray-100'
                      )}
                    >
                      {taken ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : skipped ? (
                        <Circle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                      <span className="font-medium">{time}</span>
                      {taken && <span>已服</span>}
                      {skipped && <span>跳过</span>}
                      {!taken && !skipped && (
                        <div className="flex gap-1 ml-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowRecordModal({ reminderId: reminder.id, time });
                            }}
                            className="px-2 py-0.5 text-xs bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors"
                          >
                            服药
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSkipMedicine(reminder.id, time);
                            }}
                            className="px-2 py-0.5 text-xs bg-gray-300 text-gray-600 rounded-full hover:bg-gray-400 transition-colors"
                          >
                            跳过
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {reminder.notes && (
              <div className="p-3 bg-white/50 rounded-xl">
                <p className="text-xs text-gray-500">{reminder.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-400">
                起始: {reminder.startDate}
                {reminder.endDate && ` · 截止: ${reminder.endDate}`}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleActive(reminder.id, reminder.active);
                  }}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    reminder.active
                      ? 'text-emerald-500 hover:bg-emerald-50'
                      : 'text-gray-400 hover:bg-gray-100'
                  )}
                  title={reminder.active ? '停用提醒' : '启用提醒'}
                >
                  {reminder.active ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMedicationReminder(reminder.id);
                  }}
                  className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 text-center">
          <p className="text-3xl font-bold text-emerald-500">{adherence.rate}%</p>
          <p className="text-xs text-gray-500 mt-1">今日依从率</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 text-center">
          <p className="text-3xl font-bold text-sky-500">{adherence.taken}/{adherence.total}</p>
          <p className="text-xs text-gray-500 mt-1">已服/应服</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 text-center">
          <p className="text-3xl font-bold text-amber-500">{activeReminders.length}</p>
          <p className="text-xs text-gray-500 mt-1">活跃提醒</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all',
            activeCategory === 'all'
              ? 'bg-gradient-to-r from-violet-400 to-purple-500 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
          )}
        >
          全部
        </button>
        {(Object.keys(categoryConfig) as MedicationCategory[]).map((cat) => {
          const config = categoryConfig[cat];
          const count = medicationReminders.filter((r) => r.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                activeCategory === cat
                  ? `bg-gradient-to-r ${config.gradient} text-white shadow-md`
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
              )}
            >
              <config.icon className="w-4 h-4" />
              {config.label}
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full',
                activeCategory === cat ? 'bg-white/20' : 'bg-gray-100'
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-700">
            {activeCategory === 'all' ? '用药提醒' : `${categoryConfig[activeCategory].label}提醒`}
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-violet-400 to-purple-500 text-white rounded-full text-xs font-medium shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            添加用药
          </button>
        </div>

        {activeReminders.length > 0 ? (
          <div className="space-y-3">
            {activeReminders.map(renderReminderCard)}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Pill className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无活跃用药提醒</p>
          </div>
        )}

        {inactiveReminders.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-gray-500 mb-3">已停用</h3>
            <div className="space-y-3">
              {inactiveReminders.map(renderReminderCard)}
            </div>
          </div>
        )}
      </div>

      {medicationReminders.length === 0 && (
        <div className="card p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="font-bold text-gray-800 mb-2">添加你的第一个用药提醒</h3>
          <p className="text-sm text-gray-500 mb-4">
            管理痛经药、孕期营养素、促排药物，按时服药不遗忘
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            添加用药提醒
          </button>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">添加用药提醒</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">药品分类</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(categoryConfig) as MedicationCategory[]).map((cat) => {
                    const config = categoryConfig[cat];
                    return (
                      <button
                        key={cat}
                        onClick={() => setNewReminder({ ...newReminder, category: cat })}
                        className={cn(
                          'py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5',
                          newReminder.category === cat
                            ? `bg-gradient-to-r ${config.gradient} text-white shadow-md`
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        )}
                      >
                        <config.icon className="w-4 h-4" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">药品名称</label>
                <input
                  type="text"
                  value={newReminder.name}
                  onChange={(e) => setNewReminder({ ...newReminder, name: e.target.value })}
                  placeholder="如: 布洛芬、叶酸片"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">剂量</label>
                <input
                  type="text"
                  value={newReminder.dosage}
                  onChange={(e) => setNewReminder({ ...newReminder, dosage: e.target.value })}
                  placeholder="如: 300mg、1片"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">服用频率</label>
                <div className="grid grid-cols-3 gap-2">
                  {frequencyOptions.map((freq) => (
                    <button
                      key={freq}
                      onClick={() => handleFrequencyChange(freq)}
                      className={cn(
                        'py-2 px-2 rounded-xl text-xs font-medium transition-all',
                        newReminder.frequency === freq
                          ? 'bg-violet-100 text-violet-600 ring-2 ring-violet-400'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      )}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">提醒时间</label>
                  {newReminder.frequency !== '按需服用' && (
                    <button
                      onClick={handleAddTime}
                      className="text-xs text-violet-500 hover:text-violet-600 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      添加时间
                    </button>
                  )}
                </div>
                {newReminder.times && newReminder.times.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {newReminder.times.map((time, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => handleTimeChange(idx, e.target.value)}
                          className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-400"
                        />
                        {newReminder.times && newReminder.times.length > 1 && (
                          <button
                            onClick={() => handleRemoveTime(idx)}
                            className="p-1 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">按需服用无需设置提醒时间</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">开始日期</label>
                  <input
                    type="date"
                    value={newReminder.startDate}
                    onChange={(e) => setNewReminder({ ...newReminder, startDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">结束日期</label>
                  <input
                    type="date"
                    value={newReminder.endDate || ''}
                    onChange={(e) => setNewReminder({ ...newReminder, endDate: e.target.value || undefined })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                    placeholder="可选"
                  />
                </div>
              </div>

              {newReminder.category === 'dysmenorrhea' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    关联疼痛等级 (疼痛 ≥ 该等级时提醒)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newReminder.linkedPainLevel || 0}
                      onChange={(e) => setNewReminder({ ...newReminder, linkedPainLevel: Number(e.target.value) || undefined })}
                      className="flex-1 accent-rose-500"
                    />
                    <span className="text-sm font-bold text-rose-500 w-8 text-center">
                      {newReminder.linkedPainLevel || '-'}
                    </span>
                  </div>
                </div>
              )}

              {newReminder.category === 'pregnancy' && prenatalCheckups.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">关联产检项目</label>
                  <select
                    value={newReminder.linkedCheckupId || ''}
                    onChange={(e) => setNewReminder({ ...newReminder, linkedCheckupId: e.target.value || undefined })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                  >
                    <option value="">不关联</option>
                    {prenatalCheckups.filter((c) => !c.completed).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.type} - {c.date}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">备注 (可选)</label>
                <textarea
                  value={newReminder.notes || ''}
                  onChange={(e) => setNewReminder({ ...newReminder, notes: e.target.value })}
                  placeholder="如: 饭后服用、避免与XX同服"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddModal(false)} className="flex-1 btn-secondary">
                  取消
                </button>
                <button
                  onClick={handleSaveReminder}
                  disabled={!newReminder.name || !newReminder.dosage || !newReminder.times?.length}
                  className="flex-1 bg-gradient-to-r from-violet-400 to-purple-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRecordModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">记录服药</h2>
              <button
                onClick={() => {
                  setShowRecordModal(null);
                  setRecordSideEffects('');
                  setRecordNotes('');
                }}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">不良反应 (可选)</label>
                <input
                  type="text"
                  value={recordSideEffects}
                  onChange={(e) => setRecordSideEffects(e.target.value)}
                  placeholder="如: 胃部不适"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">备注 (可选)</label>
                <input
                  type="text"
                  value={recordNotes}
                  onChange={(e) => setRecordNotes(e.target.value)}
                  placeholder="其他备注"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleSkipMedicine(showRecordModal.reminderId, showRecordModal.time)}
                  className="flex-1 py-2.5 rounded-full font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
                >
                  跳过
                </button>
                <button
                  onClick={() => handleTakeMedicine(showRecordModal.reminderId, showRecordModal.time)}
                  className="flex-1 bg-gradient-to-r from-emerald-400 to-teal-500 text-white py-2.5 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  确认服药
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
