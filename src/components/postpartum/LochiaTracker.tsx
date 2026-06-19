import { useState } from 'react';
import { Droplets, Plus, X, AlertTriangle, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { LochiaRecord } from '@/types';

const amountConfig: Record<LochiaRecord['amount'], { label: string; color: string }> = {
  none: { label: '无', color: 'bg-gray-200 text-gray-600' },
  light: { label: '少量', color: 'bg-pink-100 text-pink-600' },
  medium: { label: '中等', color: 'bg-rose-200 text-rose-700' },
  heavy: { label: '大量', color: 'bg-red-300 text-red-800' },
  excessive: { label: '过多', color: 'bg-red-500 text-white' },
};

const colorConfig: Record<LochiaRecord['color'], { label: string; bg: string }> = {
  red: { label: '红色', bg: 'bg-red-500' },
  pink: { label: '粉红色', bg: 'bg-pink-400' },
  brown: { label: '褐色', bg: 'bg-amber-700' },
  yellow: { label: '黄色', bg: 'bg-yellow-400' },
  white: { label: '白色', bg: 'bg-gray-100 border border-gray-300' },
};

const odorConfig: Record<LochiaRecord['odor'], { label: string; color: string }> = {
  normal: { label: '正常', color: 'text-mint-600' },
  slight: { label: '轻微', color: 'text-amber-600' },
  strong: { label: '明显', color: 'text-orange-600' },
  foul: { label: '恶臭', color: 'text-red-600' },
};

const clotsConfig: Record<LochiaRecord['clots'], { label: string }> = {
  none: { label: '无血块' },
  small: { label: '小血块' },
  medium: { label: '中血块' },
  large: { label: '大血块' },
};

const symptomOptions = ['腹痛', '腰酸', '发热', '头晕', '乏力', '异味', '瘙痒', '坠胀感'];

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function LochiaTracker() {
  const { lochiaRecords, addLochiaRecord, getDaysPostpartum } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState<LochiaRecord['amount']>('light');
  const [color, setColor] = useState<LochiaRecord['color']>('red');
  const [odor, setOdor] = useState<LochiaRecord['odor']>('normal');
  const [clots, setClots] = useState<LochiaRecord['clots']>('none');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const daysPostpartum = getDaysPostpartum();
  const latestRecord = lochiaRecords.length > 0
    ? [...lochiaRecords].sort((a, b) => b.date.localeCompare(a.date))[0]
    : null;

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSave = () => {
    addLochiaRecord({
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      amount,
      color,
      odor,
      clots,
      symptoms: selectedSymptoms,
      notes: notes || undefined,
    });
    setShowModal(false);
    setAmount('light');
    setColor('red');
    setOdor('normal');
    setClots('none');
    setSelectedSymptoms([]);
    setNotes('');
  };

  const needsAttention = (record: LochiaRecord) => {
    return (
      record.amount === 'heavy' ||
      record.amount === 'excessive' ||
      record.odor === 'foul' ||
      record.clots === 'large' ||
      record.symptoms.includes('发热')
    );
  };

  const warningRecords = lochiaRecords.filter(needsAttention).length;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-rose-500" />
          排恶露追踪
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          记录情况
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 text-center">
          <p className="text-3xl font-bold text-rose-500">{daysPostpartum}</p>
          <p className="text-xs text-gray-500 mt-1">产后天数</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-fuchsia-50 text-center">
          <p className="text-3xl font-bold text-pink-500">{lochiaRecords.length}</p>
          <p className="text-xs text-gray-500 mt-1">记录次数</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 text-center">
          <p className="text-3xl font-bold text-amber-500">{warningRecords}</p>
          <p className="text-xs text-gray-500 mt-1">需关注次数</p>
        </div>
      </div>

      {latestRecord && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100">
          <h3 className="text-sm font-bold text-gray-700 mb-3">最新情况 ({latestRecord.date})</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">量:</span>
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', amountConfig[latestRecord.amount].color)}>
                {amountConfig[latestRecord.amount].label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">颜色:</span>
              <div className="flex items-center gap-1">
                <span className={cn('w-4 h-4 rounded-full', colorConfig[latestRecord.color].bg)} />
                <span className="text-xs text-gray-600">{colorConfig[latestRecord.color].label}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">气味:</span>
              <span className={cn('text-xs font-medium', odorConfig[latestRecord.odor].color)}>
                {odorConfig[latestRecord.odor].label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">血块:</span>
              <span className="text-xs text-gray-600">{clotsConfig[latestRecord.clots].label}</span>
            </div>
          </div>
          {latestRecord.symptoms.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {latestRecord.symptoms.map((s) => (
                <span key={s} className="px-2 py-0.5 bg-white rounded-full text-xs text-gray-600">
                  {s}
                </span>
              ))}
            </div>
          )}
          {needsAttention(latestRecord) && (
            <div className="mt-3 flex items-center gap-2 p-2 bg-amber-50 rounded-lg text-amber-700 text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>情况需要关注，如有异常请及时就医</span>
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">历史记录</h3>
        {lochiaRecords.length > 0 ? (
          <div className="space-y-3 max-h-52 overflow-y-auto">
            {[...lochiaRecords]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 10)
              .map((record) => (
                <div
                  key={record.id}
                  className={cn(
                    'p-3 rounded-xl border',
                    needsAttention(record)
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-rose-50/50 border-rose-100'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-800">{record.date}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', amountConfig[record.amount].color)}>
                        {amountConfig[record.amount].label}
                      </span>
                      <span className={cn('w-4 h-4 rounded-full', colorConfig[record.color].bg)} />
                      {needsAttention(record) && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span>{odorConfig[record.odor].label}</span>
                    <span>·</span>
                    <span>{clotsConfig[record.clots].label}</span>
                    {record.symptoms.length > 0 && (
                      <>
                        <span>·</span>
                        <span>{record.symptoms.join('、')}</span>
                      </>
                    )}
                  </div>
                  {record.notes && <p className="text-xs text-gray-500 mt-1">{record.notes}</p>}
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无记录</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">记录恶露情况</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">量</label>
                <div className="grid grid-cols-5 gap-2">
                  {(Object.keys(amountConfig) as LochiaRecord['amount'][]).map((a) => (
                    <button
                      key={a}
                      onClick={() => setAmount(a)}
                      className={cn(
                        'py-2 px-1 rounded-xl text-xs font-medium transition-all',
                        amount === a
                          ? amountConfig[a].color + ' ring-2 ring-offset-1'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      )}
                    >
                      {amountConfig[a].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">颜色</label>
                <div className="flex gap-3">
                  {(Object.keys(colorConfig) as LochiaRecord['color'][]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2 rounded-xl transition-all',
                        color === c ? 'bg-rose-50 ring-2 ring-rose-400' : 'hover:bg-gray-50'
                      )}
                    >
                      <span className={cn('w-8 h-8 rounded-full', colorConfig[c].bg)} />
                      <span className="text-xs text-gray-600">{colorConfig[c].label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">气味</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(odorConfig) as LochiaRecord['odor'][]).map((o) => (
                    <button
                      key={o}
                      onClick={() => setOdor(o)}
                      className={cn(
                        'py-2 rounded-xl text-xs font-medium transition-all',
                        odor === o
                          ? 'bg-rose-100 text-rose-600 ring-2 ring-rose-400'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      )}
                    >
                      {odorConfig[o].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">血块</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(clotsConfig) as LochiaRecord['clots'][]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setClots(c)}
                      className={cn(
                        'py-2 rounded-xl text-xs font-medium transition-all',
                        clots === c
                          ? 'bg-rose-100 text-rose-600 ring-2 ring-rose-400'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      )}
                    >
                      {clotsConfig[c].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">伴随症状</label>
                <div className="flex flex-wrap gap-2">
                  {symptomOptions.map((symptom) => (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm transition-all',
                        selectedSymptoms.includes(symptom)
                          ? 'bg-rose-100 text-rose-600 border border-rose-300'
                          : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-rose-50'
                      )}
                    >
                      {symptom}
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all resize-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl">
                <p className="text-xs text-amber-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>如出现大量出血、恶臭分泌物、发热等症状，请立即就医。</span>
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-rose-400 to-pink-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
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
