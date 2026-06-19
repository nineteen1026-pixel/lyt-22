import { useState } from 'react';
import { Flame, Plus, X, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { HotFlashRecord } from '@/types';

const triggerOptions = ['压力', '热饮', '辛辣食物', '酒精', '闷热环境', '运动', '夜间', '情绪波动', '紧身衣物', '咖啡因'];

const severityConfig = {
  mild: { label: '轻度', color: 'from-yellow-400 to-amber-400', bg: 'bg-yellow-50', text: 'text-yellow-600', ring: 'ring-yellow-400' },
  moderate: { label: '中度', color: 'from-orange-400 to-red-400', bg: 'bg-orange-50', text: 'text-orange-600', ring: 'ring-orange-400' },
  severe: { label: '重度', color: 'from-red-400 to-rose-500', bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-400' },
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function HotFlashRecorder() {
  const { hotFlashRecords, addHotFlashRecord, getHotFlashTrend } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [severity, setSeverity] = useState<HotFlashRecord['severity']>('moderate');
  const [duration, setDuration] = useState(5);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [notes, setNotes] = useState('');

  const trend = getHotFlashTrend();
  const todayRecords = hotFlashRecords.filter((r) => r.date === new Date().toISOString().split('T')[0]);
  const todayCount = todayRecords.length;

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(trigger) ? prev.filter((t) => t !== trigger) : [...prev, trigger]
    );
  };

  const handleSave = () => {
    addHotFlashRecord({
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      time,
      severity,
      duration,
      triggers: selectedTriggers,
      notes: notes || undefined,
    });
    setShowModal(false);
    setSeverity('moderate');
    setDuration(5);
    setSelectedTriggers([]);
    setNotes('');
  };

  const maxBarCount = Math.max(...trend.map((t) => t.count), 1);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          潮热记录
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          记录潮热
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 text-center">
          <p className="text-3xl font-bold text-orange-500">{todayCount}</p>
          <p className="text-xs text-gray-500 mt-1">今日次数</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 text-center">
          <p className="text-3xl font-bold text-yellow-600">
            {todayRecords.length > 0
              ? (todayRecords.reduce((sum, r) => sum + (r.severity === 'mild' ? 1 : r.severity === 'moderate' ? 2 : 3), 0) / todayRecords.length).toFixed(1)
              : '—'}
          </p>
          <p className="text-xs text-gray-500 mt-1">平均严重度</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 text-center">
          <p className="text-3xl font-bold text-rose-500">
            {hotFlashRecords.length > 0
              ? hotFlashRecords.reduce((sum, r) => sum + r.duration, 0) / hotFlashRecords.length
              : '—'}
          </p>
          <p className="text-xs text-gray-500 mt-1">平均时长(分)</p>
        </div>
      </div>

      {trend.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            近期趋势
          </h3>
          <div className="flex items-end gap-2 h-24">
            {trend.slice(-7).map((item) => (
              <div key={item.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: '72px' }}>
                  <div
                    className="w-full max-w-[32px] rounded-t-md bg-gradient-to-t from-orange-400 to-red-400 transition-all"
                    style={{ height: `${(item.count / maxBarCount) * 64}px` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400">{item.date.slice(5)}</span>
                <span className="text-[10px] font-medium text-orange-500">{item.count}次</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">最近记录</h3>
        {hotFlashRecords.length > 0 ? (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {hotFlashRecords
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
              .slice(0, 8)
              .map((record) => {
                const cfg = severityConfig[record.severity];
                return (
                  <div key={record.id} className={`p-3 rounded-xl ${cfg.bg} border border-white/50`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Flame className={`w-4 h-4 ${cfg.text}`} />
                        <span className="text-sm font-medium text-gray-800">{record.date}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {record.time}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${cfg.color} text-white`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>持续 {record.duration} 分钟</span>
                      {record.triggers.length > 0 && <span>诱因: {record.triggers.join('、')}</span>}
                    </div>
                    {record.notes && <p className="text-xs text-gray-500 mt-1">{record.notes}</p>}
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无潮热记录</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">记录潮热</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">发生时间</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">严重程度</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(severityConfig) as HotFlashRecord['severity'][]).map((level) => {
                    const cfg = severityConfig[level];
                    return (
                      <button
                        key={level}
                        onClick={() => setSeverity(level)}
                        className={cn(
                          'p-3 rounded-xl text-center transition-all',
                          severity === level
                            ? `${cfg.bg} ring-2 ${cfg.ring}`
                            : 'bg-gray-50 hover:bg-gray-100'
                        )}
                      >
                        <span className={`text-sm font-medium ${severity === level ? cfg.text : 'text-gray-600'}`}>
                          {cfg.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  持续时长: {duration} 分钟
                </label>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1分钟</span>
                  <span>60分钟</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">可能诱因</label>
                <div className="flex flex-wrap gap-2">
                  {triggerOptions.map((trigger) => (
                    <button
                      key={trigger}
                      onClick={() => toggleTrigger(trigger)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm transition-all',
                        selectedTriggers.includes(trigger)
                          ? 'bg-orange-100 text-orange-600 border border-orange-300'
                          : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-orange-50'
                      )}
                    >
                      {trigger}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">备注 (可选)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="记录更多细节..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 btn-secondary">取消</button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-orange-400 to-red-400 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
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
