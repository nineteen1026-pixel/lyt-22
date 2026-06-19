import { useState } from 'react';
import { Moon, Plus, X, Clock, TrendingUp, Droplets, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { SleepRecord } from '@/types';

const qualityLabels = ['很差', '较差', '一般', '良好', '极佳'];
const qualityColors = ['from-red-400 to-rose-500', 'from-orange-400 to-amber-500', 'from-yellow-400 to-orange-400', 'from-mint-400 to-emerald-500', 'from-mint-400 to-teal-500'];

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function SleepMonitor() {
  const { sleepRecords, addSleepRecord, getSleepTrend, cycleData, hotFlashRecords } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [bedTime, setBedTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [quality, setQuality] = useState<SleepRecord['quality']>(3);
  const [interruptions, setInterruptions] = useState(0);
  const [nightSweats, setNightSweats] = useState(false);
  const [notes, setNotes] = useState('');

  const trend = getSleepTrend();
  const latestRecord = sleepRecords.length > 0
    ? sleepRecords.sort((a, b) => b.date.localeCompare(a.date))[0]
    : null;

  const avgDuration = sleepRecords.length > 0
    ? (sleepRecords.reduce((sum, r) => sum + r.duration, 0) / sleepRecords.length).toFixed(1)
    : '—';
  const avgQuality = sleepRecords.length > 0
    ? (sleepRecords.reduce((sum, r) => sum + r.quality, 0) / sleepRecords.length).toFixed(1)
    : '—';

  const daysSinceLastPeriod = cycleData.lastPeriodDate
    ? Math.floor((Date.now() - new Date(cycleData.lastPeriodDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const nightSweatCount = sleepRecords.filter((r) => r.nightSweats).length;
  const nightSweatRate = sleepRecords.length > 0
    ? Math.round((nightSweatCount / sleepRecords.length) * 100)
    : 0;

  const nightHotFlashCount = hotFlashRecords.filter((r) => r.time >= '20:00' || r.time <= '06:00').length;

  const getCycleAnalysis = () => {
    const items: { icon: string; text: string; color: string }[] = [];

    if (daysSinceLastPeriod !== null) {
      if (daysSinceLastPeriod > 90) {
        items.push({
          icon: '🔴',
          text: `已停经 ${daysSinceLastPeriod} 天，可能已进入绝经期`,
          color: 'text-rose-600',
        });
      } else if (daysSinceLastPeriod > cycleData.cycleLength + 7) {
        items.push({
          icon: '🟡',
          text: `经期推迟 ${daysSinceLastPeriod - cycleData.cycleLength} 天，更年期常见周期紊乱`,
          color: 'text-amber-600',
        });
      } else if (cycleData.cycleLength > 35) {
        items.push({
          icon: '🟡',
          text: `周期 ${cycleData.cycleLength} 天（延长），与雌激素下降相关`,
          color: 'text-amber-600',
        });
      } else if (cycleData.cycleLength < 21) {
        items.push({
          icon: '🟡',
          text: `周期 ${cycleData.cycleLength} 天（缩短），建议关注激素波动`,
          color: 'text-amber-600',
        });
      } else {
        items.push({
          icon: '🟢',
          text: `周期 ${cycleData.cycleLength} 天，目前在正常范围内`,
          color: 'text-mint-600',
        });
      }
    }

    if (nightSweatRate > 50) {
      items.push({
        icon: '💧',
        text: `夜间盗汗发生率 ${nightSweatRate}%，与潮热高度相关`,
        color: 'text-indigo-600',
      });
    }

    if (nightHotFlashCount > 0) {
      items.push({
        icon: '🔥',
        text: `记录到 ${nightHotFlashCount} 次夜间潮热，影响睡眠质量`,
        color: 'text-orange-600',
      });
    }

    if (Number(avgQuality) < 3) {
      items.push({
        icon: '😴',
        text: `近期睡眠质量偏低（${avgQuality}/5），建议调整作息`,
        color: 'text-purple-600',
      });
    }

    return items;
  };

  const cycleAnalysisItems = getCycleAnalysis();

  const handleSave = () => {
    const [bh, bm] = bedTime.split(':').map(Number);
    const [wh, wm] = wakeTime.split(':').map(Number);
    let bedMinutes = bh * 60 + bm;
    let wakeMinutes = wh * 60 + wm;
    if (wakeMinutes <= bedMinutes) wakeMinutes += 24 * 60;
    const durationHours = Number(((wakeMinutes - bedMinutes) / 60).toFixed(1));

    addSleepRecord({
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      bedTime,
      wakeTime,
      duration: durationHours,
      quality,
      interruptions,
      nightSweats,
      notes: notes || undefined,
    });
    setShowModal(false);
    setBedTime('23:00');
    setWakeTime('06:30');
    setQuality(3);
    setInterruptions(0);
    setNightSweats(false);
    setNotes('');
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Moon className="w-5 h-5 text-indigo-500" />
          睡眠监测
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-indigo-400 to-purple-400 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          记录睡眠
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 text-center">
          <p className="text-3xl font-bold text-indigo-500">{avgDuration}</p>
          <p className="text-xs text-gray-500 mt-1">平均时长(时)</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-lavender-50 text-center">
          <p className="text-3xl font-bold text-purple-500">{avgQuality}</p>
          <p className="text-xs text-gray-500 mt-1">平均质量</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-lavender-50 to-pink-50 text-center">
          <p className="text-3xl font-bold text-lavender-500">
            {sleepRecords.filter((r) => r.nightSweats).length}
          </p>
          <p className="text-xs text-gray-500 mt-1">盗汗天数</p>
        </div>
      </div>

      <div className="card p-4 mb-6 bg-gradient-to-r from-indigo-50/80 to-lavender-50/80 border border-indigo-100/50">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 mb-2">周期与睡眠关联分析</p>
            {cycleAnalysisItems.length > 0 ? (
              <ul className="space-y-1.5">
                {cycleAnalysisItems.map((item, idx) => (
                  <li key={idx} className={`flex items-start gap-2 text-xs ${item.color}`}>
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500">记录更多数据以获取关联分析</p>
            )}
          </div>
        </div>
      </div>

      {trend.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            睡眠趋势
          </h3>
          <div className="flex items-end gap-2 h-24">
            {trend.slice(-7).map((item) => (
              <div key={item.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: '72px' }}>
                  <div
                    className={cn(
                      'w-full max-w-[32px] rounded-t-md transition-all',
                      item.avgQuality >= 4
                        ? 'bg-gradient-to-t from-mint-400 to-emerald-400'
                        : item.avgQuality >= 3
                        ? 'bg-gradient-to-t from-indigo-400 to-purple-400'
                        : 'bg-gradient-to-t from-orange-400 to-red-400'
                    )}
                    style={{ height: `${(item.avgDuration / 10) * 64}px` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400">{item.date.slice(5)}</span>
                <span className="text-[10px] font-medium text-indigo-500">{item.avgDuration}h</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">最近记录</h3>
        {sleepRecords.length > 0 ? (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {sleepRecords
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 6)
              .map((record) => (
                <div
                  key={record.id}
                  className={cn(
                    'p-3 rounded-xl border border-white/50',
                    record.nightSweats ? 'bg-gradient-to-r from-indigo-50 to-purple-50' : 'bg-gray-50'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm font-medium text-gray-800">{record.date}</span>
                    </div>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full bg-gradient-to-r text-white',
                      qualityColors[record.quality - 1]
                    )}>
                      {qualityLabels[record.quality - 1]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{record.bedTime} → {record.wakeTime}</span>
                    <span>{record.duration}小时</span>
                    {record.interruptions > 0 && <span>中断{record.interruptions}次</span>}
                    {record.nightSweats && (
                      <span className="flex items-center gap-1 text-indigo-500">
                        <Droplets className="w-3 h-3" />
                        盗汗
                      </span>
                    )}
                  </div>
                  {record.notes && <p className="text-xs text-gray-500 mt-1">{record.notes}</p>}
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无睡眠记录</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">记录睡眠</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">入睡时间</label>
                  <input
                    type="time"
                    value={bedTime}
                    onChange={(e) => setBedTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">起床时间</label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">睡眠质量</label>
                <div className="grid grid-cols-5 gap-2">
                  {([1, 2, 3, 4, 5] as SleepRecord['quality'][]).map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={cn(
                        'p-2 rounded-xl text-center transition-all',
                        quality === q
                          ? 'bg-indigo-100 ring-2 ring-indigo-400'
                          : 'bg-gray-50 hover:bg-gray-100'
                      )}
                    >
                      <span className={cn('text-sm', quality === q ? 'text-indigo-600 font-medium' : 'text-gray-600')}>
                        {qualityLabels[q - 1]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  夜间中断次数: {interruptions}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={interruptions}
                  onChange={(e) => setInterruptions(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  夜间盗汗
                  <button
                    onClick={() => setNightSweats(!nightSweats)}
                    className={cn(
                      'w-10 h-5 rounded-full transition-all relative',
                      nightSweats ? 'bg-indigo-500' : 'bg-gray-300'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm',
                        nightSweats ? 'left-5.5' : 'left-0.5'
                      )}
                    />
                  </button>
                </label>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">备注 (可选)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="记录影响睡眠的因素..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 btn-secondary">取消</button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-indigo-400 to-purple-400 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
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
