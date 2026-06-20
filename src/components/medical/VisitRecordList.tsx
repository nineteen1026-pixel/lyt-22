import { useState } from 'react';
import {
  Plus,
  X,
  Calendar,
  Building2,
  User,
  Stethoscope,
  FileText,
  Link2,
  ChevronDown,
  ChevronUp,
  Trash2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';
import type { VisitRecord } from '@/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const departmentOptions = [
  '妇产科',
  '产科/产检',
  '产后康复科',
  '生殖医学科',
  '内分泌科',
  '更年期专科',
  '皮肤科',
  '心理科',
  '急诊科',
  '乳腺外科',
  '泌尿科',
  '中医科',
  '其他',
];

export default function VisitRecordList() {
  const {
    visitRecords,
    painRecords,
    prenatalCheckups,
    addVisitRecord,
    updateVisitRecord,
    deleteVisitRecord,
    getLinkedPainRecords,
    getLinkedPrenatalCheckup,
  } = useAppStore();

  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<VisitRecord>>({
    date: new Date().toISOString().split('T')[0],
    department: '妇产科',
    hospital: '',
    doctor: '',
    chiefComplaint: '',
    diagnosis: '',
    prescription: '',
    followUpDate: '',
    linkedPrenatalCheckupId: '',
    notes: '',
  });

  const sortedRecords = [...visitRecords].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const availablePrenatalCheckups = prenatalCheckups.map((c) => ({
    id: c.id,
    label: `${c.type} (${c.date}) ${c.completed ? '✓' : '待查'}`,
  }));

  const availablePainRecords = painRecords
    .filter((r) => r.date === form.date)
    .map((r) => ({
      id: r.id,
      label: `疼痛等级 ${r.level} (${r.time})`,
    }));

  const [selectedPainIds, setSelectedPainIds] = useState<string[]>([]);

  const handleSave = () => {
    if (!form.date || !form.department || !form.hospital || !form.chiefComplaint) return;
    addVisitRecord({
      id: generateId(),
      date: form.date!,
      department: form.department!,
      hospital: form.hospital!,
      doctor: form.doctor || undefined,
      chiefComplaint: form.chiefComplaint!,
      diagnosis: form.diagnosis || undefined,
      prescription: form.prescription || undefined,
      followUpDate: form.followUpDate || undefined,
      linkedPrenatalCheckupId: form.linkedPrenatalCheckupId || undefined,
      linkedPainRecordIds: selectedPainIds.length > 0 ? selectedPainIds : undefined,
      notes: form.notes || undefined,
    });
    setShowModal(false);
    setForm({
      date: new Date().toISOString().split('T')[0],
      department: '妇产科',
      hospital: '',
      doctor: '',
      chiefComplaint: '',
      diagnosis: '',
      prescription: '',
      followUpDate: '',
      linkedPrenatalCheckupId: '',
      notes: '',
    });
    setSelectedPainIds([]);
  };

  const togglePainSelect = (id: string) => {
    setSelectedPainIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-sky-500" />
          就诊记录
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          添加记录
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 text-center">
          <p className="text-3xl font-bold text-sky-500">{visitRecords.length}</p>
          <p className="text-xs text-gray-500 mt-1">就诊总数</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 text-center">
          <p className="text-3xl font-bold text-amber-500">
            {visitRecords.filter((r) => r.followUpDate && new Date(r.followUpDate) >= new Date()).length}
          </p>
          <p className="text-xs text-gray-500 mt-1">待复查</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-fuchsia-50 to-pink-50 text-center">
          <p className="text-3xl font-bold text-fuchsia-500">
            {visitRecords.filter((r) => r.linkedPrenatalCheckupId).length}
          </p>
          <p className="text-xs text-gray-500 mt-1">关联产检</p>
        </div>
      </div>

      {sortedRecords.length > 0 ? (
        <div className="space-y-3">
          {sortedRecords.map((record) => {
            const isExpanded = expandedId === record.id;
            const linkedCheckup = record.linkedPrenatalCheckupId
              ? getLinkedPrenatalCheckup(record.id)
              : undefined;
            const linkedPains = record.linkedPainRecordIds?.length
              ? getLinkedPainRecords(record.id)
              : [];

            return (
              <div key={record.id} className="card overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : record.id)}
                  className="w-full p-5 text-left flex items-start justify-between hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-800">{record.department}</h4>
                      {record.diagnosis && (
                        <span className="px-2 py-0.5 bg-sky-100 text-sky-600 text-xs rounded-full">
                          {record.diagnosis}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {record.date}
                      <span className="mx-1">·</span>
                      <Building2 className="w-3 h-3" />
                      {record.hospital}
                      {record.doctor && (
                        <>
                          <span className="mx-1">·</span>
                          <User className="w-3 h-3" />
                          {record.doctor}
                        </>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      {record.chiefComplaint}
                    </p>
                    {(linkedCheckup || linkedPains.length > 0) && (
                      <div className="flex items-center gap-2 mt-2">
                        <Link2 className="w-3 h-3 text-fuchsia-400" />
                        {linkedCheckup && (
                          <span className="text-xs px-2 py-0.5 bg-fuchsia-50 text-fuchsia-600 rounded-full">
                            产检: {linkedCheckup.type}
                          </span>
                        )}
                        {linkedPains.length > 0 && (
                          <span className="text-xs px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full">
                            疼痛 {linkedPains.length} 条
                          </span>
                        )}
                      </div>
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
                    {record.prescription && (
                      <div className="p-3 bg-emerald-50 rounded-xl">
                        <p className="text-xs text-emerald-600 font-medium mb-1">处方</p>
                        <p className="text-sm text-gray-700">{record.prescription}</p>
                      </div>
                    )}
                    {record.followUpDate && (
                      <div className="p-3 bg-amber-50 rounded-xl">
                        <p className="text-xs text-amber-600 font-medium mb-1">复查日期</p>
                        <p className="text-sm text-gray-700">{record.followUpDate}</p>
                      </div>
                    )}
                    {record.notes && (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 font-medium mb-1">备注</p>
                        <p className="text-sm text-gray-700">{record.notes}</p>
                      </div>
                    )}

                    {linkedCheckup && (
                      <div className="p-3 bg-fuchsia-50 rounded-xl">
                        <p className="text-xs text-fuchsia-600 font-medium mb-1">关联产检记录</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{linkedCheckup.type}</p>
                            <p className="text-xs text-gray-500">
                              {linkedCheckup.date} · {linkedCheckup.completed ? '已完成' : '待查'}
                            </p>
                          </div>
                          <button
                            onClick={() => navigate('/pregnancy')}
                            className="text-xs text-fuchsia-500 font-medium flex items-center gap-1 hover:gap-2 transition-all"
                          >
                            查看产检 <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    {linkedPains.length > 0 && (
                      <div className="p-3 bg-rose-50 rounded-xl">
                        <p className="text-xs text-rose-600 font-medium mb-1">关联疼痛记录</p>
                        <div className="space-y-1.5">
                          {linkedPains.map((p) => (
                            <div key={p.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">
                                疼痛等级 <strong className="text-rose-500">{p.level}</strong>
                                <span className="text-gray-400 ml-1">{p.time}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => navigate('/relief')}
                          className="mt-2 text-xs text-rose-500 font-medium flex items-center gap-1 hover:gap-2 transition-all"
                        >
                          查看疼痛记录 <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={() => deleteVisitRecord(record.id)}
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
          <p>暂无就诊记录</p>
          <p className="text-sm mt-1">点击上方按钮添加您的就诊记录</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">添加就诊记录</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPainIds([]);
                }}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">就诊日期</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">科室</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                  >
                    {departmentOptions.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">医院</label>
                  <input
                    type="text"
                    value={form.hospital}
                    onChange={(e) => setForm({ ...form, hospital: e.target.value })}
                    placeholder="医院名称"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">医生</label>
                  <input
                    type="text"
                    value={form.doctor}
                    onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                    placeholder="可选"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">主诉</label>
                <textarea
                  value={form.chiefComplaint}
                  onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })}
                  placeholder="描述您的主要症状和就诊原因"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">诊断</label>
                <input
                  type="text"
                  value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  placeholder="可选"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">处方</label>
                <textarea
                  value={form.prescription}
                  onChange={(e) => setForm({ ...form, prescription: e.target.value })}
                  placeholder="药物处方、治疗方案等"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">复查日期</label>
                <input
                  type="date"
                  value={form.followUpDate}
                  onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                />
              </div>

              {availablePrenatalCheckups.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
                    <Link2 className="w-4 h-4 text-fuchsia-400" />
                    关联产检记录
                  </label>
                  <select
                    value={form.linkedPrenatalCheckupId || ''}
                    onChange={(e) => setForm({ ...form, linkedPrenatalCheckupId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                  >
                    <option value="">不关联</option>
                    {availablePrenatalCheckups.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {availablePainRecords.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
                    <Link2 className="w-4 h-4 text-rose-400" />
                    关联疼痛记录（当日）
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availablePainRecords.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => togglePainSelect(p.id)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                          selectedPainIds.includes(p.id)
                            ? 'bg-rose-100 text-rose-600 ring-1 ring-rose-300'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">备注</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="其他需要记录的信息"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedPainIds([]);
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.date || !form.department || !form.hospital || !form.chiefComplaint}
                  className="flex-1 bg-gradient-to-r from-sky-400 to-blue-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
