import { useMemo, useState, useEffect } from 'react';
import {
  Thermometer,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  Calendar,
  Activity,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import LineChart from '@/components/reports/LineChart';
import type { CyclePhase } from '@/types';

const phaseColors: Record<CyclePhase | string, string> = {
  period: '#f43f5e',
  follicular: '#06b6d4',
  ovulation: '#ec4899',
  luteal: '#8b5cf6',
  unknown: '#9ca3af',
};

const phaseLabels: Record<CyclePhase | string, string> = {
  period: '月经期',
  follicular: '卵泡期',
  ovulation: '排卵期',
  luteal: '黄体期',
  unknown: '未知',
};

export default function TemperatureChart() {
  const {
    temperatureRecords,
    temperatureAlerts,
    getTemperatureStatistics,
    getTemperatureTrend,
    detectTemperatureAnomalies,
    acknowledgeTemperatureAlert,
  } = useAppStore();

  useEffect(() => {
    detectTemperatureAnomalies();
  }, [detectTemperatureAnomalies, temperatureRecords.length]);

  const anomalies = useMemo(() => temperatureAlerts, [temperatureAlerts]);

  const [days, setDays] = useState(30);
  const [showPhaseColors, setShowPhaseColors] = useState(true);

  const stats = useMemo(() => getTemperatureStatistics(), [getTemperatureStatistics]);
  const trend = useMemo(() => getTemperatureTrend(days), [getTemperatureTrend, days]);

  const chartData = useMemo(() => {
    return trend.map((item) => ({
      label: item.date,
      value: item.temperature || 0,
    }));
  }, [trend]);

  const validData = chartData.filter((d) => d.value > 0);
  const hasData = validData.length > 0;

  const getPhaseForDate = (date: string): CyclePhase | string => {
    const record = temperatureRecords.find((r) => r.date === date);
    return record?.cyclePhase || 'unknown';
  };

  const today = new Date().toISOString().split('T')[0];
  const latestTemp = stats.latestTemperature;
  const latestDate = stats.latestTemperatureDate;

  const statCards = [
    {
      label: '最新体温',
      value: latestTemp ? `${latestTemp}°C` : '—',
      subValue: latestDate || '',
      icon: Thermometer,
      color: 'text-rose-500',
      bg: 'bg-rose-100',
    },
    {
      label: '平均体温',
      value: stats.avgTemperature ? `${stats.avgTemperature}°C` : '—',
      subValue: `${stats.recordCount} 条记录`,
      icon: Activity,
      color: 'text-cyan-500',
      bg: 'bg-cyan-100',
    },
    {
      label: '连续记录',
      value: `${stats.continuousDays} 天`,
      subValue: stats.tempShiftDetected ? '已检测到体温升高' : '坚持记录中',
      icon: Calendar,
      color: 'text-emerald-500',
      bg: 'bg-emerald-100',
    },
    {
      label: '异常提醒',
      value: `${anomalies.filter((a) => !a.acknowledged).length} 条`,
      subValue: anomalies.length > 0 ? '需关注' : '一切正常',
      icon: AlertTriangle,
      color: anomalies.some((a) => !a.acknowledged) ? 'text-amber-500' : 'text-gray-400',
      bg: anomalies.some((a) => !a.acknowledged) ? 'bg-amber-100' : 'bg-gray-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card p-4 bg-white">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', card.bg)}>
                  <Icon className={cn('w-5 h-5', card.color)} />
                </div>
                <span className="text-sm text-gray-500">{card.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-1">{card.value}</p>
              <p className="text-xs text-gray-400">{card.subValue}</p>
            </div>
          );
        })}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-500" />
              体温趋势曲线
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              基础体温变化趋势 · 双相体温提示有排卵
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[7, 14, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-md transition-all',
                    days === d
                      ? 'bg-white text-gray-800 shadow-sm font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {d}天
                </button>
              ))}
            </div>
          </div>
        </div>

        {hasData ? (
          <div className="relative">
            <LineChart
              data={chartData}
              height={280}
              color="#ec4899"
              showArea={true}
              showDots={true}
              showGrid={true}
              yAxisMin={35.5}
              yAxisMax={37.5}
              valueFormat={(v) => `${v.toFixed(1)}°`}
              legend1="基础体温"
            />

            {stats.tempShiftDetected && stats.tempShiftDate && (
              <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-800">已检测到排卵后体温升高</p>
                    <p className="text-sm text-emerald-600 mt-1">
                      体温升高日：{stats.tempShiftDate}
                      {stats.tempDiff !== undefined &&
                        ` · 温差约 ${stats.tempDiff.toFixed(2)}°C`}
                    </p>
                    {stats.follicularPhaseAvg !== undefined &&
                      stats.lutealPhaseAvg !== undefined && (
                        <p className="text-xs text-emerald-500 mt-2">
                          卵泡期平均: {stats.follicularPhaseAvg.toFixed(2)}°C · 黄体期平均:{' '}
                          {stats.lutealPhaseAvg.toFixed(2)}°C
                        </p>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400">
            <Thermometer className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">暂无体温数据</p>
            <p className="text-xs mt-1">连接设备或导入数据开始记录</p>
          </div>
        )}

        {showPhaseColors && hasData && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3">周期相位图例</p>
            <div className="flex flex-wrap gap-4">
              {Object.entries(phaseLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: phaseColors[key] }}
                  />
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-sky-500" />
            基础体温小知识
          </h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 mt-0.5">•</span>
              <span>每天清晨醒来后立即测量，保持同一时间</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 mt-0.5">•</span>
              <span>测量前不要起床、说话、进食</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 mt-0.5">•</span>
              <span>排卵后体温通常会升高0.2-0.5°C</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 mt-0.5">•</span>
              <span>双相体温（有高低温区）提示可能有排卵</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 mt-0.5">•</span>
              <span>体温持续升高18天以上可能提示怀孕</span>
            </li>
          </ul>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            异常提醒
          </h3>
          {anomalies.filter((a) => !a.acknowledged).length > 0 ? (
            <div className="space-y-3">
              {anomalies
                .filter((a) => !a.acknowledged)
                .slice(0, 5)
                .map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      'p-3 rounded-xl border',
                      alert.severity === 'high'
                        ? 'bg-rose-50 border-rose-200'
                        : alert.severity === 'medium'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-sky-50 border-sky-200'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p
                          className={cn(
                            'font-medium text-sm',
                            alert.severity === 'high'
                              ? 'text-rose-700'
                              : alert.severity === 'medium'
                              ? 'text-amber-700'
                              : 'text-sky-700'
                          )}
                        >
                          {alert.typeName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{alert.date}</p>
                      </div>
                      {alert.temperature && (
                        <span className="text-sm font-bold text-gray-700">
                          {alert.temperature}°C
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{alert.description}</p>
                    {alert.suggestion && (
                      <p className="text-xs text-gray-500 mt-1">
                        建议：{alert.suggestion}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm">暂无异常提醒</p>
              <p className="text-xs mt-1">体温数据一切正常 💕</p>
            </div>
          )}
        </div>
      </div>

      {temperatureRecords.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">最近记录</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">日期</th>
                  <th className="pb-3 font-medium">时间</th>
                  <th className="pb-3 font-medium">体温</th>
                  <th className="pb-3 font-medium">来源</th>
                  <th className="pb-3 font-medium">周期阶段</th>
                </tr>
              </thead>
              <tbody>
                {[...temperatureRecords]
                  .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
                  .slice(0, 10)
                  .map((record) => (
                    <tr key={record.id} className="border-b border-gray-50">
                      <td className="py-3 text-gray-800">{record.date}</td>
                      <td className="py-3 text-gray-600">{record.time}</td>
                      <td className="py-3">
                        <span
                          className={cn(
                            'font-medium',
                            record.temperature >= 37
                              ? 'text-rose-600'
                              : record.temperature < 36
                              ? 'text-sky-600'
                              : 'text-gray-800'
                          )}
                        >
                          {record.temperature}°C
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-xs',
                            record.source === 'bluetooth'
                              ? 'bg-sky-100 text-sky-700'
                              : record.source === 'csv'
                              ? 'bg-violet-100 text-violet-700'
                              : record.source === 'device'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-600'
                          )}
                        >
                          {record.source === 'bluetooth'
                            ? '蓝牙'
                            : record.source === 'csv'
                            ? 'CSV导入'
                            : record.source === 'device'
                            ? '设备'
                            : '手动'}
                        </span>
                      </td>
                      <td className="py-3">
                        {record.cyclePhase ? (
                          <span
                            className="px-2 py-0.5 rounded text-xs text-white"
                            style={{ backgroundColor: phaseColors[record.cyclePhase] }}
                          >
                            {phaseLabels[record.cyclePhase]}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
