import { useState, useMemo } from 'react';
import {
  Plus,
  X,
  Activity,
  FileText,
  AlertCircle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Pill,
  Stethoscope,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import HormoneTrendChart from './HormoneTrendChart';
import type {
  HormoneRecord,
  HormonePhase,
  HormoneIndicator,
  HormoneReferenceRange,
  HormoneInterpretation,
  HormoneAnalysisReport,
  HormoneTrendPoint,
} from '@/types';

interface HormoneLabTrackerProps {
  records: HormoneRecord[];
  onAddRecord: (record: HormoneRecord) => void;
}

const phaseLabels: Record<HormonePhase, string> = {
  follicular: '卵泡期',
  ovulatory: '排卵期',
  luteal: '黄体期',
  perimenopausal: '围绝经期',
  postmenopausal: '绝经后',
  pregnancy: '妊娠期',
  postpartum: '产后',
};

const phaseColors: Record<HormonePhase, string> = {
  follicular: 'from-cyan-400 to-sky-500',
  ovulatory: 'from-pink-400 to-rose-500',
  luteal: 'from-violet-400 to-purple-500',
  perimenopausal: 'from-amber-400 to-orange-500',
  postmenopausal: 'from-slate-400 to-gray-500',
  pregnancy: 'from-emerald-400 to-teal-500',
  postpartum: 'from-rose-400 to-pink-500',
};

const indicatorMeta: Record<
  HormoneIndicator,
  { name: string; shortName: string; unit: string; field: keyof HormoneRecord; color: string }
> = {
  estradiol: { name: '雌二醇', shortName: 'E2', unit: 'pg/mL', field: 'estrogenLevel', color: '#ec4899' },
  progesterone: { name: '孕酮', shortName: 'P', unit: 'ng/mL', field: 'progesteroneLevel', color: '#8b5cf6' },
  fsh: { name: '促卵泡激素', shortName: 'FSH', unit: 'mIU/mL', field: 'fshLevel', color: '#f59e0b' },
  lh: { name: '促黄体生成素', shortName: 'LH', unit: 'mIU/mL', field: 'lhLevel', color: '#06b6d4' },
  testosterone: { name: '睾酮', shortName: 'T', unit: 'ng/dL', field: 'testosteroneLevel', color: '#ef4444' },
  prolactin: { name: '泌乳素', shortName: 'PRL', unit: 'ng/mL', field: 'prolactinLevel', color: '#10b981' },
  amh: { name: '抗缪勒管激素', shortName: 'AMH', unit: 'ng/mL', field: 'amhLevel', color: '#6366f1' },
  tsh: { name: '促甲状腺激素', shortName: 'TSH', unit: 'mIU/L', field: 'tshLevel', color: '#14b8a6' },
  ft3: { name: '游离T3', shortName: 'FT3', unit: 'pg/mL', field: 'ft3Level', color: '#f97316' },
  ft4: { name: '游离T4', shortName: 'FT4', unit: 'ng/dL', field: 'ft4Level', color: '#84cc16' },
  dhea: { name: '脱氢表雄酮', shortName: 'DHEA', unit: 'μg/dL', field: 'dheaLevel', color: '#a855f7' },
  cortisol: { name: '皮质醇', shortName: 'Cortisol', unit: 'μg/dL', field: 'cortisolLevel', color: '#0ea5e9' },
};

const defaultReferenceRanges: HormoneReferenceRange[] = [
  { indicator: 'estradiol', indicatorName: '雌二醇', unit: 'pg/mL', phase: 'follicular', min: 20, max: 150, optimalMin: 30, optimalMax: 100 },
  { indicator: 'estradiol', indicatorName: '雌二醇', unit: 'pg/mL', phase: 'ovulatory', min: 100, max: 500, optimalMin: 150, optimalMax: 350 },
  { indicator: 'estradiol', indicatorName: '雌二醇', unit: 'pg/mL', phase: 'luteal', min: 50, max: 250, optimalMin: 80, optimalMax: 180 },
  { indicator: 'estradiol', indicatorName: '雌二醇', unit: 'pg/mL', phase: 'perimenopausal', min: 20, max: 200 },
  { indicator: 'estradiol', indicatorName: '雌二醇', unit: 'pg/mL', phase: 'postmenopausal', min: 0, max: 30 },
  { indicator: 'progesterone', indicatorName: '孕酮', unit: 'ng/mL', phase: 'follicular', min: 0.2, max: 1.5 },
  { indicator: 'progesterone', indicatorName: '孕酮', unit: 'ng/mL', phase: 'ovulatory', min: 1.5, max: 5 },
  { indicator: 'progesterone', indicatorName: '孕酮', unit: 'ng/mL', phase: 'luteal', min: 5, max: 30, optimalMin: 10, optimalMax: 25 },
  { indicator: 'progesterone', indicatorName: '孕酮', unit: 'ng/mL', phase: 'postmenopausal', min: 0.1, max: 0.8 },
  { indicator: 'fsh', indicatorName: '促卵泡激素', unit: 'mIU/mL', phase: 'follicular', min: 3.5, max: 12.5 },
  { indicator: 'fsh', indicatorName: '促卵泡激素', unit: 'mIU/mL', phase: 'ovulatory', min: 4.7, max: 21.5 },
  { indicator: 'fsh', indicatorName: '促卵泡激素', unit: 'mIU/mL', phase: 'luteal', min: 1.7, max: 7.7 },
  { indicator: 'fsh', indicatorName: '促卵泡激素', unit: 'mIU/mL', phase: 'perimenopausal', min: 10, max: 40 },
  { indicator: 'fsh', indicatorName: '促卵泡激素', unit: 'mIU/mL', phase: 'postmenopausal', min: 25.8, max: 134.8 },
  { indicator: 'lh', indicatorName: '促黄体生成素', unit: 'mIU/mL', phase: 'follicular', min: 2.4, max: 12.6 },
  { indicator: 'lh', indicatorName: '促黄体生成素', unit: 'mIU/mL', phase: 'ovulatory', min: 14, max: 95.6 },
  { indicator: 'lh', indicatorName: '促黄体生成素', unit: 'mIU/mL', phase: 'luteal', min: 1, max: 11.4 },
  { indicator: 'lh', indicatorName: '促黄体生成素', unit: 'mIU/mL', phase: 'postmenopausal', min: 7.7, max: 58.5 },
  { indicator: 'testosterone', indicatorName: '睾酮', unit: 'ng/dL', phase: 'general', min: 15, max: 70 },
  { indicator: 'prolactin', indicatorName: '泌乳素', unit: 'ng/mL', phase: 'general', min: 2, max: 25 },
  { indicator: 'amh', indicatorName: '抗缪勒管激素', unit: 'ng/mL', phase: 'general', min: 0.1, max: 10, optimalMin: 1, optimalMax: 4 },
  { indicator: 'tsh', indicatorName: '促甲状腺激素', unit: 'mIU/L', phase: 'general', min: 0.4, max: 4.5, optimalMin: 0.5, optimalMax: 2.5 },
  { indicator: 'ft3', indicatorName: '游离T3', unit: 'pg/mL', phase: 'general', min: 2, max: 4.4 },
  { indicator: 'ft4', indicatorName: '游离T4', unit: 'ng/dL', phase: 'general', min: 0.8, max: 1.8 },
  { indicator: 'dhea', indicatorName: '脱氢表雄酮', unit: 'μg/dL', phase: 'general', min: 30, max: 500 },
  { indicator: 'cortisol', indicatorName: '皮质醇', unit: 'μg/dL', phase: 'general', min: 6, max: 23 },
];

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function HormoneLabTracker({ records, onAddRecord }: HormoneLabTrackerProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<HormonePhase>('follicular');
  const [formValues, setFormValues] = useState<Partial<Record<HormoneIndicator, number | ''>>>({});
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [hospital, setHospital] = useState('');
  const [notes, setNotes] = useState('');
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());

  const availableIndicators: HormoneIndicator[] = [
    'estradiol',
    'progesterone',
    'fsh',
    'lh',
    'testosterone',
    'prolactin',
    'amh',
    'tsh',
    'ft3',
    'ft4',
    'dhea',
    'cortisol',
  ];

  const trendData: HormoneTrendPoint[] = useMemo(() => {
    return [...records]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((record) => ({
        date: record.date,
        phase: record.phase,
        values: {
          estradiol: record.estrogenLevel,
          progesterone: record.progesteroneLevel,
          fsh: record.fshLevel,
          lh: record.lhLevel,
          testosterone: record.testosteroneLevel,
          prolactin: record.prolactinLevel,
          amh: record.amhLevel,
          tsh: record.tshLevel,
          ft3: record.ft3Level,
          ft4: record.ft4Level,
          dhea: record.dheaLevel,
          cortisol: record.cortisolLevel,
        },
      }));
  }, [records]);

  const latestRecord = useMemo(() => {
    if (records.length === 0) return null;
    return [...records].sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [records]);

  const getReferenceRange = (indicator: HormoneIndicator, phase: HormonePhase) => {
    return (
      defaultReferenceRanges.find((r) => r.indicator === indicator && r.phase === phase) ||
      defaultReferenceRanges.find((r) => r.indicator === indicator && r.phase === 'general')
    );
  };

  const getInterpretation = (
    indicator: HormoneIndicator,
    value: number,
    phase: HormonePhase
  ): HormoneInterpretation | null => {
    const range = getReferenceRange(indicator, phase);
    if (!range) return null;

    const meta = indicatorMeta[indicator];
    let status: 'low' | 'normal' | 'high' | 'critical' = 'normal';
    let description = '';
    let possibleCauses: string[] = [];
    let recommendations: string[] = [];

    if (value < range.min) {
      status = value < range.min * 0.5 ? 'critical' : 'low';
    } else if (value > range.max) {
      status = value > range.max * 2 ? 'critical' : 'high';
    }

    if (indicator === 'estradiol') {
      if (status === 'low') {
        description = '雌二醇水平偏低';
        possibleCauses = ['卵巢功能减退', '围绝经期', '过度运动', '营养不良', '垂体功能减退'];
        recommendations = ['保证充足睡眠', '均衡饮食，摄入健康脂肪', '减轻压力', '咨询妇科内分泌医生'];
      } else if (status === 'high') {
        description = '雌二醇水平偏高';
        possibleCauses = ['卵巢囊肿', '雌激素分泌肿瘤', '外源性雌激素摄入', '性早熟'];
        recommendations = ['进一步检查明确原因', '减少豆制品等植物雌激素摄入', '定期复查监测'];
      } else {
        description = '雌二醇水平正常';
        recommendations = ['保持规律作息', '继续健康生活方式', '定期监测'];
      }
    } else if (indicator === 'progesterone') {
      if (status === 'low' && phase === 'luteal') {
        description = '黄体期孕酮水平偏低，可能提示黄体功能不足';
        possibleCauses = ['黄体功能不全', '排卵障碍', '高泌乳素血症', '甲状腺功能异常'];
        recommendations = ['黄体期补充孕酮（需医生指导）', '改善睡眠质量', '补充维生素B6'];
      } else if (status === 'normal') {
        description = '孕酮水平正常';
        recommendations = ['继续保持健康生活方式', '定期监测'];
      }
    } else if (indicator === 'fsh') {
      if (status === 'high') {
        description = 'FSH水平升高，提示卵巢储备功能下降';
        possibleCauses = ['卵巢功能衰退', '围绝经期', '卵巢早衰', '先天性性腺发育不全'];
        recommendations = ['评估卵巢储备功能', 'AMH检查', '咨询生殖内分泌医生', '保持健康生活方式'];
      } else if (status === 'low') {
        description = 'FSH水平偏低';
        possibleCauses = ['下丘脑-垂体功能障碍', '多囊卵巢综合征', '妊娠', '肥胖'];
        recommendations = ['进一步检查垂体功能', '体重管理', '规律作息'];
      } else {
        description = 'FSH水平正常';
        recommendations = ['定期监测卵巢功能', '保持健康生活方式'];
      }
    } else if (indicator === 'lh') {
      if (status === 'high') {
        description = 'LH水平升高';
        possibleCauses = ['排卵期高峰', '多囊卵巢综合征', '卵巢功能衰退', '先天性性腺发育不全'];
        recommendations = ['结合月经周期分析', 'B超检查卵巢情况', '进一步性激素检查'];
      } else {
        description = 'LH水平正常';
        recommendations = ['定期监测'];
      }
    } else if (indicator === 'amh') {
      if (status === 'low') {
        description = 'AMH水平偏低，提示卵巢储备功能下降';
        possibleCauses = ['年龄增长', '卵巢早衰', '化疗/放疗后', '遗传因素'];
        recommendations = ['尽早规划生育计划', '咨询生殖科医生', '保持健康生活方式，戒烟限酒'];
      } else if (status === 'high') {
        description = 'AMH水平偏高，可能与多囊卵巢综合征相关';
        possibleCauses = ['多囊卵巢综合征', '卵巢颗粒细胞瘤'];
        recommendations = ['B超检查卵巢形态', '结合月经情况分析', '内分泌科就诊'];
      } else {
        description = 'AMH水平正常';
        recommendations = ['定期监测卵巢储备', '保持健康生活方式'];
      }
    } else if (indicator === 'tsh') {
      if (status === 'high') {
        description = 'TSH水平升高，提示甲状腺功能减退可能';
        possibleCauses = ['桥本甲状腺炎', '碘缺乏', '甲状腺术后', '药物影响'];
        recommendations = ['复查甲状腺功能全套', '内分泌科就诊', '必要时甲状腺素替代治疗'];
      } else if (status === 'low') {
        description = 'TSH水平降低，提示甲状腺功能亢进可能';
        possibleCauses = ['Graves病', '甲状腺结节自主分泌', '甲状腺炎早期', '药物影响'];
        recommendations = ['复查甲状腺功能及抗体', '甲状腺B超', '内分泌科就诊'];
      } else {
        description = 'TSH水平正常';
        recommendations = ['定期监测甲状腺功能', '保持适量碘摄入'];
      }
    } else {
      if (status === 'low') {
        description = `${meta.name}水平偏低`;
        possibleCauses = ['内分泌功能异常', '营养因素', '药物影响'];
        recommendations = ['进一步检查明确原因', '咨询专科医生', '定期复查'];
      } else if (status === 'high') {
        description = `${meta.name}水平偏高`;
        possibleCauses = ['内分泌功能异常', '疾病因素', '药物影响'];
        recommendations = ['进一步检查明确原因', '咨询专科医生', '定期复查监测'];
      } else {
        description = `${meta.name}水平正常`;
        recommendations = ['保持健康生活方式', '定期监测'];
      }
    }

    return {
      indicator,
      indicatorName: meta.name,
      value,
      unit: meta.unit,
      status,
      phase,
      description,
      possibleCauses,
      recommendations,
    };
  };

  const analysisReport = useMemo((): HormoneAnalysisReport | null => {
    if (!latestRecord) return null;

    const interpretations: HormoneInterpretation[] = [];
    let abnormalCount = 0;
    let criticalCount = 0;

    (Object.keys(indicatorMeta) as HormoneIndicator[]).forEach((indicator) => {
      const field = indicatorMeta[indicator].field;
      const value = latestRecord[field] as number | undefined;
      if (value !== undefined && value !== null) {
        const interpretation = getInterpretation(indicator, value, latestRecord.phase);
        if (interpretation) {
          interpretations.push(interpretation);
          if (interpretation.status !== 'normal') abnormalCount++;
          if (interpretation.status === 'critical') criticalCount++;
        }
      }
    });

    let overallStatus: 'normal' | 'monitor' | 'attention' = 'normal';
    if (criticalCount > 0) {
      overallStatus = 'attention';
    } else if (abnormalCount > 0) {
      overallStatus = 'monitor';
    }

    const keyInsights: { type: 'warning' | 'info' | 'good'; title: string; description: string }[] = [];

    const fshRecord = latestRecord.fshLevel;
    const amhRecord = latestRecord.amhLevel;
    if (fshRecord !== undefined && fshRecord > 25) {
      keyInsights.push({
        type: 'warning',
        title: '卵巢储备功能下降',
        description: `FSH ${fshRecord} mIU/mL，结合${latestRecord.phase === 'perimenopausal' ? '围绝经期' : '当前阶段'}，提示卵巢功能减退趋势`,
      });
    }
    if (amhRecord !== undefined && amhRecord < 1) {
      keyInsights.push({
        type: 'warning',
        title: '低卵巢储备',
        description: `AMH ${amhRecord} ng/mL，卵巢储备功能偏低，建议咨询生殖内分泌科`,
      });
    }

    const estrogenRecord = latestRecord.estrogenLevel;
    const progesteroneRecord = latestRecord.progesteroneLevel;
    if (
      latestRecord.phase === 'luteal' &&
      estrogenRecord !== undefined &&
      progesteroneRecord !== undefined &&
      progesteroneRecord < 5
    ) {
      keyInsights.push({
        type: 'info',
        title: '黄体期孕酮偏低',
        description: '黄体期孕酮水平不足可能影响月经周期和受孕能力',
      });
    }

    const tshRecord = latestRecord.tshLevel;
    if (tshRecord !== undefined && (tshRecord < 0.4 || tshRecord > 4.5)) {
      keyInsights.push({
        type: 'warning',
        title: '甲状腺功能异常',
        description: 'TSH异常提示甲状腺功能可能存在问题，建议内分泌科进一步检查',
      });
    }

    if (keyInsights.length === 0) {
      keyInsights.push({
        type: 'good',
        title: '激素水平基本稳定',
        description: '主要激素指标均在正常范围内，继续保持健康生活方式',
      });
    }

    const phaseContextMap: Record<HormonePhase, string> = {
      follicular: '卵泡期是月经周期的前半段，雌激素逐渐升高，卵泡发育成熟。此阶段FSH和雌激素是评估卵巢功能的重要指标。',
      ovulatory: '排卵期是受孕窗口期，LH峰触发排卵，雌激素达到高峰。此阶段性激素水平波动较大，检查结果需结合周期分析。',
      luteal: '黄体期排卵后形成黄体，分泌孕酮使子宫内膜增厚。孕酮水平是评估黄体功能的关键指标。',
      perimenopausal: '围绝经期卵巢功能逐渐衰退，FSH升高、雌激素波动下降，可出现月经紊乱、潮热等症状。',
      postmenopausal: '绝经后卵巢功能衰竭，雌激素显著降低，FSH持续升高，需要关注骨健康和心血管健康。',
      pregnancy: '妊娠期激素水平发生显著变化，HCG、孕酮、雌激素等持续升高，维持妊娠正常进行。',
      postpartum: '产后激素水平快速变化，雌激素、孕激素急剧下降，可能影响情绪和身体恢复。',
    };

    const nextSteps: string[] = [
      '建议下次月经第2-4天复查基础性激素',
      '保持规律作息，避免熬夜和过度劳累',
      '均衡饮食，适量运动，保持健康体重',
      '如有不适症状，及时妇科内分泌科就诊',
    ];

    return {
      date: latestRecord.date,
      phase: latestRecord.phase,
      overallStatus,
      interpretations,
      keyInsights,
      phaseContext: phaseContextMap[latestRecord.phase],
      nextSteps,
    };
  }, [latestRecord]);

  const handleSubmit = () => {
    const recordData: HormoneRecord = {
      id: generateId(),
      date: testDate,
      phase: selectedPhase,
      hospital: hospital || undefined,
      notes: notes || undefined,
    };

    (Object.keys(formValues) as HormoneIndicator[]).forEach((indicator) => {
      const value = formValues[indicator];
      if (value !== '' && value !== undefined) {
        const field = indicatorMeta[indicator].field;
        (recordData as any)[field] = Number(value);
      }
    });

    onAddRecord(recordData);
    setShowModal(false);
    setFormValues({});
    setTestDate(new Date().toISOString().split('T')[0]);
    setHospital('');
    setNotes('');
    setSelectedPhase('follicular');
  };

  const toggleRecordExpand = (id: string) => {
    setExpandedRecords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'high':
      case 'low':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      default:
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'critical':
        return '异常';
      case 'high':
        return '偏高';
      case 'low':
        return '偏低';
      default:
        return '正常';
    }
  };

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => b.date.localeCompare(a.date)),
    [records]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="w-6 h-6 text-fuchsia-500" />
            激素化验追踪
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            记录激素化验结果，跟踪变化趋势，获取智能解读
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-fuchsia-400 via-pink-400 to-rose-400 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          录入化验
        </button>
      </div>

      <HormoneTrendChart
        data={trendData}
        indicators={availableIndicators}
        referenceRanges={defaultReferenceRanges}
        height={320}
      />

      {analysisReport && (
        <div className="card p-6 bg-gradient-to-br from-violet-50/50 to-fuchsia-50/50">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-500" />
                智能分析报告
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                基于最新化验结果 · {analysisReport.date} · {phaseLabels[analysisReport.phase]}
              </p>
            </div>
            <span
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium border',
                analysisReport.overallStatus === 'normal'
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : analysisReport.overallStatus === 'monitor'
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : 'bg-rose-50 text-rose-600 border-rose-200'
              )}
            >
              {analysisReport.overallStatus === 'normal'
                ? '✓ 基本正常'
                : analysisReport.overallStatus === 'monitor'
                ? '⚠ 需关注'
                : '⚡ 需重视'}
            </span>
          </div>

          {analysisReport.keyInsights.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {analysisReport.keyInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'p-4 rounded-xl border',
                    insight.type === 'good'
                      ? 'bg-emerald-50/80 border-emerald-200/50'
                      : insight.type === 'warning'
                      ? 'bg-rose-50/80 border-rose-200/50'
                      : 'bg-sky-50/80 border-sky-200/50'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">
                      {insight.type === 'good'
                        ? '✨'
                        : insight.type === 'warning'
                        ? '⚠️'
                        : '💡'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{insight.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mb-6 p-4 bg-white/60 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-gray-700">阶段解读</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {analysisReport.phaseContext}
            </p>
          </div>

          {analysisReport.interpretations.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-bold text-gray-700 mb-3">各指标详细解读</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysisReport.interpretations.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white/70 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: indicatorMeta[item.indicator].color }}
                        />
                        <span className="font-medium text-gray-800 text-sm">
                          {item.indicatorName}
                        </span>
                      </div>
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full border',
                          getStatusColor(item.status)
                        )}
                      >
                        {getStatusText(item.status)}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-xl font-bold text-gray-800">{item.value}</span>
                      <span className="text-xs text-gray-500">{item.unit}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                    <div className="text-xs text-gray-500">
                      <p className="font-medium text-gray-600 mb-1">可能原因：</p>
                      <p>{item.possibleCauses.slice(0, 3).join('、')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl border border-violet-100">
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-medium text-gray-700">建议与注意事项</span>
            </div>
            <ul className="space-y-1">
              {analysisReport.nextSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-violet-400 mt-0.5">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-500" />
            历史记录
          </h3>
          <span className="text-sm text-gray-500">共 {records.length} 条</span>
        </div>

        {sortedRecords.length > 0 ? (
          <div className="space-y-3">
            {sortedRecords.map((record) => {
              const isExpanded = expandedRecords.has(record.id);
              const values: { indicator: HormoneIndicator; value: number; field: string }[] = [];

              (Object.keys(indicatorMeta) as HormoneIndicator[]).forEach((ind) => {
                const field = indicatorMeta[ind].field;
                const val = record[field] as number | undefined;
                if (val !== undefined && val !== null) {
                  values.push({ indicator: ind, value: val, field });
                }
              });

              return (
                <div
                  key={record.id}
                  className="border border-gray-100 rounded-xl overflow-hidden bg-white"
                >
                  <button
                    onClick={() => toggleRecordExpand(record.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold',
                          phaseColors[record.phase]
                        )}
                      >
                        {record.date.split('-')[2]}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-800">{record.date}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded-full text-white bg-gradient-to-r',
                              phaseColors[record.phase]
                            )}
                          >
                            {phaseLabels[record.phase]}
                          </span>
                          {record.hospital && (
                            <span className="text-xs text-gray-400">{record.hospital}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-wrap gap-1.5 justify-end max-w-xs">
                        {values.slice(0, 4).map(({ indicator, value }) => (
                          <span
                            key={indicator}
                            className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                          >
                            {indicatorMeta[indicator].shortName}: {value}
                          </span>
                        ))}
                        {values.length > 4 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                            +{values.length - 4}
                          </span>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/50">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                        {values.map(({ indicator, value }) => {
                          const range = getReferenceRange(indicator, record.phase);
                          const meta = indicatorMeta[indicator];
                          const interp = getInterpretation(indicator, value, record.phase);
                          const status = interp?.status || 'normal';

                          return (
                            <div
                              key={indicator}
                              className="p-3 rounded-lg bg-white border border-gray-100"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-500">{meta.name}</span>
                                <span
                                  className={cn(
                                    'text-xs px-1.5 py-0.5 rounded',
                                    status === 'normal'
                                      ? 'bg-emerald-100 text-emerald-600'
                                      : status === 'critical'
                                      ? 'bg-rose-100 text-rose-600'
                                      : 'bg-amber-100 text-amber-600'
                                  )}
                                >
                                  {getStatusText(status)}
                                </span>
                              </div>
                              <p className="text-lg font-bold text-gray-800">
                                {value}
                                <span className="text-xs font-normal text-gray-400 ml-1">
                                  {meta.unit}
                                </span>
                              </p>
                              {range && (
                                <p className="text-xs text-gray-400 mt-1">
                                  参考: {range.min}-{range.max}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {record.notes && (
                        <div className="p-3 bg-white rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">备注</p>
                          <p className="text-sm text-gray-600">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">暂无激素化验记录</p>
            <p className="text-xs mt-1">点击右上角按钮录入首次化验结果</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">录入激素化验结果</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">化验日期</label>
                  <input
                    type="date"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">检查医院</label>
                  <input
                    type="text"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    placeholder="如: 市妇幼保健院"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">所处周期阶段</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {(Object.keys(phaseLabels) as HormonePhase[]).map((phase) => (
                    <button
                      key={phase}
                      onClick={() => setSelectedPhase(phase)}
                      className={cn(
                        'p-2.5 rounded-xl text-center transition-all text-sm',
                        selectedPhase === phase
                          ? cn(
                              'bg-gradient-to-r text-white shadow-md',
                              phaseColors[phase]
                            )
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      {phaseLabels[phase]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">激素指标</label>
                <p className="text-xs text-gray-400 mb-3">填入已知指标数值，留空表示未检测</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableIndicators.map((indicator) => {
                    const meta = indicatorMeta[indicator];
                    const range = getReferenceRange(indicator, selectedPhase);
                    return (
                      <div key={indicator} className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: meta.color }}
                          />
                          <span className="text-sm font-medium text-gray-700">{meta.name}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                          <input
                            type="number"
                            value={formValues[indicator] ?? ''}
                            onChange={(e) =>
                              setFormValues((prev) => ({
                                ...prev,
                                [indicator]: e.target.value ? Number(e.target.value) : '',
                              }))
                            }
                            placeholder="数值"
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-100 outline-none transition-all"
                          />
                          <span className="text-xs text-gray-400 w-12">{meta.unit}</span>
                        </div>
                        {range && (
                          <p className="text-xs text-gray-400">
                            参考: {range.min}-{range.max}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">备注 (可选)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="医生建议、注意事项等..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-fuchsia-400 via-pink-400 to-rose-400 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  保存记录
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
