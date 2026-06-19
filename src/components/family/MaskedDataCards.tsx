import {
  Heart,
  Moon,
  Smile,
  Pill,
  Calendar,
  Stethoscope,
  Baby,
  UtensilsCrossed,
  AlertCircle,
} from 'lucide-react';
import type { PermissionConfig, MaskedHealthData } from '@/types';
import { cn } from '@/lib/utils';

export function MaskedDataCards({
  data,
  permissions,
}: {
  data: MaskedHealthData;
  permissions: PermissionConfig;
}) {
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

      {permissions.pain && data.pain && !permissions.cycle && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-gray-800">疼痛状况</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">今日状态</span>
              <span className={cn('font-medium', data.pain.hasPainToday ? 'text-rose-500' : 'text-emerald-500')}>
                {data.pain.hasPainToday ? '有疼痛' : '无疼痛'}
              </span>
            </div>
            {data.pain.hasPainToday && (
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">今日疼痛级别</span>
                <span className="font-medium text-gray-800">{data.pain.todayLevel} / 10</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">近7天疼痛天数</span>
              <span className="font-medium text-gray-800">{data.pain.painDays7d} 天</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">近7天平均级别</span>
              <span className="font-medium text-gray-800">
                {data.pain.painDays7d > 0 ? `${data.pain.recentAveLevel} / 10` : '无'}
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
