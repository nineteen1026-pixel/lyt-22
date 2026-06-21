import { useState, useEffect, useMemo } from 'react';
import {
  Heart,
  Users,
  User,
  Shield,
  CheckSquare,
  Calendar,
  Copy,
  Check,
  LogIn,
  X,
  Link2,
  Activity,
  TrendingUp,
  Zap,
  Baby,
  Pill,
  Stethoscope,
  Smile,
  BookOpen,
  EyeOff,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import OvulationWindowSharing from '@/components/partner-prep/OvulationWindowSharing';
import PartnerTaskBoard from '@/components/partner-prep/PartnerTaskBoard';
import PartnerPermissionManager from '@/components/partner-prep/PartnerPermissionManager';
import type { PartnerPrepPermissionConfig } from '@/types';

type ViewRole = 'female' | 'partner';
type TabType = 'overview' | 'tasks' | 'ovulation' | 'permissions';

export default function PartnerPrep() {
  const {
    partnerPrepState,
    initPartnerPrep,
    joinPartnerPrep,
    refreshOvulationWindowShare,
    getPartnerPrepSummary,
    generatePartnerInviteCode,
  } = useAppStore();

  const [viewRole, setViewRole] = useState<ViewRole>('female');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showInvite, setShowInvite] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinError, setJoinError] = useState('');
  const [initName, setInitName] = useState('');
  const [showInit, setShowInit] = useState(false);

  useEffect(() => {
    refreshOvulationWindowShare();
  }, [refreshOvulationWindowShare]);

  const FULL_PERMISSIONS: PartnerPrepPermissionConfig = {
    ovulation_window: true,
    conception_probability: true,
    temperature_curve: true,
    lh_test: true,
    task_details: true,
    task_completion: true,
    medication_plan: true,
    checkup_schedule: true,
    mood_status: true,
    lifestyle_notes: true,
  };

  function defaultPerms(): PartnerPrepPermissionConfig {
    return {
      ovulation_window: true,
      conception_probability: true,
      temperature_curve: false,
      lh_test: false,
      task_details: true,
      task_completion: true,
      medication_plan: true,
      checkup_schedule: true,
      mood_status: false,
      lifestyle_notes: true,
    };
  }

  const summary = useMemo(() => getPartnerPrepSummary(), [getPartnerPrepSummary, partnerPrepState]);
  const profile = partnerPrepState.profile;
  const partner = partnerPrepState.partner;

  const currentPermissions: PartnerPrepPermissionConfig =
    viewRole === 'female'
      ? FULL_PERMISSIONS
      : partner?.permissions ?? defaultPerms();

  const handleGenerateInvite = () => {
    const code = generatePartnerInviteCode();
    setInviteCode(code);
  };

  const handleCopyCode = async () => {
    if (inviteCode) {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoin = () => {
    setJoinError('');
    if (!joinCode.trim()) {
      setJoinError('请输入邀请码');
      return;
    }
    if (!joinName.trim()) {
      setJoinError('请输入你的称呼');
      return;
    }
    const success = joinPartnerPrep(joinCode.trim().toUpperCase(), joinName.trim());
    if (!success) {
      setJoinError('邀请码无效或伴侣已加入');
      return;
    }
    setShowJoin(false);
    setJoinCode('');
    setJoinName('');
  };

  const handleInit = () => {
    if (!initName.trim()) return;
    initPartnerPrep(initName.trim());
    setShowInit(false);
    setInitName('');
  };

  type PermissionKey = keyof PartnerPrepPermissionConfig;

  function renderPermissionModule(
    permissionKey: PermissionKey,
    title: string,
    Icon: typeof Heart,
    gradient: string,
    iconBg: string,
    iconColor: string,
    content: React.ReactNode,
  ) {
    const hasPermission = currentPermissions[permissionKey];
    return (
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shadow-sm', iconBg)}>
              <Icon className={cn('w-5 h-5', iconColor)} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{title}</h3>
              <p className="text-xs text-gray-400">
                {viewRole === 'female' ? '我的数据' : '女方已授权共享'}
              </p>
            </div>
          </div>
          {!hasPermission && viewRole === 'partner' && (
            <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-500 flex items-center gap-1">
              <EyeOff className="w-3 h-3" />
              未授权
            </span>
          )}
        </div>
        {hasPermission ? (
          content
        ) : (
          <div className="py-8 text-center">
            <EyeOff className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-400 mb-1">该数据暂未向伴侣开放</p>
            <p className="text-xs text-gray-300">如需查看，请在权限管理中开启</p>
          </div>
        )}
      </div>
    );
  }

  const tabs: { key: TabType; label: string; icon: typeof Heart; color: string }[] = [
    { key: 'overview', label: '总览', icon: Activity, color: 'from-rose-400 to-pink-500' },
    { key: 'ovulation', label: '排卵窗口', icon: Calendar, color: 'from-fuchsia-400 to-pink-500' },
    { key: 'tasks', label: '任务板', icon: CheckSquare, color: 'from-mint-400 to-emerald-500' },
    { key: 'permissions', label: '权限管理', icon: Shield, color: 'from-primary-400 to-lavender-500' },
  ];

  if (!profile && !showInit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-rose-400 via-pink-400 to-lavender-400 flex items-center justify-center shadow-xl shadow-pink-200/50">
            <Heart className="w-12 h-12 text-white" fill="white" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            伴侣协同备孕
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            与伴侣共享排卵窗口与备孕任务，携手迎接新生命
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <button
            onClick={() => setShowInit(true)}
            className="w-full card p-6 text-left hover:shadow-lg transition-shadow border-2 border-transparent hover:border-mint-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">我是女方</h3>
                <p className="text-sm text-gray-500">创建备孕空间，邀请伴侣加入</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowJoin(true)}
            className="w-full card p-6 text-left hover:shadow-lg transition-shadow border-2 border-transparent hover:border-sky-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">我是伴侣</h3>
                <p className="text-sm text-gray-500">输入邀请码，加入备孕空间</p>
              </div>
            </div>
          </button>
        </div>

        {showInit && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card p-6 w-full max-w-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">创建备孕空间</h3>
                <button onClick={() => setShowInit(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">输入你的称呼，开始创建专属备孕空间</p>
              <input
                type="text"
                value={initName}
                onChange={(e) => setInitName(e.target.value)}
                placeholder="你的称呼"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none mb-4"
              />
              <button
                onClick={handleInit}
                disabled={!initName.trim()}
                className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                创建并开始
              </button>
            </div>
          </div>
        )}

        {showJoin && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card p-6 w-full max-w-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">加入备孕空间</h3>
                <button onClick={() => setShowJoin(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(''); }}
                  placeholder="邀请码 (PP开头)"
                  maxLength={8}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none font-mono text-center tracking-widest"
                />
                <input
                  type="text"
                  value={joinName}
                  onChange={(e) => { setJoinName(e.target.value); setJoinError(''); }}
                  placeholder="你的称呼"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                />
                {joinError && (
                  <p className="text-sm text-rose-500 text-center">{joinError}</p>
                )}
                <button
                  onClick={handleJoin}
                  disabled={!joinCode.trim() || !joinName.trim()}
                  className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  加入
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 via-pink-400 to-lavender-400 flex items-center justify-center shadow-lg shadow-pink-200/50">
            <Heart className="w-6 h-6 text-white" fill="white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">伴侣协同备孕</h1>
            <p className="text-gray-500">共享排卵窗口 · 协作备孕任务 · 独立权限控制</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-rose-500" />
            </div>
            <span className="text-xs text-gray-500">任务进度</span>
          </div>
          <p className="text-xl font-bold text-gray-800">{summary.completedToday}/{summary.activeTasks + summary.completedToday}</p>
          <p className="text-xs text-mint-600">今日完成率 {summary.completionRate}%</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-pink-500" />
            </div>
            <span className="text-xs text-gray-500">排卵窗口</span>
          </div>
          <p className={cn('text-xl font-bold', summary.ovulationWindowActive ? 'text-rose-600' : 'text-gray-800')}>
            {summary.ovulationWindowActive ? '进行中' : '等待中'}
          </p>
          <p className="text-xs text-gray-400">
            {summary.daysUntilOvulation !== null
              ? summary.daysUntilOvulation > 0
                ? `距排卵 ${summary.daysUntilOvulation} 天`
                : summary.daysUntilOvulation === 0
                ? '今天排卵'
                : '已过'
              : '暂无数据'}
          </p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-sky-500" />
            </div>
            <span className="text-xs text-gray-500">伴侣状态</span>
          </div>
          <p className="text-xl font-bold text-gray-800">
            {partner ? partner.name : '未加入'}
          </p>
          <p className={cn('text-xs', partner?.active ? 'text-emerald-500' : 'text-gray-400')}>
            {partner?.active ? '已连接' : '等待加入'}
          </p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-xs text-gray-500">协作效率</span>
          </div>
          <p className="text-xl font-bold text-gray-800">{summary.completionRate}%</p>
          <p className="text-xs text-gray-400">总任务完成率</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 inline-flex bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setViewRole('female')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all flex-1 justify-center',
              viewRole === 'female'
                ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            )}
          >
            <User className="w-4 h-4" />
            女方视图
            {profile && <span className="text-xs opacity-80">({profile.name})</span>}
          </button>
          <button
            onClick={() => setViewRole('partner')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all flex-1 justify-center',
              viewRole === 'partner'
                ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            )}
          >
            <Users className="w-4 h-4" />
            伴侣视图
            {partner && <span className="text-xs opacity-80">({partner.name})</span>}
          </button>
        </div>

        {!partner && viewRole === 'female' && (
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-lavender-400 to-purple-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
          >
            <Link2 className="w-4 h-4" />
            邀请伴侣
          </button>
        )}
      </div>

      {viewRole === 'partner' && !partner && (
        <div className="card p-8 text-center mb-6">
          <Users className="w-16 h-16 mx-auto mb-4 text-sky-300" />
          <h3 className="font-bold text-gray-800 mb-2">伴侣尚未加入</h3>
          <p className="text-gray-500 mb-4">邀请伴侣加入后，即可在伴侣视图中查看共享数据</p>
          <button
            onClick={() => setShowJoin(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all"
          >
            <LogIn className="w-4 h-4 inline mr-2" />
            输入邀请码加入
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all text-sm font-medium',
                isActive
                  ? cn('bg-gradient-to-r text-white shadow-lg', tab.color)
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-mint-300 hover:shadow-md'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <OvulationWindowSharing permissions={currentPermissions} viewRole={viewRole} />

          <div className="card p-6 bg-gradient-to-br from-mint-50 to-emerald-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mint-400 to-emerald-500 flex items-center justify-center shadow-md">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">今日待办速览</h3>
                <p className="text-xs text-gray-500">
                  {viewRole === 'female' ? '我的待办' : '伴侣的待办（可见范围）'}
                </p>
              </div>
            </div>
            {partnerPrepState.tasks.filter((t) => !t.completed && (viewRole === 'female' ? true : currentPermissions.task_details)).length > 0 ? (
              <div className="space-y-2">
                {partnerPrepState.tasks
                  .filter((t) => !t.completed && (viewRole === 'female' ? true : currentPermissions.task_details))
                  .slice(0, 5)
                  .map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-white/70 rounded-xl">
                      <CheckSquare className="w-4 h-4 text-gray-300" />
                      <span className="text-sm text-gray-700 flex-1">{task.title}</span>
                      <span className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full',
                        task.assignee === 'female' ? 'bg-rose-50 text-rose-600' :
                        task.assignee === 'partner' ? 'bg-sky-50 text-sky-600' :
                        'bg-mint-50 text-mint-600'
                      )}>
                        {({ female: '女方', partner: '伴侣', both: '双方' } as const)[task.assignee]}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">暂无待办任务</p>
            )}
          </div>

          {viewRole === 'female' && !partner && (
            <div className="card p-6 bg-gradient-to-br from-lavender-50 to-purple-50 border border-lavender-200">
              <div className="flex items-center gap-3 mb-3">
                <Baby className="w-6 h-6 text-lavender-500" />
                <h3 className="font-bold text-gray-800">邀请伴侣一起备孕</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                生成邀请码，让伴侣加入你们的专属备孕空间，共享排卵窗口与协作完成任务。
              </p>
              <button
                onClick={() => setShowInvite(true)}
                className="px-5 py-2 bg-gradient-to-r from-lavender-400 to-purple-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
              >
                生成邀请码
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderPermissionModule(
              'medication_plan',
              '用药计划',
              Pill,
              'from-rose-400 to-pink-500',
              'bg-rose-100',
              'text-rose-600',
              <div className="space-y-3">
                {[
                  { name: '叶酸片', time: '每日早餐后', dose: '0.4mg', note: '预防胎儿神经管缺陷' },
                  { name: '维生素D3', time: '每日午餐后', dose: '1000IU', note: '促进钙吸收' },
                  { name: '钙片', time: '每日睡前', dose: '600mg', note: '储备骨骼钙质' },
                ].map((med, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/70 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{med.name}</p>
                      <p className="text-xs text-gray-500">{med.time} · {med.dose}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{med.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {renderPermissionModule(
              'checkup_schedule',
              '检查安排',
              Stethoscope,
              'from-sky-400 to-blue-500',
              'bg-sky-100',
              'text-sky-600',
              <div className="space-y-3">
                {[
                  { name: '孕前全面体检', date: '本月内', status: 'pending', items: '血常规、B超、TORCH、性激素六项' },
                  { name: '妇科常规检查', date: '月经干净后3-7天', status: 'pending', items: '白带常规、TCT、HPV' },
                  { name: '口腔检查', date: '备孕前3个月', status: 'done', items: '洗牙、智齿评估' },
                  { name: '甲状腺功能', date: '已完成', status: 'done', items: 'TSH、FT3、FT4、TPOAb' },
                ].map((check, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/70 rounded-xl">
                    <div className={cn(
                      'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                      check.status === 'done' ? 'bg-emerald-400' : 'bg-sky-400'
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800 text-sm">{check.name}</p>
                        {check.status === 'done' ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">已完成</span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600">待安排</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{check.date}</p>
                      <p className="text-xs text-gray-400 mt-0.5">项目：{check.items}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {renderPermissionModule(
              'mood_status',
              '情绪状态',
              Smile,
              'from-amber-400 to-orange-500',
              'bg-amber-100',
              'text-amber-600',
              <div className="space-y-3">
                {[
                  { day: '今天', mood: '😊', label: '愉快', score: 8, note: '今天感觉状态不错，散步了半小时' },
                  { day: '昨天', mood: '😌', label: '平静', score: 7, note: '工作有点忙，但整体平稳' },
                  { day: '前天', mood: '😔', label: '低落', score: 4, note: '排卵试纸阴性，有点焦虑' },
                ].map((m, i) => (
                  <div key={i} className="p-3 bg-white/70 rounded-xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{m.mood}</span>
                        <span className="font-semibold text-sm text-gray-800">{m.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">{m.day}</span>
                        <span className="text-xs font-bold text-amber-600">{m.score}/10</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                        style={{ width: `${m.score * 10}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">{m.note}</p>
                  </div>
                ))}
              </div>
            )}

            {renderPermissionModule(
              'lifestyle_notes',
              '生活备注',
              BookOpen,
              'from-mint-400 to-emerald-500',
              'bg-mint-100',
              'text-mint-600',
              <div className="space-y-3">
                {[
                  { type: '💤 睡眠', content: '目标 7-8 小时，尽量 23:00 前入睡', tag: '重要' },
                  { type: '🏃 运动', content: '每周3-4次轻运动：快走、瑜伽、游泳', tag: '规律' },
                  { type: '🍵 饮食', content: '避免咖啡因、生冷食物；多吃优质蛋白、深绿色蔬菜', tag: '坚持中' },
                  { type: '🚫 禁忌', content: '戒烟戒酒、避免接触有害物质、不乱服用药物', tag: '严格' },
                ].map((note, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/70 rounded-xl">
                    <p className="text-sm flex-shrink-0">{note.type}</p>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">{note.content}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-mint-50 text-mint-600 flex-shrink-0">
                      {note.tag}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'ovulation' && (
        <OvulationWindowSharing permissions={currentPermissions} viewRole={viewRole} />
      )}

      {activeTab === 'tasks' && (
        <PartnerTaskBoard
          viewRole={viewRole}
          canEdit={viewRole === 'female' || (partner?.permissions.task_completion ?? false)}
          permissions={currentPermissions}
        />
      )}

      {activeTab === 'permissions' && (
        <PartnerPermissionManager />
      )}

      {showInvite && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">邀请伴侣</h3>
              <button onClick={() => setShowInvite(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!inviteCode ? (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                  生成邀请码，分享给伴侣即可加入备孕空间
                </p>
                <button
                  onClick={handleGenerateInvite}
                  className="px-6 py-3 bg-gradient-to-r from-lavender-400 to-purple-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  生成邀请码
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">将此邀请码分享给伴侣</p>
                <div className="inline-flex items-center gap-2 bg-gray-50 px-6 py-4 rounded-2xl mb-4">
                  <span className="font-mono text-2xl font-bold tracking-widest gradient-text">{inviteCode}</span>
                  <button onClick={handleCopyCode} className="p-2 rounded-lg hover:bg-gray-200 transition-all">
                    {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-gray-500" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">{copied ? '已复制到剪贴板！' : '点击右侧图标复制'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showJoin && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">加入备孕空间</h3>
              <button onClick={() => setShowJoin(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(''); }}
                placeholder="邀请码 (PP开头)"
                maxLength={8}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none font-mono text-center tracking-widest"
              />
              <input
                type="text"
                value={joinName}
                onChange={(e) => { setJoinName(e.target.value); setJoinError(''); }}
                placeholder="你的称呼"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
              />
              {joinError && (
                <p className="text-sm text-rose-500 text-center">{joinError}</p>
              )}
              <button
                onClick={handleJoin}
                disabled={!joinCode.trim() || !joinName.trim()}
                className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                加入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
