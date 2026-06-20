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
  Settings,
  Pill,
  ArrowRight,
  Cross,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { PrenatalCheckup } from '@/types';
import { useNavigate } from 'react-router-dom';

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

const babySizeByWeek: Record<number, { size: string; description: string }> = {
  4: { size: '约0.2cm', description: '像一颗罂粟籽' },
  5: { size: '约0.4cm', description: '像一颗芝麻' },
  6: { size: '约0.6cm', description: '像一颗小扁豆' },
  7: { size: '约1cm', description: '像一颗蓝莓' },
  8: { size: '约1.6cm', description: '像一颗芸豆' },
  9: { size: '约2.3cm', description: '像一颗葡萄' },
  10: { size: '约3.1cm', description: '像一颗金桔' },
  11: { size: '约4.1cm', description: '像一颗无花果' },
  12: { size: '约5.4cm', description: '像一颗酸橙' },
  13: { size: '约7.4cm', description: '像一个桃子' },
  14: { size: '约8.7cm', description: '像一个柠檬' },
  15: { size: '约10.1cm', description: '像一个苹果' },
  16: { size: '约11.6cm', description: '像一个牛油果' },
  20: { size: '约25.6cm', description: '像一个香蕉' },
  24: { size: '约30cm', description: '像一个玉米' },
  28: { size: '约37cm', description: '像一个茄子' },
  32: { size: '约42cm', description: '像一个南瓜' },
  36: { size: '约47cm', description: '像一个哈密瓜' },
  40: { size: '约50cm', description: '像一个小西瓜' },
};

const getBabyInfo = (week: number) => {
  if (week <= 0) return { size: '待确定', description: '请设置孕周' };
  const knownWeeks = Object.keys(babySizeByWeek).map(Number).sort((a, b) => b - a);
  const closestWeek = knownWeeks.find(w => week >= w) || 4;
  return babySizeByWeek[closestWeek] || { size: '成长中', description: '宝宝正在努力发育' };
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function PregnancyPage() {
  const {
    prenatalCheckups,
    pregnancyData,
    addPrenatalCheckup,
    toggleCheckupComplete,
    setPregnancyData,
    getCurrentWeek,
    getDueDate,
    medicationReminders,
    getTodayMedicationSchedule,
    visitRecords,
    getVisitRecordsByDate,
  } = useAppStore();

  const navigate = useNavigate();

  const pregnancyMedReminders = medicationReminders.filter((r) => r.category === 'pregnancy' && r.active);
  const pregnancySchedule = getTodayMedicationSchedule().filter((s) => s.reminder.category === 'pregnancy');
  const pregnancyPending = pregnancySchedule.filter((s) => !s.record?.taken && !s.record?.skipped);
  const pregnancyTaken = pregnancySchedule.filter((s) => s.record?.taken);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newCheckup, setNewCheckup] = useState<Partial<PrenatalCheckup>>({
    date: new Date().toISOString().split('T')[0],
    week: 12,
    type: '',
    doctor: '',
    notes: '',
    completed: false,
  });

  const [lmpDate, setLmpDate] = useState(pregnancyData.lastMenstrualPeriodDate);
  const [manualWeek, setManualWeek] = useState<string>(
    pregnancyData.manualWeek !== null ? String(pregnancyData.manualWeek) : ''
  );
  const [useManualWeek, setUseManualWeek] = useState(pregnancyData.manualWeek !== null);

  const completedCount = prenatalCheckups.filter((c) => c.completed).length;
  const totalCount = prenatalCheckups.length;
  const upcoming = prenatalCheckups.filter((c) => !c.completed).sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const completed = prenatalCheckups.filter((c) => c.completed).sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const currentWeek = getCurrentWeek();
  const dueDate = getDueDate();
  const babyInfo = getBabyInfo(currentWeek);

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

  const handleSaveSettings = () => {
    if (useManualWeek) {
      setPregnancyData({
        lastMenstrualPeriodDate: lmpDate,
        manualWeek: manualWeek ? Number(manualWeek) : null,
      });
    } else {
      setPregnancyData({
        lastMenstrualPeriodDate: lmpDate,
        manualWeek: null,
      });
    }
    setShowSettingsModal(false);
  };

  const getDaysUntilDue = () => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const daysUntilDue = getDaysUntilDue();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-200/50">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-800">孕期</h1>
              <p className="text-gray-500">全程陪伴产检之旅</p>
            </div>
          </div>
          <button
            onClick={() => {
              setLmpDate(pregnancyData.lastMenstrualPeriodDate);
              setManualWeek(pregnancyData.manualWeek !== null ? String(pregnancyData.manualWeek) : '');
              setUseManualWeek(pregnancyData.manualWeek !== null);
              setShowSettingsModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">孕周设置</span>
          </button>
        </div>
      </div>

      <div className="card p-6 mb-8 bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-500 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-white/80 text-sm mb-1">当前孕周</p>
            <h2 className="font-display text-4xl font-bold mb-2">
              {currentWeek > 0 ? `第 ${currentWeek} 周` : '请设置孕周'}
            </h2>
            <p className="text-white/90">
              {currentWeek > 0 ? '宝宝正在健康成长中 💕' : '点击右上角设置末次月经或手动填写孕周'}
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-3xl mb-1">👶</div>
              <p className="text-xs text-white/80">宝宝大小</p>
              <p className="font-bold">{babyInfo.size}</p>
              <p className="text-xs text-white/70">{babyInfo.description}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">💓</div>
              <p className="text-xs text-white/80">胎心</p>
              <p className="font-bold">120-160次/分</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">📅</div>
              <p className="text-xs text-white/80">预产期</p>
              <p className="font-bold">{dueDate || '待设置'}</p>
              {daysUntilDue !== null && (
                <p className="text-xs text-white/70">还有 {daysUntilDue} 天</p>
              )}
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

      <div className="card p-5 mb-8 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-400 flex items-center justify-center">
              <Cross className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">就医助手</h3>
              <p className="text-xs text-gray-500">
                关联就诊记录 · 检查单管理 · 科室推荐
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/medical-assistant')}
            className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
          >
            查看 <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        {visitRecords.filter(r => r.linkedPrenatalCheckupId).length > 0 && (
          <div className="mt-4 pt-4 border-t border-sky-100">
            <p className="text-xs text-gray-500 mb-2">关联的就诊记录</p>
            <div className="space-y-2">
              {visitRecords
                .filter(r => r.linkedPrenatalCheckupId)
                .slice(0, 2)
                .map(record => {
                  const linkedCheckup = prenatalCheckups.find(c => c.id === record.linkedPrenatalCheckupId);
                  return (
                    <div key={record.id} className="flex items-center justify-between p-2 rounded-lg bg-white/70">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {record.department}
                          {record.diagnosis && (
                            <span className="ml-2 text-xs text-sky-500">({record.diagnosis})</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {record.date} · {record.hospital}
                          {linkedCheckup && (
                            <span className="ml-1">· 关联产检: {linkedCheckup.type}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {pregnancyMedReminders.length > 0 && (
        <div className="card p-6 mb-8 bg-gradient-to-br from-sky-50 to-blue-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                <Pill className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">孕期用药提醒</h3>
                <p className="text-xs text-gray-500">今日 {pregnancyTaken.length}/{pregnancySchedule.length} 已服</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/medication')}
              className="text-sm text-sky-500 font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              用药中心 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {pregnancyPending.length > 0 ? (
            <div className="space-y-2">
              {pregnancyPending.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/70 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-gray-800">{item.reminder.name}</span>
                    <span className="text-xs text-gray-400">{item.reminder.dosage}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">{item.time} 待服</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-2">今日孕期药物已全部服用 🎉</p>
          )}
        </div>
      )}

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
              {currentWeek >= 8
                ? '现在宝宝已经初具人形，头部约占身体的一半。四肢开始发育，心脏已经形成并开始跳动。各个器官正在快速分化发育中。'
                : currentWeek >= 4
                ? '宝宝正在着床，各器官开始形成。这是发育的关键时期，要特别注意营养和休息。'
                : '请先设置孕周，了解宝宝的发育情况。'}
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

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">孕周设置</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  末次月经日期
                </label>
                <input
                  type="date"
                  value={lmpDate}
                  onChange={(e) => setLmpDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">
                  设置后会自动计算当前孕周和预产期
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useManualWeek"
                  checked={useManualWeek}
                  onChange={(e) => setUseManualWeek(e.target.checked)}
                  className="w-4 h-4 accent-sky-500"
                />
                <label htmlFor="useManualWeek" className="text-sm text-gray-700">
                  手动设置孕周
                </label>
              </div>

              {useManualWeek && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    当前孕周 (周)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="42"
                    value={manualWeek}
                    onChange={(e) => setManualWeek(e.target.value)}
                    placeholder="填写当前孕周"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                  />
                </div>
              )}

              <div className="p-4 bg-sky-50 rounded-xl">
                <p className="text-sm text-gray-600">
                  <strong>💡 小提示：</strong>孕周是从末次月经第一天开始计算的，整个孕期约280天（40周）。如果记不清末次月经，可以通过B超检查确定孕周。
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 bg-gradient-to-r from-sky-400 to-blue-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  保存设置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
