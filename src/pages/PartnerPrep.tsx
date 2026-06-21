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
  Moon,
  Dumbbell,
  Leaf,
  UtensilsCrossed,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import OvulationWindowSharing from '@/components/partner-prep/OvulationWindowSharing';
import PartnerTaskBoard from '@/components/partner-prep/PartnerTaskBoard';
import PartnerPermissionManager from '@/components/partner-prep/PartnerPermissionManager';
import type { PartnerPrepPermissionConfig, PartnerPrepTask, MedicationReminder, MoodRecord, PrenatalCheckup, SleepRecord } from '@/types';

type ViewRole = 'female' | 'partner';
type TabType = 'overview' | 'tasks' | 'ovulation' | 'permissions';

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

const moodEmojiMap: Record<string, string> = {
  开心: '😊',
  愉快: '😄',
  平静: '😌',
  平静放松: '😌',
  焦虑: '😟',
  担心: '😟',
  低落: '😔',
  难过: '😢',
  疲惫: '😩',
  累: '😩',
  烦躁: '😤',
  生气: '😠',
  幸福: '🥰',
  期待: '🤗',
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

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA);
  const b = new Date(dateB);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export default function PartnerPrep() {
  const {
    partnerPrepState,
    initPartnerPrep,
    joinPartnerPrep,
    refreshOvulationWindowShare,
    getPartnerPrepSummary,
    generatePartnerInviteCode,
    medicationReminders,
    moodRecords,
    prenatalCheckups,
    sleepRecords,
    getPartnerPrepTasksByAssignee,
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

  const summary = useMemo(() => getPartnerPrepSummary(), [getPartnerPrepSummary, partnerPrepState]);
  const profile = partnerPrepState.profile;
  const partner = partnerPrepState.partner;

  const currentPermissions: PartnerPrepPermissionConfig =
    viewRole === 'female'
      ? FULL_PERMISSIONS
      : partner?.permissions ?? defaultPerms();

  // ================ 真实数据源 ================
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. 用药计划：从 medicationReminders 取备孕期/排卵相关 + 活跃
  const prepMedications = useMemo<MedicationReminder[]>(() => {
    return medicationReminders.filter((r) =>
      r.active && ['pregnancy', 'ovulation'].includes(r.category)
    );
  }, [medicationReminders]);

  // 2. 检查安排：prenatalCheckups + partnerPrepTasks 中 checkup 类
  const prepCheckups = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      date: string;
      status: 'pending' | 'done' | 'overdue';
      items?: string;
      source: 'prenatal' | 'task';
    }> = [];

    prenatalCheckups.forEach((c) => {
      const diff = daysBetween(c.date, todayStr);
      let status: 'pending' | 'done' | 'overdue' = c.completed ? 'done' : diff < 0 ? 'overdue' : 'pending';
      list.push({
        id: c.id,
        name: c.type,
        date: c.date,
        status,
        items: [c.notes, c.doctor ? `医师:${c.doctor}` : null, c.hospital ? `🏥${c.hospital}` : null]
          .filter(Boolean)
          .join(' · ') || undefined,
        source: 'prenatal',
      });
    });

    partnerPrepState.tasks
      .filter((t) => t.category === 'checkup')
      .forEach((t: PartnerPrepTask) => {
        const diff = daysBetween(t.dueDate, todayStr);
        let status: 'pending' | 'done' | 'overdue' = t.completed ? 'done' : diff < 0 ? 'overdue' : 'pending';
        list.push({
          id: t.id,
          name: t.title,
          date: t.dueDate,
          status,
          items: [t.description, t.priority ? `优先级:${t.priority}` : null].filter(Boolean).join(' · ') || undefined,
          source: 'task',
        });
      });

    list.sort((a, b) => a.date.localeCompare(b.date));
    return list;
  }, [prenatalCheckups, partnerPrepState.tasks, todayStr]) as Array<{
    id: string;
    name: string;
    date: string;
    status: 'pending' | 'done' | 'overdue';
    items?: string;
    source: 'prenatal' | 'task';
  }>;

  // 3. 情绪状态：从 moodRecords 取最近 7 条
  const recentMoods = useMemo(() => {
    const sorted = [...moodRecords].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
    return sorted.map((r: MoodRecord) => {
      const diff = daysBetween(r.date, todayStr);
      let dayLabel = '今天';
      if (diff === -1) dayLabel = '昨天';
      else if (diff === -2) dayLabel = '前天';
      else if (diff < 0) dayLabel = `${-diff}天前`;
      else if (diff === 1) dayLabel = '明天';
      else if (diff > 0) dayLabel = `${diff}天后`;

      return {
        id: r.id,
        date: r.date,
        dayLabel,
        mood: r.mood,
        emotion: r.emotion,
        score: r.intensity,
        journal: r.journal || '',
        emoji: moodEmojiMap[r.mood] || moodEmojiMap[r.emotion] || '💭',
      };
    });
  }, [moodRecords, todayStr]) as Array<{
    id: string;
    date: string;
    dayLabel: string;
    mood: string;
    emotion: string;
    score: number;
    journal: string;
    emoji: string;
  }>;

  // 4. 生活备注：综合 sleepRecords + 备孕期生活习惯任务
  const lifestyleData = useMemo(() => {
    const recentSleep = [...sleepRecords]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3)
      .map((s: SleepRecord) => {
        const diff = daysBetween(s.date, todayStr);
        let label = '今天';
        if (diff === -1) label = '昨天';
        else if (diff === -2) label = '前天';
        else if (diff < 0) label = `${-diff}天前`;
        return {
          date: s.date,
          duration: s.duration,
          quality: s.quality,
          label,
        };
      });

    const lifeTasks = partnerPrepState.tasks.filter(
      (t) => ['lifestyle', 'exercise', 'nutrition'].includes(t.category) && !t.completed
    );

    const categoryLabelMap: Record<string, { label: string; tag: string }> = {
      lifestyle: { label: '🌿 生活方式', tag: '坚持' },
      exercise: { label: '🏃 运动计划', tag: '规律' },
      nutrition: { label: '🍵 饮食营养', tag: '均衡' },
    };

    return {
      sleepRecent: recentSleep,
      lifestyleTasks: lifeTasks.map((t: PartnerPrepTask) => ({
        id: t.id,
        title: t.title,
        category: categoryLabelMap[t.category]?.label || t.category,
        tag: categoryLabelMap[t.category]?.tag || '待办',
      })),
      rules: [
        { type: '💤 睡眠目标', content: '保持 7-8 小时睡眠，23:00 前入睡', tag: '重要' },
        { type: '🚫 禁忌提醒', content: '戒烟戒酒、避免接触有害物质、不擅自用药', tag: '严格' },
        { type: '💧 水分摄入', content: '每日饮水量 1500-2000ml', tag: '日常' },
      ],
    };
  }, [sleepRecords, partnerPrepState.tasks, todayStr]) as {
    sleepRecent: Array<{ date: string; duration: number; quality: number; label: string }>;
    lifestyleTasks: Array<{ id: string; title: string; category: string; tag: string }>;
    rules: Array<{ type: string; content: string; tag: string }>;
  };

  // ================ 通用方法 ================
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
    emptyHint?: string,
  ) {
    const hasPermission = currentPermissions[permissionKey];
    const isPartnerView = viewRole === 'partner';
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
                {viewRole === 'female' ? '我的真实业务数据' : '女方已授权共享（脱敏）'}
              </p>
            </div>
          </div>
          {!hasPermission && isPartnerView && (
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
            <p className="text-xs text-gray-300">如需查看，请在权限管理中开启「{title}」</p>
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

  // ================ 入口选择 ================
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

  // ================ 主页面 ================
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

      {/* 统计卡片 */}
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

      {/* 视图切换 */}
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

      {/* 伴侣视图无伴侣提示 */}
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

      {/* Tab 切换 */}
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

      {/* ===================== 总览页 ===================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <OvulationWindowSharing permissions={currentPermissions} viewRole={viewRole} />

          {/* 今日待办速览 */}
          <div className="card p-6 bg-gradient-to-br from-mint-50 to-emerald-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mint-400 to-emerald-500 flex items-center justify-center shadow-md">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">今日待办速览</h3>
                <p className="text-xs text-gray-500">
                  {viewRole === 'female' ? '我的待办（真实任务）' : '伴侣的待办（可见权限范围内）'}
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

          {/* 邀请伴侣 */}
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

          {/* ========== 四大真实数据模块 ========== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 用药计划：真实 medicationReminders 数据 */}
            {renderPermissionModule(
              'medication_plan',
              '用药计划',
              Pill,
              'from-rose-400 to-pink-500',
              'bg-rose-100',
              'text-rose-600',
              prepMedications.length > 0 ? (
                <div className="space-y-2">
                  {prepMedications.map((med) => (
                    <div key={med.id} className="flex items-start gap-3 p-3 bg-rose-50/40 rounded-xl border border-rose-100">
                      <div className="w-2 h-2 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-800 text-sm">{med.name}</p>
                          {med.active ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">进行中</span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">已停用</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {med.dosage} · {med.frequency} · {med.times.join('/')}
                        </p>
                        {viewRole === 'female' && med.notes && (
                          <p className="text-xs text-gray-400 mt-0.5">💡 {med.notes}</p>
                        )}
                        {viewRole === 'partner' && med.notes && currentPermissions.medication_plan && (
                          <p className="text-xs text-gray-400 mt-0.5">💡 备注已同步（摘要）</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-400">暂无备孕期用药记录</p>
                  <p className="text-xs text-gray-300 mt-0.5">可在提醒中心添加备孕期用药</p>
                </div>
              ),
              '暂无用药记录',
            )}

            {/* 检查安排：真实 prenatalCheckups + checkup 任务 */}
            {renderPermissionModule(
              'checkup_schedule',
              '检查安排',
              Stethoscope,
              'from-sky-400 to-blue-500',
              'bg-sky-100',
              'text-sky-600',
              prepCheckups.length > 0 ? (
                <div className="space-y-2">
                  {prepCheckups.map((c) => {
                    const diff = daysBetween(c.date, todayStr);
                    const dateLabel = diff === 0 ? '今天'
                      : diff === 1 ? '明天'
                      : diff > 0 ? `${diff}天后`
                      : diff === -1 ? '昨天'
                      : `${-diff}天前`;
                    return (
                      <div
                        key={c.id}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-xl border',
                          c.status === 'done'
                            ? 'bg-emerald-50/50 border-emerald-100'
                            : c.status === 'overdue'
                            ? 'bg-rose-50/40 border-rose-100'
                            : 'bg-sky-50/40 border-sky-100'
                        )}
                      >
                        <div className={cn(
                          'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                          c.status === 'done' ? 'bg-emerald-400' :
                          c.status === 'overdue' ? 'bg-rose-400' : 'bg-sky-400'
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
                            {c.status === 'done' ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">✓ 已完成</span>
                            ) : c.status === 'overdue' ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600">⚠ 已过期</span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600">待完成 · {dateLabel}</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            📅 {c.date.slice(5)}
                            {c.source === 'prenatal' ? '（产检系统）' : '（备孕任务）'}
                          </p>
                          {c.items && (
                            <p className="text-xs text-gray-400 mt-0.5">{c.items}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-400">暂无检查安排记录</p>
                  <p className="text-xs text-gray-300 mt-0.5">建议添加孕前全面体检、妇科检查等</p>
                </div>
              ),
              '暂无检查安排',
            )}

            {/* 情绪状态：真实 moodRecords 数据 */}
            {renderPermissionModule(
              'mood_status',
              '情绪状态',
              Smile,
              'from-amber-400 to-orange-500',
              'bg-amber-100',
              'text-amber-600',
              recentMoods.length > 0 ? (
                <div className="space-y-2">
                  {recentMoods.map((m, idx) => (
                    <div
                      key={m.id}
                      className={cn(
                        'p-3 rounded-xl border',
                        idx === 0 ? 'bg-amber-50/60 border-amber-200' : 'bg-amber-50/30 border-amber-100'
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{m.emoji}</span>
                          <span className="font-semibold text-sm text-gray-800">{m.mood}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-500">{m.dayLabel}</span>
                          <span className="text-xs font-bold text-amber-600">{m.score}/10</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            m.score >= 7 ? 'bg-gradient-to-r from-emerald-400 to-mint-400'
                              : m.score >= 4 ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                              : 'bg-gradient-to-r from-rose-400 to-pink-400'
                          )}
                          style={{ width: `${m.score * 10}%` }}
                        />
                      </div>
                      {viewRole === 'female' && m.journal && (
                        <p className="text-xs text-gray-400 mt-1.5">📝 {m.journal}</p>
                      )}
                      {viewRole === 'partner' && m.journal && currentPermissions.mood_status && (
                        <p className="text-xs text-gray-400 mt-1.5">📝 日记摘要：{m.journal.length > 12 ? m.journal.slice(0, 12) + '...' : m.journal}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-400">暂无情绪记录</p>
                  <p className="text-xs text-gray-300 mt-0.5">建议每天记录情绪以辅助调理</p>
                </div>
              ),
              '暂无情绪记录',
            )}

            {/* 生活备注：真实 sleepRecords + lifestyle 任务 */}
            {renderPermissionModule(
              'lifestyle_notes',
              '生活备注',
              BookOpen,
              'from-mint-400 to-emerald-500',
              'bg-mint-100',
              'text-mint-600',
              <div className="space-y-4">
                {/* 睡眠数据 */}
                {lifestyleData.sleepRecent.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Moon className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-semibold text-gray-600">近期睡眠</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {lifestyleData.sleepRecent.map((s) => (
                        <div key={s.date} className="p-2 bg-indigo-50/60 rounded-lg text-center">
                          <p className="text-[10px] text-gray-400">{s.label}</p>
                          <p className="text-sm font-bold text-indigo-700">{s.duration.toFixed(1)}h</p>
                          <p className="text-[10px] text-indigo-500">
                            {'⭐'.repeat(s.quality).slice(0, 5)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 生活方式任务 */}
                {lifestyleData.lifestyleTasks.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-semibold text-gray-600">习惯养成</span>
                    </div>
                    <div className="space-y-1.5">
                      {lifestyleData.lifestyleTasks.slice(0, 3).map((t) => (
                        <div key={t.id} className="flex items-center gap-2 p-2 bg-emerald-50/40 rounded-lg">
                          <span className="text-[11px] text-gray-500 flex-shrink-0">{t.category}</span>
                          <span className="text-xs text-gray-700 flex-1 min-w-0 truncate">{t.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">{t.tag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 通用规则 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Dumbbell className="w-4 h-4 text-sky-500" />
                    <span className="text-xs font-semibold text-gray-600">日常守则</span>
                  </div>
                  <div className="space-y-1.5">
                    {lifestyleData.rules.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-sky-50/40 rounded-lg">
                        <span className="text-[11px] text-gray-600 font-medium flex-shrink-0">{r.type}</span>
                        <span className="text-xs text-gray-600 flex-1">{r.content}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600 flex-shrink-0">{r.tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>,
              '暂无生活备注数据',
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
