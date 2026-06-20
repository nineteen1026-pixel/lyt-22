import { useState } from 'react';
import {
  Plus,
  X,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Link2,
  StickyNote,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import type { TestReport } from '@/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const reportNameOptions = [
  '血常规',
  '尿常规',
  '性激素六项',
  '甲状腺功能',
  '盆底肌力评估',
  'B超',
  '唐筛',
  '糖耐量',
  '白带常规',
  '宫颈涂片',
  '乳腺超声',
  '骨密度',
  '其他',
];

export default function TestReportNotes() {
  const {
    testReports,
    visitRecords,
    addTestReport,
    updateTestReport,
    deleteTestReport,
  } = useAppStore();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteEditingId, setNoteEditingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const [form, setForm] = useState<Partial<TestReport>>({
    visitRecordId: '',
    date: new Date().toISOString().split('T')[0],
    name: '血常规',
    department: '',
    result: '',
    abnormalItems: [],
    referenceRange: '',
    notes: '',
  });

  const [abnormalInput, setAbnormalInput] = useState('');

  const sortedReports = [...testReports].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const reportsWithAbnormal = testReports.filter((r) => r.abnormalItems && r.abnormalItems.length > 0);

  const getVisitRecordLabel = (visitId?: string) => {
    if (!visitId) return null;
    const visit = visitRecords.find((v) => v.id === visitId);
    return visit ? `${visit.department} (${visit.date})` : null;
  };

  const handleSave = () => {
    if (!form.date || !form.name) return;
    const abnormalItems = abnormalInput
      ? abnormalInput.split(/[,，、]/).map((s) => s.trim()).filter(Boolean)
      : [];

    addTestReport({
      id: generateId(),
      visitRecordId: form.visitRecordId || undefined,
      date: form.date!,
      name: form.name!,
      department: form.department || undefined,
      result: form.result || undefined,
      abnormalItems: abnormalItems.length > 0 ? abnormalItems : undefined,
      referenceRange: form.referenceRange || undefined,
      notes: form.notes || undefined,
      createdAt: new Date().toISOString(),
    });

    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      visitRecordId: '',
      date: new Date().toISOString().split('T')[0],
      name: '血常规',
      department: '',
      result: '',
      abnormalItems: [],
      referenceRange: '',
      notes: '',
    });
    setAbnormalInput('');
  };

  const handleSaveNote = (reportId: string) => {
    updateTestReport(reportId, { notes: noteText });
    setNoteEditingId(null);
    setNoteText('');
  };

  const startEditNote = (report: TestReport) => {
    setNoteEditingId(report.id);
    setNoteText(report.notes || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-violet-500" />
          检查单备注
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-violet-400 to-purple-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          添加检查单
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 text-center">
          <p className="text-3xl font-bold text-violet-500">{testReports.length}</p>
          <p className="text-xs text-gray-500 mt-1">检查单总数</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 text-center">
          <p className="text-3xl font-bold text-amber-500">{reportsWithAbnormal.length}</p>
          <p className="text-xs text-gray-500 mt-1">异常项</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 text-center">
          <p className="text-3xl font-bold text-emerald-500">
            {testReports.filter((r) => r.notes).length}
          </p>
          <p className="text-xs text-gray-500 mt-1">已备注</p>
        </div>
      </div>

      {reportsWithAbnormal.length > 0 && (
        <div className="card p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            异常项汇总
          </h3>
          <div className="flex flex-wrap gap-2">
            {reportsWithAbnormal.flatMap((r) =>
              (r.abnormalItems || []).map((item) => (
                <span
                  key={`${r.id}-${item}`}
                  className="px-3 py-1.5 bg-white/70 text-amber-700 text-sm rounded-full border border-amber-200"
                >
                  {r.name}: {item}
                </span>
              ))
            )}
          </div>
        </div>
      )}

      {sortedReports.length > 0 ? (
        <div className="space-y-3">
          {sortedReports.map((report) => {
            const isExpanded = expandedId === report.id;
            const hasAbnormal = report.abnormalItems && report.abnormalItems.length > 0;
            const visitLabel = getVisitRecordLabel(report.visitRecordId);

            return (
              <div
                key={report.id}
                className={cn(
                  'card overflow-hidden',
                  hasAbnormal && 'border-l-4 border-l-amber-400'
                )}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : report.id)}
                  className="w-full p-5 text-left flex items-start justify-between hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-800">{report.name}</h4>
                      {hasAbnormal ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          异常
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-xs rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          正常
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {report.date}
                      {report.department && <span className="mx-1">·</span>}
                      {report.department}
                    </p>
                    {visitLabel && (
                      <p className="text-xs text-fuchsia-500 flex items-center gap-1 mt-1">
                        <Link2 className="w-3 h-3" />
                        {visitLabel}
                      </p>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
                    {report.result && (
                      <div className="p-3 bg-sky-50 rounded-xl">
                        <p className="text-xs text-sky-600 font-medium mb-1">检查结果</p>
                        <p className="text-sm text-gray-700">{report.result}</p>
                      </div>
                    )}

                    {hasAbnormal && (
                      <div className="p-3 bg-amber-50 rounded-xl">
                        <p className="text-xs text-amber-600 font-medium mb-1">异常项</p>
                        <div className="flex flex-wrap gap-1.5">
                          {report.abnormalItems!.map((item) => (
                            <span
                              key={item}
                              className="px-2 py-0.5 bg-white text-amber-700 text-xs rounded-full border border-amber-200"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {report.referenceRange && (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 font-medium mb-1">参考范围</p>
                        <p className="text-sm text-gray-700">{report.referenceRange}</p>
                      </div>
                    )}

                    <div className="p-3 bg-violet-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-violet-600 font-medium flex items-center gap-1">
                          <StickyNote className="w-3 h-3" />
                          备注
                        </p>
                        {noteEditingId !== report.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditNote(report);
                            }}
                            className="text-xs text-violet-500 hover:text-violet-700 transition-colors"
                          >
                            {report.notes ? '编辑' : '添加备注'}
                          </button>
                        )}
                      </div>
                      {noteEditingId === report.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="记录检查单备注、医生建议、后续注意事项等"
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-violet-200 text-sm outline-none focus:border-violet-400 resize-none"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setNoteEditingId(null)}
                              className="text-xs text-gray-400 hover:text-gray-600"
                            >
                              取消
                            </button>
                            <button
                              onClick={() => handleSaveNote(report.id)}
                              className="text-xs px-3 py-1 bg-violet-500 text-white rounded-full"
                            >
                              保存备注
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className={cn('text-sm', report.notes ? 'text-gray-700' : 'text-gray-400 italic')}>
                          {report.notes || '暂无备注，点击添加'}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => deleteTestReport(report.id)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        删除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>暂无检查单记录</p>
          <p className="text-sm mt-1">点击上方按钮添加检查单</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">添加检查单</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">检查日期</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">检查名称</label>
                  <select
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                  >
                    {reportNameOptions.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">科室</label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="如: 妇产科"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>

              {visitRecords.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                    <Link2 className="w-4 h-4 text-sky-400" />
                    关联就诊记录
                  </label>
                  <select
                    value={form.visitRecordId || ''}
                    onChange={(e) => setForm({ ...form, visitRecordId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                  >
                    <option value="">不关联</option>
                    {visitRecords.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.department} ({v.date}) - {v.chiefComplaint}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">检查结果</label>
                <textarea
                  value={form.result}
                  onChange={(e) => setForm({ ...form, result: e.target.value })}
                  placeholder="输入检查结果数值或描述"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">异常项（用逗号分隔）</label>
                <input
                  type="text"
                  value={abnormalInput}
                  onChange={(e) => setAbnormalInput(e.target.value)}
                  placeholder="如: 白细胞偏高, 血红蛋白偏低"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">参考范围</label>
                <input
                  type="text"
                  value={form.referenceRange}
                  onChange={(e) => setForm({ ...form, referenceRange: e.target.value })}
                  placeholder="如: WBC 4-10×10⁹/L"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                  <StickyNote className="w-4 h-4 text-violet-400" />
                  备注
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="医生建议、注意事项等"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.date || !form.name}
                  className="flex-1 bg-gradient-to-r from-violet-400 to-purple-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
