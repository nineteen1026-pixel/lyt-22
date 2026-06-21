import { useEffect } from 'react';
import {
  Calendar,
  Heart,
  Thermometer,
  Activity,
  TrendingUp,
  Zap,
  Clock,
  Droplets,
  Star,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { PartnerPrepPermissionConfig, OvulationWindowShare } from '@/types';

const levelLabels: Record<string, { label: string; color: string; bg: string }> = {
  peak: { label: '峰值', color: 'text-rose-600', bg: 'bg-rose-100' },
  high: { label: '高', color: 'text-orange-600', bg: 'bg-orange-100' },
  medium: { label: '中', color: 'text-amber-600', bg: 'bg-amber-100' },
  low: { label: '低', color: 'text-gray-500', bg: 'bg-gray-100' },
};

const lhLabels: Record<string, { label: string; color: string; bg: string }> = {
  strong_positive: { label: '强阳', color: 'text-rose-600', bg: 'bg-rose-100' },
  positive: { label: '阳性', color: 'text-orange-600', bg: 'bg-orange-100' },
  faint: { label: '弱阳', color: 'text-amber-600', bg: 'bg-amber-100' },
  negative: { label: '阴性', color: 'text-sky-600', bg: 'bg-sky-100' },
};

export default function OvulationWindowSharing({
  permissions,
  viewRole,
}: {
  permissions: PartnerPrepPermissionConfig;
  viewRole: 'female' | 'partner';
}) {
  const { partnerPrepState, refreshOvulationWindowShare } = useAppStore();
  const share = partnerPrepState.ovulationWindowShare;

  useEffect(() => {
    refreshOvulationWindowShare();
  }, [refreshOvulationWindowShare]);

  if (!share) {
    return (
      <div className="card p-6 text-center">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">正在加载排卵窗口数据...</p>
      </div>
    );
  }

  const canSeeOvulation = permissions.ovulation_window;
  const canSeeProbability = permissions.conception_probability;
  const canSeeTemp = permissions.temperature_curve;
  const canSeeLh = permissions.lh_test;

  return (
    <div className="space-y-4">
      <div className={cn(
        'card p-6 relative overflow-hidden',
        share.isActive
          ? 'bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200'
          : 'bg-gradient-to-br from-sky-50 to-blue-50'
      )}>
        {share.isActive && (
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-l from-rose-500 to-pink-500 text-white text-xs font-bold rounded-bl-xl">
            易孕期进行中
          </div>
        )}

        <div className="flex items-center gap-3 mb-5">
          <div className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg',
            share.isActive
              ? 'bg-gradient-to-br from-rose-400 to-pink-500 shadow-rose-200/50'
              : 'bg-gradient-to-br from-sky-400 to-blue-500 shadow-sky-200/50'
          )}>
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">
              {canSeeOvulation ? '排卵窗口' : '周期状态'}
            </h3>
            <p className="text-xs text-gray-500">
              {viewRole === 'female' ? '基于你的周期与检测数据' : '基于伴侣的周期数据（脱敏）'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {canSeeOvulation && (
            <>
              <div className="p-4 bg-white/70 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-rose-500" />
                  <span className="text-xs text-gray-500">排卵日</span>
                </div>
                <p className="text-lg font-bold text-gray-800">{share.ovulationDate.slice(5)}</p>
                <p className={cn('text-xs font-medium', share.daysUntilOvulation > 0 ? 'text-mint-600' : 'text-rose-600')}>
                  {share.daysUntilOvulation > 0 ? `还有 ${share.daysUntilOvulation} 天` : share.daysUntilOvulation === 0 ? '就是今天!' : '已过'}
                </p>
              </div>

              <div className="p-4 bg-white/70 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span className="text-xs text-gray-500">易孕期</span>
                </div>
                <p className="text-lg font-bold text-gray-800">
                  {share.fertileStart.slice(5)} ~ {share.fertileEnd.slice(5)}
                </p>
                <p className="text-xs text-gray-500">
                  {share.adjustedOvulationDate ? '已修正' : '预测值'}
                </p>
              </div>
            </>
          )}

          {canSeeProbability && (
            <div className="p-4 bg-white/70 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-gray-500">今日受孕率</span>
              </div>
              <p className="text-lg font-bold text-gray-800">{share.conceptionProbability}%</p>
              <span className={cn('text-xs px-2 py-0.5 rounded-full', levelLabels[share.conceptionLevel]?.bg, levelLabels[share.conceptionLevel]?.color)}>
                {levelLabels[share.conceptionLevel]?.label}
              </span>
            </div>
          )}

          {canSeeTemp && (
            <div className="p-4 bg-white/70 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-gray-500">体温升高</span>
              </div>
              <p className={cn('text-lg font-bold', share.tempShiftDetected ? 'text-orange-600' : 'text-gray-500')}>
                {share.tempShiftDetected ? '已检测到' : '未检测到'}
              </p>
              <p className="text-xs text-gray-400">双相体温确认</p>
            </div>
          )}

          {canSeeLh && share.lhStatus && (
            <div className="p-4 bg-white/70 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-gray-500">LH试纸</span>
              </div>
              <span className={cn('text-xs px-2 py-0.5 rounded-full', lhLabels[share.lhStatus]?.bg, lhLabels[share.lhStatus]?.color)}>
                {lhLabels[share.lhStatus]?.label}
              </span>
              <p className="text-xs text-gray-400 mt-1">最近检测结果</p>
            </div>
          )}

          {!canSeeOvulation && !canSeeProbability && !canSeeTemp && !canSeeLh && (
            <div className="col-span-full p-6 text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">当前权限无法查看排卵窗口详情</p>
              <p className="text-xs text-gray-400 mt-1">请联系对方开放相关权限</p>
            </div>
          )}
        </div>

        {share.isActive && canSeeOvulation && (
          <div className="mt-4 p-3 bg-rose-100/60 rounded-xl">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-rose-500" />
              <p className="text-sm text-rose-700 font-medium">
                当前处于易孕期，建议隔天同房一次以提高受孕几率
              </p>
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span>数据更新于 {new Date(share.updatedAt).toLocaleString('zh-CN')}</span>
        </div>
      </div>
    </div>
  );
}
