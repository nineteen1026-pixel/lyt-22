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
  Info,
  Lock,
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

  // ========== 伴侣视图预览 ==========
  const partnerPerms = partner?.permissions;
  const visibleCount = partnerPerms ? Object.values(partnerPerms).filter(Boolean).length : 0;
  const totalCount = permissionItems.length;

  const basicPerms = permissionItems.filter((i) => !i.sensitive);
  const sensitivePerms = permissionItems.filter((i) => i.sensitive);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-lavender-500 flex items-center justify-center shadow-lg shadow-primary-200/50">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">独立权限管理</h3>
          <p className="text-xs text-gray-500">仅管理「伴侣可见数据权限」· 女方作为数据所有者拥有完整访问权</p>
        </div>
      </div>

      {/* ========== 1. 说明：女方不参与权限控制 ========== */}
      <div className="card p-5 bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-100">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rose-800">权限模型说明</p>
            <ul className="text-xs text-rose-700 mt-1.5 space-y-1">
              <li>✅ <strong>女方视图</strong>：作为数据所有者，始终拥有完整权限（10/10 项全开），无需配置</li>
              <li>🔒 <strong>伴侣视图</strong>：仅能看到女方在下方「伴侣可见数据权限」中主动开启的模块</li>
              <li>⚡ 权限变更即时生效，伴侣端无需重新登录或刷新</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ========== 2. 伴侣权限管理（唯一可编辑） ========== */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md bg-gradient-to-br from-sky-400 to-blue-500">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">伴侣可见数据权限</h4>
              <p className="text-xs text-gray-500">
                {partner ? `${partner.name} · 已授权 ${visibleCount}/${totalCount} 项` : '邀请伴侣加入后立即生效'}
              </p>
            </div>
          </div>
          {partner && (
            <button
              onClick={() => {
                const allOn = visibleCount === totalCount;
                const newPerms = Object.fromEntries(
                  permissionItems.map((item) => [item.key, !allOn])
                ) as unknown as PartnerPrepPermissionConfig;
                updatePartnerPrepPermissions('partner', newPerms);
              }}
              className="text-xs text-mint-600 hover:text-mint-700 font-medium"
            >
              {visibleCount === totalCount ? '取消全选' : '全选'}
            </button>
          )}
        </div>

        {partner ? (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">基础权限</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {basicPerms.map((item) => (
                <PermissionToggle
                  key={item.key}
                  item={item}
                  enabled={partnerPerms?.[item.key] ?? false}
                  onToggle={() => togglePermission('partner', item.key)}
                />
              ))}
            </div>

            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5">
              <EyeOff className="w-3 h-3" />敏感权限
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sensitivePerms.map((item) => (
                <PermissionToggle
                  key={item.key}
                  item={item}
                  enabled={partnerPerms?.[item.key] ?? false}
                  onToggle={() => togglePermission('partner', item.key)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center">
            <Lock className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500">伴侣尚未加入</p>
            <p className="text-xs text-gray-400 mt-1">先邀请伴侣加入，再来管理权限吧</p>
          </div>
        )}
      </div>

      {/* ========== 3. 伴侣视图预览（只读可视化） ========== */}
      <div className="card p-5 bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-md">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">伴侣视图预览</h4>
              <p className="text-xs text-gray-500">
                模拟伴侣视角：以下是伴侣登录后实际能看到的模块
              </p>
            </div>
          </div>
          <span className={cn(
            'text-xs px-2.5 py-1 rounded-full font-medium',
            visibleCount >= 7 ? 'bg-emerald-100 text-emerald-700'
              : visibleCount >= 4 ? 'bg-amber-100 text-amber-700'
              : 'bg-rose-100 text-rose-700'
          )}>
            可见度 {Math.round((visibleCount / totalCount) * 100)}%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {permissionItems.map((item) => {
            const Icon = item.icon;
            const visible = partnerPerms?.[item.key] ?? false;
            return (
              <div
                key={item.key}
                className={cn(
                  'p-3 rounded-xl border-2 text-center transition-all',
                  visible
                    ? 'bg-white border-mint-200 shadow-sm'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                )}
              >
                <div className="flex justify-center mb-1.5">
                  {visible ? (
                    <div className="w-8 h-8 rounded-lg bg-mint-100 flex items-center justify-center">
                      <Icon className={cn('w-4 h-4', item.color)} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
                <p className={cn(
                  'text-xs font-medium',
                  visible ? 'text-gray-800' : 'text-gray-400 line-through'
                )}>
                  {item.label}
                </p>
                <p className={cn(
                  'text-[10px] mt-0.5',
                  visible ? 'text-mint-600' : 'text-gray-400'
                )}>
                  {visible ? '✓ 可见' : '✕ 未授权'}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-white/60 rounded-xl border border-sky-100">
          <p className="text-xs text-sky-700">
            💡 <strong>提示：</strong>
            {visibleCount === totalCount
              ? '所有数据均已共享，伴侣可完整参与备孕协作。'
              : visibleCount >= 7
              ? '共享程度良好，核心协作数据已开放，敏感数据保持私密。'
              : visibleCount >= 4
              ? '仅共享了基础数据，部分核心功能可能受限（如任务操作、用药提醒等）。'
              : '共享程度较低，伴侣几乎看不到任何有效数据，建议至少开启基础权限。'}
          </p>
        </div>
      </div>

      {/* ========== 4. 权限说明 ========== */}
      <div className="card p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
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
