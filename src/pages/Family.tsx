import { useState } from 'react';
import {
  Users,
  Shield,
  Share2,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Copy,
  Check,
  Clock,
  Heart,
  Moon,
  Smile,
  Pill,
  Calendar,
  Stethoscope,
  Baby,
  UtensilsCrossed,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  LogIn,
  Activity,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { PermissionConfig, FamilyRelation, DataCategory, MaskedHealthData } from '@/types';
import { cn } from '@/lib/utils';

const relationLabels: Record<FamilyRelation, string> = {
  partner: '伴侣',
  mother: '母亲',
  father: '父亲',
  other: '其他',
};

const relationColors: Record<FamilyRelation, string> = {
  partner: 'from-rose-400 to-pink-500',
  mother: 'from-lavender-400 to-purple-500',
  father: 'from-sky-400 to-blue-500',
  other: 'from-gray-400 to-gray-500',
};

const permissionItems: {
  key: DataCategory;
  label: string;
  description: string;
  icon: typeof Heart;
  color: string;
}[] = [
  { key: 'cycle', label: '周期数据', description: '周期阶段、下次经期时间等', icon: Calendar, color: 'text-pink-500' },
  { key: 'sleep', label: '睡眠数据', description: '平均睡眠时长、质量等', icon: Moon, color: 'text-indigo-500' },
  { key: 'mood', label: '情绪数据', description: '近期情绪状态和趋势', icon: Smile, color: 'text-orange-500' },
  { key: 'medication', label: '用药数据', description: '今日服药情况、依从率', icon: Pill, color: 'text-emerald-500' },
  { key: 'pain', label: '疼痛数据', description: '痛经程度等疼痛信息', icon: AlertCircle, color: 'text-rose-500' },
  { key: 'pregnancy', label: '孕期数据', description: '孕周、产检等孕期信息', icon: Stethoscope, color: 'text-sky-500' },
  { key: 'postpartum', label: '产后数据', description: '产后恢复、哺乳等信息', icon: Baby, color: 'text-fuchsia-500' },
  { key: 'nutrition', label: '营养数据', description: '饮食摄入、营养分析等', icon: UtensilsCrossed, color: 'text-amber-500' },
];

type TabType = 'members' | 'share' | 'viewer' | 'preview';

function MaskedDataCards({ data, permissions }: { data: MaskedHealthData; permissions: PermissionConfig }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {permissions.cycle && data.cycle && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-gray-800">周期状态</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">当前阶段</span>
              <span className="font-medium text-gray-800">{data.cycle.cyclePhase}</span>
            </div>
            {data.cycle.daysUntilNextPeriod !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">距下次经期</span>
                <span className="font-medium text-gray-800">{data.cycle.daysUntilNextPeriod} 天</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">今日痛经</span>
              <span className={cn('font-medium', data.cycle.hasPainToday ? 'text-rose-500' : 'text-emerald-500')}>
                {data.cycle.hasPainToday
                  ? permissions.pain && data.cycle.painLevel
                    ? { none: '无', mild: '轻微', moderate: '中度', severe: '严重' }[data.cycle.painLevel]
                    : '有不适'
                  : '无不适'}
              </span>
            </div>
          </div>
        </div>
      )}

      {permissions.sleep && data.sleep && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
              <Moon className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-gray-800">睡眠状况（近7天）</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">平均时长</span>
              <span className="font-medium text-gray-800">{data.sleep.avgDuration} 小时</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">平均质量</span>
              <span className="font-medium text-gray-800">{data.sleep.avgQuality} / 5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">睡眠不佳天数</span>
              <span className={cn('font-medium', data.sleep.poorSleepDays > 2 ? 'text-rose-500' : 'text-gray-800')}>
                {data.sleep.poorSleepDays} 天
              </span>
            </div>
          </div>
        </div>
      )}

      {permissions.mood && data.mood && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <Smile className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-gray-800">情绪状态</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">近期心情</span>
              <span className="font-medium text-gray-800">{data.mood.recentMood}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">情绪趋势</span>
              <span
                className={cn(
                  'font-medium',
                  data.mood.moodTrend === 'improving' && 'text-emerald-500',
                  data.mood.moodTrend === 'declining' && 'text-rose-500',
                  data.mood.moodTrend === 'stable' && 'text-gray-800',
                  data.mood.moodTrend === 'unknown' && 'text-gray-400'
                )}
              >
                {{ improving: '↗ 渐好', stable: '→ 稳定', declining: '↘ 下滑', unknown: '数据不足' }[data.mood.moodTrend]}
              </span>
            </div>
          </div>
        </div>
      )}

      {permissions.medication && data.medication && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-gray-800">用药情况（今日）</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">服药进度</span>
              <span className="font-medium text-gray-800">{data.medication.todayTaken} / {data.medication.todayTotal}</span>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-500 text-sm">依从率</span>
                <span
                  className={cn(
                    'font-medium',
                    data.medication.adherenceRate >= 80 ? 'text-emerald-500' : data.medication.adherenceRate >= 50 ? 'text-amber-500' : 'text-rose-500'
                  )}
                >
                  {data.medication.adherenceRate}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all',
                    data.medication.adherenceRate >= 80
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                      : data.medication.adherenceRate >= 50
                      ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                      : 'bg-gradient-to-r from-rose-400 to-red-400'
                  )}
                  style={{ width: `${data.medication.adherenceRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {permissions.pregnancy && data.pregnancy && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-gray-800">孕期状况</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">当前孕周</span>
              <span className="font-medium text-gray-800">第 {data.pregnancy.currentWeek} 周</span>
            </div>
            {data.pregnancy.dueDate && (
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">预产期</span>
                <span className="font-medium text-gray-800">{data.pregnancy.dueDate}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">产检进度</span>
              <span className="font-medium text-gray-800">
                已完成 {data.pregnancy.completedCheckupCount} · 待检 {data.pregnancy.upcomingCheckupCount}
              </span>
            </div>
          </div>
        </div>
      )}

      {permissions.postpartum && data.postpartum && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-400 to-pink-500 flex items-center justify-center">
              <Baby className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-gray-800">产后恢复</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">产后天数</span>
              <span className="font-medium text-gray-800">第 {data.postpartum.daysPostpartum} 天</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">恢复阶段</span>
              <span className="font-medium text-gray-800">{data.postpartum.recoveryPhase}</span>
            </div>
            {data.postpartum.breastfeedingTodayCount !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">今日哺乳</span>
                <span className="font-medium text-gray-800">{data.postpartum.breastfeedingTodayCount} 次</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">本周盆底训练</span>
              <span className="font-medium text-gray-800">{data.postpartum.pelvicFloorExercisesThisWeek} 次</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">待复查</span>
              <span className="font-medium text-gray-800">{data.postpartum.upcomingCheckupCount} 项</span>
            </div>
          </div>
        </div>
      )}

      {permissions.nutrition && data.nutrition && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-gray-800">营养状况（今日）</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">今日热量</span>
              <span className="font-medium text-gray-800">{data.nutrition.todayCalories} / {data.nutrition.calorieTarget} kcal</span>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-500 text-sm">蛋白质充足度</span>
                <span
                  className={cn(
                    'font-medium',
                    data.nutrition.proteinAdequacy >= 80 ? 'text-emerald-500' : data.nutrition.proteinAdequacy >= 50 ? 'text-amber-500' : 'text-rose-500'
                  )}
                >
                  {data.nutrition.proteinAdequacy}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all',
                    data.nutrition.proteinAdequacy >= 80
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                      : data.nutrition.proteinAdequacy >= 50
                      ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                      : 'bg-gradient-to-r from-rose-400 to-red-400'
                  )}
                  style={{ width: `${Math.min(data.nutrition.proteinAdequacy, 100)}%` }}
                />
              </div>
            </div>
            {data.nutrition.keyGaps.length > 0 && (
              <div className="flex justify-between items-start">
                <span className="text-gray-500 text-sm">营养缺口</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {data.nutrition.keyGaps.map((g) => (
                    <span key={g} className="px-2 py-0.5 bg-amber-50 text-amber-600 text-xs rounded-full">{g}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Family() {
  const {
    familyMembers,
    shareCodes,
    addFamilyMember,
    updateMemberPermissions,
    removeFamilyMember,
    generateShareCode,
    revokeShareCode,
    redeemShareCode,
    getMaskedHealthData,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState<FamilyRelation>('partner');
  const [newMemberPermissions, setNewMemberPermissions] = useState<PermissionConfig>({
    cycle: true, sleep: true, mood: true, medication: true,
    pregnancy: true, postpartum: true, nutrition: false, pain: true,
  });
  const [sharePermissions, setSharePermissions] = useState<PermissionConfig>({
    cycle: true, sleep: true, mood: true, medication: true,
    pregnancy: true, postpartum: true, nutrition: false, pain: true,
  });
  const [shareValidHours, setShareValidHours] = useState(24);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [previewPermissions, setPreviewPermissions] = useState<PermissionConfig>({
    cycle: true, sleep: true, mood: true, medication: true,
    pregnancy: true, postpartum: true, nutrition: false, pain: true,
  });

  const [redeemCodeInput, setRedeemCodeInput] = useState('');
  const [redeemName, setRedeemName] = useState('');
  const [redeemRelation, setRedeemRelation] = useState<FamilyRelation>('partner');
  const [redeemError, setRedeemError] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState(false);
  const [selectedViewerId, setSelectedViewerId] = useState<string | null>(
    familyMembers.length > 0 ? familyMembers[0].id : null
  );

  const previewData = getMaskedHealthData(previewPermissions);
  const activeShareCodes = shareCodes.filter((c) => !c.used && new Date(c.expiresAt) > new Date());

  const selectedViewer = familyMembers.find((m) => m.id === selectedViewerId);
  const viewerData = selectedViewer ? getMaskedHealthData(selectedViewer.permissions) : null;

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    addFamilyMember({
      name: newMemberName.trim(),
      relation: newMemberRelation,
      permissions: newMemberPermissions,
      active: true,
    });
    setNewMemberName('');
    setNewMemberRelation('partner');
    setNewMemberPermissions({
      cycle: true, sleep: true, mood: true, medication: true,
      pregnancy: true, postpartum: true, nutrition: false, pain: true,
    });
    setShowAddMember(false);
  };

  const handleGenerateCode = () => {
    const code = generateShareCode(sharePermissions, shareValidHours);
    setGeneratedCode(code.code);
  };

  const handleCopyCode = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleRedeemCode = () => {
    setRedeemError('');
    setRedeemSuccess(false);
    if (!redeemCodeInput.trim()) {
      setRedeemError('请输入共享码');
      return;
    }
    if (!redeemName.trim()) {
      setRedeemError('请输入您的称呼');
      return;
    }
    const member = redeemShareCode(redeemCodeInput.trim().toUpperCase(), redeemName.trim(), redeemRelation);
    if (!member) {
      setRedeemError('共享码无效、已使用或已过期');
      return;
    }
    setRedeemSuccess(true);
    setSelectedViewerId(member.id);
    setRedeemCodeInput('');
    setRedeemName('');
    setRedeemRelation('partner');
  };

  const togglePermission = (
    permissions: PermissionConfig,
    setter: (p: PermissionConfig) => void,
    key: DataCategory
  ) => {
    setter({ ...permissions, [key]: !permissions[key] });
  };

  const PermissionCheckbox = ({
    item,
    permissions,
    onChange,
  }: {
    item: typeof permissionItems[number];
    permissions: PermissionConfig;
    onChange: (key: DataCategory) => void;
  }) => (
    <button
      onClick={() => onChange(item.key)}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left w-full',
        permissions[item.key]
          ? 'border-primary-300 bg-primary-50/50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      )}
    >
      <div
        className={cn(
          'w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0',
          permissions[item.key]
            ? 'bg-gradient-to-br from-primary-400 to-lavender-500'
            : 'border-2 border-gray-300'
        )}
      >
        {permissions[item.key] && <Check className="w-3.5 h-3.5 text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <item.icon className={cn('w-4 h-4', item.color)} />
          <span className="font-medium text-gray-800 text-sm">{item.label}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
      </div>
    </button>
  );

  const SelectAllPermissions = ({
    permissions,
    setter,
  }: {
    permissions: PermissionConfig;
    setter: (p: PermissionConfig) => void;
  }) => {
    const allSelected = Object.values(permissions).every(Boolean);
    return (
      <button
        onClick={() => {
          const value = !allSelected;
          setter({
            cycle: value, sleep: value, mood: value, medication: value,
            pregnancy: value, postpartum: value, nutrition: value, pain: value,
          });
        }}
        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        {allSelected ? '取消全选' : '全选'}
      </button>
    );
  };

  const tabs: { key: TabType; label: string; icon: typeof Users }[] = [
    { key: 'members', label: '共享成员', icon: Users },
    { key: 'share', label: '共享码', icon: Share2 },
    { key: 'viewer', label: '家人查看', icon: Eye },
    { key: 'preview', label: '数据预览', icon: Activity },
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-8 md:mb-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-rose-400 via-pink-400 to-lavender-400 flex items-center justify-center shadow-xl shadow-pink-200/50">
          <Users className="w-10 h-10 text-white" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          家庭共享空间
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          与家人分享脱敏后的健康数据，让爱与关怀更加贴心
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-gray-100 rounded-full p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all',
                activeTab === tab.key
                  ? 'bg-white text-primary-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'members' && (
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-500" />
              我的共享成员 ({familyMembers.length})
            </h2>
            <button
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-primary-400 to-lavender-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-primary-200/50 hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              添加成员
            </button>
          </div>

          {showAddMember && (
            <div className="card p-6 mb-6 border-2 border-primary-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">添加共享成员</h3>
                <button onClick={() => setShowAddMember(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">成员称呼</label>
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="例如：老公、妈妈"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">关系</label>
                    <select
                      value={newMemberRelation}
                      onChange={(e) => setNewMemberRelation(e.target.value as FamilyRelation)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all bg-white"
                    >
                      {(Object.keys(relationLabels) as FamilyRelation[]).map((r) => (
                        <option key={r} value={r}>{relationLabels[r]}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      <Shield className="w-4 h-4" />可查看的数据
                    </label>
                    <SelectAllPermissions permissions={newMemberPermissions} setter={setNewMemberPermissions} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {permissionItems.map((item) => (
                      <PermissionCheckbox
                        key={item.key}
                        item={item}
                        permissions={newMemberPermissions}
                        onChange={(key) => togglePermission(newMemberPermissions, setNewMemberPermissions, key)}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setShowAddMember(false)} className="px-5 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-medium transition-all">取消</button>
                  <button
                    onClick={handleAddMember}
                    disabled={!newMemberName.trim()}
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-primary-400 to-lavender-500 text-white font-medium shadow-lg shadow-primary-200/50 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    添加
                  </button>
                </div>
              </div>
            </div>
          )}

          {familyMembers.length === 0 ? (
            <div className="card p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">还没有共享成员</p>
              <button onClick={() => setShowAddMember(true)} className="text-primary-600 font-medium hover:text-primary-700">
                + 添加第一位成员
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {familyMembers.map((member) => (
                <div key={member.id} className="card overflow-hidden">
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn('w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center shadow-md', relationColors[member.relation])}>
                          <Heart className="w-6 h-6 text-white" fill="white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{member.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{relationLabels[member.relation]}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />加入于 {member.createdAt}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', member.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500')}>
                          {member.active ? '已授权' : '已暂停'}
                        </span>
                        {expandedMember === member.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>
                  </div>

                  {expandedMember === member.id && (
                    <div className="px-5 pb-5 pt-0 border-t border-gray-100">
                      <div className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-1.5">
                            <Shield className="w-4 h-4 text-primary-500" />权限配置
                          </h4>
                          <SelectAllPermissions permissions={member.permissions} setter={(p) => updateMemberPermissions(member.id, p)} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                          {permissionItems.map((item) => (
                            <PermissionCheckbox
                              key={item.key}
                              item={item}
                              permissions={member.permissions}
                              onChange={(key) => {
                                const newPerms = { ...member.permissions, [key]: !member.permissions[key] };
                                updateMemberPermissions(member.id, newPerms);
                              }}
                            />
                          ))}
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => { if (confirm(`确定要移除 ${member.name} 吗？`)) removeFamilyMember(member.id); }}
                            className="flex items-center gap-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                          >
                            <Trash2 className="w-4 h-4" />移除成员
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'share' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
              <Share2 className="w-5 h-5 text-primary-500" />生成共享码
            </h2>
            <p className="text-gray-500 text-sm mb-6">生成一次性共享码，家人使用后即可加入共享空间</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">有效期</label>
                <select
                  value={shareValidHours}
                  onChange={(e) => setShareValidHours(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all bg-white"
                >
                  <option value={1}>1 小时</option>
                  <option value={6}>6 小时</option>
                  <option value={24}>24 小时</option>
                  <option value={72}>3 天</option>
                  <option value={168}>7 天</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />共享数据权限
                  </label>
                  <SelectAllPermissions permissions={sharePermissions} setter={setSharePermissions} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {permissionItems.map((item) => (
                    <PermissionCheckbox
                      key={item.key}
                      item={item}
                      permissions={sharePermissions}
                      onChange={(key) => togglePermission(sharePermissions, setSharePermissions, key)}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateCode}
                className="w-full bg-gradient-to-r from-primary-400 to-lavender-500 text-white py-3 rounded-xl font-medium shadow-lg shadow-primary-200/50 hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />生成共享码
              </button>
            </div>
          </div>

          {generatedCode && (
            <div className="card p-6 bg-gradient-to-br from-primary-50 to-lavender-50 border-2 border-primary-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">您的共享码</p>
                <div className="inline-flex items-center gap-2 bg-white px-8 py-4 rounded-2xl shadow-lg mb-4">
                  <span className="font-mono text-3xl font-bold tracking-widest gradient-text">{generatedCode}</span>
                  <button onClick={handleCopyCode} className="p-2 rounded-lg hover:bg-gray-100 transition-all">
                    {copiedCode ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-gray-500" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">{copiedCode ? '已复制到剪贴板！' : '点击右侧图标复制'}</p>
                <p className="text-xs text-gray-500 mt-2">请在 {shareValidHours} 小时内使用，过期将自动失效</p>
              </div>
            </div>
          )}

          {activeShareCodes.length > 0 && (
            <div className="card p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />待使用的共享码 ({activeShareCodes.length})
              </h3>
              <div className="space-y-3">
                {activeShareCodes.map((code) => (
                  <div key={code.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-mono text-xl font-bold text-gray-800 tracking-wider">{code.code}</p>
                      <p className="text-xs text-gray-500 mt-1">过期时间：{new Date(code.expiresAt).toLocaleString('zh-CN')}</p>
                    </div>
                    <button onClick={() => revokeShareCode(code.id)} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'viewer' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
              <LogIn className="w-5 h-5 text-primary-500" />兑换共享码
            </h2>
            <p className="text-gray-500 text-sm mb-6">输入您收到的共享码，加入家庭共享空间</p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">共享码</label>
                  <input
                    type="text"
                    value={redeemCodeInput}
                    onChange={(e) => { setRedeemCodeInput(e.target.value.toUpperCase()); setRedeemError(''); setRedeemSuccess(false); }}
                    placeholder="6位共享码"
                    maxLength={6}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-mono text-center text-lg tracking-widest"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">您的称呼</label>
                  <input
                    type="text"
                    value={redeemName}
                    onChange={(e) => { setRedeemName(e.target.value); setRedeemError(''); setRedeemSuccess(false); }}
                    placeholder="例如：老公"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">关系</label>
                  <select
                    value={redeemRelation}
                    onChange={(e) => setRedeemRelation(e.target.value as FamilyRelation)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all bg-white"
                  >
                    {(Object.keys(relationLabels) as FamilyRelation[]).map((r) => (
                      <option key={r} value={r}>{relationLabels[r]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {redeemError && (
                <div className="flex items-center gap-2 text-rose-500 text-sm bg-rose-50 px-4 py-2.5 rounded-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {redeemError}
                </div>
              )}

              {redeemSuccess && (
                <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 px-4 py-2.5 rounded-xl">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  兑换成功！已加入家庭共享空间
                </div>
              )}

              <button
                onClick={handleRedeemCode}
                disabled={!redeemCodeInput.trim() || !redeemName.trim()}
                className="w-full bg-gradient-to-r from-primary-400 to-lavender-500 text-white py-3 rounded-xl font-medium shadow-lg shadow-primary-200/50 hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogIn className="w-5 h-5" />兑换共享码
              </button>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-gray-50 to-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-gray-400" />
                <h3 className="font-bold text-gray-700">家人视角 — 查看共享数据</h3>
              </div>
              {familyMembers.length > 0 && (
                <select
                  value={selectedViewerId || ''}
                  onChange={(e) => setSelectedViewerId(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all bg-white text-sm"
                >
                  {familyMembers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}（{relationLabels[m.relation]}）</option>
                  ))}
                </select>
              )}
            </div>

            {familyMembers.length === 0 ? (
              <div className="text-center py-12">
                <EyeOff className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-2">暂无共享成员</p>
                <p className="text-gray-400 text-sm">请先兑换共享码或在「共享成员」中添加成员</p>
              </div>
            ) : selectedViewer && viewerData ? (
              Object.values(selectedViewer.permissions).every((v) => !v) ? (
                <div className="text-center py-12">
                  <EyeOff className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">该成员暂无任何数据查看权限</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
                    <span>以「{selectedViewer.name}」的身份查看</span>
                    <span>·</span>
                    <span>仅展示脱敏后的摘要数据</span>
                  </div>
                  <MaskedDataCards data={viewerData} permissions={selectedViewer.permissions} />
                </>
              )
            ) : null}
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-primary-500" />脱敏数据预览
            </h2>
            <p className="text-gray-500 text-sm mb-6">选择下方权限，查看家人视角能看到的数据效果</p>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />模拟权限设置
                </label>
                <SelectAllPermissions permissions={previewPermissions} setter={setPreviewPermissions} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {permissionItems.slice(0, 4).map((item) => (
                  <PermissionCheckbox
                    key={item.key}
                    item={item}
                    permissions={previewPermissions}
                    onChange={(key) => togglePermission(previewPermissions, setPreviewPermissions, key)}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {permissionItems.slice(4).map((item) => (
                  <PermissionCheckbox
                    key={item.key}
                    item={item}
                    permissions={previewPermissions}
                    onChange={(key) => togglePermission(previewPermissions, setPreviewPermissions, key)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-gray-50 to-white">
            <div className="flex items-center gap-2 mb-6">
              <EyeOff className="w-5 h-5 text-gray-400" />
              <h3 className="font-bold text-gray-700">家人视角</h3>
            </div>

            {Object.values(previewPermissions).every((v) => !v) ? (
              <div className="text-center py-12">
                <EyeOff className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">请选择至少一项数据权限进行预览</p>
              </div>
            ) : (
              <MaskedDataCards data={previewData} permissions={previewPermissions} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
