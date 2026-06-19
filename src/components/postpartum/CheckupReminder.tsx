import { useState } from 'react';
import { Stethoscope, Plus, X, Calendar, CheckCircle2, Circle, ChevronRight, Scale, Activity, Heart, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { PostpartumCheckup } from '@/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const checkupTypeOptions: { type: PostpartumCheckup['type']; name: string; defaultDays: number }[] = [
  { type: '6week', name: '产后6周复查', defaultDays: 42 },
  { type: '3month', name: '产后3个月复查', defaultDays: 90 },
  { type: '6month', name: '产后6个月复查', defaultDays: 180 },
  { type: '1year', name: '产后1年复查', defaultDays: 365 },
  { type: 'other', name: '其他复查', defaultDays: 30 },
];

export default function CheckupReminder() {
  const { postpartumCheckups, addPostpartumCheckup, togglePostpartumCheckupComplete, getDaysPostpartum } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [checkupType, setCheckupType] = useState<PostpartumCheckup['type']>('other');
  const [typeName, setTypeName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hospital, setHospital] = useState('');
  const [doctor, setDoctor] = useState('');
  const [notes, setNotes] = useState('');
  const [completed, setCompleted] = useState(false);
  const [weight, setWeight] = useState<string>('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [uterineRecovery, setUterineRecovery] = useState('');
  const [pelvicFloorScore, setPelvicFloorScore] = useState<string>('');

  const daysPostpartum = getDaysPostpartum();

  const handleTypeChange = (type: PostpartumCheckup['type']) => {
    setCheckupType(type);
    const option = checkupTypeOptions.find((o) => o.type === type);
    if (option && type !== 'other') {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() - daysPostpartum + option.defaultDays);
      setDate(dueDate.toISOString().split('T')[0]);
      setTypeName(option.name);
    } else {
      setTypeName('');
    }
  };

  const handleSave = () => {
    if (date && (typeName || checkupType !== 'other')) {
      addPostpartumCheckup({
        id: generateId(),
        date,
        type: checkupType,
        typeName: typeName || checkupTypeOptions.find((o) => o.type === checkupType)?.name || '复查',
        hospital: hospital || undefined,
        doctor: doctor || undefined,
        completed,
        weight: weight ? Number(weight) : undefined,
        bloodPressure: bloodPressure || undefined,
        uterineRecovery: uterineRecovery || undefined,
        pelvicFloorScore: pelvicFloorScore ? Number(pelvicFloorScore) : undefined,
        notes: notes || undefined,
      });
      setShowModal(false);
      setCheckupType('other');
      setTypeName('');
      setDate(new Date().toISOString().split('T')[0]);
      setHospital('');
      setDoctor('');
      setNotes('');
      setCompleted(false);
      setWeight('');
      setBloodPressure('');
      setUterineRecovery('');
      setPelvicFloorScore('');
    }
  };

  const upcoming = postpartumCheckups.filter((c) => !c.completed).sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const done = postpartumCheckups.filter((c) => c.completed).sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getDaysUntil = (checkupDate: string) => {
    const target = new Date(checkupDate);
    const today = new Date();
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-indigo-500" />
          复查提醒
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-indigo-400 to-violet-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          添加复查
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 text-center">
          <p className="text-3xl font-bold text-indigo-500">{postpartumCheckups.length}</p>
          <p className="text-xs text-gray-500 mt-1">复查总数</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 text-center">
          <p className="text-3xl font-bold text-emerald-500">{done.length}</p>
          <p className="text-xs text-gray-500 mt-1">已完成</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 text-center">
          <p className="text-3xl font-bold text-amber-500">{upcoming.length}</p>
          <p className="text-xs text-gray-500 mt-1">待检查</p>
        </div>
      </div>

      {upcoming.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3">待完成</h3>
          <div className="space-y-3">
            {upcoming.map((checkup) => {
              const daysUntil = getDaysUntil(checkup.date);
              const isUrgent = daysUntil <= 7;
              return (
                <div
                  key={checkup.id}
                  className={cn(
                    'p-4 rounded-xl border hover:shadow-md transition-shadow',
                    isUrgent
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                      : 'bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-100'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <button onClick={() => togglePostpartumCheckupComplete(checkup.id)} className="mt-0.5">
                        <Circle className="w-5 h-5 text-indigo-400 hover:text-indigo-500" />
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-800">{checkup.typeName}</h4>
                          {daysUntil <= 7 && daysUntil >= 0 && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                              {daysUntil === 0 ? '今天' : `还有${daysUntil}天`}
                            </span>
                          )}
                          {daysUntil < 0 && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                              已过期{Math.abs(daysUntil)}天
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {checkup.date}
                        </p>
                        {checkup.hospital && (
                          <p className="text-sm text-gray-400 mt-1">🏥 {checkup.hospital}</p>
                        )}
                        {checkup.doctor && (
                          <p className="text-sm text-gray-400 mt-0.5">👩‍⚕️ {checkup.doctor}</p>
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
              );
            })}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3">已完成</h3>
          <div className="space-y-3">
            {done.map((checkup) => (
              <div key={checkup.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <button onClick={() => togglePostpartumCheckupComplete(checkup.id)} className="mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" fill="currentColor" />
                    </button>
                    <div>
                      <h4 className="font-medium text-gray-600 line-through">{checkup.typeName}</h4>
                      <p className="text-sm text-gray-400 mt-1">{checkup.date}</p>
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
                        {checkup.pelvicFloorScore && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            盆底评分 {checkup.pelvicFloorScore}
                          </span>
                        )}
                        {checkup.uterineRecovery && (
                          <span className="text-xs text-gray-500">子宫恢复: {checkup.uterineRecovery}</span>
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

      {postpartumCheckups.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">暂无复查记录</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">添加复查</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">复查类型</label>
                <div className="grid grid-cols-2 gap-2">
                  {checkupTypeOptions.map((opt) => (
                    <button
                      key={opt.type}
                      onClick={() => handleTypeChange(opt.type)}
                      className={cn(
                        'py-2.5 px-2 rounded-xl text-xs font-medium transition-all',
                        checkupType === opt.type
                          ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-400'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      )}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>

              {checkupType === 'other' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">复查名称</label>
                  <input
                    type="text"
                    value={typeName}
                    onChange={(e) => setTypeName(e.target.value)}
                    placeholder="输入复查名称"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">检查日期</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">医院</label>
                  <input
                    type="text"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    placeholder="可选"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">医生</label>
                  <input
                    type="text"
                    value={doctor}
                    onChange={(e) => setDoctor(e.target.value)}
                    placeholder="可选"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  <input
                    type="checkbox"
                    checked={completed}
                    onChange={(e) => setCompleted(e.target.checked)}
                    className="w-4 h-4 mr-2 accent-indigo-500"
                  />
                  已完成此次检查
                </label>
              </div>

              {completed && (
                <div className="p-4 rounded-xl bg-indigo-50 space-y-4">
                  <h4 className="text-sm font-bold text-gray-700">检查结果</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">体重 (kg)</label>
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">血压</label>
                      <input
                        type="text"
                        value={bloodPressure}
                        onChange={(e) => setBloodPressure(e.target.value)}
                        placeholder="如: 120/80"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">盆底评分 (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={pelvicFloorScore}
                        onChange={(e) => setPelvicFloorScore(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">子宫恢复</label>
                      <input
                        type="text"
                        value={uterineRecovery}
                        onChange={(e) => setUterineRecovery(e.target.value)}
                        placeholder="如: 恢复良好"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">备注 (可选)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="注意事项等"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-indigo-400 to-violet-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
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
