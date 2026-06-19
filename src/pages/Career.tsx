import { useState } from 'react';
import {
  Briefcase,
  Clock,
  AlertTriangle,
  TrendingUp,
  Coffee,
  Moon,
  Heart,
  Plus,
  X,
  Zap,
  Target,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { OvertimeRecord } from '@/types';

const healthTips = [
  {
    id: 1,
    title: '加班后的身体护理',
    tips: [
      '补充睡眠，尽量保证7-8小时睡眠',
      '多吃富含维生素的水果和蔬菜',
      '适当运动，促进血液循环',
      '避免摄入过多咖啡因',
    ],
    icon: '💤',
  },
  {
    id: 2,
    title: '经期加班注意事项',
    tips: [
      '注意保暖，避免空调直吹',
      '准备暖宝宝或热水袋',
      '避免久坐，定时起身活动',
      '保持心情舒畅，减少压力',
    ],
    icon: '🌸',
  },
];

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function CareerPage() {
  const { overtimeRecords, addOvertimeRecord } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<OvertimeRecord>>({
    date: new Date().toISOString().split('T')[0],
    hours: 2,
    stressLevel: 5,
    sleepHours: 7,
  });

  const totalOvertimeHours = overtimeRecords.reduce((sum, r) => sum + r.hours, 0);
  const avgStressLevel = overtimeRecords.length > 0
    ? (overtimeRecords.reduce((sum, r) => sum + r.stressLevel, 0) / overtimeRecords.length).toFixed(1)
    : 0;
  const avgSleepHours = overtimeRecords.length > 0
    ? (overtimeRecords.reduce((sum, r) => sum + r.sleepHours, 0) / overtimeRecords.length).toFixed(1)
    : 0;

  const handleAddRecord = () => {
    if (newRecord.date && newRecord.hours !== undefined) {
      addOvertimeRecord({
        id: generateId(),
        date: newRecord.date,
        hours: newRecord.hours,
        stressLevel: newRecord.stressLevel || 5,
        sleepHours: newRecord.sleepHours || 7,
        periodImpact: newRecord.periodImpact,
      } as OvertimeRecord);
      setShowAddModal(false);
      setNewRecord({
        date: new Date().toISOString().split('T')[0],
        hours: 2,
        stressLevel: 5,
        sleepHours: 7,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lavender-400 to-purple-500 flex items-center justify-center shadow-lg shadow-lavender-200/50">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">职场期</h1>
            <p className="text-gray-500">平衡工作与健康，让努力不伤身</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-lavender-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-lavender-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">累计加班</p>
              <p className="text-2xl font-bold text-gray-800">{totalOvertimeHours} 小时</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">本月加班总时长</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">平均压力值</p>
              <p className="text-2xl font-bold text-gray-800">{avgStressLevel}</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-yellow-400 to-red-400 h-1.5 rounded-full"
              style={{ width: `${Number(avgStressLevel) * 10}%` }}
            />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-mint-100 flex items-center justify-center">
              <Moon className="w-5 h-5 text-mint-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">平均睡眠</p>
              <p className="text-2xl font-bold text-gray-800">{avgSleepHours} 小时</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">建议每天7-8小时睡眠</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-lavender-500" />
                加班记录
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-lavender-400 to-purple-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                添加记录
              </button>
            </div>

            {overtimeRecords.length > 0 ? (
              <div className="space-y-3">
                {overtimeRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 rounded-xl bg-gradient-to-r from-lavender-50 to-purple-50 border border-lavender-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">{record.date}</span>
                      <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-lavender-600">
                        加班 {record.hours} 小时
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-500">压力值: {record.stressLevel}/10</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-500">睡眠: {record.sleepHours}小时</span>
                      </div>
                    </div>
                    {record.periodImpact && (
                      <div className="mt-2 pt-2 border-t border-lavender-100">
                        <p className="text-sm text-pink-500 flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5" />
                          {record.periodImpact}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Coffee className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无加班记录</p>
                <p className="text-sm">记得好好休息哦~</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {healthTips.map((tip) => (
            <div key={tip.id} className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{tip.icon}</span>
                <h3 className="font-bold text-gray-800">{tip.title}</h3>
              </div>
              <ul className="space-y-2">
                {tip.tips.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-lavender-400 mt-0.5">•</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="card p-6 bg-gradient-to-br from-lavender-50 to-purple-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <Target className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="font-bold text-gray-800">本周健康目标</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">不加班天数</span>
                  <span className="font-medium text-purple-600">3/5</span>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <div className="bg-gradient-to-r from-lavender-400 to-purple-500 h-2 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">运动时长</span>
                  <span className="font-medium text-purple-600">2/3次</span>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <div className="bg-gradient-to-r from-mint-400 to-emerald-500 h-2 rounded-full" style={{ width: '66%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">添加加班记录</h2>
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
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">加班时长 (小时)</label>
                <input
                  type="number"
                  value={newRecord.hours}
                  onChange={(e) => setNewRecord({ ...newRecord, hours: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  压力等级: {newRecord.stressLevel}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newRecord.stressLevel}
                  onChange={(e) => setNewRecord({ ...newRecord, stressLevel: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">睡眠时长 (小时)</label>
                <input
                  type="number"
                  value={newRecord.sleepHours}
                  onChange={(e) => setNewRecord({ ...newRecord, sleepHours: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">对经期影响 (可选)</label>
                <input
                  type="text"
                  value={newRecord.periodImpact || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, periodImpact: e.target.value })}
                  placeholder="如：经期推迟、痛经加重等"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 outline-none transition-all"
                />
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
                  className="flex-1 bg-gradient-to-r from-lavender-400 to-purple-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
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
