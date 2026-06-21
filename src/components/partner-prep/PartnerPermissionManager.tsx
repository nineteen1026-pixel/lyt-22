import {
  Shield,
  Eye,
  EyeOff,
  Calendar,
  TrendingUp,
  Thermometer,
  Droplets,
  CheckSquare,
  Pill,
  Stethoscope,
  Smile,
  StickyNote,
  Check,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { PartnerPrepPermission, PartnerPrepPermissionConfig } from '@/types';

const permissionItems: {
  key: PartnerPrepPermission;
  label: string;
  description: string;
  icon: typeof Calendar;
  color: string;
  sensitive: boolean;
}[] = [
  { key: 'ovulation_window', label: '排卵窗口', description: '易孕期范围、排卵日等', icon: Calendar, color: 'text-rose-500', sensitive: false },
  { key: 'conception_probability', label: '受孕概率', description: '每日受孕概率及等级', icon: TrendingUp, color: 'text-emerald-500', sensitive: false },
  { key: 'temperature_curve', label: '体温曲线', description: '基础体温变化趋势', icon: Thermometer, color: 'text-orange-500', sensitive: true },
  { key: 'lh_test', label: 'LH试纸结果', description: '排卵试纸检测数据', icon: Droplets, color: 'text-amber-500', sensitive: true },
  { key: 'task_details', label: '任务详情', description: '查看任务内容与描述', icon: CheckSquare, color: 'text-mint-500', sensitive: false },
  { key: 'task_completion', label: '任务完成', description: '可标记任务为已完成', icon: CheckSquare, color: 'text-teal-500', sensitive: false },
  { key: 'medication_plan', label: '用药计划', description: '促排药、叶酸等用药信息', icon: Pill, color: 'text-emerald-600', sensitive: true },
  { key: 'checkup_schedule', label: '检查安排', description: '孕前检查时间与项目', icon: Stethoscope, color: 'text-sky-500', sensitive: false },
  { key: 'mood_status', label: '情绪状态', description: '近期情绪概要（脱敏）', icon: Smile, color: 'text-pink-500', sensitive: true },
  { key: 'lifestyle_notes', label: '生活备注', description: '双方共享的生活提醒', icon: StickyNote, color: 'text-lavender-500', sensitive: false },
];

export default function PartnerPermissionManager() {
  const { partnerPrepState, updatePartnerPrepPermissions } = useAppStore();
  const partner = partnerPrepState.partner;
  const profile = partnerPrepState.profile;

  if (!partner && !profile) return null;

  const togglePermission = (role: 'female' | 'partner', key: PartnerPrepPermission) => {
    const target = role === 'female' ? profile : partner;
    if (!target) return;
    const newPerms: PartnerPrepPermissionConfig = {
      ...target.permissions,
      [key]: !target.permissions[key],
    };
    updatePartnerPrepPermissions(role, newPerms);
  };

  const PermissionSection = ({
    title,
    role,
    profile: targetProfile,
  }: {
    title: string;
    role: 'female' | 'partner';
    profile: { permissions: PartnerPrepPermissionConfig; name: string } | null;
  }) => {
    if (!targetProfile) return null;
    const perms = targetProfile.permissions;
    const allEnabled = Object.values(perms).every(Boolean);
    const enabledCount = Object.values(perms).filter(Boolean).length;

    return (
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center shadow-md',
              role === 'female'
                ? 'bg-gradient-to-br from-rose-400 to-pink-500'
                : 'bg-gradient-to-br from-sky-400 to-blue-500'
            )}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">{title}</h4>
              <p className="text-xs text-gray-500">
                {targetProfile.name} · 已授权 {enabledCount}/{permissionItems.length} 项
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const value = !allEnabled;
              const newPerms = Object.fromEntries(
                permissionItems.map((item) => [item.key, value])
              ) as unknown as PartnerPrepPermissionConfig;
              updatePartnerPrepPermissions(role, newPerms);
            }}
            className="text-xs text-mint-600 hover:text-mint-700 font-medium"
          >
            {allEnabled ? '取消全选' : '全选'}
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">基础权限</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {permissionItems.filter((i) => !i.sensitive).map((item) => (
              <PermissionToggle
                key={item.key}
                item={item}
                enabled={perms[item.key]}
                onToggle={() => togglePermission(role, item.key)}
              />
            ))}
          </div>

          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5">
            <EyeOff className="w-3 h-3" />敏感权限
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {permissionItems.filter((i) => i.sensitive).map((item) => (
              <PermissionToggle
                key={item.key}
                item={item}
                enabled={perms[item.key]}
                onToggle={() => togglePermission(role, item.key)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-lavender-500 flex items-center justify-center shadow-lg shadow-primary-200/50">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">独立权限管理</h3>
          <p className="text-xs text-gray-500">精细控制双方可见数据范围，保护隐私同时促进协作</p>
        </div>
      </div>

      <PermissionSection
        title="伴侣可见数据权限"
        role="partner"
        profile={partner ? { permissions: partner.permissions, name: partner.name } : null}
      />

      <PermissionSection
        title="女方可见数据权限"
        role="female"
        profile={profile ? { permissions: profile.permissions, name: profile.name } : null}
      />

      <div className="card p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
        <div className="flex items-start gap-2">
          <Eye className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">权限说明</p>
            <ul className="text-xs text-amber-700 mt-1 space-y-1">
              <li>· 基础权限：对协作备孕必要的数据，建议开放</li>
              <li>· 敏感权限：涉及体温、LH、情绪等私密数据，需谨慎授权</li>
              <li>· 伴侣视角仅展示脱敏后的摘要信息，不暴露原始记录</li>
              <li>· 权限变更即时生效，已共享的历史数据同步受新权限约束</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function PermissionToggle({
  item,
  enabled,
  onToggle,
}: {
  item: typeof permissionItems[number];
  enabled: boolean;
  onToggle: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left w-full',
        enabled
          ? 'border-mint-300 bg-mint-50/50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      )}
    >
      <div
        className={cn(
          'w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0',
          enabled
            ? 'bg-gradient-to-br from-mint-400 to-emerald-500'
            : 'border-2 border-gray-300'
        )}
      >
        {enabled && <Check className="w-3.5 h-3.5 text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Icon className={cn('w-4 h-4', item.color)} />
          <span className="font-medium text-gray-800 text-sm">{item.label}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
      </div>
    </button>
  );
}
