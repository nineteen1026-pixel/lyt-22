import { useState } from 'react';
import {
  Sparkles,
  Calendar,
  BookOpen,
  Heart,
  Star,
  Plus,
  ChevronLeft,
  ChevronRight,
  Info,
  TrendingUp,
  Shield,
  AlertCircle,
  Sparkles as SparklesIcon,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { CalendarDayType, PredictionResult } from '@/types';

const cycleKnowledge = [
  {
    id: 1,
    title: '什么是月经周期？',
    content: '月经周期是从本次月经第一天到下次月经第一天的间隔。正常周期为21-35天，平均28天。',
    icon: '🌸',
  },
  {
    id: 2,
    title: '初潮意味着什么？',
    content: '初潮是女孩第一次来月经，标志着青春期的开始。通常发生在10-16岁之间，是身体发育的正常现象。',
    icon: '✨',
  },
  {
    id: 3,
    title: '经期需要注意什么？',
    content: '保持外阴清洁，勤换卫生巾；避免剧烈运动和生冷食物；保证充足睡眠，保持心情愉快。',
    icon: '💗',
  },
  {
    id: 4,
    title: '痛经怎么办？',
    content: '可以用热水袋敷腹部，喝红糖姜茶，适当休息。如果疼痛严重，建议咨询医生。',
    icon: '🌷',
  },
];

const symptomsOptions = [
  '腹痛', '腰酸', '乳房胀痛', '疲劳', '情绪波动', '头痛', '食欲变化', '失眠'
];

const moodOptions = ['开心', '平静', '烦躁', '低落', '焦虑', '敏感'];

const phaseLabels: Record<PredictionResult['cyclePhase'], { label: string; color: string; emoji: string }> = {
  period: { label: '经期', color: 'from-rose-500', emoji: '🩸' },
  follicular: { label: '卵泡期', color: 'from-sky-500', emoji: '🌱' },
  ovulation: { label: '排卵期', color: 'from-violet-500', emoji: '💜' },
  fertile: { label: '易孕期', color: 'from-purple-500', emoji: '🌸' },
  luteal: { label: '黄体期', color: 'from-amber-500', emoji: '🌼' },
  predicted_period: { label: '预测经期', color: 'from-pink-400', emoji: '📅' },
};

const confidenceColors = {
  high: { label: '高', color: 'bg-emerald-500', ring: 'ring-emerald-200', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  medium: { label: '中', color: 'bg-amber-500', ring: 'ring-amber-200', text: 'text-amber-700', bg: 'bg-amber-50' },
  low: { label: '低', color: 'bg-rose-500', ring: 'ring-rose-200', text: 'text-rose-700', bg: 'bg-rose-50' },
};

export default function TeenPage() {
  const cycleData = useAppStore((s) => s.cycleData);
  const setCycleData = useAppStore((s) => s.setCycleData);
  const addPeriodRecord = useAppStore((s) => s.addPeriodRecord);
  const getPeriodPrediction = useAppStore((s) => s.getPeriodPrediction);
  const getCalendarDayInfo = useAppStore((s) => s.getCalendarDayInfo);
  const getCycleStatistics = useAppStore((s) => s.getCycleStatistics);
  const extractPeriodStartDates = useAppStore((s) => s.extractPeriodStartDates);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [flow, setFlow] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState('平静');
  const [cycleLength, setCycleLength] = useState(cycleData.cycleLength);
  const [periodLength, setPeriodLength] = useState(cycleData.periodLength);
  const [firstPeriodDate, setFirstPeriodDate] = useState(cycleData.firstPeriodDate);
  const [lastPeriodDate, setLastPeriodDate] = useState(cycleData.lastPeriodDate);

  const prediction = getPeriodPrediction();
  const stats = getCycleStatistics();
  const startDates = extractPeriodStartDates();

  const phaseInfo = phaseLabels[prediction.cyclePhase];
  const confInfo = confidenceColors[prediction.confidenceLevel];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(selectedDate);

  const prevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleSaveRecord = () => {
    addPeriodRecord({
      id: Math.random().toString(36).substr(2, 9),
      date: recordDate,
      flow,
      symptoms: selectedSymptoms,
      mood: selectedMood,
    });
    setShowRecordModal(false);
  };

  const handleSaveSettings = () => {
    setCycleData({
      cycleLength,
      periodLength,
      firstPeriodDate,
      lastPeriodDate,
    });
  };

  const getDayClasses = (info: ReturnType<typeof getCalendarDayInfo>) => {
    const base = 'aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all cursor-pointer relative';
    const typeMap: Record<CalendarDayType, string> = {
      empty: '',
      normal: cn(
        'text-gray-600 hover:bg-pink-50',
        info.isToday && 'ring-2 ring-pink-400 ring-offset-2'
      ),
      period: 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md shadow-rose-200/50',
      predicted_period: cn(
        'bg-gradient-to-br from-pink-200 to-rose-200 text-rose-700 border-2 border-dashed border-pink-400',
        info.isToday && 'ring-2 ring-pink-500 ring-offset-1'
      ),
      predicted_early: cn(
        'bg-pink-100/60 text-rose-500 border border-dashed border-pink-300/80',
        info.isToday && 'ring-2 ring-pink-400 ring-offset-1'
      ),
      predicted_late: cn(
        'bg-pink-100/60 text-rose-500 border border-dashed border-pink-300/80',
        info.isToday && 'ring-2 ring-pink-400 ring-offset-1'
      ),
      ovulation: 'bg-gradient-to-br from-violet-400 to-purple-500 text-white shadow-md shadow-purple-200/50',
      fertile: 'bg-violet-100 text-violet-700 border-2 border-violet-300',
      today: 'ring-2 ring-pink-400 ring-offset-2 text-gray-700 hover:bg-pink-50',
    };
    return cn(base, typeMap[info.type]);
  };

  const renderDot = (info: ReturnType<typeof getCalendarDayInfo>) => {
    if (info.type === 'ovulation') {
      return <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-white/90" />;
    }
    if (info.type === 'fertile' || info.type === 'predicted_period' || info.type === 'predicted_early' || info.type === 'predicted_late') {
      const opacity = (info.confidence || 50) / 100;
      const color = info.type.startsWith('predict') ? 'bg-pink-400' : 'bg-violet-400';
      return (
        <span
          className={cn('absolute -bottom-0.5 w-1.5 h-1.5 rounded-full', color)}
          style={{ opacity: Math.max(0.3, opacity) }}
        />
      );
    }
    return null;
  };

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.getMonth() + 1}/${s.getDate()} - ${e.getMonth() + 1}/${e.getDate()}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-200/50">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">少女期</h1>
            <p className="text-gray-500">温柔记录成长的每一步</p>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6 bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{phaseInfo.emoji}</span>
              <span className={cn(
                'px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r',
                phaseInfo.color
              )}>
                当前阶段：{phaseInfo.label}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">
              {prediction.daysUntilNextPeriod > 0
                ? `距离下次经期还有 ${prediction.daysUntilNextPeriod} 天`
                : prediction.daysUntilNextPeriod === 0
                ? '预计今天可能来例假啦'
                : `预测经期已开始 ${-prediction.daysUntilNextPeriod} 天`}
            </p>
            <p className="text-sm text-gray-500">
              预测日期：{prediction.predictedNextStart} ~ {prediction.predictedNextEnd}
            </p>
          </div>
          <div className="flex flex-col justify-center">
            <div className={cn('p-4 rounded-2xl rounded-tr-3xl rounded-bl-3xl', confInfo.bg)}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className={cn('w-5 h-5', confInfo.text)} />
                <span className={cn('text-sm font-medium', confInfo.text)}>
                  预测可靠度 · {confInfo.label}
                </span>
              </div>
              <div className="w-full h-2.5 bg-white rounded-full overflow-hidden mb-2">
                <div
                  className={cn('h-full rounded-full transition-all', confInfo.color)}
                  style={{ width: `${prediction.confidencePercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                基于历史数据的预测把握程度
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="p-4 rounded-2xl rounded-tl-3xl rounded-br-3xl bg-white shadow-sm border border-pink-100">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-pink-500" />
                <span className="text-sm font-medium text-pink-700">周期规律度</span>
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">{stats.regularityScore}<span className="text-sm font-normal text-gray-400"> / 100</span></p>
              <p className="text-xs text-gray-500">
                平均 {stats.avgCycleLength} 天 · 记录 {stats.cycleCount + 1} 个周期
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-pink-500" />
                周期日历
                <span className="text-xs font-normal text-gray-400 ml-1">
                  · 结合 {startDates.length} 次历史记录智能预测
                </span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="w-8 h-8 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center hover:bg-pink-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-medium text-gray-700 min-w-[100px] text-center">
                  {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月
                </span>
                <button
                  onClick={nextMonth}
                  className="w-8 h-8 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center hover:bg-pink-100 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                <div key={day} className="text-center text-sm text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startingDay }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const info = getCalendarDayInfo(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                return (
                  <div key={day} className={getDayClasses(info)} title={info.date}>
                    <span>{day}</span>
                    {renderDot(info)}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-500 to-rose-500" />
                <span className="text-sm text-gray-500">经期</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 border-2 border-dashed border-pink-400" />
                <span className="text-sm text-gray-500">预测经期</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-pink-100/70 border border-dashed border-pink-300" />
                <span className="text-sm text-gray-500">置信区间</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-400 to-purple-500" />
                <span className="text-sm text-gray-500">排卵日</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-violet-100 border-2 border-violet-300" />
                <span className="text-sm text-gray-500">易孕期</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full ring-2 ring-pink-400 ring-offset-2" />
                <span className="text-sm text-gray-500">今天</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
              <SparklesIcon className="w-5 h-5 text-violet-500" />
              周期预测详情
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-pink-500" />
                  <span className="text-sm font-medium text-pink-700">下次经期预测</span>
                </div>
                <p className="text-lg font-bold text-gray-800 mb-1">{prediction.predictedNextStart}</p>
                <p className="text-xs text-gray-500">
                  预计持续 {Math.round(stats.avgPeriodLength)} 天
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
                <div className="flex items-center gap-2 mb-2">
                  <SparklesIcon className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-medium text-violet-700">排卵日预测</span>
                </div>
                <p className="text-lg font-bold text-gray-800 mb-1">{prediction.ovulationDate}</p>
                <p className="text-xs text-gray-500">
                  易孕期 {formatDateRange(prediction.fertileWindowStart, prediction.fertileWindowEnd)}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-700">可能来潮范围</span>
                </div>
                <p className="text-lg font-bold text-gray-800 mb-1">
                  {prediction.confidenceIntervalStart}
                </p>
                <p className="text-xs text-gray-500">
                  至 {prediction.confidenceIntervalEnd}
                </p>
                <p className="text-xs text-amber-600 mt-2">
                  根据历史波动推算，实际来潮大概率落在此范围内
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-sky-500" />
                  <span className="text-sm font-medium text-sky-700">历史统计</span>
                </div>
                <p className="text-lg font-bold text-gray-800 mb-1">
                  平均 {stats.avgCycleLength} 天
                </p>
                <p className="text-xs text-gray-500">
                  最短 {stats.minCycleLength} 天 · 最长 {stats.maxCycleLength} 天
                </p>
              </div>
            </div>

            {stats.cycleCount >= 2 && (
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-emerald-700 mb-1">周期分析</p>
                    <p className="text-xs text-gray-600">
                      已记录 {stats.cycleCount + 1} 个周期，
                      标准差 {stats.stdDevCycle} 天，
                      中位数 {stats.medianCycleLength} 天。
                      {stats.regularityScore >= 75
                        ? '你的周期非常规律，预测准确度较高。'
                        : stats.regularityScore >= 50
                        ? '周期基本规律，建议继续记录以提升预测准确度。'
                        : '周期波动较大，预测仅供参考，建议咨询医生。'}
                    </p>
                  </div>
                  </div>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-pink-500" />
              小知识
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cycleKnowledge.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 hover:shadow-md transition-shadow"
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              周期概览
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-pink-50 rounded-xl">
                <span className="text-gray-600 text-sm">平均周期</span>
                <span className="font-bold text-pink-600">{stats.avgCycleLength} 天</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-rose-50 rounded-xl">
                <span className="text-gray-600 text-sm">平均经期</span>
                <span className="font-bold text-rose-600">{stats.avgPeriodLength} 天</span>
              </div>
              {cycleData.firstPeriodDate && (
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                  <span className="text-gray-600 text-sm">初潮日期</span>
                  <span className="font-bold text-amber-600 text-xs">{cycleData.firstPeriodDate}</span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                <span className="text-gray-600 text-sm">末次月经</span>
                <span className="font-bold text-purple-600 text-xs">{cycleData.lastPeriodDate}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl">
                <span className="text-gray-600 text-sm">下次经期</span>
                <span className="font-bold text-indigo-600 text-xs">{prediction.predictedNextStart}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-violet-50 rounded-xl">
                <span className="text-gray-600 text-sm">记录周期</span>
                <span className="font-bold text-violet-600">{startDates.length} 次</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-pink-500" />
              周期设置
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">初潮日期</label>
                <input
                  type="date"
                  value={firstPeriodDate}
                  onChange={(e) => setFirstPeriodDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">末次月经日期</label>
                <input
                  type="date"
                  value={lastPeriodDate}
                  onChange={(e) => setLastPeriodDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">周期长度 (天)</label>
                <input
                  type="number"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">经期长度 (天)</label>
                <input
                  type="number"
                  value={periodLength}
                  onChange={(e) => setPeriodLength(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                />
              </div>
              <button
                onClick={handleSaveSettings}
                className="w-full btn-primary"
              >
                保存设置
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setRecordDate(new Date().toISOString().split('T')[0]);
              setFlow('medium');
              setSelectedSymptoms([]);
              setSelectedMood('平静');
              setShowRecordModal(true);
            }}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            补录经期
          </button>
        </div>
      </div>

      {showRecordModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              补录经期记录
            </h2>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">记录日期</label>
                <input
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">可选择历史日期补录</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">经量</label>
                <div className="flex gap-3">
                  {(['light', 'medium', 'heavy'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFlow(f)}
                      className={cn(
                        'flex-1 py-3 rounded-xl font-medium transition-all',
                        flow === f
                          ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-md'
                          : 'bg-gray-50 text-gray-600 hover:bg-pink-50'
                      )}
                    >
                      {f === 'light' ? '少量' : f === 'medium' ? '中等' : '较多'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">症状</label>
                <div className="flex flex-wrap gap-2">
                  {symptomsOptions.map((symptom) => (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm transition-all',
                        selectedSymptoms.includes(symptom)
                          ? 'bg-pink-100 text-pink-600 border border-pink-300'
                          : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-pink-50'
                      )}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">心情</label>
                <div className="flex flex-wrap gap-2">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setSelectedMood(mood)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-all',
                        selectedMood === mood
                          ? 'bg-gradient-to-r from-violet-400 to-purple-500 text-white shadow-md'
                          : 'bg-gray-50 text-gray-500 hover:bg-violet-50'
                      )}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRecordModal(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveRecord}
                  className="flex-1 btn-primary"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
