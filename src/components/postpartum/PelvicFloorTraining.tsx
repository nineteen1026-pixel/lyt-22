import { useState } from 'react';
import { Dumbbell, Plus, X, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { PelvicFloorRecord } from '@/types';

const exerciseTypeConfig: Record<PelvicFloorRecord['exerciseType'], { label: string; icon: string }> = {
  kegel: { label: '凯格尔运动', icon: '💪' },
  squeeze: { label: '收缩训练', icon: '🎯' },
  breathing: { label: '呼吸训练', icon: '🌬️' },
  biofeedback: { label: '生物反馈', icon: '📊' },
  other: { label: '其他', icon: '✨' },
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function PelvicFloorTraining() {
  const { pelvicFloorRecords, addPelvicFloorRecord, getPelvicFloorTrend } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [exerciseType, setExerciseType] = useState<PelvicFloorRecord['exerciseType']>('kegel');
  const [duration, setDuration] = useState(10);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [difficulty, setDifficulty] = useState<PelvicFloorRecord['difficulty']>(2);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [notes, setNotes] = useState('');

  const trend = getPelvicFloorTrend();
  const todayRecords = pelvicFloorRecords.filter(
    (r) => r.date === new Date().toISOString().split('T')[0]
  );
  const todayTotalMinutes = todayRecords.reduce((sum, r) => sum + r.duration, 0);
  const todayCount = todayRecords.length;
  const totalDays = new Set(pelvicFloorRecords.map((r) => r.date)).size;

  const handleSave = () => {
    addPelvicFloorRecord({
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      time,
      exerciseType,
      duration,
      sets: sets || undefined,
      reps: reps || undefined,
      difficulty,
      notes: notes || undefined,
    });
    setShowModal(false);
    setExerciseType('kegel');
    setDuration(10);
    setSets(3);
    setReps(10);
    setDifficulty(2);
    setTime(new Date().toTimeString().slice(0, 5));
    setNotes('');
  };

  const maxBarMinutes = Math.max(...trend.map((t) => t.totalDuration), 1);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-teal-500" />
          盆底训练打卡
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-teal-400 to-cyan-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          记录训练
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 text-center">
          <p className="text-3xl font-bold text-teal-500">{todayCount}</p>
          <p className="text-xs text-gray-500 mt-1">今日次数</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-sky-50 text-center">
          <p className="text-3xl font-bold text-cyan-500">{todayTotalMinutes}</p>
          <p className="text-xs text-gray-500 mt-1">今日时长(分)</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 text-center">
          <p className="text-3xl font-bold text-sky-500">{totalDays}</p>
          <p className="text-xs text-gray-500 mt-1">坚持天数</p>
        </div>
      </div>

      {trend.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-teal-400" />
            近期训练趋势
          </h3>
          <div className="flex items-end gap-2 h-24">
            {trend.slice(-7).map((item) => (
              <div key={item.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: '72px' }}>
                  <div
                    className="w-full max-w-[32px] rounded-t-md bg-gradient-to-t from-teal-400 to-cyan-400 transition-all"
                    style={{ height: `${(item.totalDuration / maxBarMinutes) * 64}px` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400">{item.date.slice(5)}</span>
                <span className="text-[10px] font-medium text-teal-500">{item.totalDuration}分</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">最近记录</h3>
        {pelvicFloorRecords.length > 0 ? (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {pelvicFloorRecords
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
              .slice(0, 8)
              .map((record) => {
                const cfg = exerciseTypeConfig[record.exerciseType];
                return (
                  <div
                    key={record.id}
                    className="p-3 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 border border-white/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cfg.icon}</span>
                        <span className="text-sm font-medium text-gray-800">{cfg.label}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {record.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span
                            key={s}
                            className={`w-3 h-3 rounded-full ${
                              s <= record.difficulty ? 'bg-teal-400' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>时长 {record.duration} 分钟</span>
                      {record.sets && <span>{record.sets}组</span>}
                      {record.reps && <span>每组{record.reps}次</span>}
                    </div>
                    {record.notes && <p className="text-xs text-gray-500 mt-1">{record.notes}</p>}
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无训练记录</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">记录盆底训练</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">训练时间</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">训练类型</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(exerciseTypeConfig) as PelvicFloorRecord['exerciseType'][]).map(
                    (type) => {
                      const cfg = exerciseTypeConfig[type];
                      return (
                        <button
                          key={type}
                          onClick={() => setExerciseType(type)}
                          className={cn(
                            'p-3 rounded-xl text-left transition-all flex items-center gap-2',
                            exerciseType === type
                              ? 'bg-teal-50 ring-2 ring-teal-400'
                              : 'bg-gray-50 hover:bg-gray-100'
                          )}
                        >
                          <span>{cfg.icon}</span>
                          <span
                            className={cn(
                              'text-sm font-medium',
                              exerciseType === type ? 'text-teal-600' : 'text-gray-600'
                            )}
                          >
                            {cfg.label}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  训练时长: {duration} 分钟
                </label>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1分钟</span>
                  <span>60分钟</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">组数</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={sets}
                    onChange={(e) => setSets(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">每组次数</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={reps}
                    onChange={(e) => setReps(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  难度等级: {difficulty} / 5
                </label>
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setDifficulty(s as PelvicFloorRecord['difficulty'])}
                      className={cn(
                        'flex-1 py-3 rounded-xl text-sm font-medium transition-all',
                        s <= difficulty
                          ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>轻松</span>
                  <span>困难</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">备注 (可选)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="记录训练感受..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-teal-400 to-cyan-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
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
