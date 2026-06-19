import { useState } from 'react';
import { Activity, Plus, X, TrendingDown, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { HormoneRecord } from '@/types';

const phaseLabels: Record<HormoneRecord['phase'], string> = {
  follicular: '卵泡期',
  ovulatory: '排卵期',
  luteal: '黄体期',
  perimenopausal: '围绝经期',
  postmenopausal: '绝经后',
};

const phaseColors: Record<HormoneRecord['phase'], string> = {
  follicular: 'from-pink-400 to-rose-500',
  ovulatory: 'from-orange-400 to-amber-500',
  luteal: 'from-purple-400 to-lavender-500',
  perimenopausal: 'from-amber-400 to-orange-500',
  postmenopausal: 'from-slate-400 to-gray-500',
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function HormoneAnalysis() {
  const { hormoneRecords, addHormoneRecord, getHormoneTrend, cycleData, hotFlashRecords, sleepRecords } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [estrogenLevel, setEstrogenLevel] = useState<number | ''>('');
  const [progesteroneLevel, setProgesteroneLevel] = useState<number | ''>('');
  const [fshLevel, setFshLevel] = useState<number | ''>('');
  const [lhLevel, setLhLevel] = useState<number | ''>('');
  const [phase, setPhase] = useState<HormoneRecord['phase']>('perimenopausal');
  const [notes, setNotes] = useState('');

  const trend = getHormoneTrend();
  const latest = hormoneRecords.length > 0
    ? hormoneRecords.sort((a, b) => b.date.localeCompare(a.date))[0]
    : null;

  const estrogenTrend = trend.length >= 2 && trend[trend.length - 1].estrogen !== undefined && trend[trend.length - 2].estrogen !== undefined
    ? (trend[trend.length - 1].estrogen! > trend[trend.length - 2].estrogen! ? 'up' : 'down')
    : 'stable';

  const fshTrend = trend.length >= 2 && trend[trend.length - 1].fsh !== undefined && trend[trend.length - 2].fsh !== undefined
    ? (trend[trend.length - 1].fsh! > trend[trend.length - 2].fsh! ? 'up' : 'down')
    : 'stable';

  const daysSinceLastPeriod = cycleData.lastPeriodDate
    ? Math.floor((Date.now() - new Date(cycleData.lastPeriodDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const getHormoneStatus = () => {
    if (!latest) return null;
    const isPeriOrPost = latest.phase === 'perimenopausal' || latest.phase === 'postmenopausal';
    const highFsh = (latest.fshLevel ?? 0) > 40;
    const lowEstrogen = (latest.estrogenLevel ?? 100) < 30;
    if (isPeriOrPost && highFsh && lowEstrogen) return 'highRisk';
    if (isPeriOrPost || highFsh) return 'monitor';
    return 'normal';
  };

  const hormoneStatus = getHormoneStatus();

  const getComprehensiveAnalysis = () => {
    const items: { icon: string; text: string; color: string }[] = [];

    if (daysSinceLastPeriod !== null) {
      if (daysSinceLastPeriod > 90) {
        items.push({
          icon: '🔴',
          text: `已停经 ${daysSinceLastPeriod} 天，结合激素指标判断是否已绝经`,
          color: 'text-rose-600',
        });
      } else if (daysSinceLastPeriod > cycleData.cycleLength + 7) {
        items.push({
          icon: '🟡',
          text: `经期推迟 ${daysSinceLastPeriod - cycleData.cycleLength} 天，与激素波动相关`,
          color: 'text-amber-600',
        });
      } else if (cycleData.cycleLength > 35) {
        items.push({
          icon: '🟡',
          text: `周期 ${cycleData.cycleLength} 天（延长），雌激素下降可能导致周期紊乱`,
          color: 'text-amber-600',
        });
      } else if (cycleData.cycleLength < 21) {
        items.push({
          icon: '🟡',
          text: `周期 ${cycleData.cycleLength} 天（缩短），FSH 波动可能影响周期规律`,
          color: 'text-amber-600',
        });
      } else {
        items.push({
          icon: '🟢',
          text: `周期 ${cycleData.cycleLength} 天，目前仍保持规律`,
          color: 'text-mint-600',
        });
      }
    }

    if (latest && latest.fshLevel !== undefined) {
      if (latest.fshLevel > 40) {
        items.push({
          icon: '📈',
          text: `FSH ${latest.fshLevel} mIU/mL，显著升高提示卵巢功能衰退`,
          color: 'text-rose-600',
        });
      } else if (latest.fshLevel > 25) {
        items.push({
          icon: '📊',
          text: `FSH ${latest.fshLevel} mIU/mL，偏高提示进入围绝经期`,
          color: 'text-amber-600',
        });
      }
    }

    if (latest && latest.estrogenLevel !== undefined) {
      if (latest.estrogenLevel < 30) {
        items.push({
          icon: '📉',
          text: `雌二醇 ${latest.estrogenLevel} pg/mL，偏低与潮热、盗汗症状相关`,
          color: 'text-rose-600',
        });
      } else if (latest.estrogenLevel < 50) {
        items.push({
          icon: '📊',
          text: `雌二醇 ${latest.estrogenLevel} pg/mL，处于较低水平`,
          color: 'text-amber-600',
        });
      }
    }

    if (hotFlashRecords.length > 0) {
      const avgSeverity = hotFlashRecords.reduce((sum, r) => sum + (r.severity === 'mild' ? 1 : r.severity === 'moderate' ? 2 : 3), 0) / hotFlashRecords.length;
      if (avgSeverity >= 2) {
        items.push({
          icon: '🔥',
          text: `潮热平均严重度 ${avgSeverity.toFixed(1)}/3，建议与激素水平联合评估`,
          color: 'text-orange-600',
        });
      }
    }

    if (sleepRecords.length > 0) {
      const nightSweatCount = sleepRecords.filter((r) => r.nightSweats).length;
      const nightSweatRate = Math.round((nightSweatCount / sleepRecords.length) * 100);
      if (nightSweatRate > 50) {
        items.push({
          icon: '💧',
          text: `夜间盗汗发生率 ${nightSweatRate}%，与雌激素下降高度相关`,
          color: 'text-indigo-600',
        });
      }
    }

    if (latest) {
      items.push({
        icon: '📍',
        text: `当前阶段：${phaseLabels[latest.phase]}，上次经期 ${cycleData.lastPeriodDate || '未记录'}`,
        color: 'text-gray-600',
      });
    }

    return items;
  };

  const analysisItems = getComprehensiveAnalysis();

  const handleSave = () => {
    addHormoneRecord({
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      estrogenLevel: estrogenLevel !== '' ? estrogenLevel : undefined,
      progesteroneLevel: progesteroneLevel !== '' ? progesteroneLevel : undefined,
      fshLevel: fshLevel !== '' ? fshLevel : undefined,
      lhLevel: lhLevel !== '' ? lhLevel : undefined,
      phase,
      notes: notes || undefined,
    });
    setShowModal(false);
    setEstrogenLevel('');
    setProgesteroneLevel('');
    setFshLevel('');
    setLhLevel('');
    setPhase('perimenopausal');
    setNotes('');
  };

  const maxEstrogen = Math.max(...trend.map((t) => t.estrogen ?? 0), 1);
  const maxFsh = Math.max(...trend.map((t) => t.fsh ?? 0), 1);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-lavender-500" />
          激素波动分析
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-lavender-400 to-purple-400 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          录入数据
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 text-center">
          <p className="text-2xl font-bold text-rose-500">{latest?.estrogenLevel ?? '—'}</p>
          <p className="text-xs text-gray-500 mt-0.5">雌二醇 pg/mL</p>
          {estrogenTrend !== 'stable' && (
            <span className="flex items-center justify-center gap-0.5 text-[10px] mt-1">
              {estrogenTrend === 'up' ? (
                <><TrendingUp className="w-3 h-3 text-rose-400" /><span className="text-rose-400">上升</span></>
              ) : (
                <><TrendingDown className="w-3 h-3 text-mint-500" /><span className="text-mint-500">下降</span></>
              )}
            </span>
          )}
        </div>
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-lavender-50 text-center">
          <p className="text-2xl font-bold text-purple-500">{latest?.progesteroneLevel ?? '—'}</p>
          <p className="text-xs text-gray-500 mt-0.5">孕酮 ng/mL</p>
        </div>
        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 text-center">
          <p className="text-2xl font-bold text-amber-500">{latest?.fshLevel ?? '—'}</p>
          <p className="text-xs text-gray-500 mt-0.5">FSH mIU/mL</p>
          {fshTrend !== 'stable' && (
            <span className="flex items-center justify-center gap-0.5 text-[10px] mt-1">
              {fshTrend === 'up' ? (
                <><TrendingUp className="w-3 h-3 text-amber-500" /><span className="text-amber-500">上升</span></>
              ) : (
                <><TrendingDown className="w-3 h-3 text-mint-500" /><span className="text-mint-500">下降</span></>
              )}
            </span>
          )}
        </div>
        <div className="p-3 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 text-center">
          <p className="text-2xl font-bold text-sky-500">{latest?.lhLevel ?? '—'}</p>
          <p className="text-xs text-gray-500 mt-0.5">LH mIU/mL</p>
        </div>
      </div>

      {hormoneStatus && (
        <div className={cn(
          'card p-4 mb-6 border',
          hormoneStatus === 'highRisk' ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200/50' :
          hormoneStatus === 'monitor' ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50' :
          'bg-gradient-to-r from-mint-50 to-emerald-50 border-mint-200/50'
        )}>
          <div className="flex items-start gap-3">
            <Info className={cn(
              'w-5 h-5 mt-0.5 flex-shrink-0',
              hormoneStatus === 'highRisk' ? 'text-red-400' :
              hormoneStatus === 'monitor' ? 'text-amber-400' : 'text-mint-400'
            )} />
            <div className="flex-1">
              <p className={cn(
                'text-sm font-medium',
                hormoneStatus === 'highRisk' ? 'text-red-700' :
                hormoneStatus === 'monitor' ? 'text-amber-700' : 'text-mint-700'
              )}>
                {hormoneStatus === 'highRisk' ? '激素水平显著波动' :
                 hormoneStatus === 'monitor' ? '需持续关注激素变化' : '激素水平基本稳定'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {hormoneStatus === 'highRisk'
                  ? 'FSH升高且雌激素降低，提示围绝经期进展，建议咨询医生。'
                  : hormoneStatus === 'monitor'
                  ? '部分指标有波动，建议定期复查并记录变化趋势。'
                  : '当前激素水平在可控范围，保持规律监测即可。'}
              </p>
              {analysisItems.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-600 mb-1.5">多维度关联分析</p>
                  <ul className="space-y-1">
                    {analysisItems.map((item, idx) => (
                      <li key={idx} className={`flex items-start gap-2 text-xs ${item.color}`}>
                        <span className="flex-shrink-0">{item.icon}</span>
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {trend.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3">激素变化趋势</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-rose-500 font-medium">雌二醇 (E2)</span>
                <span className="text-xs text-gray-400">pg/mL</span>
              </div>
              <div className="flex items-end gap-1 h-16">
                {trend.slice(-10).map((item) => (
                  <div key={item.date} className="flex-1 flex items-end justify-center">
                    <div
                      className="w-full max-w-[24px] rounded-t bg-gradient-to-t from-rose-400 to-pink-300 transition-all"
                      style={{ height: item.estrogen ? `${(item.estrogen / maxEstrogen) * 56}px` : '2px' }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-amber-500 font-medium">促卵泡激素 (FSH)</span>
                <span className="text-xs text-gray-400">mIU/mL</span>
              </div>
              <div className="flex items-end gap-1 h-16">
                {trend.slice(-10).map((item) => (
                  <div key={item.date} className="flex-1 flex items-end justify-center">
                    <div
                      className="w-full max-w-[24px] rounded-t bg-gradient-to-t from-amber-400 to-yellow-300 transition-all"
                      style={{ height: item.fsh ? `${(item.fsh / maxFsh) * 56}px` : '2px' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">历史记录</h3>
        {hormoneRecords.length > 0 ? (
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {hormoneRecords
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((record) => (
                <div key={record.id} className="p-3 rounded-xl bg-lavender-50/50 border border-white/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800">{record.date}</span>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full bg-gradient-to-r text-white',
                      phaseColors[record.phase]
                    )}>
                      {phaseLabels[record.phase]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {record.estrogenLevel !== undefined && <span>E2: {record.estrogenLevel}</span>}
                    {record.progesteroneLevel !== undefined && <span>P: {record.progesteroneLevel}</span>}
                    {record.fshLevel !== undefined && <span>FSH: {record.fshLevel}</span>}
                    {record.lhLevel !== undefined && <span>LH: {record.lhLevel}</span>}
                  </div>
                  {record.notes && <p className="text-xs text-gray-500 mt-1">{record.notes}</p>}
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无激素记录</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">录入激素数据</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">当前阶段</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(phaseLabels) as HormoneRecord['phase'][]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPhase(p)}
                      className={cn(
                        'p-2.5 rounded-xl text-center transition-all text-sm',
                        phase === p
                          ? 'bg-lavender-100 ring-2 ring-lavender-400 text-lavender-700 font-medium'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      {phaseLabels[p]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">雌二醇 (pg/mL)</label>
                  <input
                    type="number"
                    value={estrogenLevel}
                    onChange={(e) => setEstrogenLevel(e.target.value ? Number(e.target.value) : '')}
                    placeholder="如: 30"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">孕酮 (ng/mL)</label>
                  <input
                    type="number"
                    value={progesteroneLevel}
                    onChange={(e) => setProgesteroneLevel(e.target.value ? Number(e.target.value) : '')}
                    placeholder="如: 2"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">FSH (mIU/mL)</label>
                  <input
                    type="number"
                    value={fshLevel}
                    onChange={(e) => setFshLevel(e.target.value ? Number(e.target.value) : '')}
                    placeholder="如: 80"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">LH (mIU/mL)</label>
                  <input
                    type="number"
                    value={lhLevel}
                    onChange={(e) => setLhLevel(e.target.value ? Number(e.target.value) : '')}
                    placeholder="如: 40"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">备注 (可选)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="检查医院、医生建议等..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 btn-secondary">取消</button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-lavender-400 to-purple-400 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
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
