import { useState, useMemo } from 'react';
import {
  Briefcase,
  Clock,
  AlertTriangle,
  TrendingUp,
  Coffee,
  Moon,
  Heart,
  Plus,
  X,
  Zap,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Brain,
  Flame,
  Shield,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Droplet,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { OvertimeRecord } from '@/types';
import LineChart from '@/components/reports/LineChart';
import BarChart from '@/components/reports/BarChart';
import DonutChart from '@/components/reports/DonutChart';

const generateId = () => Math.random().toString(36).substr(2, 9);

type AnalysisTab = 'trend' | 'phase' | 'correlation' | 'cause';

const cyclePhaseLabels: Record<string, { name: string; icon: string; color: string }> = {
  period: { name: '月经期', icon: '🩸', color: '#f43f5e' },
  follicular: { name: '卵泡期', icon: '🌱', color: '#10b981' },
  ovulation: { name: '排卵期', icon: '✨', color: '#8b5cf6' },
  luteal: { name: '黄体期', icon: '🌙', color: '#f59e0b' },
};

const stressLevelLabels = [
  { min: 0, max: 3, label: '轻松', color: '#10b981', desc: '身心放松，状态良好' },
  { min: 4, max: 6, label: '中等', color: '#f59e0b', desc: '略有压力，可承受' },
  { min: 7, max: 8, label: '较高', color: '#f97316', desc: '压力明显，需注意' },
  { min: 9, max: 10, label: '过载', color: '#ef4444', desc: '严重过载，请休息' },
];

const painLevelLabels = [
  { min: 0, max: 0, label: '无痛', color: '#10b981' },
  { min: 1, max: 3, label: '轻度', color: '#84cc16' },
  { min: 4, max: 6, label: '中度', color: '#f59e0b' },
  { min: 7, max: 8, label: '重度', color: '#f97316' },
  { min: 9, max: 10, label: '剧痛', color: '#ef4444' },
];

export default function CareerPage() {
  const { overtimeRecords, addOvertimeRecord } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<AnalysisTab>('trend');
  const [newRecord, setNewRecord] = useState<Partial<OvertimeRecord>>({
    date: new Date().toISOString().split('T')[0],
    hours: 2,
    stressLevel: 5,
    sleepHours: 7,
    dysmenorrheaLevel: 0,
  });

  const sortedRecords = useMemo(
    () => [...overtimeRecords].sort((a, b) => a.date.localeCompare(b.date)),
    [overtimeRecords]
  );

  const totalOvertimeHours = overtimeRecords.reduce((sum, r) => sum + r.hours, 0);
  const avgStressLevel = overtimeRecords.length > 0
    ? (overtimeRecords.reduce((sum, r) => sum + r.stressLevel, 0) / overtimeRecords.length).toFixed(1)
    : 0;
  const avgSleepHours = overtimeRecords.length > 0
    ? (overtimeRecords.reduce((sum, r) => sum + r.sleepHours, 0) / overtimeRecords.length).toFixed(1)
    : 0;

  const periodOvertimeRecords = overtimeRecords.filter((r) => r.isPeriodDay);
  const avgPeriodPain = periodOvertimeRecords.length > 0
    ? (periodOvertimeRecords.reduce((sum, r) => sum + (r.dysmenorrheaLevel || 0), 0) / periodOvertimeRecords.length).toFixed(1)
    : 0;

  const highStressCount = overtimeRecords.filter((r) => r.stressLevel >= 7).length;
  const highStressWithPain = overtimeRecords.filter(
    (r) => r.stressLevel >= 7 && (r.dysmenorrheaLevel || 0) >= 4
  ).length;

  const trendChartData = useMemo(() => {
    const last14 = sortedRecords.slice(-14);
    return last14.map((r) => ({
      label: r.date,
      value: r.hours,
      value2: r.stressLevel * 0.5,
    }));
  }, [sortedRecords]);

  const painTrendData = useMemo(() => {
    const last14 = sortedRecords.slice(-14);
    return last14.map((r) => ({
      label: r.date,
      value: r.dysmenorrheaLevel || 0,
      value2: r.stressLevel,
    }));
  }, [sortedRecords]);

  const phaseAnalysis = useMemo(() => {
    const phases: Record<string, { count: number; totalHours: number; totalStress: number; totalPain: number; painDays: number }> = {
      period: { count: 0, totalHours: 0, totalStress: 0, totalPain: 0, painDays: 0 },
      follicular: { count: 0, totalHours: 0, totalStress: 0, totalPain: 0, painDays: 0 },
      ovulation: { count: 0, totalHours: 0, totalStress: 0, totalPain: 0, painDays: 0 },
      luteal: { count: 0, totalHours: 0, totalStress: 0, totalPain: 0, painDays: 0 },
    };

    overtimeRecords.forEach((r) => {
      const phase = r.cyclePhase || 'follicular';
      phases[phase].count += 1;
      phases[phase].totalHours += r.hours;
      phases[phase].totalStress += r.stressLevel;
      if (r.dysmenorrheaLevel) {
        phases[phase].totalPain += r.dysmenorrheaLevel;
        phases[phase].painDays += 1;
      }
    });

    return Object.entries(phases).map(([key, val]) => ({
      key,
      count: val.count,
      avgHours: val.count > 0 ? Number((val.totalHours / val.count).toFixed(1)) : 0,
      avgStress: val.count > 0 ? Number((val.totalStress / val.count).toFixed(1)) : 0,
      avgPain: val.painDays > 0 ? Number((val.totalPain / val.painDays).toFixed(1)) : 0,
      ...cyclePhaseLabels[key],
    }));
  }, [overtimeRecords]);

  const phaseHoursBarData = phaseAnalysis.map((p) => ({
    label: p.name,
    value: p.avgHours,
    color: p.color,
  }));

  const phaseStressBarData = phaseAnalysis.map((p) => ({
    label: p.name,
    value: p.avgStress,
    color: p.color,
  }));

  const phasePainBarData = phaseAnalysis.map((p) => ({
    label: p.name,
    value: p.avgPain,
    color: p.color,
  }));

  const donutData = phaseAnalysis.map((p) => ({
    label: p.name,
    value: p.count,
    color: p.color,
  }));

  const correlationBuckets = useMemo(() => {
    const buckets = {
      lowStressLowHours: { pain: 0, count: 0 },
      lowStressHighHours: { pain: 0, count: 0 },
      highStressLowHours: { pain: 0, count: 0 },
      highStressHighHours: { pain: 0, count: 0 },
    };

    overtimeRecords.forEach((r) => {
      const isHighStress = r.stressLevel >= 6;
      const isHighHours = r.hours >= 3;
      const pain = r.dysmenorrheaLevel || 0;

      if (!isHighStress && !isHighHours) {
        buckets.lowStressLowHours.count += 1;
        buckets.lowStressLowHours.pain += pain;
      } else if (!isHighStress && isHighHours) {
        buckets.lowStressHighHours.count += 1;
        buckets.lowStressHighHours.pain += pain;
      } else if (isHighStress && !isHighHours) {
        buckets.highStressLowHours.count += 1;
        buckets.highStressLowHours.pain += pain;
      } else {
        buckets.highStressHighHours.count += 1;
        buckets.highStressHighHours.pain += pain;
      }
    });

    return Object.entries(buckets).map(([key, val]) => ({
      key,
      avgPain: val.count > 0 ? Number((val.pain / val.count).toFixed(1)) : 0,
      count: val.count,
    }));
  }, [overtimeRecords]);

  const getBucketLabel = (key: string) => {
    switch (key) {
      case 'lowStressLowHours': return '低压少加班';
      case 'lowStressHighHours': return '低压多加班';
      case 'highStressLowHours': return '高压少加班';
      case 'highStressHighHours': return '高压多加班';
      default: return key;
    }
  };

  const getBucketColor = (key: string) => {
    switch (key) {
      case 'lowStressLowHours': return '#10b981';
      case 'lowStressHighHours': return '#06b6d4';
      case 'highStressLowHours': return '#f59e0b';
      case 'highStressHighHours': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const causeAnalysis = useMemo(() => {
    const insights: {
      type: 'warning' | 'danger' | 'info' | 'good';
      icon: string;
      title: string;
      description: string;
      suggestions: string[];
    }[] = [];

    const highStressPainRecords = overtimeRecords.filter(
      (r) => r.stressLevel >= 7 && (r.dysmenorrheaLevel || 0) >= 5
    );
    if (highStressPainRecords.length >= 2) {
      insights.push({
        type: 'danger',
        icon: '🔥',
        title: '高压与痛经强关联预警',
        description: `记录显示 ${highStressPainRecords.length} 次高压力（≥7）加班后出现中度以上痛经（≥5）。长期高压力状态会通过下丘脑-垂体-肾上腺轴影响激素分泌，加重前列腺素导致的子宫收缩痛。`,
        suggestions: [
          '高压工作日优先安排放松训练（10分钟深呼吸/冥想）',
          '经期前1周避免不必要的加班，预留缓冲时间',
          '考虑与主管沟通任务优先级，合理分配工作量',
        ],
      });
    }

    const periodOvertimeHours = periodOvertimeRecords.reduce((s, r) => s + r.hours, 0);
    if (periodOvertimeRecords.length >= 2 && periodOvertimeHours / periodOvertimeRecords.length >= 2.5) {
      insights.push({
        type: 'warning',
        icon: '🩸',
        title: '经期加班时长超标',
        description: `月经期平均每次加班 ${(periodOvertimeHours / periodOvertimeRecords.length).toFixed(1)} 小时。经期身体处于失血和免疫力低谷，长时间脑力劳动会加重疲劳感和盆腔充血，延长经期疼痛持续时间。`,
        suggestions: [
          '经期将加班控制在1小时内，或申请调休半天',
          '每工作45分钟起身活动5分钟，促进盆腔血液循环',
          '工位常备暖宝宝贴，腰腹保暖可降低痛感30%',
        ],
      });
    }

    const highHoursLowSleep = overtimeRecords.filter((r) => r.hours >= 3 && r.sleepHours <= 6);
    if (highHoursLowSleep.length >= 2) {
      insights.push({
        type: 'warning',
        icon: '🌙',
        title: '加班挤占睡眠，放大痛感',
        description: `${highHoursLowSleep.length} 次长时间加班（≥3h）后睡眠不足6小时。研究表明，睡眠剥夺会使疼痛敏感度上升240%，这是因为大脑内啡肽分泌减少而炎症因子升高。`,
        suggestions: [
          '加班回家后优先保证睡眠，非紧急家务延后',
          '睡前30分钟关闭电子设备，用泡脚/阅读助眠',
          '如必须加班，次日中午补觉20分钟可显著降低疼痛反应',
        ],
      });
    }

    const lutealHeavy = phaseAnalysis.find((p) => p.key === 'luteal');
    if (lutealHeavy && lutealHeavy.avgStress >= 6) {
      insights.push({
        type: 'info',
        icon: '🌙',
        title: '经前期压力管理提示',
        description: `黄体期平均压力值 ${lutealHeavy.avgStress}，略高于其他阶段。此阶段孕激素下降会导致 GABA（抑制性神经递质）水平降低，使情绪和痛感更易被触发。`,
        suggestions: [
          '黄体期增加富含镁的食物（坚果、深绿蔬菜）',
          '经前3天开始补充维生素B6和Omega-3',
          '避免咖啡因和高糖饮食，减少情绪波动',
        ],
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'good',
        icon: '✨',
        title: '状态良好，继续保持',
        description: '当前数据未显示明显的加班-痛经强关联模式，说明你的工作节奏和身体状态处于较好平衡。',
        suggestions: [
          '继续保持规律作息，适度运动',
          '记录更多数据有助于发现潜在模式',
          '经期仍需注意保暖和休息',
        ],
      });
    }

    return insights;
  }, [overtimeRecords, periodOvertimeRecords, phaseAnalysis]);

  const handleAddRecord = () => {
    if (newRecord.date && newRecord.hours !== undefined) {
      let cyclePhase: OvertimeRecord['cyclePhase'] = 'follicular';
      let isPeriodDay = false;
      const date = new Date(newRecord.date);
      const cycleStart = new Date();
      cycleStart.setDate(cycleStart.getDate() - 3);
      const dayInCycle = Math.floor((date.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24));
      const cycleDay = ((dayInCycle % 28) + 28) % 28;
      if (cycleDay >= 0 && cycleDay < 5) { cyclePhase = 'period'; isPeriodDay = true; }
      else if (cycleDay >= 5 && cycleDay < 12) cyclePhase = 'follicular';
      else if (cycleDay >= 12 && cycleDay < 16) cyclePhase = 'ovulation';
      else cyclePhase = 'luteal';

      addOvertimeRecord({
        id: generateId(),
        date: newRecord.date,
        hours: newRecord.hours,
        stressLevel: newRecord.stressLevel || 5,
        sleepHours: newRecord.sleepHours || 7,
        periodImpact: newRecord.periodImpact,
        dysmenorrheaLevel: newRecord.dysmenorrheaLevel || undefined,
        isPeriodDay,
        cyclePhase,
      } as OvertimeRecord);
      setShowAddModal(false);
      setNewRecord({
        date: new Date().toISOString().split('T')[0],
        hours: 2,
        stressLevel: 5,
        sleepHours: 7,
        dysmenorrheaLevel: 0,
      });
    }
  };

  const getStressLabel = (level: number) =>
    stressLevelLabels.find((s) => level >= s.min && level <= s.max) || stressLevelLabels[1];

  const getPainLabel = (level: number) =>
    painLevelLabels.find((p) => level >= p.min && level <= p.max) || painLevelLabels[0];

  const analysisTabs: { key: AnalysisTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'trend', label: '趋势联动', icon: TrendingUp },
    { key: 'phase', label: '周期阶段', icon: PieChart },
    { key: 'correlation', label: '交叉矩阵', icon: BarChart3 },
    { key: 'cause', label: '成因分析', icon: Brain },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lavender-400 to-purple-500 flex items-center justify-center shadow-lg shadow-lavender-200/50">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">职场期 · 健康看板</h1>
            <p className="text-gray-500">加班 · 压力 · 痛经 交叉关联分析</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-lavender-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-lavender-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">累计加班</p>
              <p className="text-2xl font-bold text-gray-800">{totalOvertimeHours}<span className="text-sm font-normal ml-0.5">h</span></p>
            </div>
          </div>
          <p className="text-xs text-gray-400">共 {overtimeRecords.length} 次记录</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">平均压力</p>
              <p className="text-2xl font-bold text-gray-800">{avgStressLevel}<span className="text-sm font-normal ml-0.5">/10</span></p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${Number(avgStressLevel) * 10}%`,
                background: getStressLabel(Number(avgStressLevel)).color,
              }}
            />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-mint-100 flex items-center justify-center">
              <Moon className="w-5 h-5 text-mint-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">平均睡眠</p>
              <p className="text-2xl font-bold text-gray-800">{avgSleepHours}<span className="text-sm font-normal ml-0.5">h</span></p>
            </div>
          </div>
          <p className="text-xs text-gray-400">建议每天7-8小时睡眠</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <Droplet className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">经期加班痛</p>
              <p className="text-2xl font-bold text-gray-800">{avgPeriodPain}<span className="text-sm font-normal ml-0.5">/10</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {highStressWithPain > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-medium">
                ⚠ {highStressWithPain}次高压+疼痛
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="card p-2 mb-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {analysisTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeAnalysisTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveAnalysisTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-gradient-to-r from-lavender-400 to-purple-500 text-white shadow-md'
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

      <div className="mb-8">
        {activeAnalysisTab === 'trend' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-lavender-500" />
                  加班时长 vs 压力趋势
                </h3>
                <LineChart
                  data={trendChartData}
                  color="#8b5cf6"
                  color2="#f59e0b"
                  legend1="加班时长(h)"
                  legend2="压力指数(÷2)"
                  yAxisMax={10}
                  height={220}
                />
                <p className="text-xs text-gray-400 mt-3">两条曲线的峰谷重合度越高，说明加班与压力关联性越强</p>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500" />
                  痛经等级 vs 压力趋势
                </h3>
                <LineChart
                  data={painTrendData}
                  color="#f43f5e"
                  color2="#8b5cf6"
                  legend1="痛经等级"
                  legend2="压力值"
                  yAxisMax={10}
                  height={220}
                />
                <p className="text-xs text-gray-400 mt-3">关注痛经高峰是否与高压加班日重合</p>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                数据联动说明
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 rounded-xl bg-gradient-to-br from-lavender-50 to-purple-50 border border-lavender-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-lavender-600" />
                    <span className="font-semibold text-gray-800">加班时长</span>
                  </div>
                  <p className="text-gray-600">超过 <strong>3小时</strong> 的加班会使身体皮质醇水平升高，干扰雌激素和孕激素的平衡节律。</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span className="font-semibold text-gray-800">压力值</span>
                  </div>
                  <p className="text-gray-600">压力 <strong>≥7</strong> 时，下丘脑-垂体-肾上腺轴激活，前列腺素F2α分泌增加，子宫收缩加强。</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span className="font-semibold text-gray-800">痛经反应</span>
                  </div>
                  <p className="text-gray-600">高压+经期+加班的三重叠加，会使疼痛体感放大 <strong>2-3倍</strong>，持续时间延长。</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeAnalysisTab === 'phase' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-violet-500" />
                  加班分布
                </h3>
                <DonutChart
                  data={donutData}
                  centerLabel="总加班"
                  centerValue={`${overtimeRecords.length}次`}
                  size={160}
                />
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-lavender-500" />
                  各阶段平均加班时长
                </h3>
                <BarChart data={phaseHoursBarData} height={220} maxValue={6} />
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  各阶段平均压力值
                </h3>
                <BarChart data={phaseStressBarData} height={220} maxValue={10} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500" />
                  各阶段平均痛经等级
                </h3>
                <BarChart data={phasePainBarData} height={220} maxValue={10} />
              </div>

              <div className="card p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-fuchsia-500" />
                  阶段特征解读
                </h3>
                {phaseAnalysis.map((p) => (
                  <div key={p.key} className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{p.icon}</span>
                        <span className="font-semibold text-gray-800">{p.name}</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: p.color }}>
                        {p.count}次
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-gray-400">加班</span>
                        <p className="font-medium text-gray-700">{p.avgHours}h/次</p>
                      </div>
                      <div>
                        <span className="text-gray-400">压力</span>
                        <p className="font-medium text-gray-700">{p.avgStress}/10</p>
                      </div>
                      <div>
                        <span className="text-gray-400">痛经</span>
                        <p className="font-medium text-gray-700">{p.avgPain || '—'}/10</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeAnalysisTab === 'correlation' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                压力×加班 矩阵分析
              </h3>
              <p className="text-sm text-gray-500 mb-6">四象限展示不同压力-加班组合下的平均痛经等级</p>

              <div className="grid grid-cols-2 gap-4">
                {correlationBuckets.map((bucket) => {
                  const painLabel = getPainLabel(bucket.avgPain);
                  const riskLevel = bucket.avgPain >= 7 ? '高风险' : bucket.avgPain >= 4 ? '中风险' : bucket.avgPain >= 1 ? '低风险' : '安全';
                  return (
                    <div
                      key={bucket.key}
                      className="p-5 rounded-2xl border-2 transition-all hover:shadow-lg"
                      style={{
                        borderColor: getBucketColor(bucket.key) + '40',
                        background: `linear-gradient(135deg, ${getBucketColor(bucket.key)}08 0%, white 100%)`,
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-gray-800">{getBucketLabel(bucket.key)}</h4>
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-medium text-white"
                          style={{ background: bucket.avgPain >= 7 ? '#ef4444' : bucket.avgPain >= 4 ? '#f59e0b' : '#10b981' }}
                        >
                          {riskLevel}
                        </span>
                      </div>
                      <div className="flex items-end gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-400">平均痛经</p>
                          <p className="text-3xl font-bold" style={{ color: painLabel.color }}>
                            {bucket.avgPain}
                            <span className="text-sm font-normal text-gray-400">/10</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">样本数</p>
                          <p className="text-xl font-bold text-gray-700">{bucket.count}</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${bucket.avgPain * 10}%`,
                            background: painLabel.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-500" />
                风险阈值速查
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">条件组合</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">风险等级</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">建议措施</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">压力≥7 且 加班≥3h 且 经期</td>
                      <td className="py-3 px-4"><span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">极高</span></td>
                      <td className="py-3 px-4 text-gray-600">务必提前请假休息，避免叠加</td>
                    </tr>
                    <tr className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">压力≥7 或 加班≥3h 且 经期</td>
                      <td className="py-3 px-4"><span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">高</span></td>
                      <td className="py-3 px-4 text-gray-600">缩短加班时长，增加休息间隔</td>
                    </tr>
                    <tr className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">压力5-6 或 加班1-2h 且 经期</td>
                      <td className="py-3 px-4"><span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">中</span></td>
                      <td className="py-3 px-4 text-gray-600">注意保暖，适时拉伸放松</td>
                    </tr>
                    <tr className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">压力≤4 且 无加班</td>
                      <td className="py-3 px-4"><span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">低</span></td>
                      <td className="py-3 px-4 text-gray-600">保持当前状态即可</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeAnalysisTab === 'cause' && (
          <div className="space-y-6">
            {causeAnalysis.map((insight, idx) => (
              <div
                key={idx}
                className={cn(
                  'card p-6 border-l-4 transition-shadow hover:shadow-lg',
                  insight.type === 'danger' && 'border-l-red-500',
                  insight.type === 'warning' && 'border-l-amber-500',
                  insight.type === 'info' && 'border-l-sky-500',
                  insight.type === 'good' && 'border-l-emerald-500'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl shrink-0">{insight.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{insight.title}</h3>
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          insight.type === 'danger' && 'bg-red-100 text-red-700',
                          insight.type === 'warning' && 'bg-amber-100 text-amber-700',
                          insight.type === 'info' && 'bg-sky-100 text-sky-700',
                          insight.type === 'good' && 'bg-emerald-100 text-emerald-700'
                        )}
                      >
                        {insight.type === 'danger' ? '高风险' : insight.type === 'warning' ? '需关注' : insight.type === 'info' ? '提示' : '良好'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{insight.description}</p>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-lavender-50/50 to-purple-50/50 border border-lavender-100/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-semibold text-gray-800">应对建议</span>
                      </div>
                      <ul className="space-y-1.5">
                        {insight.suggestions.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-purple-400 mt-0.5">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="card p-6 bg-gradient-to-br from-fuchsia-50 via-purple-50 to-sky-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Brain className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">医学原理 · 为什么加班会诱发痛经？</h3>
                  <p className="text-xs text-gray-500">基于妇科内分泌学的通俗解释</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-purple-600">① HPA轴激活 → 激素紊乱：</strong>
                  加班压力使下丘脑-垂体-肾上腺轴（HPA轴）持续兴奋，皮质醇水平长期偏高。
                  高皮质醇会"压制"孕激素的分泌，破坏雌激素-孕激素平衡，使经期前列腺素F2α（PGF2α）过度合成。
                </p>
                <p>
                  <strong className="text-rose-600">② PGF2α → 子宫痉挛：</strong>
                  PGF2α是引起痛经的"元凶"。它负责在经期刺激子宫平滑肌收缩以排出经血。
                  当其合成过量时，子宫平滑肌会产生<strong>缺血缺氧性痉挛收缩</strong>，表现为剧烈绞痛。
                </p>
                <p>
                  <strong className="text-amber-600">③ 睡眠剥夺 → 痛阈降低：</strong>
                  加班挤占睡眠时间，大脑内啡肽（天然止痛药）分泌减少，而炎症因子（IL-6、TNF-α）水平升高。
                  这会让你对同样的子宫收缩<strong>感觉更痛</strong>，持续时间更长。
                </p>
                <p>
                  <strong className="text-emerald-600">④ 恶性循环 → 症状放大：</strong>
                  疼痛→焦虑→工作效率下降→被迫加班→压力更高→疼痛更重。
                  打破循环的关键是<strong>在经前期主动降负荷</strong>，而不是等疼到受不了才处理。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-lavender-500" />
                加班记录
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-lavender-400 to-purple-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                添加记录
              </button>
            </div>

            {overtimeRecords.length > 0 ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {overtimeRecords.map((record) => {
                  const stressInfo = getStressLabel(record.stressLevel);
                  const painLevel = record.dysmenorrheaLevel || 0;
                  const painInfo = getPainLabel(painLevel);
                  return (
                    <div
                      key={record.id}
                      className={cn(
                        'p-4 rounded-xl border hover:shadow-md transition-all',
                        record.isPeriodDay
                          ? 'bg-gradient-to-r from-rose-50 to-pink-50 border-rose-100'
                          : 'bg-gradient-to-r from-lavender-50 to-purple-50 border-lavender-100'
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{record.date}</span>
                          {record.cyclePhase && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                              style={{ background: cyclePhaseLabels[record.cyclePhase].color }}
                            >
                              {cyclePhaseLabels[record.cyclePhase].icon} {cyclePhaseLabels[record.cyclePhase].name}
                            </span>
                          )}
                        </div>
                        <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-lavender-600 shadow-sm">
                          加班 {record.hours} h
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Zap className="w-3.5 h-3.5" style={{ color: stressInfo.color }} />
                            <span className="text-gray-500 text-xs">压力</span>
                          </div>
                          <p className="font-medium" style={{ color: stressInfo.color }}>
                            {record.stressLevel}/10 · {stressInfo.label}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Moon className="w-3.5 h-3.5 text-mint-600" />
                            <span className="text-gray-500 text-xs">睡眠</span>
                          </div>
                          <p className="font-medium text-mint-600">{record.sleepHours}h</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Heart className="w-3.5 h-3.5" style={{ color: painInfo.color }} />
                            <span className="text-gray-500 text-xs">痛经</span>
                          </div>
                          <p className="font-medium" style={{ color: painInfo.color }}>
                            {painLevel > 0 ? `${painLevel}/10 · ${painInfo.label}` : '无'}
                          </p>
                        </div>
                      </div>
                      {record.periodImpact && (
                        <div className="mt-3 pt-3 border-t border-rose-100/50">
                          <p className="text-sm text-rose-500 flex items-start gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            {record.periodImpact}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Coffee className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无加班记录</p>
                <p className="text-sm">记得好好休息哦~</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 bg-gradient-to-br from-lavender-50 to-purple-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <Target className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="font-bold text-gray-800">本周健康目标</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">不加班天数</span>
                  <span className="font-medium text-purple-600">3/5</span>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <div className="bg-gradient-to-r from-lavender-400 to-purple-500 h-2 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">经期加班≤1h</span>
                  <span className="font-medium text-rose-500">1/2</span>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <div className="bg-gradient-to-r from-rose-400 to-pink-500 h-2 rounded-full" style={{ width: '50%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">运动时长</span>
                  <span className="font-medium text-emerald-600">2/3次</span>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <div className="bg-gradient-to-r from-mint-400 to-emerald-500 h-2 rounded-full" style={{ width: '66%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">💡</span>
              <h3 className="font-bold text-gray-800">加班后急救方案</h3>
            </div>
            <ul className="space-y-2">
              {[
                { icon: '🛁', text: '40°C温水泡脚15分钟，加速盆腔血液循环' },
                { icon: '🍵', text: '生姜红糖水/玫瑰花茶，温经散寒' },
                { icon: '🧘', text: '猫牛式瑜伽10组，缓解子宫痉挛' },
                { icon: '😴', text: '20分钟正念冥想，降低皮质醇' },
                { icon: '🍫', text: '一小块黑巧克力(70%+)，促进内啡肽' },
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">添加加班记录</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">日期</label>
                <input
                  type="date"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">加班时长 (小时)</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={newRecord.hours}
                  onChange={(e) => setNewRecord({ ...newRecord, hours: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  压力等级: {newRecord.stressLevel}/10
                  <span className="ml-2 text-xs font-normal" style={{ color: getStressLabel(newRecord.stressLevel || 5).color }}>
                    · {getStressLabel(newRecord.stressLevel || 5).label}
                  </span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newRecord.stressLevel}
                  onChange={(e) => setNewRecord({ ...newRecord, stressLevel: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>轻松</span>
                  <span>中等</span>
                  <span>较高</span>
                  <span>过载</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">睡眠时长 (小时)</label>
                <input
                  type="number"
                  min={0}
                  max={12}
                  step={0.5}
                  value={newRecord.sleepHours}
                  onChange={(e) => setNewRecord({ ...newRecord, sleepHours: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  痛经等级: {newRecord.dysmenorrheaLevel || 0}/10
                  {newRecord.dysmenorrheaLevel && newRecord.dysmenorrheaLevel > 0 && (
                    <span className="ml-2 text-xs font-normal" style={{ color: getPainLabel(newRecord.dysmenorrheaLevel).color }}>
                      · {getPainLabel(newRecord.dysmenorrheaLevel).label}
                    </span>
                  )}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={newRecord.dysmenorrheaLevel || 0}
                  onChange={(e) => setNewRecord({ ...newRecord, dysmenorrheaLevel: Number(e.target.value) })}
                  className="w-full accent-rose-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>无痛</span>
                  <span>轻度</span>
                  <span>中度</span>
                  <span>剧痛</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">对经期影响 (可选)</label>
                <input
                  type="text"
                  value={newRecord.periodImpact || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, periodImpact: e.target.value })}
                  placeholder="如：经期推迟、痛经加重等"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleAddRecord}
                  className="flex-1 bg-gradient-to-r from-lavender-400 to-purple-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
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
