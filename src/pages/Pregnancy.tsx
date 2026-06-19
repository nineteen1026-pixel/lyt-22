import { useState } from 'react';
import {
  Stethoscope,
  Calendar,
  Heart,
  Baby,
  Scale,
  Activity,
  CheckCircle2,
  Circle,
  Plus,
  X,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { PrenatalCheckup } from '@/types';

const pregnancyKnowledge = [
  {
    id: 1,
    title: '孕期重要检查',
    items: [
      '6-8周：确认怀孕，排除宫外孕',
      '11-13周：NT检查',
      '15-20周：唐筛',
      '22-26周：大排畸',
      '24-28周：糖耐量',
      '32周后：胎心监护',
    ],
    icon: '📋',
  },
  {
    id: 2,
    title: '孕期注意事项',
    items: [
      '定期产检，遵医嘱',
      '均衡营养，适量运动',
      '保持良好心态',
      '注意休息，避免劳累',
      '远离有害物质',
    ],
    icon: '💝',
  },
];

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function PregnancyPage() {
  const { prenatalCheckups, addPrenatalCheckup, toggleCheckupComplete } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCheckup, setNewCheckup] = useState<Partial<PrenatalCheckup>>({
    date: new Date().toISOString().split('T')[0],
    week: 12,
    type: '',
    doctor: '',
    notes: '',
    completed: false,
  });

  const completedCount = prenatalCheckups.filter((c) => c.completed).length;
  const totalCount = prenatalCheckups.length;
  const upcoming = prenatalCheckups.filter((c) => !c.completed).sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const completed = prenatalCheckups.filter((c) => c.completed).sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const currentWeek = 10;

  const handleAddCheckup = () => {
    if (newCheckup.date && newCheckup.type) {
      addPrenatalCheckup({
        id: generateId(),
        date: newCheckup.date,
        week: newCheckup.week || 0,
        type: newCheckup.type,
        doctor: newCheckup.doctor,
        notes: newCheckup.notes,
        weight: newCheckup.weight,
        bloodPressure: newCheckup.bloodPressure,
        babyHeartbeat: newCheckup.babyHeartbeat,
        completed: false,
      } as PrenatalCheckup);
      setShowAddModal(false);
      setNewCheckup({
        date: new Date().toISOString().split('T')[0],
        week: 12,
        type: '',
        doctor: '',
        notes: '',
        completed: false,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-200/50">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">孕期</h1>
            <p className="text-gray-500">全程陪伴产检之旅</p>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-8 bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-500 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-white/80 text-sm mb-1">当前孕周</p>
            <h2 className="font-display text-4xl font-bold mb-2">第 {currentWeek} 周</h2>
            <p className="text-white/90">宝宝正在健康成长中 💕</p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-3xl mb-1">👶</div>
              <p className="text-xs text-white/80">宝宝大小</p>
              <p className="font-bold">约3cm</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">💓</div>
              <p className="text-xs text-white/80">胎心</p>
              <p className="font-bold">150次/分</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">📅</div>
              <p className="text-xs text-white/80">预产期</p>
              <p className="font-bold">280天</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">产检总数</p>
              <p className="text-xl font-bold text-gray-800">{totalCount} 次</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-mint-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-mint-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已完成</p>
              <p className="text-xl font-bold text-gray-800">{completedCount} 次</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">待检查</p>
              <p className="text-xl font-bold text-gray-800">{totalCount - completedCount} 次</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-500" />
                产检计划
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                添加检查
              </button>
            </div>

            {upcoming.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">待完成</h3>
                <div className="space-y-3">
                  {upcoming.map((checkup) => (
                    <div
                      key={checkup.id}
                      className="p-4 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleCheckupComplete(checkup.id)}
                            className="mt-0.5"
                          >
                            <Circle className="w-5 h-5 text-sky-400 hover:text-sky-500" />
                          </button>
                          <div>
                            <h4 className="font-bold text-gray-800">{checkup.type}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {checkup.date} · 第{checkup.week}周
                            </p>
                            {checkup.doctor && (
                              <p className="text-sm text-gray-400 mt-1">
                                医生：{checkup.doctor}
                              </p>
                            )}
                            {checkup.notes && (
                              <p className="text-sm text-gray-500 mt-2 bg-white/50 p-2 rounded-lg">
                                {checkup.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">已完成</h3>
                <div className="space-y-3">
                  {completed.map((checkup) => (
                    <div
                      key={checkup.id}
                      className="p-4 rounded-xl bg-gray-50 border border-gray-100 opacity-75"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleCheckupComplete(checkup.id)}
                            className="mt-0.5"
                          >
                            <CheckCircle2 className="w-5 h-5 text-mint-500" fill="currentColor" />
                          </button>
                          <div>
                            <h4 className="font-medium text-gray-600 line-through">
                              {checkup.type}
                            </h4>
                            <p className="text-sm text-gray-400 mt-1">
                              {checkup.date} · 第{checkup.week}周
                            </p>
                            <div className="flex flex-wrap gap-3 mt-2">
                              {checkup.weight && (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Scale className="w-3 h-3" />
                                  {checkup.weight}kg
                                </span>
                              )}
                              {checkup.bloodPressure && (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Activity className="w-3 h-3" />
                                  {checkup.bloodPressure}
                                </span>
                              )}
                              {checkup.babyHeartbeat && (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  {checkup.babyHeartbeat}次/分
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {pregnancyKnowledge.map((item) => (
            <div key={item.id} className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{item.icon}</span>
                <h3 className="font-bold text-gray-800">{item.title}</h3>
              </div>
              <ul className="space-y-2">
                {item.items.map((subItem, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-sky-400 mt-0.5">•</span>
                    {subItem}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="card p-6 bg-gradient-to-br from-pink-50 to-rose-50">
            <div className="flex items-center gap-3 mb-3">
              <Baby className="w-6 h-6 text-pink-500" />
              <h3 className="font-bold text-gray-800">宝宝发育</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              现在宝宝已经初具人形，头部约占身体的一半。
              四肢开始发育，心脏已经形成并开始跳动。
              各个器官正在快速分化发育中。
            </p>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">添加产检</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">检查日期</label>
                <input
                  type="date"
                  value={newCheckup.date}
                  onChange={(e) => setNewCheckup({ ...newCheckup, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">孕周</label>
                <input
                  type="number"
                  value={newCheckup.week}
                  onChange={(e) => setNewCheckup({ ...newCheckup, week: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">检查项目</label>
                <input
                  type="text"
                  value={newCheckup.type}
                  onChange={(e) => setNewCheckup({ ...newCheckup, type: e.target.value })}
                  placeholder="如：NT检查、唐筛等"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">主治医生</label>
                <input
                  type="text"
                  value={newCheckup.doctor || ''}
                  onChange={(e) => setNewCheckup({ ...newCheckup, doctor: e.target.value })}
                  placeholder="可选"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">备注</label>
                <textarea
                  value={newCheckup.notes || ''}
                  onChange={(e) => setNewCheckup({ ...newCheckup, notes: e.target.value })}
                  placeholder="检查注意事项等"
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all resize-none"
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
                  onClick={handleAddCheckup}
                  className="flex-1 bg-gradient-to-r from-sky-400 to-blue-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
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
