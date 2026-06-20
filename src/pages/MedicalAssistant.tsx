import { useState } from 'react';
import {
  Stethoscope,
  MapPin,
  FileText,
  ClipboardList,
  ArrowRight,
  CalendarDays,
  Link2,
  Activity,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';
import DepartmentRecommendation from '@/components/medical/DepartmentRecommendation';
import VisitRecordList from '@/components/medical/VisitRecordList';
import TestReportNotes from '@/components/medical/TestReportNotes';

type TabKey = 'overview' | 'department' | 'visit' | 'report';

const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { key: 'overview', label: '概览', icon: CalendarDays, color: 'from-sky-400 via-blue-400 to-indigo-400' },
  { key: 'department', label: '科室推荐', icon: MapPin, color: 'from-sky-400 to-cyan-500' },
  { key: 'visit', label: '就诊记录', icon: ClipboardList, color: 'from-blue-400 to-indigo-500' },
  { key: 'report', label: '检查单备注', icon: FileText, color: 'from-violet-400 to-purple-500' },
];

export default function MedicalAssistant() {
  const {
    visitRecords,
    testReports,
    painRecords,
    prenatalCheckups,
    postpartumCheckups,
    lifeStage,
    getLinkedPostpartumCheckup,
    getLinkedPrenatalCheckup,
    getLinkedPainRecords,
  } = useAppStore();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const recentVisits = [...visitRecords]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const recentReports = [...testReports]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const abnormalReportCount = testReports.filter(
    (r) => r.abnormalItems && r.abnormalItems.length > 0
  ).length;

  const pendingFollowUps = visitRecords.filter(
    (r) => r.followUpDate && new Date(r.followUpDate) >= new Date()
  ).length;

  const todayPainRecords = painRecords.filter(
    (r) => r.date === new Date().toISOString().split('T')[0]
  );

  const upcomingPrenatalCheckups = prenatalCheckups
    .filter((c) => !c.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);

  const upcomingPostpartumCheckups = postpartumCheckups
    .filter((c) => !c.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);

  const moduleCards: {
    key: TabKey;
    label: string;
    desc: string;
    count: number;
    unit: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
  }[] = [
    {
      key: 'department',
      label: '科室推荐',
      desc: '根据症状智能推荐',
      count: 9,
      unit: '个科室',
      icon: MapPin,
      color: 'text-sky-600',
      bg: 'from-sky-50 to-cyan-50',
    },
    {
      key: 'visit',
      label: '就诊记录',
      desc: '记录每次就诊详情',
      count: visitRecords.length,
      unit: '次就诊',
      icon: ClipboardList,
      color: 'text-blue-600',
      bg: 'from-blue-50 to-indigo-50',
    },
    {
      key: 'report',
      label: '检查单备注',
      desc: '检查结果与异常标注',
      count: testReports.length,
      unit: '份报告',
      icon: FileText,
      color: 'text-violet-600',
      bg: 'from-violet-50 to-purple-50',
    },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {moduleCards.map((card) => (
          <button
            key={card.key}
            onClick={() => setActiveTab(card.key)}
            className={cn(
              'card p-5 text-left card-hover group bg-gradient-to-br',
              card.bg
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn('w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm', card.color)}>
                <card.icon className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">{card.label}</h3>
            <p className="text-xs text-gray-500 mb-3">{card.desc}</p>
            <p className="text-2xl font-bold text-gray-800">
              {card.count}
              <span className="text-sm font-normal text-gray-500 ml-1">{card.unit}</span>
            </p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 bg-gradient-to-br from-rose-50 to-pink-50">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-500" />
            关联疼痛记录
          </h3>
          {todayPainRecords.length > 0 ? (
            <div className="space-y-2">
              {todayPainRecords.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-white/70">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      疼痛等级 <span className="text-rose-500 font-bold">{r.level}</span>
                    </p>
                    <p className="text-xs text-gray-500">{r.time} {r.symptoms ? `· ${r.symptoms}` : ''}</p>
                  </div>
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    r.level <= 3 ? 'bg-emerald-100 text-emerald-600' :
                    r.level <= 6 ? 'bg-amber-100 text-amber-600' :
                    'bg-rose-100 text-rose-600'
                  )}>
                    {r.level <= 3 ? '轻度' : r.level <= 6 ? '中度' : '重度'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">今日暂无疼痛记录</p>
          )}
          <button
            onClick={() => navigate('/relief')}
            className="mt-4 text-sm text-rose-500 font-medium flex items-center gap-1 hover:gap-2 transition-all"
          >
            前往疼痛记录 <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="card p-6 bg-gradient-to-br from-fuchsia-50 to-pink-50">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-fuchsia-500" />
            关联产检/产后复查
          </h3>
          {(upcomingPrenatalCheckups.length > 0 || upcomingPostpartumCheckups.length > 0) ? (
            <div className="space-y-2">
              {upcomingPrenatalCheckups.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/70">
                  <div>
                    <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                      {c.type}
                      <span className="text-[10px] px-1.5 py-0.5 bg-fuchsia-100 text-fuchsia-600 rounded">产检</span>
                    </p>
                    <p className="text-xs text-gray-500">{c.date} · 孕{c.week}周</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-fuchsia-100 text-fuchsia-600">
                    待查
                  </span>
                </div>
              ))}
              {upcomingPostpartumCheckups.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/70">
                  <div>
                    <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                      {c.typeName}
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">产后</span>
                    </p>
                    <p className="text-xs text-gray-500">{c.date}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-fuchsia-100 text-fuchsia-600">
                    待查
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">暂无待查产检/复查</p>
          )}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => navigate('/pregnancy')}
              className="text-sm text-fuchsia-500 font-medium flex items-center gap-1 hover:gap-2 transition-all flex-1"
            >
              前往孕期 <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => navigate('/postpartum')}
              className="text-sm text-blue-500 font-medium flex items-center gap-1 hover:gap-2 transition-all flex-1"
            >
              前往产后 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {recentVisits.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-500" />
              最近就诊
            </h3>
            <button
              onClick={() => setActiveTab('visit')}
              className="text-sm text-blue-500 font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              查看全部 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {recentVisits.map((visit) => {
              const linkedCheckup = visit.linkedPrenatalCheckupId ? getLinkedPrenatalCheckup(visit.id) : undefined;
              const linkedPostpartum = visit.linkedPostpartumCheckupId ? getLinkedPostpartumCheckup(visit.id) : undefined;
              const linkedPains = visit.linkedPainRecordIds?.length ? getLinkedPainRecords(visit.id) : [];

              return (
                <div key={visit.id} className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {visit.department}
                        {visit.diagnosis && (
                          <span className="ml-2 text-xs text-blue-500">({visit.diagnosis})</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{visit.date} · {visit.hospital}</p>
                    </div>
                    {visit.followUpDate && new Date(visit.followUpDate) >= new Date() ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-600">
                        复查 {visit.followUpDate}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-600">
                        已就诊
                      </span>
                    )}
                  </div>
                  {(linkedCheckup || linkedPostpartum || linkedPains.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {linkedCheckup && (
                        <span className="text-[10px] px-2 py-0.5 bg-fuchsia-100 text-fuchsia-600 rounded-full">
                          📋 关联产检: {linkedCheckup.type}
                        </span>
                      )}
                      {linkedPostpartum && (
                        <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
                          📋 关联产后: {linkedPostpartum.typeName}
                        </span>
                      )}
                      {linkedPains.length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full">
                          🔥 关联疼痛: {linkedPains.length} 条
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {recentReports.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-500" />
              最近检查单
            </h3>
            <button
              onClick={() => setActiveTab('report')}
              className="text-sm text-violet-500 font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              查看全部 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {recentReports.map((report) => {
              const hasAbnormal = report.abnormalItems && report.abnormalItems.length > 0;
              return (
                <div key={report.id} className={cn(
                  'flex items-center justify-between p-3 rounded-xl',
                  hasAbnormal ? 'bg-amber-50 border border-amber-200' : 'bg-gradient-to-r from-violet-50 to-purple-50'
                )}>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {report.name}
                      {hasAbnormal && (
                        <span className="ml-2 flex items-center gap-0.5 text-xs text-amber-600">
                          <AlertTriangle className="w-3 h-3" />
                          异常
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{report.date}{report.department ? ` · ${report.department}` : ''}</p>
                  </div>
                  {hasAbnormal ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-600">
                      {report.abnormalItems!.length}项异常
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      正常
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pendingFollowUps > 0 && (
        <div className="card p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800">待复查提醒</h4>
              <p className="text-sm text-gray-600">您有 {pendingFollowUps} 项就诊记录有待复查</p>
            </div>
            <button
              onClick={() => setActiveTab('visit')}
              className="text-sm text-amber-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              查看详情 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'department':
        return <DepartmentRecommendation />;
      case 'visit':
        return <VisitRecordList />;
      case 'report':
        return <TestReportNotes />;
      case 'overview':
      default:
        return renderOverview();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 via-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-200/50">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">就医助手</h1>
            <p className="text-gray-500">科室导航 · 就诊管理 · 检查追踪</p>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6 bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-500 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-white/80 text-sm mb-1">就医数据总览</p>
            <h2 className="font-display text-4xl font-bold mb-2">
              {visitRecords.length + testReports.length}
            </h2>
            <p className="text-white/90">
              {visitRecords.length} 次就诊 · {testReports.length} 份检查 · {abnormalReportCount} 项异常
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-3xl mb-1">🏥</div>
              <p className="text-xs text-white/80">就诊记录</p>
              <p className="font-bold">{visitRecords.length}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">📋</div>
              <p className="text-xs text-white/80">检查报告</p>
              <p className="font-bold">{testReports.length}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">🔗</div>
              <p className="text-xs text-white/80">关联记录</p>
              <p className="font-bold">
                {visitRecords.filter(r => r.linkedPrenatalCheckupId || r.linkedPostpartumCheckupId || (r.linkedPainRecordIds && r.linkedPainRecordIds.length > 0)).length}
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">⚠️</div>
              <p className="text-xs text-white/80">待复查</p>
              <p className="font-bold">{pendingFollowUps}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-2 mb-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                  isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {renderTabContent()}
    </div>
  );
}
