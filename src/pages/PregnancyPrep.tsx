import { useState } from 'react';
import {
  Baby,
  Thermometer,
  Droplets,
  Calendar,
  Heart,
  Plus,
  X,
  Star,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { OvulationRecord } from '@/types';

const prepTips = [
  {
    id: 1,
    title: '排卵期症状',
    items: ['基础体温升高', '宫颈粘液增多呈蛋清状', '轻微腹痛', '性欲增强'],
    icon: '🌡️',
  },
  {
    id: 2,
    title: '备孕小贴士',
    items: ['保持规律作息', '均衡饮食', '适量运动', '补充叶酸', '保持心情愉快'],
    icon: '💚',
  },
];

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function PregnancyPrepPage() {
  const { ovulationRecords, addOvulationRecord, getOvulationDate, cycleData } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<OvulationRecord>>({
    date: new Date().toISOString().split('T')[0],
    basalTemp: 36.5,
    cervicalMucus: '',
    ovulationTest: 'none',
    fertileWindow: false,
  });

  const ovulationDate = getOvulationDate();
  
  const today = new Date();
  const ovDate = new Date(ovulationDate);
  const daysUntilOvulation = Math.ceil(
    (ovDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleAddRecord = () => {
    if (newRecord.date) {
      addOvulationRecord({
        id: generateId(),
        date: newRecord.date,
        basalTemp: newRecord.basalTemp,
        cervicalMucus: newRecord.cervicalMucus,
        ovulationTest: newRecord.ovulationTest || 'none',
        fertileWindow: newRecord.fertileWindow || false,
      } as OvulationRecord);
      setShowAddModal(false);
      setNewRecord({
        date: new Date().toISOString().split('T')[0],
        basalTemp: 36.5,
        cervicalMucus: '',
        ovulationTest: 'none',
        fertileWindow: false,
      });
    }
  };

  const fertileWindowStart = new Date(ovDate);
  fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);
  
  const isInFertileWindow = today >= fertileWindowStart && today <= ovDate;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mint-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-mint-200/50">
            <Baby className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">备孕期</h1>
            <p className="text-gray-500">精准把握黄金时期，迎接新生命</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-mint-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-mint-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">排卵日</p>
              <p className="text-xl font-bold text-gray-800">{ovulationDate}</p>
            </div>
          </div>
          <p className="text-xs text-mint-600 font-medium">
            {daysUntilOvulation > 0 ? `还有 ${daysUntilOvulation} 天` : daysUntilOvulation === 0 ? '就是今天!' : '已过'}
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">易孕期</p>
              <p className="text-xl font-bold text-gray-800">
                {isInFertileWindow ? '进行中' : '等待中'}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            排卵日前5天至排卵日
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">周期长度</p>
              <p className="text-xl font-bold text-gray-800">{cycleData.cycleLength} 天</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">正常范围 21-35 天</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-mint-500" />
                排卵记录
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-mint-400 to-emerald-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                添加记录
              </button>
            </div>

            {ovulationRecords.length > 0 ? (
              <div className="space-y-3">
                {ovulationRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 rounded-xl bg-gradient-to-r from-mint-50 to-emerald-50 border border-mint-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-800">{record.date}</span>
                      {record.fertileWindow && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-medium">
                          易孕期
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-red-400" />
                        <span className="text-gray-600">
                          {record.basalTemp ? `${record.basalTemp}°C` : '-'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-600">
                          {record.cervicalMucus || '-'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-gray-600">
                          {record.ovulationTest === 'positive' ? '阳性' : record.ovulationTest === 'negative' ? '阴性' : '未测'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Baby className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无排卵记录</p>
                <p className="text-sm">开始记录你的排卵情况吧~</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {prepTips.map((tip) => (
            <div key={tip.id} className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{tip.icon}</span>
                <h3 className="font-bold text-gray-800">{tip.title}</h3>
              </div>
              <ul className="space-y-2">
                {tip.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-mint-400 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="card p-6 bg-gradient-to-br from-mint-50 to-emerald-50">
            <h3 className="font-bold text-gray-800 mb-3">💡 最佳受孕时间</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              排卵前1-2天同房受孕几率最高。精子在女性体内可存活3-5天，
              卵子存活12-24小时。建议在易孕期隔天同房一次。
            </p>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">添加排卵记录</h2>
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
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">基础体温 (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newRecord.basalTemp}
                  onChange={(e) => setNewRecord({ ...newRecord, basalTemp: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">宫颈粘液</label>
                <select
                  value={newRecord.cervicalMucus || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, cervicalMucus: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all"
                >
                  <option value="">请选择</option>
                  <option value="干燥">干燥</option>
                  <option value="粘稠">粘稠</option>
                  <option value="奶油状">奶油状</option>
                  <option value="蛋清状">蛋清状</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">排卵试纸</label>
                <div className="flex gap-3">
                  {(['positive', 'negative', 'none'] as const).map((result) => (
                    <button
                      key={result}
                      onClick={() => setNewRecord({ ...newRecord, ovulationTest: result })}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-sm font-medium transition-all',
                        newRecord.ovulationTest === result
                          ? 'bg-gradient-to-r from-mint-400 to-emerald-500 text-white shadow-md'
                          : 'bg-gray-50 text-gray-600 hover:bg-mint-50'
                      )}
                    >
                      {result === 'positive' ? '阳性' : result === 'negative' ? '阴性' : '未测'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fertileWindow"
                  checked={newRecord.fertileWindow}
                  onChange={(e) => setNewRecord({ ...newRecord, fertileWindow: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500"
                />
                <label htmlFor="fertileWindow" className="text-sm text-gray-700">
                  易孕期
                </label>
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
                  className="flex-1 bg-gradient-to-r from-mint-400 to-emerald-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
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
