import { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Droplets,
  BookOpen,
  Heart,
  Star,
  Plus,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

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

export default function TeenPage() {
  const { cycleData, getNextPeriodDate, setCycleData, addPeriodRecord } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [flow, setFlow] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState('平静');
  const [cycleLength, setCycleLength] = useState(cycleData.cycleLength);
  const [periodLength, setPeriodLength] = useState(cycleData.periodLength);
  const [firstPeriodDate, setFirstPeriodDate] = useState(cycleData.firstPeriodDate);
  const [lastPeriodDate, setLastPeriodDate] = useState(cycleData.lastPeriodDate);

  const nextPeriod = getNextPeriodDate();

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

  const isPeriodDay = (day: number) => {
    const checkDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    const lastPeriod = new Date(cycleData.lastPeriodDate);
    const diffDays = Math.floor((checkDate.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 0 && diffDays < cycleData.periodLength) {
      return true;
    }
    return false;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
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
      date: new Date().toISOString().split('T')[0],
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-pink-500" />
                周期日历
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
                const period = isPeriodDay(day);
                const today = isToday(day);
                
                return (
                  <div
                    key={day}
                    className={cn(
                      'aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all cursor-pointer',
                      period && 'bg-gradient-to-br from-pink-400 to-rose-400 text-white shadow-md',
                      today && !period && 'ring-2 ring-pink-400 ring-offset-2',
                      !period && !today && 'hover:bg-pink-50 text-gray-600'
                    )}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-400 to-rose-400" />
                <span className="text-sm text-gray-500">经期</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full ring-2 ring-pink-400 ring-offset-2" />
                <span className="text-sm text-gray-500">今天</span>
              </div>
            </div>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-pink-50 rounded-xl">
                <span className="text-gray-600">周期长度</span>
                <span className="font-bold text-pink-600">{cycleData.cycleLength} 天</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-rose-50 rounded-xl">
                <span className="text-gray-600">经期长度</span>
                <span className="font-bold text-rose-600">{cycleData.periodLength} 天</span>
              </div>
              {cycleData.firstPeriodDate && (
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                  <span className="text-gray-600">初潮日期</span>
                  <span className="font-bold text-amber-600 text-sm">{cycleData.firstPeriodDate}</span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                <span className="text-gray-600">末次月经</span>
                <span className="font-bold text-purple-600 text-sm">{cycleData.lastPeriodDate}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl">
                <span className="text-gray-600">下次经期</span>
                <span className="font-bold text-indigo-600 text-sm">{nextPeriod}</span>
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
            onClick={() => setShowRecordModal(true)}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            记录今天
          </button>
        </div>
      </div>

      {showRecordModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              记录今天
            </h2>

            <div className="space-y-6">
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
                          ? 'bg-gradient-to-r from-lavender-400 to-purple-500 text-white shadow-md'
                          : 'bg-gray-50 text-gray-500 hover:bg-lavender-50'
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
