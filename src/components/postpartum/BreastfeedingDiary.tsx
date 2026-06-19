import { useState } from 'react';
import { Baby, Plus, X, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { BreastfeedingRecord, FeedingType, BreastSide } from '@/types';

const typeConfig: Record<FeedingType, { label: string; icon: string; color: string }> = {
  breast: { label: '亲喂', icon: '🤱', color: 'from-rose-400 to-pink-400' },
  pumped: { label: '瓶喂母乳', icon: '🍼', color: 'from-pink-400 to-fuchsia-400' },
  formula: { label: '配方奶', icon: '🥛', color: 'from-amber-400 to-orange-400' },
  mixed: { label: '混合', icon: '✨', color: 'from-fuchsia-400 to-purple-400' },
};

const sideConfig: Record<BreastSide, { label: string }> = {
  left: { label: '左侧' },
  right: { label: '右侧' },
  both: { label: '双侧' },
};

const moodConfig: Record<NonNullable<BreastfeedingRecord['mood']>, { label: string; emoji: string }> = {
  calm: { label: '安静', emoji: '😌' },
  sleepy: { label: '犯困', emoji: '😴' },
  hungry: { label: '饥饿', emoji: '😋' },
  fussy: { label: '烦躁', emoji: '😟' },
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function BreastfeedingDiary() {
  const { breastfeedingRecords, addBreastfeedingRecord, getBreastfeedingStats } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<FeedingType>('breast');
  const [side, setSide] = useState<BreastSide | undefined>('left');
  const [startTime, setStartTime] = useState(new Date().toTimeString().slice(0, 5));
  const [duration, setDuration] = useState(15);
  const [amount, setAmount] = useState<string>('');
  const [mood, setMood] = useState<BreastfeedingRecord['mood']>('calm');
  const [notes, setNotes] = useState('');

  const stats = getBreastfeedingStats();
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = breastfeedingRecords.filter((r) => r.date === today);

  const totalFeedings = breastfeedingRecords.length;
  const leftCount = breastfeedingRecords.filter((r) => r.side === 'left').length;
  const rightCount = breastfeedingRecords.filter((r) => r.side === 'right').length;
  const lastRecord = [...breastfeedingRecords].sort((a, b) => {
    const aTime = new Date(`${a.date}T${a.startTime}`).getTime();
    const bTime = new Date(`${b.date}T${b.startTime}`).getTime();
    return bTime - aTime;
  })[0];

  const hoursSinceLast = lastRecord
    ? Math.round((Date.now() - new Date(`${lastRecord.date}T${lastRecord.startTime}`).getTime()) / 3600000)
    : null;

  const handleSave = () => {
    addBreastfeedingRecord({
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      startTime,
      type,
      side: type === 'breast' || type === 'mixed' ? side : undefined,
      duration,
      amount: amount ? Number(amount) : undefined,
      mood,
      notes: notes || undefined,
    });
    setShowModal(false);
    setType('breast');
    setSide('left');
    setStartTime(new Date().toTimeString().slice(0, 5));
    setDuration(15);
    setAmount('');
    setMood('calm');
    setNotes('');
  };

  const typeRecordCounts: Record<FeedingType, number> = {
    breast: breastfeedingRecords.filter((r) => r.type === 'breast').length,
    pumped: breastfeedingRecords.filter((r) => r.type === 'pumped').length,
    formula: breastfeedingRecords.filter((r) => r.type === 'formula').length,
    mixed: breastfeedingRecords.filter((r) => r.type === 'mixed').length,
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Baby className="w-5 h-5 text-fuchsia-500" />
          哺乳日记
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-fuchsia-400 to-pink-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          记录哺乳
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 text-center">
          <p className="text-2xl font-bold text-rose-500">{stats.todayCount}</p>
          <p className="text-[11px] text-gray-500 mt-1">今日次数</p>
        </div>
        <div className="p-3 rounded-xl bg-gradient-to-br from-pink-50 to-fuchsia-50 text-center">
          <p className="text-2xl font-bold text-pink-500">{stats.todayTotalMinutes}</p>
          <p className="text-[11px] text-gray-500 mt-1">今日时长(分)</p>
        </div>
        <div className="p-3 rounded-xl bg-gradient-to-br from-fuchsia-50 to-purple-50 text-center">
          <p className="text-2xl font-bold text-fuchsia-500">{hoursSinceLast !== null ? `${hoursSinceLast}h` : '—'}</p>
          <p className="text-[11px] text-gray-500 mt-1">距上次</p>
        </div>
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 text-center">
          <p className="text-2xl font-bold text-purple-500">{totalFeedings}</p>
          <p className="text-[11px] text-gray-500 mt-1">总记录</p>
        </div>
      </div>

      {(leftCount > 0 || rightCount > 0) && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-rose-400" />
            左右平衡
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>左侧 {leftCount}次</span>
                <span>{rightCount}次 右侧</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-gray-200">
                <div
                  className="bg-gradient-to-r from-rose-400 to-pink-400 transition-all"
                  style={{ width: `${(leftCount / (leftCount + rightCount)) * 100}%` }}
                />
                <div
                  className="bg-gradient-to-r from-pink-400 to-fuchsia-400 transition-all"
                  style={{ width: `${(rightCount / (leftCount + rightCount)) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(typeRecordCounts) as FeedingType[]).map((t) => (
              typeRecordCounts[t] > 0 && (
                <span key={t} className="px-2 py-0.5 bg-white rounded-full text-xs text-gray-600">
                  {typeConfig[t].icon} {typeConfig[t].label} {typeRecordCounts[t]}次
                </span>
              )
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">今日记录</h3>
        {todayRecords.length > 0 ? (
          <div className="space-y-3 max-h-56 overflow-y-auto">
            {[...todayRecords]
              .sort((a, b) => b.startTime.localeCompare(a.startTime))
              .map((record) => {
                const cfg = typeConfig[record.type];
                return (
                  <div
                    key={record.id}
                    className={cn(
                      'p-3 rounded-xl border bg-gradient-to-r',
                      record.type === 'breast'
                        ? 'from-rose-50 to-pink-50 border-rose-100'
                        : record.type === 'pumped'
                        ? 'from-pink-50 to-fuchsia-50 border-pink-100'
                        : record.type === 'formula'
                        ? 'from-amber-50 to-orange-50 border-amber-100'
                        : 'from-fuchsia-50 to-purple-50 border-fuchsia-100'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span>{cfg.icon}</span>
                        <span className="text-sm font-medium text-gray-800">{cfg.label}</span>
                        {record.side && (
                          <span className="text-xs px-1.5 py-0.5 bg-white/70 rounded-full text-gray-600">
                            {sideConfig[record.side].label}
                          </span>
                        )}
                        {record.mood && <span>{moodConfig[record.mood].emoji}</span>}
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {record.startTime}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      {record.duration && <span>时长 {record.duration}分钟</span>}
                      {record.amount && <span>奶量 {record.amount}ml</span>}
                    </div>
                    {record.notes && <p className="text-xs text-gray-500 mt-1">{record.notes}</p>}
                  </div>
                );
              })}
          </div>
        ) : breastfeedingRecords.length > 0 ? (
          <div className="space-y-3 max-h-56 overflow-y-auto">
            {[...breastfeedingRecords]
              .sort((a, b) => {
                const aTime = new Date(`${a.date}T${a.startTime}`).getTime();
                const bTime = new Date(`${b.date}T${b.startTime}`).getTime();
                return bTime - aTime;
              })
              .slice(0, 6)
              .map((record) => {
                const cfg = typeConfig[record.type];
                return (
                  <div
                    key={record.id}
                    className={cn(
                      'p-3 rounded-xl border bg-gradient-to-r',
                      record.type === 'breast'
                        ? 'from-rose-50 to-pink-50 border-rose-100'
                        : record.type === 'pumped'
                        ? 'from-pink-50 to-fuchsia-50 border-pink-100'
                        : record.type === 'formula'
                        ? 'from-amber-50 to-orange-50 border-amber-100'
                        : 'from-fuchsia-50 to-purple-50 border-fuchsia-100'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span>{cfg.icon}</span>
                        <span className="text-sm font-medium text-gray-800">{cfg.label}</span>
                        {record.side && (
                          <span className="text-xs px-1.5 py-0.5 bg-white/70 rounded-full text-gray-600">
                            {sideConfig[record.side].label}
                          </span>
                        )}
                        {record.mood && <span>{moodConfig[record.mood].emoji}</span>}
                      </div>
                      <span className="text-xs text-gray-400">
                        {record.date} {record.startTime}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      {record.duration && <span>时长 {record.duration}分钟</span>}
                      {record.amount && <span>奶量 {record.amount}ml</span>}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无哺乳记录</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">记录哺乳</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">开始时间</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">喂养方式</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(typeConfig) as FeedingType[]).map((t) => {
                    const cfg = typeConfig[t];
                    return (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={cn(
                          'p-3 rounded-xl text-left transition-all flex items-center gap-2',
                          type === t
                            ? `bg-gradient-to-r ${cfg.color} text-white shadow-md`
                            : 'bg-gray-50 hover:bg-gray-100'
                        )}
                      >
                        <span className="text-lg">{cfg.icon}</span>
                        <span className={cn('text-sm font-medium', type === t ? 'text-white' : 'text-gray-600')}>
                          {cfg.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {(type === 'breast' || type === 'mixed') && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">喂养侧</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(sideConfig) as BreastSide[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSide(s)}
                        className={cn(
                          'py-2.5 rounded-xl text-sm font-medium transition-all',
                          side === s
                            ? 'bg-fuchsia-100 text-fuchsia-600 ring-2 ring-fuchsia-400'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        )}
                      >
                        {sideConfig[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  持续时长: {duration} 分钟
                </label>
                <input
                  type="range"
                  min="1"
                  max="120"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-fuchsia-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1分钟</span>
                  <span>120分钟</span>
                </div>
              </div>

              {(type === 'pumped' || type === 'formula' || type === 'mixed') && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">奶量 (ml, 可选)</label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="输入奶量"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100 outline-none transition-all"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">宝宝状态</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(moodConfig) as NonNullable<BreastfeedingRecord['mood']>[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={cn(
                        'py-3 rounded-xl text-center transition-all flex flex-col items-center gap-1',
                        mood === m
                          ? 'bg-fuchsia-100 ring-2 ring-fuchsia-400'
                          : 'bg-gray-50 hover:bg-gray-100'
                      )}
                    >
                      <span className="text-xl">{moodConfig[m].emoji}</span>
                      <span className={cn('text-xs', mood === m ? 'text-fuchsia-600' : 'text-gray-500')}>
                        {moodConfig[m].label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">备注 (可选)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="记录宝宝吃奶情况..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-fuchsia-400 to-pink-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
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
