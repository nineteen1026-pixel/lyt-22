import { useState, useMemo, useEffect } from 'react';
import {
  Baby,
  Thermometer,
  Droplets,
  Calendar,
  Heart,
  Plus,
  X,
  Star,
  Clock,
  Sparkles,
  Pill,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  Upload,
  AlertTriangle,
  Info,
  Download,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { OvulationRecord, LHResult, ConceptionProbability, CalendarDayInfo, TemperatureAnomalyAlert } from '@/types';
import { useNavigate } from 'react-router-dom';
import TemperatureChart from '@/components/temperature/TemperatureChart';
import TemperatureImport from '@/components/temperature/TemperatureImport';

const prepTips = [
  {
    id: 1,
    title: '排卵期症状',
    items: ['基础体温升高', '宫颈粘液增多呈蛋清状', '轻微腹痛', '性欲增强'],
    icon: '🌡️',
  },
  {
    id: 2,
    title: '备孕小贴士',
    items: ['保持规律作息', '均衡饮食', '适量运动', '补充叶酸', '保持心情愉快'],
    icon: '💚',
  },
];

const generateId = () => Math.random().toString(36).substr(2, 9);

const lhOptions: { value: LHResult; label: string; desc: string; color: string }[] = [
  { value: 'none', label: '未测', desc: '', color: 'bg-gray-100 text-gray-500' },
  { value: 'negative', label: '阴性', desc: '无LH峰', color: 'bg-blue-50 text-blue-600' },
  { value: 'faint', label: '弱阳', desc: '检测线浅于对照线', color: 'bg-amber-50 text-amber-600' },
  { value: 'positive', label: '阳性', desc: '检测线与对照线相当', color: 'bg-orange-50 text-orange-600' },
  { value: 'strong_positive', label: '强阳', desc: '检测线深于对照线', color: 'bg-rose-50 text-rose-600' },
];

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

function getDayTypeStyle(type: CalendarDayInfo['type']): string {
  switch (type) {
    case 'period':
      return 'bg-rose-100 text-rose-700 border-rose-300';
    case 'predicted_period':
      return 'bg-rose-50 text-rose-500 border-rose-200 border-dashed';
    case 'predicted_early':
    case 'predicted_late':
      return 'bg-rose-50/50 text-rose-400 border-rose-100 border-dashed';
    case 'ovulation':
      return 'bg-gradient-to-br from-fuchsia-400 to-pink-500 text-white border-fuchsia-400 shadow-md';
    case 'fertile_peak':
      return 'bg-gradient-to-br from-rose-300 to-pink-400 text-white border-rose-400';
    case 'fertile_high':
      return 'bg-rose-200 text-rose-800 border-rose-300';
    case 'fertile':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'lh_surge':
      return 'bg-amber-200 text-amber-900 border-amber-400';
    case 'temp_shift':
      return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'today':
      return 'bg-mint-100 text-mint-700 border-mint-400 ring-2 ring-mint-300';
    default:
      return 'bg-white text-gray-600 border-gray-100';
  }
}

function getProbabilityLabel(level: ConceptionProbability['level']): { label: string; color: string } {
  switch (level) {
    case 'peak':
      return { label: '峰值', color: 'text-rose-600 bg-rose-100' };
    case 'high':
      return { label: '高', color: 'text-orange-600 bg-orange-100' };
    case 'medium':
      return { label: '中', color: 'text-amber-600 bg-amber-100' };
    default:
      return { label: '低', color: 'text-gray-500 bg-gray-100' };
  }
}

export default function PregnancyPrepPage() {
  const {
    ovulationRecords,
    addOvulationRecord,
    getOvulationDate,
    getAdjustedOvulationDate,
    getPeriodPrediction,
    getCalendarDayInfo,
    getConceptionProbability,
    cycleData,
    medicationReminders,
    getTodayMedicationSchedule,
    detectTemperatureAnomalies,
    acknowledgeTemperatureAlert,
    temperatureRecords,
    temperatureAlerts,
  } = useAppStore();
  const navigate = useNavigate();

  const ovulationReminders = medicationReminders.filter((r) => r.category === 'ovulation' && r.active);
  const ovulationSchedule = getTodayMedicationSchedule().filter((s) => s.reminder.category === 'ovulation');
  const pendingOvPills = ovulationSchedule.filter((s) => !s.record?.taken && !s.record?.skipped);
  const takenOvPills = ovulationSchedule.filter((s) => s.record?.taken);

  const [activeTab, setActiveTab] = useState<'overview' | 'temperature' | 'calendar'>('overview');
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    detectTemperatureAnomalies();
  }, [detectTemperatureAnomalies]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<OvulationRecord>>({
    date: new Date().toISOString().split('T')[0],
    basalTemp: 36.5,
    cervicalMucus: '',
    ovulationTest: 'none',
    lhTest: 'none',
    lhIntensity: 0,
    fertileWindow: false,
  });

  const [calendarCursor, setCalendarCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const pred = useMemo(() => getPeriodPrediction(), [getPeriodPrediction]);
  const ovulationDate = getOvulationDate();
  const adjustedOvDate = getAdjustedOvulationDate();

  const today = new Date();
  const ovDate = new Date(ovulationDate);
  const daysUntilOvulation = Math.ceil((ovDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const fertileStart = adjustedOvDate ? new Date(adjustedOvDate) : new Date(pred.fertileWindowStart);
  fertileStart.setDate(fertileStart.getDate() - 5);
  const fertileEnd = adjustedOvDate ? new Date(adjustedOvDate) : new Date(pred.fertileWindowEnd);
  fertileEnd.setDate(fertileEnd.getDate() + 1);

  const todayStr = today.toISOString().split('T')[0];
  const todayProb = getConceptionProbability(todayStr);

  const isInFertileWindow = today >= fertileStart && today <= fertileEnd;

  const handleAddRecord = () => {
    if (newRecord.date) {
      addOvulationRecord({
        id: generateId(),
        date: newRecord.date,
        basalTemp: newRecord.basalTemp,
        cervicalMucus: newRecord.cervicalMucus,
        ovulationTest: newRecord.ovulationTest || 'none',
        lhTest: newRecord.lhTest || 'none',
        lhIntensity: newRecord.lhIntensity,
        fertileWindow: newRecord.fertileWindow || false,
      } as OvulationRecord);
      setShowAddModal(false);
      setNewRecord({
        date: new Date().toISOString().split('T')[0],
        basalTemp: 36.5,
        cervicalMucus: '',
        ovulationTest: 'none',
        lhTest: 'none',
        lhIntensity: 0,
        fertileWindow: false,
      });
    }
  };

  const calendarDays = useMemo(() => {
    const { year, month } = calendarCursor;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days: (CalendarDayInfo | null)[] = [];
    for (let i = 0; i < startPadding; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(getCalendarDayInfo(year, month, d));
    }
    return days;
  }, [calendarCursor, getCalendarDayInfo]);

  const prevMonth = () => {
    setCalendarCursor((c) => {
      const m = c.month - 1;
      if (m < 0) return { year: c.year - 1, month: 11 };
      return { year: c.year, month: m };
    });
  };
  const nextMonth = () => {
    setCalendarCursor((c) => {
      const m = c.month + 1;
      if (m > 11) return { year: c.year + 1, month: 0 };
      return { year: c.year, month: m };
    });
  };

  const upcomingProbabilities = pred.conceptionProbabilities?.filter((p) => p.date >= todayStr).slice(0, 7) || [];

  const tempAnomalies = useMemo(() => temperatureAlerts, [temperatureAlerts]);
  const unackAnomalies = useMemo(
    () => tempAnomalies.filter((a) => !a.acknowledged),
    [tempAnomalies]
  );

  const pageTabs: { key: 'overview' | 'temperature' | 'calendar'; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { key: 'overview', label: '备孕概览', icon: Heart, color: 'from-fuchsia-400 via-pink-400 to-rose-400' },
    { key: 'temperature', label: '体温曲线', icon: Thermometer, color: 'from-rose-400 to-pink-500' },
    { key: 'calendar', label: '排卵日历', icon: Calendar, color: 'from-mint-400 to-emerald-500' },
  ];

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return 'bg-rose-50 border-rose-200 text-rose-800';
      case 'medium':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      default:
        return 'bg-sky-50 border-sky-200 text-sky-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mint-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-mint-200/50">
            <Baby className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">备孕期</h1>
            <p className="text-gray-500">精准把握黄金时期，迎接新生命</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-mint-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-mint-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">排卵日</p>
              <p className="text-xl font-bold text-gray-800">{ovulationDate}</p>
            </div>
          </div>
          <p className="text-xs text-mint-600 font-medium">
            {daysUntilOvulation > 0 ? `还有 ${daysUntilOvulation} 天` : daysUntilOvulation === 0 ? '就是今天!' : '已过'}
            {adjustedOvDate && <span className="ml-1 text-emerald-600">· 已修正</span>}
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">易孕期</p>
              <p className="text-xl font-bold text-gray-800">
                {isInFertileWindow ? '进行中' : '等待中'}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            {adjustedOvDate ? '已根据LH试纸/体温修正' : '排卵日前5天至排卵日'}
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">今日受孕率</p>
              <p className="text-xl font-bold text-gray-800">
                {todayProb ? `${todayProb.probability}%` : '-'}
              </p>
            </div>
          </div>
          {todayProb && (
            <span className={cn('text-xs px-2 py-0.5 rounded-full', getProbabilityLabel(todayProb.level).color)}>
              {getProbabilityLabel(todayProb.level).label}
            </span>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">周期长度</p>
              <p className="text-xl font-bold text-gray-800">{cycleData.cycleLength} 天</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">正常范围 21-35 天</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {pageTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-3 px-5 py-3 rounded-xl transition-all',
                isActive
                  ? cn('bg-gradient-to-r', tab.color, 'text-white shadow-lg')
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-mint-300 hover:shadow-md'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive ? 'text-white' : 'text-mint-500')} />
              <div className="text-left">
                <p className={cn('font-bold', isActive ? 'text-white' : 'text-gray-800')}>{tab.label}</p>
                <p
                  className={cn(
                    'text-xs',
                    isActive ? 'text-white/80' : 'text-gray-400'
                  )}
                >
                  {tab.key === 'overview' && '关键指标+概率+记录'}
                  {tab.key === 'temperature' && `共 ${temperatureRecords.length} 条记录`}
                  {tab.key === 'calendar' && '日历+排卵标记'}
                </p>
              </div>
              {tab.key === 'temperature' && unackAnomalies.length > 0 && (
                <span
                  className={cn(
                    'ml-auto w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                    isActive ? 'bg-white text-rose-500' : 'bg-rose-500 text-white'
                  )}
                >
                  {unackAnomalies.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {unackAnomalies.length > 0 && (
        <div className="card p-4 mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-amber-900">
                  体温异常提醒（{unackAnomalies.length} 条待确认）
                </p>
                {unackAnomalies.length > 3 && (
                  <button
                    onClick={() =>
                      unackAnomalies.forEach((a) => acknowledgeTemperatureAlert(a.id))
                    }
                    className="text-xs text-amber-700 hover:text-amber-900 underline"
                  >
                    全部确认
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {unackAnomalies.slice(0, 6).map((alert: TemperatureAnomalyAlert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      'p-3 rounded-lg border text-xs flex items-start justify-between gap-2',
                      getSeverityColor(alert.severity)
                    )}
                  >
                    <div className="flex-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <span>{alert.typeName}</span>
                        <span className="opacity-60">· {alert.date}</span>
                      </p>
                      <p className="opacity-80 mt-1">{alert.description}</p>
                      {alert.suggestion && (
                        <p className="opacity-70 mt-1 italic">建议: {alert.suggestion}</p>
                      )}
                    </div>
                    <button
                      onClick={() => acknowledgeTemperatureAlert(alert.id)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 hover:bg-white/80 opacity-90 hover:opacity-100 transition flex-shrink-0"
                      title="确认此提醒"
                    >
                      确认
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'temperature' ? (
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Thermometer className="w-6 h-6 text-rose-500" />
                基础体温曲线
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                导入设备数据 · 自动检测排卵升高 · 同步到排卵日历
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Upload className="w-4 h-4" />
                导入体温
              </button>
            </div>
          </div>

          <TemperatureChart />

          <div className="card p-6 bg-gradient-to-br from-orange-50 to-amber-50">
            <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-orange-500" />
              体温驱动排卵日历说明
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">•</span>
                <span>导入体温后，系统自动检测基础体温升高（≥ 0.2°C 且持续），标记为 <strong>体温升高日</strong>。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">•</span>
                <span>排卵日将根据体温升高日向前修正，日历格显示
                  <span className="mx-1 px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 text-xs">体温升高</span>
                  角标与橙点标记。
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">•</span>
                <span>当前共 <strong className="text-orange-600">{temperatureRecords.length}</strong> 条体温记录，
                  已同步 <strong className="text-orange-600">{ovulationRecords.filter((r) => r.basalTemp !== undefined).length}</strong> 天至排卵日历。</span>
              </li>
            </ul>
          </div>
        </div>
      ) : null}

      {activeTab !== 'temperature' ? (
        <>
          <div className="card p-6 mb-8 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">受孕概率趋势</h3>
            <p className="text-xs text-gray-500">未来 {upcomingProbabilities.length} 天</p>
          </div>
        </div>
        {upcomingProbabilities.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {upcomingProbabilities.map((p) => {
              const lvl = getProbabilityLabel(p.level);
              const d = new Date(p.date);
              const isT = p.date === todayStr;
              return (
                <div
                  key={p.date}
                  className={cn(
                    'p-3 rounded-xl text-center transition-all',
                    isT ? 'bg-white shadow-md ring-2 ring-rose-300' : 'bg-white/60 hover:bg-white'
                  )}
                >
                  <p className="text-xs text-gray-500 mb-1">
                    {d.getMonth() + 1}/{d.getDate()}
                    {isT && <span className="ml-1 text-rose-500 font-bold">今</span>}
                  </p>
                  <p className="text-2xl font-bold text-gray-800 mb-1">{p.probability}%</p>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', lvl.color)}>
                    {lvl.label}
                  </span>
                  {(p.factors.lhTest || p.factors.basalTemp || p.factors.cervicalMucus) && (
                    <div className="mt-2 flex flex-wrap justify-center gap-1">
                      {p.factors.lhTest && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">LH +{p.factors.lhTest}</span>}
                      {p.factors.basalTemp && <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">体温 +{p.factors.basalTemp}</span>}
                      {p.factors.cervicalMucus && <span className="text-[10px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">粘液 +{p.factors.cervicalMucus}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">暂无受孕概率数据</p>
        )}
      </div>

      <div className="card p-6 mb-8 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Pill className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">促排药管理</h3>
              <p className="text-xs text-gray-500">今日 {takenOvPills.length}/{ovulationSchedule.length} 已服</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/medication')}
            className="text-sm text-amber-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
          >
            用药中心 <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        {ovulationReminders.length > 0 ? (
          <>
            {pendingOvPills.length > 0 ? (
              <div className="space-y-2 mb-4">
                {pendingOvPills.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/70 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-gray-800">{item.reminder.name}</span>
                      <span className="text-xs text-gray-400">{item.reminder.dosage}</span>
                      {item.reminder.notes && (
                        <span className="text-xs text-gray-300 hidden sm:inline">· {item.reminder.notes}</span>
                      )}
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">{item.time} 待服</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-2 mb-2">今日促排药物已全部服用 🎉</p>
            )}
            <div className="pt-3 border-t border-amber-100/60">
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-amber-500" />
                管理中: {ovulationReminders.map((r) => r.name).join('、')}
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400 text-center py-2">暂无促排药提醒，可在用药中心添加</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-mint-500" />
                排卵日历
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-[100px] text-center">
                  {calendarCursor.year}年{calendarCursor.month + 1}月
                </span>
                <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {weekDays.map((w) => (
                <div key={w} className="text-center text-xs text-gray-400 py-2 font-medium">
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((day, idx) => (
                <div key={idx} className="aspect-square">
                  {day ? (
                    <div
                      className={cn(
                        'relative w-full h-full rounded-lg border flex flex-col items-center justify-center text-xs font-medium transition-all',
                        getDayTypeStyle(day.isToday ? 'today' : day.type),
                        day.isToday && day.type !== 'normal' && 'ring-2 ring-mint-300'
                      )}
                    >
                      <span>{new Date(day.date).getDate()}</span>
                      {day.conceptionProbability !== undefined && day.type !== 'period' && !day.type.startsWith('predicted') && (
                        <span className={cn(
                          'text-[9px] leading-none mt-0.5',
                          day.type === 'ovulation' || day.type === 'fertile_peak' ? 'text-white/90' : 'text-current opacity-80'
                        )}>
                          {day.conceptionProbability}%
                        </span>
                      )}
                      <div className="absolute top-0.5 right-0.5 flex gap-0.5">
                        {day.hasLHPositive && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="LH峰值" />}
                        {day.hasTempShift && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" title="体温升高" />}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-100 border border-rose-300" />月经期</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-50 border border-rose-200 border-dashed" />预测经期</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gradient-to-br from-fuchsia-400 to-pink-500" />排卵日</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-200 border border-rose-300" />易孕期</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-200 border border-amber-400" />LH峰值</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-100 border border-orange-300" />体温升高</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />LH阳性</span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-mint-500" />
                排卵记录
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-mint-400 to-emerald-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                添加记录
              </button>
            </div>

            {ovulationRecords.length > 0 ? (
              <div className="space-y-3">
                {[...ovulationRecords]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((record) => {
                    const prob = getConceptionProbability(record.date);
                    return (
                      <div
                        key={record.id}
                        className="p-4 rounded-xl bg-gradient-to-r from-mint-50 to-emerald-50 border border-mint-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{record.date}</span>
                            {prob && (
                              <span className={cn('text-xs px-2 py-0.5 rounded-full', getProbabilityLabel(prob.level).color)}>
                                {prob.probability}%
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {record.tempShift && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
                                体温升高
                              </span>
                            )}
                            {record.fertileWindow && (
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-medium">
                                易孕期
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Thermometer className="w-4 h-4 text-red-400" />
                            <span className="text-gray-600">
                              {record.basalTemp ? `${record.basalTemp}°C` : '-'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-blue-400" />
                            <span className="text-gray-600">
                              {record.cervicalMucus || '-'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-gray-600">
                              {record.ovulationTest === 'positive' ? '阳性' : record.ovulationTest === 'negative' ? '阴性' : '未测'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-rose-400" />
                            <span className={cn(
                              'text-xs px-2 py-0.5 rounded-full',
                              lhOptions.find((o) => o.value === (record.lhTest || 'none'))?.color || 'bg-gray-100 text-gray-500'
                            )}>
                              LH: {lhOptions.find((o) => o.value === (record.lhTest || 'none'))?.label || '未测'}
                              {record.lhIntensity ? ` ${record.lhIntensity}%` : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Baby className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无排卵记录</p>
                <p className="text-sm">开始记录你的排卵情况吧~</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {prepTips.map((tip) => (
            <div key={tip.id} className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{tip.icon}</span>
                <h3 className="font-bold text-gray-800">{tip.title}</h3>
              </div>
              <ul className="space-y-2">
                {tip.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-mint-400 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="card p-6 bg-gradient-to-br from-mint-50 to-emerald-50">
            <h3 className="font-bold text-gray-800 mb-3">💡 最佳受孕时间</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              排卵前1-2天同房受孕几率最高。精子在女性体内可存活3-5天，
              卵子存活12-24小时。建议在易孕期隔天同房一次。
              LH试纸强阳后24-48小时排卵，体温升高0.2°C以上表明已排卵。
            </p>
          </div>

          <div className="card p-6 bg-gradient-to-br from-amber-50 to-rose-50">
            <h3 className="font-bold text-gray-800 mb-3">📊 受孕概率计算说明</h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-start gap-2"><span className="text-rose-500">•</span>周期预测：基于周期规律估算排卵日位置权重</li>
              <li className="flex items-start gap-2"><span className="text-amber-500">•</span>LH试纸：强阳(+30)、阳性(+20)、弱阳(+8)</li>
              <li className="flex items-start gap-2"><span className="text-orange-500">•</span>基础体温：排卵日附近升高(+15)</li>
              <li className="flex items-start gap-2"><span className="text-sky-500">•</span>宫颈粘液：蛋清状(+15)、奶油状(+8)</li>
            </ul>
          </div>
        </div>
      </div>
        </>
      ) : null}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">添加排卵记录</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">日期</label>
                <input
                  type="date"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">基础体温 (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newRecord.basalTemp}
                  onChange={(e) => setNewRecord({ ...newRecord, basalTemp: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">清晨醒来后立即测量，排卵后通常升高0.2°C以上</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">LH试纸结果</label>
                <div className="grid grid-cols-5 gap-2">
                  {lhOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setNewRecord({
                          ...newRecord,
                          lhTest: opt.value,
                          lhIntensity:
                            opt.value === 'strong_positive'
                              ? 90
                              : opt.value === 'positive'
                              ? 70
                              : opt.value === 'faint'
                              ? 40
                              : 0,
                          ovulationTest: opt.value === 'positive' || opt.value === 'strong_positive' ? 'positive' : opt.value === 'negative' ? 'negative' : 'none',
                        })
                      }
                      className={cn(
                        'py-2 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-0.5',
                        newRecord.lhTest === opt.value
                          ? 'bg-gradient-to-r from-mint-400 to-emerald-500 text-white shadow-md ring-2 ring-mint-300'
                          : 'bg-gray-50 text-gray-600 hover:bg-mint-50'
                      )}
                    >
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
                {(newRecord.lhTest === 'positive' || newRecord.lhTest === 'strong_positive' || newRecord.lhTest === 'faint') && (
                  <div className="mt-3">
                    <label className="text-xs text-gray-500 mb-1 block">检测线强度 ({newRecord.lhIntensity || 0}%)</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={newRecord.lhIntensity || 0}
                      onChange={(e) => setNewRecord({ ...newRecord, lhIntensity: Number(e.target.value) })}
                      className="w-full accent-mint-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">宫颈粘液</label>
                <select
                  value={newRecord.cervicalMucus || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, cervicalMucus: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all"
                >
                  <option value="">请选择</option>
                  <option value="干燥">干燥</option>
                  <option value="粘稠">粘稠</option>
                  <option value="奶油状">奶油状</option>
                  <option value="蛋清状">蛋清状（最易受孕）</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">排卵试纸（旧版）</label>
                <div className="flex gap-3">
                  {(['positive', 'negative', 'none'] as const).map((result) => (
                    <button
                      key={result}
                      onClick={() => setNewRecord({ ...newRecord, ovulationTest: result })}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-sm font-medium transition-all',
                        newRecord.ovulationTest === result
                          ? 'bg-gradient-to-r from-mint-400 to-emerald-500 text-white shadow-md'
                          : 'bg-gray-50 text-gray-600 hover:bg-mint-50'
                      )}
                    >
                      {result === 'positive' ? '阳性' : result === 'negative' ? '阴性' : '未测'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fertileWindow"
                  checked={newRecord.fertileWindow}
                  onChange={(e) => setNewRecord({ ...newRecord, fertileWindow: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500"
                />
                <label htmlFor="fertileWindow" className="text-sm text-gray-700">
                  标记为易孕期
                </label>
              </div>

              <div className="p-4 bg-mint-50 rounded-xl">
                <p className="text-sm text-gray-600">
                  <strong>💡 提示：</strong>LH强阳后24-48小时排卵，基础体温升高表明已排卵。系统会根据记录自动修正排卵日和受孕概率。
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleAddRecord}
                  className="flex-1 bg-gradient-to-r from-mint-400 to-emerald-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-rose-500" />
                基础体温导入
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <TemperatureImport onClose={() => setShowImportModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
