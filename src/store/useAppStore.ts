import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AppState,
  PeriodRecord,
  OvertimeRecord,
  OvulationRecord,
  PrenatalCheckup,
  MoodRecord,
  HotFlashRecord,
  SleepRecord,
  HormoneRecord,
  LifeStage,
  CycleData,
  PregnancyData,
  PostpartumData,
  PelvicFloorRecord,
  LochiaRecord,
  BreastfeedingRecord,
  PostpartumCheckup,
  CycleStatistics,
  PredictionResult,
  CalendarDayInfo,
  MedicationReminder,
  MedicationRecord,
  MedicationCategory,
  PainRecord,
  CyclePhase,
  SleepCycleAssociation,
  PhaseSleepStatistics,
  SleepImpactAnalysis,
  SleepRecommendation,
  FamilyMember,
  ShareCode,
  PermissionConfig,
  FamilyRelation,
  MaskedHealthData,
  DailyNutritionSummary,
  NutrientGapItem,
  RehabPlan,
  RehabCheckin,
  RehabPhase,
  RehabPhaseType,
  RehabExercise,
  RehabBodyMetric,
  RehabMilestone,
  RehabWeeklyGoal,
  ConceptionProbability,
  VisitRecord,
  TestReport,
  TemperatureRecord,
  TemperatureAnomalyAlert,
  BluetoothDeviceInfo,
  TemperatureStatistics,
  MigrationMappingSet,
  MigrationFieldMapping,
  MigrationPreview,
  MigrationResult,
} from '@/types';
import { useNutritionStore } from '@/store/useNutritionStore';
import {
  generateMockTemperatureRecords,
  detectTemperatureAnomalies as detectAnomalies,
  calculateTemperatureStatistics,
  generateTemperatureTrend,
  mergeRecords,
  syncTemperatureToOvulation,
} from '@/services/temperatureImport';

const generateId = () => Math.random().toString(36).substr(2, 9);

const dateStr = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const diffDays = (a: Date, b: Date) =>
  Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));

const today = new Date();
const lastPeriod = addDays(today, -5);

const buildInitialPeriodStartDates = () => {
  const starts: string[] = [];
  const base = addDays(lastPeriod, -28 * 5);
  for (let i = 0; i < 6; i++) {
    const offset = [0, 27, 56, 85, 113, 141][i];
    starts.push(dateStr(addDays(base, offset)));
  }
  return starts;
};

const initialStartDates = buildInitialPeriodStartDates();

const initialCycleData: CycleData = {
  cycleLength: 28,
  periodLength: 5,
  firstPeriodDate: initialStartDates[0],
  lastPeriodDate: initialStartDates[initialStartDates.length - 1],
  periodStartDates: initialStartDates,
  records: [
    {
      id: generateId(),
      date: initialStartDates[initialStartDates.length - 1],
      flow: 'medium',
      symptoms: ['轻微腹痛'],
      mood: '平静',
    },
    {
      id: generateId(),
      date: dateStr(addDays(new Date(initialStartDates[initialStartDates.length - 1]), 1)),
      flow: 'medium',
      symptoms: ['腰酸'],
      mood: '平静',
    },
  ],
};

const initialPregnancyData: PregnancyData = {
  lastMenstrualPeriodDate: '',
  manualWeek: null,
};

const initialPostpartumData: PostpartumData = {
  deliveryDate: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
  deliveryType: 'vaginal',
};

const mockPelvicFloorRecords: PelvicFloorRecord[] = [
  {
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    exerciseType: 'kegel',
    duration: 10,
    sets: 3,
    reps: 10,
    difficulty: 2,
    notes: '今天感觉肌肉力量有提升',
  },
  {
    id: generateId(),
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: '19:30',
    exerciseType: 'breathing',
    duration: 15,
    difficulty: 1,
  },
  {
    id: generateId(),
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    time: '10:00',
    exerciseType: 'kegel',
    duration: 8,
    sets: 2,
    reps: 8,
    difficulty: 2,
  },
];

const mockLochiaRecords: LochiaRecord[] = [
  {
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    amount: 'light',
    color: 'brown',
    odor: 'normal',
    clots: 'none',
    symptoms: ['轻微腹痛'],
  },
  {
    id: generateId(),
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    amount: 'light',
    color: 'pink',
    odor: 'normal',
    clots: 'small',
    symptoms: [],
  },
  {
    id: generateId(),
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    amount: 'medium',
    color: 'red',
    odor: 'slight',
    clots: 'small',
    symptoms: ['腰酸'],
  },
];

const mockBreastfeedingRecords: BreastfeedingRecord[] = [
  {
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    startTime: '08:30',
    endTime: '08:50',
    type: 'breast',
    side: 'left',
    duration: 20,
    mood: 'calm',
  },
  {
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    startTime: '11:45',
    endTime: '12:05',
    type: 'breast',
    side: 'right',
    duration: 20,
    mood: 'hungry',
  },
  {
    id: generateId(),
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    startTime: '22:00',
    endTime: '22:25',
    type: 'breast',
    side: 'both',
    duration: 25,
    mood: 'sleepy',
  },
];

const ppCheckupId1 = generateId();
const ppCheckupId2 = generateId();
const defaultPostpartumCheckups: PostpartumCheckup[] = [
  {
    id: ppCheckupId1,
    date: new Date(Date.now() + 28 * 86400000).toISOString().split('T')[0],
    type: '6week',
    typeName: '产后6周复查',
    hospital: '妇幼保健院',
    doctor: '张医生',
    completed: false,
    notes: '盆底评估、子宫恢复检查',
  },
  {
    id: ppCheckupId2,
    date: new Date(Date.now() + 76 * 86400000).toISOString().split('T')[0],
    type: '3month',
    typeName: '产后3个月复查',
    hospital: '妇幼保健院',
    completed: false,
    notes: '全面恢复评估',
  },
];

const mockMedicationReminders: MedicationReminder[] = [
  {
    id: generateId(),
    category: 'dysmenorrhea',
    name: '布洛芬缓释胶囊',
    dosage: '300mg',
    frequency: '每日2次',
    times: ['08:00', '20:00'],
    startDate: new Date().toISOString().split('T')[0],
    notes: '饭后服用，经期疼痛时使用',
    active: true,
    linkedPainLevel: 6,
  },
  {
    id: generateId(),
    category: 'dysmenorrhea',
    name: '元胡止痛片',
    dosage: '4片',
    frequency: '每日3次',
    times: ['08:00', '14:00', '20:00'],
    startDate: new Date().toISOString().split('T')[0],
    active: true,
    linkedPainLevel: 4,
  },
  {
    id: generateId(),
    category: 'pregnancy',
    name: '叶酸片',
    dosage: '0.4mg',
    frequency: '每日1次',
    times: ['09:00'],
    startDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    notes: '孕早期必备，预防神经管缺陷',
    active: true,
  },
  {
    id: generateId(),
    category: 'pregnancy',
    name: '钙尔奇D',
    dosage: '600mg',
    frequency: '每日1次',
    times: ['21:00'],
    startDate: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
    notes: '睡前服用吸收更好',
    active: true,
  },
  {
    id: generateId(),
    category: 'ovulation',
    name: '来曲唑',
    dosage: '2.5mg',
    frequency: '每日1次',
    times: ['08:00'],
    startDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    notes: '月经第3-7天服用，促排卵治疗',
    active: true,
  },
];

const mockMedicationRecords: MedicationRecord[] = [
  {
    id: generateId(),
    reminderId: mockMedicationReminders[2].id,
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    taken: true,
    skipped: false,
  },
  {
    id: generateId(),
    reminderId: mockMedicationReminders[0].id,
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    taken: true,
    skipped: false,
  },
  {
    id: generateId(),
    reminderId: mockMedicationReminders[3].id,
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: '21:00',
    taken: true,
    skipped: false,
  },
  {
    id: generateId(),
    reminderId: mockMedicationReminders[1].id,
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: '08:00',
    taken: false,
    skipped: true,
    notes: '忘记服用',
  },
];

const painRecordId1 = generateId();
const painRecordId2 = generateId();
const mockPainRecords: PainRecord[] = [
  {
    id: painRecordId1,
    date: new Date().toISOString().split('T')[0],
    time: '07:30',
    level: 6,
    symptoms: '下腹部绞痛、腰酸',
  },
  {
    id: painRecordId2,
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: '10:00',
    level: 4,
    symptoms: '轻微腹胀',
  },
];

const defaultPermissions: PermissionConfig = {
  cycle: true,
  sleep: true,
  mood: true,
  medication: true,
  pregnancy: true,
  postpartum: true,
  nutrition: false,
  pain: true,
};

const mockFamilyMembers: FamilyMember[] = [
  {
    id: generateId(),
    name: '亲爱的',
    relation: 'partner',
    permissions: { ...defaultPermissions, nutrition: true },
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    lastAccessedAt: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    active: true,
  },
];

const mockShareCodes: ShareCode[] = [];

const generateShareCodeString = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const mockOvertimeRecords: OvertimeRecord[] = (() => {
  const records: OvertimeRecord[] = [];
  const today = new Date();
  const cycleStartRef = new Date(lastPeriod);
  const cycleLen = initialCycleData.cycleLength;
  const periodLen = initialCycleData.periodLength;

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayInCycle = Math.floor((date.getTime() - cycleStartRef.getTime()) / (1000 * 60 * 60 * 24));
    const cycleDay = ((dayInCycle % cycleLen) + cycleLen) % cycleLen;

    let cyclePhase: OvertimeRecord['cyclePhase'] = 'follicular';
    let isPeriodDay = false;
    let dysmenorrheaLevel = 0;
    let baseHours = 0;
    let baseStress = 3;
    let baseSleep = 7.5;

    if (cycleDay >= 0 && cycleDay < periodLen) {
      cyclePhase = 'period';
      isPeriodDay = true;
      if (cycleDay <= 2) {
        dysmenorrheaLevel = Math.floor(5 + Math.random() * 5);
      } else {
        dysmenorrheaLevel = Math.floor(Math.random() * 4);
      }
    } else if (cycleDay >= periodLen && cycleDay < periodLen + 7) {
      cyclePhase = 'follicular';
      baseStress = 3 + Math.random() * 2;
      baseSleep = 7 + Math.random() * 1;
    } else if (cycleDay >= periodLen + 7 && cycleDay < periodLen + 11) {
      cyclePhase = 'ovulation';
      baseStress = 4 + Math.random() * 2;
    } else {
      cyclePhase = 'luteal';
      baseStress = 5 + Math.random() * 2;
      baseSleep = 6 + Math.random() * 1.5;
      if (cycleDay >= cycleLen - 4) {
        dysmenorrheaLevel = Math.floor(Math.random() * 4);
      }
    }

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const workDayOvertimeChance = isWeekend ? 0.15 : 0.55;
    const shouldOvertime = Math.random() < workDayOvertimeChance;

    if (shouldOvertime || i < 8) {
      let hours = baseHours;
      let stressLevel = baseStress;
      let sleepHours = baseSleep;
      let periodImpact: string | undefined;

      if (cycleDay <= Math.min(2, periodLen - 1) && isPeriodDay) {
        const extraStress = Math.random() > 0.5 ? Math.floor(1 + Math.random() * 3) : 0;
        hours = Math.floor(1 + Math.random() * 4);
        stressLevel = Math.min(10, Math.floor(baseStress + extraStress + (hours > 2 ? 2 : 1)));
        sleepHours = Math.max(4, baseSleep - (hours > 2 ? 1.5 : 0.5) - (stressLevel > 6 ? 1 : 0));

        if (hours >= 3 && stressLevel >= 7) {
          dysmenorrheaLevel = Math.min(10, dysmenorrheaLevel + Math.floor(1 + Math.random() * 3));
          periodImpact = '加班后痛经加重，痛感攀升明显';
        } else if (hours >= 2) {
          periodImpact = '经期加班，腹部不适加剧';
        }
      } else if (cyclePhase === 'luteal' && cycleDay >= cycleLen - 6) {
        hours = Math.floor(1 + Math.random() * 5);
        stressLevel = Math.min(10, Math.floor(baseStress + (hours > 3 ? 2 : 1)));
        sleepHours = Math.max(4.5, baseSleep - (hours > 2 ? 1 : 0.3));
        if (hours >= 3 && stressLevel >= 7) {
          periodImpact = '经前期高强度加班，身心压力较大';
          dysmenorrheaLevel = Math.min(10, dysmenorrheaLevel + 1);
        }
      } else {
        hours = Math.max(1, Math.floor(1 + Math.random() * 4));
        stressLevel = Math.min(10, Math.floor(baseStress + (hours > 3 ? 2 : 0) + Math.random()));
        sleepHours = Math.max(5, baseSleep - (hours > 2 ? 0.8 : 0));
      }

      records.push({
        id: generateId(),
        date: dateStr,
        hours,
        stressLevel,
        sleepHours: Number(sleepHours.toFixed(1)),
        periodImpact,
        dysmenorrheaLevel: dysmenorrheaLevel > 0 ? dysmenorrheaLevel : undefined,
        isPeriodDay,
        cyclePhase,
      });
    }
  }

  return records.sort((a, b) => b.date.localeCompare(a.date));
})();

const mockOvulationRecords: OvulationRecord[] = [
  {
    id: generateId(),
    date: '2024-01-25',
    basalTemp: 36.5,
    cervicalMucus: '蛋清状',
    ovulationTest: 'positive',
    lhTest: 'strong_positive',
    lhIntensity: 95,
    tempShift: false,
    fertileWindow: true,
  },
  {
    id: generateId(),
    date: '2024-01-26',
    basalTemp: 36.8,
    cervicalMucus: '蛋清状',
    ovulationTest: 'positive',
    lhTest: 'positive',
    lhIntensity: 80,
    tempShift: true,
    fertileWindow: true,
  },
];

const todayDate = new Date();
const prenatalCheckupId1 = generateId();
const prenatalCheckupId2 = generateId();
const prenatalCheckupId3 = generateId();
const mockCheckups: PrenatalCheckup[] = [
  {
    id: prenatalCheckupId1,
    date: new Date(todayDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    week: 12,
    type: 'NT检查',
    doctor: '李医生',
    notes: '检查胎儿颈部透明带',
    completed: false,
  },
  {
    id: prenatalCheckupId2,
    date: new Date(todayDate.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    week: 16,
    type: '唐筛检查',
    doctor: '李医生',
    completed: false,
  },
  {
    id: prenatalCheckupId3,
    date: new Date(todayDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    week: 8,
    type: '首次产检',
    doctor: '王医生',
    weight: 52,
    bloodPressure: '110/70',
    babyHeartbeat: 150,
    notes: '一切正常',
    completed: true,
  },
];

const mockMoodRecords: MoodRecord[] = [
  {
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    mood: '开心',
    emotion: 'joy',
    intensity: 8,
    journal: '今天天气很好，心情也跟着好起来了~',
  },
];

const mockHotFlashRecords: HotFlashRecord[] = [
  {
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    time: '14:30',
    severity: 'moderate',
    duration: 5,
    triggers: ['压力', '热饮'],
  },
  {
    id: generateId(),
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: '22:00',
    severity: 'severe',
    duration: 15,
    triggers: ['夜间'],
    notes: '出汗较多，换了睡衣',
  },
];

const mockSleepRecords: SleepRecord[] = (() => {
  const records: SleepRecord[] = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayInCycle = i % 28;
    let duration = 7;
    let quality: 1 | 2 | 3 | 4 | 5 = 3;
    let interruptions = 1;
    let nightSweats = false;
    let bedTime = '23:00';
    let wakeTime = '07:00';
    
    if (dayInCycle >= 0 && dayInCycle < 5) {
      duration = 6.5 - Math.random() * 1.5;
      quality = (dayInCycle === 0 || dayInCycle === 1) ? 2 : 3;
      interruptions = 2 + Math.floor(Math.random() * 2);
      nightSweats = Math.random() > 0.5;
      bedTime = '23:30';
      wakeTime = '06:00';
    } else if (dayInCycle >= 5 && dayInCycle < 12) {
      duration = 7.5 + Math.random() * 1;
      quality = 4;
      interruptions = 0;
      nightSweats = false;
      bedTime = '22:30';
      wakeTime = '06:30';
    } else if (dayInCycle >= 12 && dayInCycle < 16) {
      duration = 7 + Math.random() * 0.5;
      quality = 3;
      interruptions = 1;
      nightSweats = false;
      bedTime = '23:00';
      wakeTime = '06:30';
    } else if (dayInCycle >= 16 && dayInCycle < 28) {
      duration = 6.5 - Math.random() * 1;
      quality = dayInCycle > 24 ? 2 : 3;
      interruptions = 1 + Math.floor(Math.random() * 2);
      nightSweats = dayInCycle > 22 ? Math.random() > 0.6 : false;
      bedTime = '23:30';
      wakeTime = '06:00';
    }
    
    records.push({
      id: generateId(),
      date: dateStr,
      bedTime,
      wakeTime,
      duration: Number(duration.toFixed(1)),
      quality,
      interruptions,
      nightSweats,
      notes: i === 0 ? '今天感觉有些疲劳' : undefined,
    });
  }
  
  return records;
})();

const mockHormoneRecords: HormoneRecord[] = [
  {
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    estrogenLevel: 30,
    progesteroneLevel: 2,
    fshLevel: 80,
    lhLevel: 40,
    phase: 'perimenopausal',
  },
  {
    id: generateId(),
    date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    estrogenLevel: 45,
    progesteroneLevel: 5,
    fshLevel: 60,
    lhLevel: 35,
    phase: 'perimenopausal',
  },
];

const buildDefaultRehabPhases = (): RehabPhase[] => {
  const phase1Exercises: RehabExercise[] = [
    {
      id: 'p1-e1',
      name: '腹式呼吸',
      description: '平躺，双手放在腹部，深吸气使腹部隆起，呼气时收紧腹部',
      duration: 5,
      sets: 3,
      reps: 10,
      restSeconds: 30,
      difficulty: 1,
      tips: ['呼吸要缓慢均匀', '注意力集中在腹部', '每天练习效果更好'],
      precautions: ['避免憋气', '如有不适立即停止'],
      category: 'breathing',
    },
    {
      id: 'p1-e2',
      name: '凯格尔运动',
      description: '收缩盆底肌肉，保持5秒后放松5秒',
      duration: 5,
      sets: 3,
      reps: 15,
      restSeconds: 30,
      difficulty: 1,
      tips: ['找到正确的肌肉群', '保持正常呼吸', '不要收缩腹部或大腿'],
      category: 'strength',
    },
    {
      id: 'p1-e3',
      name: '脚踝旋转',
      description: '平躺，双脚脚踝顺时针和逆时针旋转',
      duration: 3,
      sets: 2,
      reps: 10,
      restSeconds: 20,
      difficulty: 1,
      tips: ['动作要缓慢', '每个方向都要做到位'],
      category: 'flexibility',
    },
  ];

  const phase2Exercises: RehabExercise[] = [
    {
      id: 'p2-e1',
      name: '桥式运动',
      description: '平躺屈膝，双脚踩地，慢慢抬起臀部，保持后缓慢放下',
      duration: 8,
      sets: 3,
      reps: 12,
      restSeconds: 45,
      difficulty: 2,
      tips: ['收紧臀部和腹部', '不要过度抬腰', '保持呼吸均匀'],
      precautions: ['剖腹产伤口愈合前谨慎'],
      category: 'strength',
    },
    {
      id: 'p2-e2',
      name: '猫式伸展',
      description: '四点支撑，吸气抬头塌腰，呼气含胸弓背',
      duration: 5,
      sets: 3,
      reps: 8,
      restSeconds: 30,
      difficulty: 2,
      tips: ['动作与呼吸配合', '幅度要适中'],
      category: 'flexibility',
    },
    {
      id: 'p2-e3',
      name: '靠墙深蹲',
      description: '背靠墙站立，缓慢下蹲至大腿与地面平行',
      duration: 8,
      sets: 3,
      reps: 10,
      restSeconds: 45,
      difficulty: 2,
      tips: ['膝盖不要超过脚尖', '保持背部贴墙'],
      category: 'strength',
    },
  ];

  const phase3Exercises: RehabExercise[] = [
    {
      id: 'p3-e1',
      name: '平板支撑',
      description: '肘膝支撑，保持身体呈一条直线',
      duration: 5,
      sets: 3,
      reps: 3,
      restSeconds: 60,
      difficulty: 3,
      tips: ['从30秒开始', '保持核心收紧', '不要塌腰或翘臀'],
      precautions: ['如有腰痛立即停止'],
      category: 'strength',
    },
    {
      id: 'p3-e2',
      name: '死虫式',
      description: '平躺，手臂举过头顶，双腿屈膝90度，交替伸展对侧手脚',
      duration: 8,
      sets: 3,
      reps: 10,
      restSeconds: 45,
      difficulty: 3,
      tips: ['保持腰部贴地', '动作要缓慢控制'],
      category: 'strength',
    },
    {
      id: 'p3-e3',
      name: '快走',
      description: '保持中等速度的健步走',
      duration: 20,
      sets: 1,
      reps: 1,
      restSeconds: 0,
      difficulty: 2,
      tips: ['保持正确姿势', '选择舒适的鞋', '逐步增加时间'],
      category: 'cardio',
    },
  ];

  const phase4Exercises: RehabExercise[] = [
    {
      id: 'p4-e1',
      name: '卷腹',
      description: '平躺屈膝，双手放在耳侧，用腹部力量抬起上半身',
      duration: 10,
      sets: 4,
      reps: 15,
      restSeconds: 45,
      difficulty: 4,
      tips: ['不要用手拉头', '下背部贴地', '动作要控制'],
      precautions: ['腹直肌分离未恢复前不建议'],
      category: 'strength',
    },
    {
      id: 'p4-e2',
      name: '侧平板支撑',
      description: '侧卧，用前臂和脚支撑身体，保持身体呈一条直线',
      duration: 6,
      sets: 3,
      reps: 2,
      restSeconds: 60,
      difficulty: 4,
      tips: ['从短时间开始', '保持髋部抬起'],
      category: 'strength',
    },
    {
      id: 'p4-e3',
      name: '慢跑',
      description: '轻松节奏的慢跑',
      duration: 30,
      sets: 1,
      reps: 1,
      restSeconds: 0,
      difficulty: 3,
      tips: ['做好热身', '循序渐进', '注意补水'],
      precautions: ['盆底肌恢复良好后开始'],
      category: 'cardio',
    },
    {
      id: 'p4-e4',
      name: '全身拉伸',
      description: '针对主要肌群的静态拉伸',
      duration: 10,
      sets: 1,
      reps: 1,
      restSeconds: 0,
      difficulty: 2,
      tips: ['每个动作保持20-30秒', '不要过度拉伸'],
      category: 'cool-down',
    },
  ];

  return [
    {
      id: 'phase1' as RehabPhaseType,
      name: '第一阶段 · 基础恢复',
      description: '产后0-6周，以温和的呼吸和盆底训练为主',
      durationWeeks: 6,
      goals: ['恢复正常呼吸模式', '唤醒盆底肌肉', '促进血液循环', '预防血栓'],
      exercises: phase1Exercises,
      weeklyFrequency: 5,
      color: 'text-sky-600',
      gradient: 'from-sky-400 to-cyan-500',
    },
    {
      id: 'phase2' as RehabPhaseType,
      name: '第二阶段 · 力量重建',
      description: '产后6-12周，开始低强度力量训练',
      durationWeeks: 6,
      goals: ['增强核心稳定性', '恢复臀部力量', '改善体态', '增加活动量'],
      exercises: phase2Exercises,
      weeklyFrequency: 4,
      color: 'text-teal-600',
      gradient: 'from-teal-400 to-emerald-500',
    },
    {
      id: 'phase3' as RehabPhaseType,
      name: '第三阶段 · 功能强化',
      description: '产后3-6个月，加入有氧和核心训练',
      durationWeeks: 12,
      goals: ['强化核心肌群', '恢复心肺功能', '改善身体耐力', '开始减脂塑形'],
      exercises: phase3Exercises,
      weeklyFrequency: 5,
      color: 'text-violet-600',
      gradient: 'from-violet-400 to-purple-500',
    },
    {
      id: 'phase4' as RehabPhaseType,
      name: '第四阶段 · 全面恢复',
      description: '产后6个月以后，回归正常运动水平',
      durationWeeks: 12,
      goals: ['恢复孕前运动能力', '塑形美体', '增强体能', '建立长期运动习惯'],
      exercises: phase4Exercises,
      weeklyFrequency: 5,
      color: 'text-fuchsia-600',
      gradient: 'from-fuchsia-400 to-pink-500',
    },
  ];
};

const buildPelvicFloorPhases = (): RehabPhase[] => [
  {
    id: 'phase1' as RehabPhaseType,
    name: '第一阶段 · 肌肉唤醒',
    description: '0-4周，学习正确感知和收缩盆底肌',
    durationWeeks: 4,
    goals: ['学会正确识别盆底肌', '建立神经-肌肉连接', '培养每日练习习惯'],
    exercises: [
      { id: 'pf1-e1', name: '凯格尔基础收缩', description: '收缩盆底肌保持3秒后放松3秒，仰卧位练习', duration: 5, sets: 3, reps: 10, restSeconds: 30, difficulty: 1, tips: ['仰卧屈膝位最容易找到肌肉', '想象憋尿的感觉', '只收缩盆底不夹臀'], precautions: ['不要憋气', '不要收缩腹部'], category: 'strength' as const },
      { id: 'pf1-e2', name: '盆底肌快速收缩', description: '快速收缩盆底肌1秒后放松2秒', duration: 5, sets: 2, reps: 15, restSeconds: 30, difficulty: 1, tips: ['速度优先而非力量', '感受肌肉的快速反应'], category: 'strength' as const },
      { id: 'pf1-e3', name: '配合呼吸的盆底训练', description: '吸气放松盆底，呼气收缩盆底', duration: 5, sets: 3, reps: 8, restSeconds: 30, difficulty: 1, tips: ['呼吸节奏是关键', '呼气时想象电梯向上提'], category: 'breathing' as const },
    ],
    weeklyFrequency: 6,
    color: 'text-rose-600',
    gradient: 'from-rose-400 to-pink-500',
  },
  {
    id: 'phase2' as RehabPhaseType,
    name: '第二阶段 · 力量提升',
    description: '4-8周，增加收缩时长和力量',
    durationWeeks: 4,
    goals: ['延长收缩保持时间至10秒', '在不同体位下完成训练', '开始功能性训练'],
    exercises: [
      { id: 'pf2-e1', name: '渐进式凯格尔', description: '收缩盆底肌保持5-10秒后放松等长时间', duration: 8, sets: 3, reps: 10, restSeconds: 45, difficulty: 2, tips: ['逐步延长保持时间', '放松时间和收缩时间等长'], category: 'strength' as const },
      { id: 'pf2-e2', name: '站姿盆底训练', description: '站立位进行凯格尔收缩训练', duration: 5, sets: 3, reps: 12, restSeconds: 30, difficulty: 2, tips: ['站姿比仰卧更有挑战', '保持正常呼吸'], category: 'strength' as const },
      { id: 'pf2-e3', name: '桥式+盆底收缩', description: '做桥式的同时收缩盆底肌', duration: 8, sets: 3, reps: 10, restSeconds: 45, difficulty: 2, tips: ['先抬臀再收缩盆底', '下放时放松盆底'], category: 'strength' as const },
    ],
    weeklyFrequency: 5,
    color: 'text-teal-600',
    gradient: 'from-teal-400 to-emerald-500',
  },
  {
    id: 'phase3' as RehabPhaseType,
    name: '第三阶段 · 功能整合',
    description: '8-16周，在日常活动中整合盆底训练',
    durationWeeks: 8,
    goals: ['咳嗽/打喷嚏前自动收缩盆底', '运动时维持盆底张力', '改善盆底肌耐力'],
    exercises: [
      { id: 'pf3-e1', name: '功能位盆底训练', description: '在深蹲、弓步等功能性动作中配合盆底收缩', duration: 10, sets: 3, reps: 8, restSeconds: 60, difficulty: 3, tips: ['动作与收缩协调', '注意不要屏气'], category: 'strength' as const },
      { id: 'pf3-e2', name: '盆底肌耐力训练', description: '收缩盆底保持15-20秒，重复多组', duration: 10, sets: 3, reps: 6, restSeconds: 60, difficulty: 3, tips: ['逐步延长保持时间', '感到疲劳时休息'], category: 'strength' as const },
      { id: 'pf3-e3', name: '快走+盆底维持', description: '快走时保持盆底肌轻度收缩', duration: 15, sets: 1, reps: 1, restSeconds: 0, difficulty: 2, tips: ['不必全力收缩', '20-30%力度即可维持'], category: 'cardio' as const },
    ],
    weeklyFrequency: 5,
    color: 'text-violet-600',
    gradient: 'from-violet-400 to-purple-500',
  },
  {
    id: 'phase4' as RehabPhaseType,
    name: '第四阶段 · 长期维护',
    description: '16周以后，建立终身盆底保养习惯',
    durationWeeks: 12,
    goals: ['维持盆底肌功能', '预防盆底功能障碍复发', '融入日常运动'],
    exercises: [
      { id: 'pf4-e1', name: '盆底肌高级训练', description: '在不同体位和负荷下进行盆底收缩', duration: 10, sets: 3, reps: 10, restSeconds: 45, difficulty: 3, tips: ['增加跳跃和负重场景', '训练前预收缩盆底'], category: 'strength' as const },
      { id: 'pf4-e2', name: '慢跑+盆底维持', description: '慢跑时注意盆底肌的支撑', duration: 20, sets: 1, reps: 1, restSeconds: 0, difficulty: 3, tips: ['从中速开始', '有漏尿感立即停止'], category: 'cardio' as const },
      { id: 'pf4-e3', name: '全身拉伸放松', description: '包括盆底肌在内的全身放松拉伸', duration: 10, sets: 1, reps: 1, restSeconds: 0, difficulty: 1, tips: ['注意髋部和骨盆区域拉伸', '配合深呼吸放松盆底'], category: 'cool-down' as const },
    ],
    weeklyFrequency: 4,
    color: 'text-fuchsia-600',
    gradient: 'from-fuchsia-400 to-pink-500',
  },
];

const buildCorePhases = (): RehabPhase[] => [
  {
    id: 'phase1' as RehabPhaseType,
    name: '第一阶段 · 腹直肌评估与呼吸',
    description: '0-4周，评估分离程度，学习腹横肌激活',
    durationWeeks: 4,
    goals: ['评估腹直肌分离程度', '学会腹横肌主动收缩', '避免加重分离的动作'],
    exercises: [
      { id: 'c1-e1', name: '腹横肌激活', description: '仰卧屈膝，手指放在髂骨内侧，呼气时收缩下腹向脊柱靠拢', duration: 5, sets: 3, reps: 10, restSeconds: 30, difficulty: 1, tips: ['想象肚脐向脊柱方向靠近', '不要屏气', '感受腹横肌的收缩'], precautions: ['不要做卷腹类动作'], category: 'breathing' as const },
      { id: 'c1-e2', name: '仰卧腹部收缩', description: '仰卧位，呼气时缓慢收紧下腹，吸气时放松', duration: 5, sets: 3, reps: 12, restSeconds: 30, difficulty: 1, tips: ['收缩力度轻柔', '保持骨盆稳定'], category: 'strength' as const },
      { id: 'c1-e3', name: '足跟滑动', description: '仰卧屈膝，缓慢伸直一侧腿再收回，保持腹部收紧', duration: 8, sets: 2, reps: 8, restSeconds: 30, difficulty: 1, tips: ['腹部不要鼓起', '动作要慢'], category: 'strength' as const },
    ],
    weeklyFrequency: 5,
    color: 'text-sky-600',
    gradient: 'from-sky-400 to-cyan-500',
  },
  {
    id: 'phase2' as RehabPhaseType,
    name: '第二阶段 · 深层核心重建',
    description: '4-8周，强化腹横肌和多裂肌',
    durationWeeks: 4,
    goals: ['增强腹横肌耐力', '改善腰椎稳定性', '分离逐渐缩小'],
    exercises: [
      { id: 'c2-e1', name: '死虫式', description: '仰卧屈膝90度，交替伸展对侧手脚，保持腰部贴地', duration: 8, sets: 3, reps: 10, restSeconds: 45, difficulty: 2, tips: ['腰部始终贴地', '动作缓慢控制', '呼气时伸展'], category: 'strength' as const },
      { id: 'c2-e2', name: '鸟狗式', description: '四点支撑，交替伸展对侧手和腿', duration: 8, sets: 3, reps: 8, restSeconds: 45, difficulty: 2, tips: ['保持脊柱中立', '不要旋转骨盆'], category: 'strength' as const },
      { id: 'c2-e3', name: '改良侧平板', description: '侧卧屈膝，用前臂和膝盖支撑抬起骨盆', duration: 6, sets: 2, reps: 4, restSeconds: 45, difficulty: 2, tips: ['保持身体一条线', '从短时间开始'], category: 'strength' as const },
    ],
    weeklyFrequency: 5,
    color: 'text-teal-600',
    gradient: 'from-teal-400 to-emerald-500',
  },
  {
    id: 'phase3' as RehabPhaseType,
    name: '第三阶段 · 核心功能强化',
    description: '8-16周，加入动态核心训练',
    durationWeeks: 8,
    goals: ['核心肌群协调发力', '支撑日常功能活动', '腹直肌分离进一步改善'],
    exercises: [
      { id: 'c3-e1', name: '平板支撑', description: '前臂和脚尖支撑，保持身体呈一条直线', duration: 5, sets: 3, reps: 3, restSeconds: 60, difficulty: 3, tips: ['从15秒开始', '核心收紧不要塌腰'], precautions: ['腰痛时停止'], category: 'strength' as const },
      { id: 'c3-e2', name: '帕洛夫推压', description: '站姿双手持弹力带向前推，抵抗旋转力', duration: 8, sets: 3, reps: 10, restSeconds: 45, difficulty: 3, tips: ['保持身体不旋转', '感受侧腹发力'], category: 'strength' as const },
      { id: 'c3-e3', name: '登山者', description: '平板支撑位交替收膝', duration: 8, sets: 3, reps: 10, restSeconds: 60, difficulty: 3, tips: ['速度不要太快', '保持核心稳定'], category: 'cardio' as const },
    ],
    weeklyFrequency: 4,
    color: 'text-violet-600',
    gradient: 'from-violet-400 to-purple-500',
  },
  {
    id: 'phase4' as RehabPhaseType,
    name: '第四阶段 · 全面核心恢复',
    description: '16周以后，回归正常核心训练',
    durationWeeks: 12,
    goals: ['腹直肌分离恢复至2指内', '可安全进行卷腹类动作', '建立长期核心训练习惯'],
    exercises: [
      { id: 'c4-e1', name: '卷腹', description: '仰卧屈膝，双手放胸前，用腹力抬起肩胛骨离地', duration: 10, sets: 3, reps: 15, restSeconds: 45, difficulty: 4, tips: ['不要用手拉头', '下背贴地', '动作幅度小而精准'], precautions: ['分离大于2指时继续上一阶段'], category: 'strength' as const },
      { id: 'c4-e2', name: '侧平板支撑', description: '侧卧，前臂和脚支撑身体呈一条直线', duration: 6, sets: 3, reps: 2, restSeconds: 60, difficulty: 4, tips: ['从直膝版本开始', '保持髋部不塌'], category: 'strength' as const },
      { id: 'c4-e3', name: '俄罗斯转体', description: '坐姿身体后倾，双手持重物左右转体', duration: 8, sets: 3, reps: 12, restSeconds: 45, difficulty: 3, tips: ['转体幅度适中', '保持核心稳定'], category: 'strength' as const },
    ],
    weeklyFrequency: 4,
    color: 'text-fuchsia-600',
    gradient: 'from-fuchsia-400 to-pink-500',
  },
];

const buildGeneralPhases = (): RehabPhase[] => [
  {
    id: 'phase1' as RehabPhaseType,
    name: '第一阶段 · 适应性训练',
    description: '1-4周，建立运动习惯和基础体能',
    durationWeeks: 4,
    goals: ['养成规律运动习惯', '唤醒全身肌肉', '改善关节活动度'],
    exercises: [
      { id: 'g1-e1', name: '全身关节热身', description: '从头到脚依次活动各关节，每个方向8次', duration: 8, sets: 1, reps: 1, restSeconds: 0, difficulty: 1, tips: ['动作缓慢流畅', '不要弹振关节'], category: 'warmup' as const },
      { id: 'g1-e2', name: '靠墙俯卧撑', description: '面对墙壁做推墙俯卧撑，锻炼上肢和胸部', duration: 5, sets: 3, reps: 10, restSeconds: 30, difficulty: 1, tips: ['身体保持直线', '核心收紧'], category: 'strength' as const },
      { id: 'g1-e3', name: '原地踏步', description: '原地高抬腿踏步，保持节奏', duration: 10, sets: 2, reps: 1, restSeconds: 30, difficulty: 1, tips: ['保持正确姿势', '逐步加快频率'], category: 'cardio' as const },
    ],
    weeklyFrequency: 4,
    color: 'text-sky-600',
    gradient: 'from-sky-400 to-cyan-500',
  },
  {
    id: 'phase2' as RehabPhaseType,
    name: '第二阶段 · 基础力量',
    description: '4-8周，提升肌力和肌耐力',
    durationWeeks: 4,
    goals: ['提升基础肌力', '改善核心控制', '增加训练量'],
    exercises: [
      { id: 'g2-e1', name: '跪姿俯卧撑', description: '双膝着地做俯卧撑，降低难度同时锻炼上肢', duration: 8, sets: 3, reps: 8, restSeconds: 45, difficulty: 2, tips: ['身体从膝到头保持直线', '下落时控制速度'], category: 'strength' as const },
      { id: 'g2-e2', name: '弓步蹲', description: '交替前弓步下蹲', duration: 8, sets: 3, reps: 10, restSeconds: 45, difficulty: 2, tips: ['前膝不超过脚尖', '保持平衡'], category: 'strength' as const },
      { id: 'g2-e3', name: '快走', description: '中等速度持续快走', duration: 20, sets: 1, reps: 1, restSeconds: 0, difficulty: 2, tips: ['保持正确步态', '逐步提速'], category: 'cardio' as const },
    ],
    weeklyFrequency: 4,
    color: 'text-teal-600',
    gradient: 'from-teal-400 to-emerald-500',
  },
  {
    id: 'phase3' as RehabPhaseType,
    name: '第三阶段 · 进阶训练',
    description: '8-16周，增加运动强度和复杂度',
    durationWeeks: 8,
    goals: ['提升运动强度', '增强心肺功能', '改善运动表现'],
    exercises: [
      { id: 'g3-e1', name: '标准俯卧撑', description: '标准平板位俯卧撑', duration: 8, sets: 3, reps: 8, restSeconds: 60, difficulty: 3, tips: ['身体保持直线', '核心收紧不塌腰'], category: 'strength' as const },
      { id: 'g3-e2', name: '深蹲', description: '双脚与肩同宽，臀部后坐下蹲至大腿平行地面', duration: 10, sets: 3, reps: 12, restSeconds: 60, difficulty: 3, tips: ['膝盖对准脚尖方向', '重心在脚后跟'], category: 'strength' as const },
      { id: 'g3-e3', name: '慢跑', description: '轻松节奏的持续慢跑', duration: 25, sets: 1, reps: 1, restSeconds: 0, difficulty: 3, tips: ['注意呼吸节奏', '循序渐进增量'], category: 'cardio' as const },
    ],
    weeklyFrequency: 4,
    color: 'text-violet-600',
    gradient: 'from-violet-400 to-purple-500',
  },
  {
    id: 'phase4' as RehabPhaseType,
    name: '第四阶段 · 综合体能',
    description: '16周以后，全面提升运动能力',
    durationWeeks: 12,
    goals: ['全面提升体能', '掌握多种训练方式', '建立终身运动习惯'],
    exercises: [
      { id: 'g4-e1', name: '波比跳', description: '深蹲+俯卧撑+跳跃组合动作', duration: 10, sets: 3, reps: 6, restSeconds: 60, difficulty: 4, tips: ['每个动作做标准', '量力而行'], category: 'cardio' as const },
      { id: 'g4-e2', name: '单腿罗马尼亚硬拉', description: '单腿站立，另一腿后伸，身体前倾', duration: 8, sets: 3, reps: 8, restSeconds: 45, difficulty: 4, tips: ['保持髋部水平', '支撑腿微屈膝'], category: 'strength' as const },
      { id: 'g4-e3', name: '跑步', description: '中等强度持续跑步', duration: 30, sets: 1, reps: 1, restSeconds: 0, difficulty: 3, tips: ['注意跑姿', '做好热身和拉伸'], category: 'cardio' as const },
      { id: 'g4-e4', name: '全身拉伸放松', description: '运动后全身主要肌群静态拉伸', duration: 10, sets: 1, reps: 1, restSeconds: 0, difficulty: 1, tips: ['每个动作保持20-30秒', '不要过度拉伸'], category: 'cool-down' as const },
    ],
    weeklyFrequency: 4,
    color: 'text-fuchsia-600',
    gradient: 'from-fuchsia-400 to-pink-500',
  },
];

const buildCustomPhases = (): RehabPhase[] => [
  {
    id: 'phase1' as RehabPhaseType,
    name: '第一阶段 · 自定义基础',
    description: '根据个人状况定制的入门阶段',
    durationWeeks: 4,
    goals: ['评估个人身体状况', '设定训练基线', '循序渐进开始训练'],
    exercises: [
      { id: 'cu1-e1', name: '腹式呼吸', description: '平躺，深吸气使腹部隆起，呼气时收紧腹部', duration: 5, sets: 3, reps: 10, restSeconds: 30, difficulty: 1, tips: ['呼吸缓慢均匀', '注意力集中'], category: 'breathing' as const },
      { id: 'cu1-e2', name: '关节活动度训练', description: '全身主要关节的主动活动', duration: 8, sets: 1, reps: 1, restSeconds: 0, difficulty: 1, tips: ['缓慢控制', '无痛范围内活动'], category: 'flexibility' as const },
      { id: 'cu1-e3', name: '轻度步行', description: '平地轻松步行', duration: 15, sets: 1, reps: 1, restSeconds: 0, difficulty: 1, tips: ['保持舒适 pace', '逐步增量'], category: 'cardio' as const },
    ],
    weeklyFrequency: 3,
    color: 'text-sky-600',
    gradient: 'from-sky-400 to-cyan-500',
  },
  {
    id: 'phase2' as RehabPhaseType,
    name: '第二阶段 · 自定义进阶',
    description: '根据恢复情况逐步增加训练强度',
    durationWeeks: 6,
    goals: ['增加训练强度', '改善肌肉力量', '提升活动能力'],
    exercises: [
      { id: 'cu2-e1', name: '改良俯卧撑', description: '跪姿或靠墙俯卧撑', duration: 5, sets: 3, reps: 8, restSeconds: 45, difficulty: 2, tips: ['选择适合的难度', '保持核心稳定'], category: 'strength' as const },
      { id: 'cu2-e2', name: '弹力带划船', description: '坐姿使用弹力带做划船动作', duration: 8, sets: 3, reps: 10, restSeconds: 45, difficulty: 2, tips: ['肩胛骨先收缩', '感受背部发力'], category: 'strength' as const },
      { id: 'cu2-e3', name: '瑜伽流', description: '简单的瑜伽流动序列', duration: 15, sets: 1, reps: 1, restSeconds: 0, difficulty: 2, tips: ['配合呼吸', '量力而行'], category: 'flexibility' as const },
    ],
    weeklyFrequency: 4,
    color: 'text-teal-600',
    gradient: 'from-teal-400 to-emerald-500',
  },
  {
    id: 'phase3' as RehabPhaseType,
    name: '第三阶段 · 自定义强化',
    description: '针对性强化薄弱环节',
    durationWeeks: 8,
    goals: ['针对性强化', '功能改善', '体能提升'],
    exercises: [
      { id: 'cu3-e1', name: '力量训练组合', description: '上下肢交替力量训练', duration: 15, sets: 3, reps: 10, restSeconds: 60, difficulty: 3, tips: ['选择合适的重量', '保持动作标准'], category: 'strength' as const },
      { id: 'cu3-e2', name: '有氧间歇', description: '低强度与中强度交替的有氧训练', duration: 20, sets: 1, reps: 1, restSeconds: 0, difficulty: 3, tips: ['控制心率', '注意恢复'], category: 'cardio' as const },
    ],
    weeklyFrequency: 4,
    color: 'text-violet-600',
    gradient: 'from-violet-400 to-purple-500',
  },
  {
    id: 'phase4' as RehabPhaseType,
    name: '第四阶段 · 自定义维持',
    description: '长期训练与维护阶段',
    durationWeeks: 12,
    goals: ['维持训练成果', '持续改善', '建立长期习惯'],
    exercises: [
      { id: 'cu4-e1', name: '综合力量训练', description: '全身力量训练循环', duration: 20, sets: 3, reps: 12, restSeconds: 60, difficulty: 3, tips: ['注重动作质量', '逐步增加负荷'], category: 'strength' as const },
      { id: 'cu4-e2', name: '有氧运动', description: '跑步、骑行或游泳等有氧运动', duration: 30, sets: 1, reps: 1, restSeconds: 0, difficulty: 3, tips: ['选择喜欢的运动', '保持规律'], category: 'cardio' as const },
      { id: 'cu4-e3', name: '拉伸与放松', description: '运动后拉伸和筋膜放松', duration: 10, sets: 1, reps: 1, restSeconds: 0, difficulty: 1, tips: ['每个部位充分拉伸', '配合深呼吸'], category: 'cool-down' as const },
    ],
    weeklyFrequency: 3,
    color: 'text-fuchsia-600',
    gradient: 'from-fuchsia-400 to-pink-500',
  },
];

const mockVisitRecords: VisitRecord[] = [
  {
    id: generateId(),
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    department: '妇产科',
    hospital: '妇幼保健院',
    doctor: '李医生',
    chiefComplaint: '产后腰痛、盆底不适',
    diagnosis: '盆底肌功能障碍I度',
    prescription: '盆底康复训练，每日凯格尔运动3组',
    followUpDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    linkedPostpartumCheckupId: ppCheckupId1,
    linkedPainRecordIds: [painRecordId1, painRecordId2],
    notes: '产后恢复情况良好，需继续盆底训练',
  },
  {
    id: generateId(),
    date: new Date(todayDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    department: '产科',
    hospital: '妇幼保健院',
    doctor: '王医生',
    chiefComplaint: '孕8周首次产检',
    diagnosis: '宫内妊娠，胎心正常',
    prescription: '叶酸补充，定期产检',
    linkedPrenatalCheckupId: prenatalCheckupId3,
    notes: '胎儿发育正常，已见胎心胎芽',
  },
  {
    id: generateId(),
    date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
    department: '内分泌科',
    hospital: '市第一人民医院',
    doctor: '王医生',
    chiefComplaint: '月经不规律、经前综合征加重',
    diagnosis: '经前期综合征',
    prescription: '维生素B6 50mg 每日1次，月见草油 1000mg 每日1次',
    notes: '建议记录情绪与周期变化',
  },
];

const mockTestReports: TestReport[] = [
  {
    id: generateId(),
    visitRecordId: mockVisitRecords[0]?.id,
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    name: '盆底肌力评估',
    department: '妇产科',
    result: 'I型肌纤维肌力2级，II型肌纤维肌力1级',
    abnormalItems: ['II型肌纤维肌力偏低'],
    referenceRange: '正常: I型≥3级, II型≥2级',
    notes: '建议加强快肌纤维训练',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: generateId(),
    visitRecordId: mockVisitRecords[1]?.id,
    date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
    name: '性激素六项',
    department: '内分泌科',
    result: 'FSH 6.5mIU/ml, LH 4.8mIU/ml, E2 45pg/ml',
    abnormalItems: [],
    referenceRange: 'FSH 3.5-12.5, LH 2.4-12.6, E2 30-400',
    notes: '激素水平在正常范围内',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

const defaultRehabPlanId = generateId();
const defaultRehabMilestones: RehabMilestone[] = [
  {
    id: generateId(),
    planId: defaultRehabPlanId,
    phaseId: 'phase1',
    title: '完成首次凯格尔训练',
    description: '完成第一次盆底肌训练，唤醒肌肉记忆',
    targetValue: 1,
    currentValue: 1,
    unit: '次',
    achieved: true,
    achievedDate: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
    icon: '🏆',
  },
  {
    id: generateId(),
    planId: defaultRehabPlanId,
    phaseId: 'phase1',
    title: '连续打卡7天',
    description: '坚持每天完成训练打卡一周',
    targetValue: 7,
    currentValue: 3,
    unit: '天',
    achieved: false,
    icon: '🔥',
  },
  {
    id: generateId(),
    planId: defaultRehabPlanId,
    phaseId: 'phase2',
    title: '完成10次力量训练',
    description: '累计完成10次力量重建训练',
    targetValue: 10,
    currentValue: 0,
    unit: '次',
    achieved: false,
    icon: '💪',
  },
  {
    id: generateId(),
    planId: defaultRehabPlanId,
    phaseId: 'phase3',
    title: '盆底肌评分达到80分',
    description: '通过持续训练将盆底肌功能评分提升至80分',
    targetValue: 80,
    currentValue: 0,
    unit: '分',
    achieved: false,
    icon: '⭐',
  },
  {
    id: generateId(),
    planId: defaultRehabPlanId,
    phaseId: 'phase4',
    title: '腹直肌分离恢复至2指以内',
    description: '通过核心训练将腹直肌分离缩小至2指以内',
    targetValue: 2,
    currentValue: 0,
    unit: '指',
    achieved: false,
    icon: '🎯',
  },
];
const defaultRehabPlans: RehabPlan[] = [
  {
    id: defaultRehabPlanId,
    name: '产后综合康复计划',
    type: 'postpartum',
    startDate: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
    phases: buildDefaultRehabPhases(),
    milestones: defaultRehabMilestones,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
    notes: '根据顺产情况定制的康复计划',
  },
];

const mockRehabBodyMetrics: RehabBodyMetric[] = [
  {
    id: generateId(),
    planId: defaultRehabPlanId,
    date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
    weight: 62.5,
    bellyCircumference: 82,
    pelvicFloorScore: 45,
    diastasisRecti: 3.5,
  },
  {
    id: generateId(),
    planId: defaultRehabPlanId,
    date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    weight: 61.8,
    bellyCircumference: 80,
    pelvicFloorScore: 52,
    diastasisRecti: 3.2,
  },
  {
    id: generateId(),
    planId: defaultRehabPlanId,
    date: new Date().toISOString().split('T')[0],
    weight: 61.2,
    bellyCircumference: 78,
    pelvicFloorScore: 58,
    diastasisRecti: 3.0,
  },
];

const mockRehabCheckins: RehabCheckin[] = [
  {
    id: generateId(),
    planId: defaultRehabPlanId,
    phaseId: 'phase1',
    date: new Date().toISOString().split('T')[0],
    time: '09:30',
    completedExercises: ['p1-e1', 'p1-e2'],
    totalDuration: 15,
    painLevel: 1,
    fatigueLevel: 2,
    mood: 'good',
    notes: '今天感觉不错，训练后很放松',
  },
  {
    id: generateId(),
    planId: defaultRehabPlanId,
    phaseId: 'phase1',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: '20:00',
    completedExercises: ['p1-e1', 'p1-e2', 'p1-e3'],
    totalDuration: 18,
    painLevel: 1,
    fatigueLevel: 3,
    mood: 'normal',
  },
  {
    id: generateId(),
    planId: defaultRehabPlanId,
    phaseId: 'phase1',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    time: '10:00',
    completedExercises: ['p1-e1'],
    totalDuration: 8,
    painLevel: 2,
    fatigueLevel: 2,
    mood: 'tired',
    notes: '今天有些累，只做了呼吸训练',
  },
];

const mockTemperatureRecords: TemperatureRecord[] = generateMockTemperatureRecords(30);

const mockTemperatureAlerts: TemperatureAnomalyAlert[] = [];

const mockBluetoothDevices: BluetoothDeviceInfo[] = [
  {
    id: 'bt-001',
    name: 'MCH智能体温计',
    macAddress: 'AA:BB:CC:DD:EE:01',
    brand: 'MCH健康',
    model: 'T1',
    batteryLevel: 85,
    lastConnected: new Date().toISOString().split('T')[0],
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      lifeStage: 'teen',
      cycleData: initialCycleData,
      pregnancyData: initialPregnancyData,
      postpartumData: initialPostpartumData,
      overtimeRecords: mockOvertimeRecords,
      ovulationRecords: mockOvulationRecords,
      prenatalCheckups: mockCheckups,
      moodRecords: mockMoodRecords,
      hotFlashRecords: mockHotFlashRecords,
      sleepRecords: mockSleepRecords,
      hormoneRecords: mockHormoneRecords,
      pelvicFloorRecords: mockPelvicFloorRecords,
      lochiaRecords: mockLochiaRecords,
      breastfeedingRecords: mockBreastfeedingRecords,
      postpartumCheckups: defaultPostpartumCheckups,
      medicationReminders: mockMedicationReminders,
      medicationRecords: mockMedicationRecords,
      painRecords: mockPainRecords,
      temperatureRecords: mockTemperatureRecords,
      temperatureAlerts: mockTemperatureAlerts,
      bluetoothDevices: mockBluetoothDevices,
      familyMembers: mockFamilyMembers,
      shareCodes: mockShareCodes,
      rehabPlans: defaultRehabPlans,
      rehabCheckins: mockRehabCheckins,
      rehabBodyMetrics: mockRehabBodyMetrics,
      activeRehabPlanId: defaultRehabPlanId,
      visitRecords: mockVisitRecords,
      testReports: mockTestReports,

      setLifeStage: (stage: LifeStage) => set({ lifeStage: stage }),

      getMigrationMapping: (from: LifeStage, to: LifeStage): MigrationMappingSet => {
        const mappings: Record<string, MigrationMappingSet> = {
          'teen->career': {
            from: 'teen',
            to: 'career',
            label: '少女期 → 职场期',
            description: '将月经周期记录迁移至职场健康看板，加班记录将关联周期阶段',
            fieldMappings: [
              { sourceField: 'cycleData.cycleLength', sourceLabel: '周期长度', targetField: 'cycleData.cycleLength', targetLabel: '周期长度', transform: 'direct' },
              { sourceField: 'cycleData.periodLength', sourceLabel: '经期长度', targetField: 'cycleData.periodLength', targetLabel: '经期长度', transform: 'direct' },
              { sourceField: 'cycleData.lastPeriodDate', sourceLabel: '末次月经', targetField: 'cycleData.lastPeriodDate', targetLabel: '末次月经', transform: 'direct' },
              { sourceField: 'cycleData.periodStartDates', sourceLabel: '经期起始日列表', targetField: 'cycleData.periodStartDates', targetLabel: '经期起始日列表', transform: 'direct' },
              { sourceField: 'cycleData.records', sourceLabel: '经期记录', targetField: 'cycleData.records', targetLabel: '经期记录', transform: 'direct' },
              { sourceField: 'painRecords', sourceLabel: '痛经记录', targetField: 'painRecords', targetLabel: '痛经记录', transform: 'direct' },
              { sourceField: 'medicationReminders(dysmenorrhea)', sourceLabel: '痛经用药提醒', targetField: 'medicationReminders(dysmenorrhea)', targetLabel: '痛经用药提醒', transform: 'direct' },
              { sourceField: 'temperatureRecords', sourceLabel: '体温记录', targetField: 'temperatureRecords', targetLabel: '体温记录', transform: 'direct' },
            ],
            autoDerivedFields: [
              { targetField: 'overtimeRecords', targetLabel: '加班记录(周期关联)', derivation: '新增加班记录时自动标注所处周期阶段与经期日标记' },
            ],
          },
          'teen->pregnancy-prep': {
            from: 'teen',
            to: 'pregnancy-prep',
            label: '少女期 → 备孕期',
            description: '周期数据直接迁移，自动启用排卵追踪与受孕概率计算',
            fieldMappings: [
              { sourceField: 'cycleData.cycleLength', sourceLabel: '周期长度', targetField: 'cycleData.cycleLength', targetLabel: '周期长度', transform: 'direct' },
              { sourceField: 'cycleData.periodLength', sourceLabel: '经期长度', targetField: 'cycleData.periodLength', targetLabel: '经期长度', transform: 'direct' },
              { sourceField: 'cycleData.lastPeriodDate', sourceLabel: '末次月经', targetField: 'cycleData.lastPeriodDate', targetLabel: '末次月经', transform: 'direct' },
              { sourceField: 'cycleData.firstPeriodDate', sourceLabel: '初潮日期', targetField: 'cycleData.firstPeriodDate', targetLabel: '初潮日期', transform: 'direct' },
              { sourceField: 'cycleData.periodStartDates', sourceLabel: '经期起始日列表', targetField: 'cycleData.periodStartDates', targetLabel: '经期起始日列表', transform: 'direct' },
              { sourceField: 'cycleData.records', sourceLabel: '经期记录', targetField: 'cycleData.records', targetLabel: '经期记录', transform: 'direct' },
              { sourceField: 'temperatureRecords', sourceLabel: '体温记录', targetField: 'temperatureRecords', targetLabel: '体温记录', transform: 'direct' },
              { sourceField: 'painRecords', sourceLabel: '痛经记录', targetField: 'painRecords', targetLabel: '痛经记录', transform: 'direct' },
            ],
            autoDerivedFields: [
              { targetField: 'ovulationRecords', targetLabel: '排卵记录', derivation: '根据体温升高日自动生成排卵记录' },
              { targetField: 'pregnancyData.lastMenstrualPeriodDate', targetLabel: '末次月经(备孕)', derivation: '同步 cycleData.lastPeriodDate 至 pregnancyData.lastMenstrualPeriodDate' },
              { targetField: 'medicationReminders(ovulation)', targetLabel: '促排药提醒', derivation: '建议添加促排药物提醒' },
            ],
          },
          'teen->pregnancy': {
            from: 'teen',
            to: 'pregnancy',
            label: '少女期 → 孕期',
            description: '迁移周期数据，自动设置末次月经计算预产期与孕周',
            fieldMappings: [
              { sourceField: 'cycleData.cycleLength', sourceLabel: '周期长度', targetField: 'cycleData.cycleLength', targetLabel: '周期长度', transform: 'direct' },
              { sourceField: 'cycleData.lastPeriodDate', sourceLabel: '末次月经', targetField: 'cycleData.lastPeriodDate', targetLabel: '末次月经', transform: 'direct' },
              { sourceField: 'cycleData.periodStartDates', sourceLabel: '经期起始日列表', targetField: 'cycleData.periodStartDates', targetLabel: '经期起始日列表', transform: 'direct' },
              { sourceField: 'cycleData.records', sourceLabel: '经期记录', targetField: 'cycleData.records', targetLabel: '经期记录', transform: 'direct' },
              { sourceField: 'temperatureRecords', sourceLabel: '体温记录', targetField: 'temperatureRecords', targetLabel: '体温记录', transform: 'direct' },
              { sourceField: 'medicationReminders', sourceLabel: '用药提醒', targetField: 'medicationReminders', targetLabel: '用药提醒', transform: 'direct' },
            ],
            autoDerivedFields: [
              { targetField: 'pregnancyData.lastMenstrualPeriodDate', targetLabel: '末次月经(孕期)', derivation: '同步 cycleData.lastPeriodDate 至 pregnancyData.lastMenstrualPeriodDate 以计算孕周和预产期' },
              { targetField: 'medicationReminders(pregnancy)', targetLabel: '孕期用药提醒', derivation: '自动添加叶酸、钙片等孕期必备药物提醒' },
            ],
          },
        };

        const key = `${from}->${to}`;
        return mappings[key] || {
          from,
          to,
          label: `${from} → ${to}`,
          description: '基础数据迁移',
          fieldMappings: [
            { sourceField: 'cycleData', sourceLabel: '周期数据', targetField: 'cycleData', targetLabel: '周期数据', transform: 'direct' },
            { sourceField: 'temperatureRecords', sourceLabel: '体温记录', targetField: 'temperatureRecords', targetLabel: '体温记录', transform: 'direct' },
          ],
          autoDerivedFields: [],
        };
      },

      getMigrationPreview: (from: LifeStage, to: LifeStage): MigrationPreview => {
        const state = get();
        const mapping = get().getMigrationMapping(from, to);
        const warnings: string[] = [];

        let sourceDataCount = 0;
        sourceDataCount += state.cycleData.periodStartDates.length;
        sourceDataCount += state.cycleData.records.length;
        sourceDataCount += state.temperatureRecords.length;
        sourceDataCount += state.painRecords.length;

        let migratedDataCount = mapping.fieldMappings.length;

        if (to === 'pregnancy-prep' || to === 'pregnancy') {
          if (!state.cycleData.lastPeriodDate) {
            warnings.push('未设置末次月经日期，迁移后需手动设置以启用预测功能');
          }
        }

        if (to === 'pregnancy' && state.cycleData.lastPeriodDate) {
          const lmp = new Date(state.cycleData.lastPeriodDate);
          const now = new Date();
          const daysSince = Math.floor((now.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSince > 280) {
            warnings.push('末次月经距今已超过280天，预产期计算可能不准确，建议手动设置孕周');
          }
        }

        if (to === 'career' && state.overtimeRecords.length > 0) {
          warnings.push('职场期已有加班记录，迁移后数据将保留');
        }

        if (mapping.autoDerivedFields.length === 0) {
          warnings.push('该迁移路径暂无自动派生字段');
        }

        return { mapping, sourceDataCount, migratedDataCount, warnings };
      },

      migrateLifeStage: (targetStage: LifeStage): MigrationResult => {
        const state = get();
        const from = state.lifeStage;
        const mapping = get().getMigrationMapping(from, targetStage);
        const warnings: string[] = [];
        const migratedFields: string[] = [];
        const derivedFields: string[] = [];
        const skippedFields: string[] = [];

        const updates: Partial<AppState> = { lifeStage: targetStage };

        for (const fm of mapping.fieldMappings) {
          if (fm.transform === 'direct') {
            migratedFields.push(fm.targetLabel);
          } else {
            skippedFields.push(fm.targetLabel);
          }
        }

        if ((targetStage === 'pregnancy-prep' || targetStage === 'pregnancy') && state.cycleData.lastPeriodDate) {
          updates.pregnancyData = {
            ...state.pregnancyData,
            lastMenstrualPeriodDate: state.cycleData.lastPeriodDate,
          };
          derivedFields.push('末次月经(孕期/备孕)');
        }

        if (targetStage === 'pregnancy') {
          const hasFolicAcid = state.medicationReminders.some(
            (r) => r.category === 'pregnancy' && r.name.includes('叶酸')
          );
          if (!hasFolicAcid) {
            const newReminder: MedicationReminder = {
              id: generateId(),
              category: 'pregnancy',
              name: '叶酸片',
              dosage: '0.4mg',
              frequency: '每日1次',
              times: ['09:00'],
              startDate: new Date().toISOString().split('T')[0],
              notes: '孕早期必备，预防神经管缺陷',
              active: true,
            };
            updates.medicationReminders = [...state.medicationReminders, newReminder];
            derivedFields.push('叶酸片用药提醒');
          }
        }

        if (targetStage === 'pregnancy-prep') {
          const hasOvulationMeds = state.medicationReminders.some(
            (r) => r.category === 'ovulation'
          );
          if (!hasOvulationMeds) {
            warnings.push('建议在用药中心添加促排药物提醒（如来曲唑等）');
          }
        }

        if (targetStage === 'career' && state.cycleData.lastPeriodDate) {
          warnings.push('加班记录新增时会自动标注周期阶段，请在职场页添加加班记录');
        }

        set(updates);

        return {
          from,
          to: targetStage,
          timestamp: new Date().toISOString(),
          migratedFields,
          derivedFields,
          skippedFields,
          warnings,
        };
      },

      addPeriodRecord: (record: PeriodRecord) =>
        set((state) => {
          const recordDate = record.date;
          const existingStarts = state.cycleData.periodStartDates || [];
          const lastStart = existingStarts[existingStarts.length - 1];
          const lastPeriodStart = state.cycleData.lastPeriodDate;
          const periodLen = state.cycleData.periodLength;

          let newStarts = [...existingStarts];
          let newLastPeriod = lastPeriodStart;
          let newFirstPeriod = state.cycleData.firstPeriodDate;

          const recordD = new Date(recordDate);
          if (!lastStart) {
            newStarts = [recordDate];
            newLastPeriod = recordDate;
            newFirstPeriod = recordDate;
          } else {
            const lastD = new Date(lastStart);
            const gap = diffDays(recordD, lastD);
            if (gap >= periodLen + 5) {
              newStarts.push(recordDate);
              newLastPeriod = recordDate;
            }
            if (!newFirstPeriod || recordDate < newFirstPeriod) {
              newFirstPeriod = recordDate;
            }
            const recordFromLastStart = diffDays(recordD, new Date(lastPeriodStart));
            if (recordFromLastStart < 0) {
              const recentStarts = [...existingStarts].sort();
              let foundPrior = false;
              for (let i = recentStarts.length - 1; i >= 0; i--) {
                const s = new Date(recentStarts[i]);
                const d = diffDays(recordD, s);
                if (d >= 0 && d < periodLen) {
                  foundPrior = true;
                  break;
                }
                if (d < 0) break;
              }
              if (!foundPrior) {
                newStarts.push(recordDate);
                newStarts = Array.from(new Set(newStarts)).sort();
              }
            }
          }
          newStarts = Array.from(new Set(newStarts)).sort();

          return {
            cycleData: {
              ...state.cycleData,
              records: [...state.cycleData.records, record],
              periodStartDates: newStarts,
              lastPeriodDate: newLastPeriod,
              firstPeriodDate: newFirstPeriod,
            },
          };
        }),

      addOvertimeRecord: (record: OvertimeRecord) =>
        set((state) => ({
          overtimeRecords: [...state.overtimeRecords, record],
        })),

      addOvulationRecord: (record: OvulationRecord) =>
        set((state) => {
          let tempShift = record.tempShift;
          if (record.basalTemp !== undefined && tempShift === undefined) {
            const prevRecords = [...state.ovulationRecords]
              .filter((r) => r.date < record.date && r.basalTemp !== undefined)
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 3);
            if (prevRecords.length >= 2) {
              const avgPrev =
                prevRecords.reduce((sum, r) => sum + (r.basalTemp || 0), 0) / prevRecords.length;
              if (record.basalTemp - avgPrev >= 0.2) {
                tempShift = true;
              }
            }
          }
          const enriched: OvulationRecord = { ...record, tempShift };
          return {
            ovulationRecords: [...state.ovulationRecords, enriched],
          };
        }),

      addPrenatalCheckup: (checkup: PrenatalCheckup) =>
        set((state) => ({
          prenatalCheckups: [...state.prenatalCheckups, checkup],
        })),

      toggleCheckupComplete: (id: string) =>
        set((state) => ({
          prenatalCheckups: state.prenatalCheckups.map((c) =>
            c.id === id ? { ...c, completed: !c.completed } : c
          ),
        })),

      addMoodRecord: (record: MoodRecord) =>
        set((state) => ({
          moodRecords: [...state.moodRecords, record],
        })),

      setCycleData: (data: Partial<CycleData>) =>
        set((state) => {
          const merged = { ...state.cycleData, ...data };
          let starts = [...(merged.periodStartDates || [])];

          if (data.lastPeriodDate !== undefined && data.lastPeriodDate !== state.cycleData.lastPeriodDate) {
            const newLast = data.lastPeriodDate;
            const periodLen = merged.periodLength;
            if (!starts.includes(newLast)) {
              const isWithinExisting = starts.some((s) => {
                const d = diffDays(new Date(newLast), new Date(s));
                return d >= 0 && d < periodLen;
              });
              if (!isWithinExisting) {
                starts.push(newLast);
                starts = Array.from(new Set(starts)).sort();
              }
            }
            const sorted = [...starts].sort();
            if (sorted.length > 0 && newLast > sorted[sorted.length - 1]) {
              merged.lastPeriodDate = newLast;
            }
          }

          if (data.firstPeriodDate !== undefined && data.firstPeriodDate !== state.cycleData.firstPeriodDate) {
            if (data.firstPeriodDate && !starts.includes(data.firstPeriodDate)) {
              const periodLen = merged.periodLength;
              const isWithinExisting = starts.some((s) => {
                const d = diffDays(new Date(data.firstPeriodDate!), new Date(s));
                return d >= 0 && d < periodLen;
              });
              if (!isWithinExisting) {
                starts.push(data.firstPeriodDate);
                starts = Array.from(new Set(starts)).sort();
              }
            }
          }

          merged.periodStartDates = starts;
          return { cycleData: merged };
        }),

      setPregnancyData: (data: Partial<PregnancyData>) =>
        set((state) => ({
          pregnancyData: { ...state.pregnancyData, ...data },
        })),

      setPostpartumData: (data: Partial<PostpartumData>) =>
        set((state) => ({
          postpartumData: { ...state.postpartumData, ...data },
        })),

      addPelvicFloorRecord: (record: PelvicFloorRecord) =>
        set((state) => ({
          pelvicFloorRecords: [...state.pelvicFloorRecords, record],
        })),

      addLochiaRecord: (record: LochiaRecord) =>
        set((state) => ({
          lochiaRecords: [...state.lochiaRecords, record],
        })),

      addBreastfeedingRecord: (record: BreastfeedingRecord) =>
        set((state) => ({
          breastfeedingRecords: [...state.breastfeedingRecords, record],
        })),

      addPostpartumCheckup: (checkup: PostpartumCheckup) =>
        set((state) => ({
          postpartumCheckups: [...state.postpartumCheckups, checkup],
        })),

      togglePostpartumCheckupComplete: (id: string) =>
        set((state) => ({
          postpartumCheckups: state.postpartumCheckups.map((c) =>
            c.id === id ? { ...c, completed: !c.completed } : c
          ),
        })),

      addMedicationReminder: (reminder: MedicationReminder) =>
        set((state) => ({
          medicationReminders: [...state.medicationReminders, reminder],
        })),

      updateMedicationReminder: (id: string, data: Partial<MedicationReminder>) =>
        set((state) => ({
          medicationReminders: state.medicationReminders.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        })),

      deleteMedicationReminder: (id: string) =>
        set((state) => ({
          medicationReminders: state.medicationReminders.filter((r) => r.id !== id),
          medicationRecords: state.medicationRecords.filter((r) => r.reminderId !== id),
        })),

      addMedicationRecord: (record: MedicationRecord) =>
        set((state) => ({
          medicationRecords: [...state.medicationRecords, record],
        })),

      addPainRecord: (record: PainRecord) =>
        set((state) => ({
          painRecords: [...state.painRecords, record],
        })),

      getTodayPainLevel: () => {
        const { painRecords } = get();
        const today = new Date().toISOString().split('T')[0];
        const todays = painRecords.filter((r) => r.date === today);
        if (todays.length === 0) return 0;
        todays.sort((a, b) => b.time.localeCompare(a.time));
        return todays[0].level;
      },

      getMedicationRemindersByCategory: (category: MedicationCategory) => {
        const { medicationReminders } = get();
        return medicationReminders.filter((r) => r.category === category);
      },

      getTodayMedicationSchedule: () => {
        const { medicationReminders, medicationRecords, getTodayPainLevel } = get();
        const today = new Date().toISOString().split('T')[0];
        const todayPain = getTodayPainLevel();
        const activeReminders = medicationReminders.filter((r) => {
          if (!r.active) return false;
          if (r.startDate > today) return false;
          if (r.endDate && r.endDate < today) return false;
          if (r.category === 'dysmenorrhea' && r.linkedPainLevel && todayPain < r.linkedPainLevel) {
            return false;
          }
          return true;
        });

        const schedule: { reminder: MedicationReminder; time: string; record?: MedicationRecord }[] = [];
        for (const reminder of activeReminders) {
          for (const time of reminder.times) {
            const record = medicationRecords.find(
              (r) => r.reminderId === reminder.id && r.date === today && r.time === time
            );
            schedule.push({ reminder, time, record });
          }
        }
        return schedule.sort((a, b) => a.time.localeCompare(b.time));
      },

      getMedicationAdherence: () => {
        const { getTodayMedicationSchedule } = get();
        const today = new Date().toISOString().split('T')[0];
        const { medicationRecords } = get();
        const schedule = getTodayMedicationSchedule();
        const total = schedule.length;
        const takenSet = new Set(
          schedule.filter((s) => s.record?.taken).map((s) => `${s.reminder.id}-${s.time}`)
        );
        const taken = takenSet.size;
        const rate = total > 0 ? Math.round((taken / total) * 100) : 0;
        return { total, taken, rate };
      },

      addHotFlashRecord: (record: HotFlashRecord) =>
        set((state) => ({
          hotFlashRecords: [...state.hotFlashRecords, record],
        })),

      addSleepRecord: (record: SleepRecord) =>
        set((state) => ({
          sleepRecords: [...state.sleepRecords, record],
        })),

      addHormoneRecord: (record: HormoneRecord) =>
        set((state) => ({
          hormoneRecords: [...state.hormoneRecords, record],
        })),

      getCurrentWeek: () => {
        const state = get();
        if (state.pregnancyData.manualWeek !== null) {
          return state.pregnancyData.manualWeek;
        }
        if (state.pregnancyData.lastMenstrualPeriodDate) {
          const lmp = new Date(state.pregnancyData.lastMenstrualPeriodDate);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - lmp.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const week = Math.floor(diffDays / 7);
          return Math.min(Math.max(week, 0), 42);
        }
        return 0;
      },

      getDueDate: () => {
        const state = get();
        if (state.pregnancyData.lastMenstrualPeriodDate) {
          const lmp = new Date(state.pregnancyData.lastMenstrualPeriodDate);
          lmp.setDate(lmp.getDate() + 280);
          return lmp.toISOString().split('T')[0];
        }
        return '';
      },

      getDaysPostpartum: () => {
        const state = get();
        if (state.postpartumData.deliveryDate) {
          const delivery = new Date(state.postpartumData.deliveryDate);
          const now = new Date();
          const diff = Math.floor((now.getTime() - delivery.getTime()) / (1000 * 60 * 60 * 24));
          return Math.max(diff, 0);
        }
        return 0;
      },

      getPelvicFloorTrend: () => {
        const { pelvicFloorRecords } = get();
        const map = new Map<string, { count: number; totalDifficulty: number; totalDuration: number }>();
        for (const r of pelvicFloorRecords) {
          const entry = map.get(r.date) || { count: 0, totalDifficulty: 0, totalDuration: 0 };
          entry.count += 1;
          entry.totalDifficulty += r.difficulty;
          entry.totalDuration += r.duration;
          map.set(r.date, entry);
        }
        return Array.from(map.entries())
          .map(([date, { count, totalDifficulty, totalDuration }]) => ({
            date,
            count,
            avgDifficulty: Number((totalDifficulty / count).toFixed(1)),
            totalDuration,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      getBreastfeedingStats: () => {
        const { breastfeedingRecords } = get();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000);
        const last24h = new Date(Date.now() - 24 * 3600 * 1000);

        const todayRecords = breastfeedingRecords.filter((r) => r.date === today);
        const last24hRecords = breastfeedingRecords.filter((r) => {
          const recordDate = new Date(`${r.date}T${r.startTime}`);
          return recordDate >= last24h;
        });

        return {
          todayCount: todayRecords.length,
          todayTotalMinutes: todayRecords.reduce((sum, r) => sum + (r.duration || 0), 0),
          last24hCount: last24hRecords.length,
        };
      },

      getNextPeriodDate: () => {
        const pred = get().getPeriodPrediction();
        return pred.predictedNextStart;
      },

      getOvulationDate: () => {
        const pred = get().getPeriodPrediction();
        return pred.adjustedOvulationDate || pred.ovulationDate;
      },

      getAdjustedOvulationDate: () => {
        const pred = get().getPeriodPrediction();
        return pred.adjustedOvulationDate || null;
      },

      extractPeriodStartDates: () => {
        const state = get();
        const { cycleData } = state;
        if (cycleData.periodStartDates && cycleData.periodStartDates.length > 0) {
          return [...cycleData.periodStartDates].sort();
        }
        const starts: string[] = [];
        const recordDates = [...cycleData.records]
          .map((r) => r.date)
          .sort();
        if (recordDates.length === 0) {
          if (cycleData.lastPeriodDate) starts.push(cycleData.lastPeriodDate);
          return starts;
        }
        const periodLen = Math.max(cycleData.periodLength, 3);
        let lastCluster: string | null = null;
        for (const d of recordDates) {
          if (!lastCluster) {
            starts.push(d);
            lastCluster = d;
          } else {
            const diff = diffDays(new Date(d), new Date(lastCluster));
            if (diff >= periodLen + 2) {
              starts.push(d);
              lastCluster = d;
            }
          }
        }
        if (cycleData.lastPeriodDate) {
          const lastInStarts = starts[starts.length - 1];
          if (!lastInStarts || diffDays(new Date(cycleData.lastPeriodDate), new Date(lastInStarts)) >= periodLen + 2) {
            starts.push(cycleData.lastPeriodDate);
          }
        }
        return Array.from(new Set(starts)).sort();
      },

      getCycleStatistics: () => {
        const state = get();
        const starts = state.extractPeriodStartDates();
        const fallback: CycleStatistics = {
          avgCycleLength: state.cycleData.cycleLength,
          avgPeriodLength: state.cycleData.periodLength,
          medianCycleLength: state.cycleData.cycleLength,
          stdDevCycle: 3,
          minCycleLength: state.cycleData.cycleLength,
          maxCycleLength: state.cycleData.cycleLength,
          cycleCount: 0,
          regularityScore: 50,
        };
        if (starts.length < 2) {
          return fallback;
        }
        const cycles: number[] = [];
        for (let i = 1; i < starts.length; i++) {
          const gap = diffDays(new Date(starts[i]), new Date(starts[i - 1]));
          if (gap >= 15 && gap <= 60) cycles.push(gap);
        }
        if (cycles.length === 0) return fallback;
        const avgC = cycles.reduce((a, b) => a + b, 0) / cycles.length;
        const sorted = [...cycles].sort((a, b) => a - b);
        const median =
          sorted.length % 2 === 0
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)];
        const variance =
          cycles.reduce((a, b) => a + (b - avgC) * (b - avgC), 0) / cycles.length;
        const stdDev = Math.sqrt(variance);
        const minC = Math.min(...cycles);
        const maxC = Math.max(...cycles);
        const cv = stdDev / avgC;
        let score = Math.max(0, 100 - cv * 300);
        if (cycles.length >= 6) score = Math.min(100, score + 10);
        if (cycles.length >= 12) score = Math.min(100, score + 5);
        if (cycles.length < 3) score = Math.max(0, score - 20);

        const periodLengths: number[] = [];
        for (let i = 0; i < starts.length; i++) {
          const startD = new Date(starts[i]);
          let inferredEnd = addDays(startD, state.cycleData.periodLength - 1);
          const nextStart = starts[i + 1];
          if (nextStart) {
            const ns = new Date(nextStart);
            if (inferredEnd > ns) inferredEnd = addDays(ns, -1);
          }
          const actualRecordsInRange = state.cycleData.records.filter((r) => {
            const rd = new Date(r.date);
            return rd >= startD && rd <= inferredEnd;
          });
          if (actualRecordsInRange.length > 0) {
            const dates = actualRecordsInRange.map((r) => new Date(r.date).getTime());
            const actualEnd = new Date(Math.max(...dates));
            periodLengths.push(diffDays(actualEnd, startD) + 1);
          } else {
            periodLengths.push(state.cycleData.periodLength);
          }
        }
        const avgPL =
          periodLengths.length > 0
            ? periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length
            : state.cycleData.periodLength;

        return {
          avgCycleLength: Math.round(avgC * 10) / 10,
          avgPeriodLength: Math.round(avgPL * 10) / 10,
          medianCycleLength: Math.round(median * 10) / 10,
          stdDevCycle: Math.round(stdDev * 10) / 10,
          minCycleLength: minC,
          maxCycleLength: maxC,
          cycleCount: cycles.length,
          regularityScore: Math.round(score),
        };
      },

      getPeriodPrediction: () => {
        const state = get();
        const stats = state.getCycleStatistics();
        const starts = state.extractPeriodStartDates();
        const todayD = new Date();
        todayD.setHours(0, 0, 0, 0);

        let avgCycle = stats.avgCycleLength;
        if (stats.cycleCount < 3) {
          avgCycle = state.cycleData.cycleLength;
        }
        const lastStartStr =
          starts.length > 0 ? starts[starts.length - 1] : state.cycleData.lastPeriodDate;
        const lastStart = lastStartStr ? new Date(lastStartStr) : todayD;
        lastStart.setHours(0, 0, 0, 0);

        const predictedStart = addDays(lastStart, Math.round(avgCycle));
        const periodLen = Math.round(stats.avgPeriodLength) || state.cycleData.periodLength;
        const predictedEnd = addDays(predictedStart, periodLen - 1);

        let stdDev = stats.stdDevCycle;
        if (stats.cycleCount < 3) stdDev = Math.max(stdDev, 4);
        if (stats.cycleCount < 1) stdDev = 6;
        const zFactor = 1.96;
        const halfRange = Math.max(1, Math.round(stdDev * zFactor));
        const confidenceStart = addDays(predictedStart, -halfRange);
        const confidenceEnd = addDays(predictedStart, halfRange);

        let confidencePercent = stats.regularityScore;
        if (stats.cycleCount >= 6) confidencePercent = Math.min(98, confidencePercent + 5);
        if (stats.cycleCount <= 1) confidencePercent = Math.max(30, confidencePercent - 20);

        let confidenceLevel: 'low' | 'medium' | 'high' = 'medium';
        if (confidencePercent >= 75) confidenceLevel = 'high';
        else if (confidencePercent < 50) confidenceLevel = 'low';

        const ovulation = addDays(predictedStart, -14);
        const fertileStart = addDays(ovulation, -5);
        const fertileEnd = addDays(ovulation, 1);

        const ovuRecords = [...state.ovulationRecords].sort((a, b) => a.date.localeCompare(b.date));
        const recordMap = new Map<string, OvulationRecord>();
        ovuRecords.forEach((r) => recordMap.set(r.date, r));

        const lhPositiveDates = ovuRecords.filter(
          (r) => r.lhTest === 'positive' || r.lhTest === 'strong_positive'
        );
        let lhSurgeDate: Date | null = null;
        if (lhPositiveDates.length > 0) {
          const sortedByIntensity = [...lhPositiveDates].sort((a, b) => (b.lhIntensity || 0) - (a.lhIntensity || 0));
          lhSurgeDate = new Date(sortedByIntensity[0].date);
          lhSurgeDate.setHours(0, 0, 0, 0);
        }

        let tempShiftDate: Date | null = null;
        const sortedRecords = [...ovuRecords].sort((a, b) => a.date.localeCompare(b.date));
        for (let i = 3; i < sortedRecords.length; i++) {
          const current = sortedRecords[i];
          if (!current.basalTemp) continue;
          const prevTemps: number[] = [];
          for (let j = i - 3; j < i; j++) {
            if (sortedRecords[j]?.basalTemp) prevTemps.push(sortedRecords[j].basalTemp);
          }
          if (prevTemps.length >= 2) {
            const avgPrev = prevTemps.reduce((a, b) => a + b, 0) / prevTemps.length;
            if (current.basalTemp - avgPrev >= 0.2) {
              tempShiftDate = new Date(current.date);
              tempShiftDate.setHours(0, 0, 0, 0);
              break;
            }
          }
        }

        let adjustedOvulation: Date | null = null;
        if (lhSurgeDate && tempShiftDate) {
          const diff = Math.abs(diffDays(tempShiftDate, lhSurgeDate));
          if (diff <= 2) {
            adjustedOvulation = new Date(lhSurgeDate);
            adjustedOvulation.setDate(adjustedOvulation.getDate() + 1);
          } else {
            adjustedOvulation = new Date(lhSurgeDate);
            adjustedOvulation.setDate(adjustedOvulation.getDate() + 1);
          }
        } else if (lhSurgeDate) {
          adjustedOvulation = new Date(lhSurgeDate);
          adjustedOvulation.setDate(adjustedOvulation.getDate() + 1);
        } else if (tempShiftDate) {
          adjustedOvulation = new Date(tempShiftDate);
          adjustedOvulation.setDate(adjustedOvulation.getDate() - 1);
        }

        let adjustedFertileStart: Date | null = null;
        let adjustedFertileEnd: Date | null = null;
        if (adjustedOvulation) {
          adjustedFertileStart = addDays(adjustedOvulation, -5);
          adjustedFertileEnd = addDays(adjustedOvulation, 1);
        }

        const effectiveOvulation = adjustedOvulation || ovulation;
        const effectiveFertileStart = adjustedFertileStart || fertileStart;
        const effectiveFertileEnd = adjustedFertileEnd || fertileEnd;

        const lhScoreForDate = (d: Date): number => {
          const rec = recordMap.get(dateStr(d));
          if (!rec?.lhTest) return 0;
          if (rec.lhTest === 'strong_positive') return 30;
          if (rec.lhTest === 'positive') return 20;
          if (rec.lhTest === 'faint') return 8;
          return 0;
        };

        const tempScoreForDate = (d: Date): number => {
          const rec = recordMap.get(dateStr(d));
          if (!rec?.basalTemp) return 0;
          const dist = Math.abs(diffDays(d, effectiveOvulation));
          if (rec.tempShift && dist <= 1) return 15;
          if (dist <= 2 && rec.basalTemp >= 36.6) return 8;
          return 0;
        };

        const mucusScoreForDate = (d: Date): number => {
          const rec = recordMap.get(dateStr(d));
          if (!rec?.cervicalMucus) return 0;
          if (rec.cervicalMucus === '蛋清状') return 15;
          if (rec.cervicalMucus === '奶油状') return 8;
          if (rec.cervicalMucus === '粘稠') return 3;
          return 0;
        };

        const cycleScoreForDate = (d: Date): number => {
          const dist = diffDays(d, effectiveOvulation);
          if (dist === -1 || dist === 0) return 35;
          if (dist === -2) return 30;
          if (dist === -3) return 20;
          if (dist === -4) return 12;
          if (dist === -5) return 6;
          if (dist === 1) return 8;
          return 0;
        };

        const conceptionProbabilities: ConceptionProbability[] = [];
        const probStart = addDays(effectiveFertileStart, -1);
        const probEnd = addDays(effectiveFertileEnd, 1);
        for (let d = new Date(probStart); d <= probEnd; d.setDate(d.getDate() + 1)) {
          const ds = dateStr(new Date(d));
          const cycleScore = cycleScoreForDate(new Date(d));
          const lhScore = lhScoreForDate(new Date(d));
          const tempScore = tempScoreForDate(new Date(d));
          const mucusScore = mucusScoreForDate(new Date(d));
          let total = cycleScore + lhScore + tempScore + mucusScore;
          if (lhSurgeDate || tempShiftDate) {
            total = Math.min(98, total * 1.1);
          }
          total = Math.min(98, Math.max(0, Math.round(total)));
          let level: ConceptionProbability['level'] = 'low';
          if (total >= 30) level = 'medium';
          if (total >= 50) level = 'high';
          if (total >= 75) level = 'peak';
          conceptionProbabilities.push({
            date: ds,
            probability: total,
            level,
            factors: {
              cyclePrediction: cycleScore,
              lhTest: lhScore > 0 ? lhScore : undefined,
              basalTemp: tempScore > 0 ? tempScore : undefined,
              cervicalMucus: mucusScore > 0 ? mucusScore : undefined,
            },
          });
        }

        const daysUntilNext = diffDays(predictedStart, todayD);

        let cyclePhase: PredictionResult['cyclePhase'] = 'follicular';
        const currentPeriodEnd = addDays(lastStart, periodLen - 1);
        if (todayD >= lastStart && todayD <= currentPeriodEnd) {
          cyclePhase = 'period';
        } else if (todayD >= effectiveFertileStart && todayD <= effectiveFertileEnd) {
          const diffO = diffDays(todayD, effectiveOvulation);
          if (Math.abs(diffO) <= 1) cyclePhase = 'ovulation';
          else cyclePhase = 'fertile';
        } else if (todayD > currentPeriodEnd && todayD < effectiveOvulation) {
          cyclePhase = 'follicular';
        } else if (todayD > effectiveFertileEnd && todayD < predictedStart) {
          cyclePhase = 'luteal';
        } else if (todayD >= predictedStart && todayD <= predictedEnd) {
          cyclePhase = 'predicted_period';
        }

        return {
          predictedNextStart: dateStr(predictedStart),
          predictedNextEnd: dateStr(predictedEnd),
          confidenceIntervalStart: dateStr(confidenceStart),
          confidenceIntervalEnd: dateStr(confidenceEnd),
          confidenceLevel,
          confidencePercent,
          ovulationDate: dateStr(ovulation),
          adjustedOvulationDate: adjustedOvulation ? dateStr(adjustedOvulation) : undefined,
          fertileWindowStart: dateStr(fertileStart),
          fertileWindowEnd: dateStr(fertileEnd),
          adjustedFertileStart: adjustedFertileStart ? dateStr(adjustedFertileStart) : undefined,
          adjustedFertileEnd: adjustedFertileEnd ? dateStr(adjustedFertileEnd) : undefined,
          daysUntilNextPeriod: daysUntilNext,
          cyclePhase,
          statistics: stats,
          conceptionProbabilities,
        };
      },

      getConceptionProbability: (dateStrInput: string): ConceptionProbability | null => {
        const pred = get().getPeriodPrediction();
        if (!pred.conceptionProbabilities) return null;
        return pred.conceptionProbabilities.find((p) => p.date === dateStrInput) || null;
      },

      getCalendarDayInfo: (year: number, month: number, day: number): CalendarDayInfo => {
        const state = get();
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);
        const dateString = dateStr(date);

        const todayD = new Date();
        todayD.setHours(0, 0, 0, 0);
        const isToday = diffDays(date, todayD) === 0;

        const pred = state.getPeriodPrediction();
        const starts = state.extractPeriodStartDates();
        const periodLen = Math.round(pred.statistics.avgPeriodLength) || state.cycleData.periodLength;

        const dayRecord = state.ovulationRecords.find((r) => r.date === dateString);
        const hasRecord = !!dayRecord;
        const hasLHPositive = !!(dayRecord && (dayRecord.lhTest === 'positive' || dayRecord.lhTest === 'strong_positive'));
        const hasTempShift = !!dayRecord?.tempShift;

        const conceptionProb = pred.conceptionProbabilities?.find((p) => p.date === dateString);

        for (const s of starts) {
          const sd = new Date(s);
          sd.setHours(0, 0, 0, 0);
          const ed = addDays(sd, periodLen - 1);
          if (date >= sd && date <= ed) {
            return { type: 'period', date: dateString, isToday, hasRecord, hasLHPositive, hasTempShift };
          }
        }

        const predStart = new Date(pred.predictedNextStart);
        predStart.setHours(0, 0, 0, 0);
        const predEnd = new Date(pred.predictedNextEnd);
        predEnd.setHours(0, 0, 0, 0);
        if (date >= predStart && date <= predEnd) {
          const mid = new Date(pred.predictedNextStart);
          mid.setHours(0, 0, 0, 0);
          const d = Math.abs(diffDays(date, mid));
          const conf = Math.max(30, pred.confidencePercent - d * 8);
          return { type: 'predicted_period', date: dateString, isToday, confidence: conf, hasRecord, hasLHPositive, hasTempShift };
        }

        const ciStart = new Date(pred.confidenceIntervalStart);
        ciStart.setHours(0, 0, 0, 0);
        const ciEnd = new Date(pred.confidenceIntervalEnd);
        ciEnd.setHours(0, 0, 0, 0);
        if (date >= ciStart && date < predStart) {
          const d = diffDays(predStart, date);
          const conf = Math.max(10, 60 - d * 10);
          return { type: 'predicted_early', date: dateString, isToday, confidence: conf, hasRecord, hasLHPositive, hasTempShift };
        }
        if (date > predEnd && date <= ciEnd) {
          const d = diffDays(date, predEnd);
          const conf = Math.max(10, 60 - d * 10);
          return { type: 'predicted_late', date: dateString, isToday, confidence: conf, hasRecord, hasLHPositive, hasTempShift };
        }

        const effectiveOvulationStr = pred.adjustedOvulationDate || pred.ovulationDate;
        const ovuD = new Date(effectiveOvulationStr);
        ovuD.setHours(0, 0, 0, 0);
        if (diffDays(date, ovuD) === 0) {
          return { type: 'ovulation', date: dateString, isToday, hasRecord, hasLHPositive, hasTempShift, conceptionProbability: conceptionProb?.probability };
        }

        if (hasLHPositive) {
          return { type: 'lh_surge', date: dateString, isToday, hasRecord, hasLHPositive, hasTempShift, conceptionProbability: conceptionProb?.probability };
        }

        if (hasTempShift) {
          return { type: 'temp_shift', date: dateString, isToday, hasRecord, hasLHPositive, hasTempShift, conceptionProbability: conceptionProb?.probability };
        }

        const effectiveFertStart = pred.adjustedFertileStart ? new Date(pred.adjustedFertileStart) : new Date(pred.fertileWindowStart);
        effectiveFertStart.setHours(0, 0, 0, 0);
        const effectiveFertEnd = pred.adjustedFertileEnd ? new Date(pred.adjustedFertileEnd) : new Date(pred.fertileWindowEnd);
        effectiveFertEnd.setHours(0, 0, 0, 0);

        if (date >= effectiveFertStart && date <= effectiveFertEnd) {
          let dayType: CalendarDayInfo['type'] = 'fertile';
          if (conceptionProb) {
            if (conceptionProb.level === 'peak') dayType = 'fertile_peak';
            else if (conceptionProb.level === 'high') dayType = 'fertile_high';
          }
          return { type: dayType, date: dateString, isToday, hasRecord, hasLHPositive, hasTempShift, conceptionProbability: conceptionProb?.probability };
        }

        return { type: 'normal', date: dateString, isToday, hasRecord, hasLHPositive, hasTempShift };
      },

      getHotFlashTrend: () => {
        const { hotFlashRecords } = get();
        const map = new Map<string, { count: number; totalSeverity: number }>();
        for (const r of hotFlashRecords) {
          const entry = map.get(r.date) || { count: 0, totalSeverity: 0 };
          entry.count += 1;
          entry.totalSeverity += r.severity === 'mild' ? 1 : r.severity === 'moderate' ? 2 : 3;
          map.set(r.date, entry);
        }
        return Array.from(map.entries())
          .map(([date, { count, totalSeverity }]) => ({ date, count, avgSeverity: Number((totalSeverity / count).toFixed(1)) }))
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      getSleepTrend: () => {
        const { sleepRecords } = get();
        const map = new Map<string, { totalQuality: number; totalDuration: number; count: number }>();
        for (const r of sleepRecords) {
          const entry = map.get(r.date) || { totalQuality: 0, totalDuration: 0, count: 0 };
          entry.totalQuality += r.quality;
          entry.totalDuration += r.duration;
          entry.count += 1;
          map.set(r.date, entry);
        }
        return Array.from(map.entries())
          .map(([date, { totalQuality, totalDuration, count }]) => ({ date, avgQuality: Number((totalQuality / count).toFixed(1)), avgDuration: Number((totalDuration / count).toFixed(1)) }))
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      getHormoneTrend: () => {
        const { hormoneRecords } = get();
        return hormoneRecords
          .map((r) => ({
            date: r.date,
            estrogen: r.estrogenLevel,
            progesterone: r.progesteroneLevel,
            fsh: r.fshLevel,
            lh: r.lhLevel,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      getCyclePhaseForDate: (dateString: string) => {
        const state = get();
        const starts = state.extractPeriodStartDates();
        const date = new Date(dateString);
        const pred = state.getPeriodPrediction();
        const stats = state.getCycleStatistics();
        const periodLen = Math.round(stats.avgPeriodLength);
        const avgCycle = Math.round(stats.avgCycleLength);

        let nearestStart: string | null = null;
        let minDiff = Infinity;
        for (const start of starts) {
          const d = diffDays(date, new Date(start));
          if (d >= 0 && d < minDiff) {
            minDiff = d;
            nearestStart = start;
          }
        }

        if (!nearestStart) {
          const nextStart = new Date(pred.predictedNextStart);
          const prevStart = addDays(nextStart, -avgCycle);
          const d = diffDays(date, prevStart);
          if (d >= 0 && d < avgCycle) {
            nearestStart = dateStr(prevStart);
            minDiff = d;
          } else {
            return { phase: 'unknown' as CyclePhase, cycleDay: 0, periodStartDate: null };
          }
        }

        const cycleDay = minDiff + 1;
        let phase: CyclePhase = 'unknown';

        if (cycleDay <= periodLen) {
          phase = 'period';
        } else if (cycleDay < avgCycle - 16) {
          phase = 'follicular';
        } else if (cycleDay >= avgCycle - 16 && cycleDay <= avgCycle - 12) {
          phase = 'ovulation';
        } else if (cycleDay > avgCycle - 12 && cycleDay <= avgCycle) {
          phase = 'luteal';
        }

        return { phase, cycleDay, periodStartDate: nearestStart };
      },

      getSleepCycleAssociation: (): SleepCycleAssociation[] => {
        const state = get();
        const { sleepRecords } = state;

        return sleepRecords
          .slice()
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((record) => {
            const { phase, cycleDay } = state.getCyclePhaseForDate(record.date);
            return {
              date: record.date,
              cyclePhase: phase,
              cycleDay,
              sleepDuration: record.duration,
              sleepQuality: record.quality,
              interruptions: record.interruptions,
              nightSweats: record.nightSweats,
            };
          });
      },

      getPhaseSleepStatistics: (): PhaseSleepStatistics[] => {
        const state = get();
        const associations = state.getSleepCycleAssociation();
        const phaseNames: Record<CyclePhase, string> = {
          period: '月经期',
          follicular: '卵泡期',
          ovulation: '排卵期',
          luteal: '黄体期',
          unknown: '未知',
        };

        const phases: CyclePhase[] = ['period', 'follicular', 'ovulation', 'luteal'];
        return phases.map((phase) => {
          const phaseData = associations.filter((a) => a.cyclePhase === phase);
          if (phaseData.length === 0) {
            return {
              phase,
              phaseName: phaseNames[phase],
              sampleCount: 0,
              avgDuration: 0,
              avgQuality: 0,
              avgInterruptions: 0,
              nightSweatRate: 0,
            };
          }

          const durations = phaseData.map((d) => d.sleepDuration);
          const qualities = phaseData.map((d) => d.sleepQuality);
          const avgDur = durations.reduce((a, b) => a + b, 0) / durations.length;
          const avgQual = qualities.reduce((a, b) => a + b, 0) / qualities.length;
          const avgInt = phaseData.reduce((a, b) => a + b.interruptions, 0) / phaseData.length;
          const nightSweatRate = (phaseData.filter((d) => d.nightSweats).length / phaseData.length) * 100;

          const durStdDev = Math.sqrt(
            durations.reduce((a, b) => a + Math.pow(b - avgDur, 2), 0) / durations.length
          );
          const qualStdDev = Math.sqrt(
            qualities.reduce((a, b) => a + Math.pow(b - avgQual, 2), 0) / qualities.length
          );

          return {
            phase,
            phaseName: phaseNames[phase],
            sampleCount: phaseData.length,
            avgDuration: Number(avgDur.toFixed(1)),
            avgQuality: Number(avgQual.toFixed(1)),
            avgInterruptions: Number(avgInt.toFixed(1)),
            nightSweatRate: Number(nightSweatRate.toFixed(1)),
            durationStdDev: Number(durStdDev.toFixed(2)),
            qualityStdDev: Number(qualStdDev.toFixed(2)),
          };
        });
      },

      getSleepImpactAnalysis: (): SleepImpactAnalysis => {
        const state = get();
        const { sleepRecords, painRecords, cycleData } = state;
        const stats = state.getCycleStatistics();
        const phaseStats = state.getPhaseSleepStatistics();
        const associations = state.getSleepCycleAssociation();

        const overallScore = sleepRecords.length > 0
          ? Math.min(100, Math.round(
              sleepRecords.reduce((sum, r) => {
                const durationScore = Math.min(100, (r.duration / 8) * 100);
                const qualityScore = (r.quality / 5) * 100;
                const interruptionPenalty = r.interruptions * 5;
                return sum + Math.max(0, (durationScore + qualityScore) / 2 - interruptionPenalty);
              }, 0) / sleepRecords.length
            ))
          : 0;

        const periodPhase = phaseStats.find((p) => p.phase === 'period');
        const follicularPhase = phaseStats.find((p) => p.phase === 'follicular');
        const lutealPhase = phaseStats.find((p) => p.phase === 'luteal');

        let cycleLengthVariation = 0;
        let periodLengthVariation = 0;
        if (stats.cycleCount >= 3) {
          cycleLengthVariation = stats.stdDevCycle;
          const starts = state.extractPeriodStartDates();
          if (starts.length >= 2) {
            const periodLengths: number[] = [];
            for (let i = 0; i < starts.length; i++) {
              const start = new Date(starts[i]);
              const nextStart = i + 1 < starts.length ? new Date(starts[i + 1]) : null;
              const endDate = nextStart ? addDays(nextStart, -1) : addDays(start, stats.avgPeriodLength + 5);
              const periodDaysInCycle = cycleData.records.filter(
                (r) => r.date >= starts[i] && r.date <= dateStr(endDate)
              );
              if (periodDaysInCycle.length > 0) {
                const sortedDates = periodDaysInCycle.map((r) => r.date).sort();
                let consecutiveDays = 1;
                for (let j = 1; j < sortedDates.length; j++) {
                  const gap = diffDays(new Date(sortedDates[j]), new Date(sortedDates[j - 1]));
                  if (gap <= 2) {
                    consecutiveDays++;
                  } else {
                    break;
                  }
                }
                periodLengths.push(consecutiveDays);
              }
            }
            if (periodLengths.length > 1) {
              const avgPL = periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length;
              periodLengthVariation = Math.sqrt(
                periodLengths.reduce((a, b) => a + Math.pow(b - avgPL, 2), 0) / periodLengths.length
              );
            }
          }
        }

        const poorSleepDays = associations.filter((a) => a.sleepQuality <= 2 || a.sleepDuration < 6).length;
        const periodPoorSleepDays = associations.filter(
          (a) => a.cyclePhase === 'period' && (a.sleepQuality <= 2 || a.sleepDuration < 6)
        ).length;

        let severity: 'low' | 'moderate' | 'high' = 'low';
        let impactDescription = '';

        if (sleepRecords.length < 7) {
          impactDescription = '记录更多睡眠数据以获取准确的周期影响分析';
        } else if (stats.cycleCount < 2) {
          impactDescription = '需要更多经期记录以分析睡眠对周期的影响';
        } else if (periodPhase && follicularPhase && periodPhase.avgQuality < follicularPhase.avgQuality - 0.8) {
          severity = 'high';
          impactDescription = '经期睡眠质量明显下降，可能加重经期不适和周期不规律';
        } else if (lutealPhase && follicularPhase && lutealPhase.avgQuality < follicularPhase.avgQuality - 0.5) {
          severity = 'moderate';
          impactDescription = '黄体期睡眠质量有所下降，注意经前期睡眠调理';
        } else if (poorSleepDays > sleepRecords.length * 0.3) {
          severity = 'moderate';
          impactDescription = '整体睡眠质量欠佳，可能影响内分泌平衡和周期规律性';
        } else {
          severity = 'low';
          impactDescription = '睡眠状况良好，对周期没有明显负面影响';
        }

        let painCorrelation = 0;
        if (painRecords.length > 3 && periodPhase) {
          const periodPainRecords = painRecords.filter((p) => {
            const { phase } = state.getCyclePhaseForDate(p.date);
            return phase === 'period';
          });
          if (periodPainRecords.length > 2 && periodPhase.avgQuality < 3.5) {
            painCorrelation = Math.min(100, (5 - periodPhase.avgQuality) * 20 + periodPhase.avgInterruptions * 5);
          }
        }

        const keyInsights: SleepImpactAnalysis['keyInsights'] = [];

        if (periodPhase && periodPhase.sampleCount > 0) {
          if (periodPhase.avgDuration < 6.5) {
            keyInsights.push({
              type: 'warning',
              title: '经期睡眠时长不足',
              description: `月经期平均睡眠仅 ${periodPhase.avgDuration} 小时，建议保证7-8小时睡眠以帮助身体恢复`,
              icon: '⚠️',
            });
          }
          if (periodPhase.avgQuality < 3) {
            keyInsights.push({
              type: 'warning',
              title: '经期睡眠质量偏低',
              description: `月经期睡眠质量评分仅 ${periodPhase.avgQuality}/5，${periodPhase.nightSweatRate > 30 ? '夜间盗汗发生率' + periodPhase.nightSweatRate.toFixed(0) + '%' + '，' : ''}建议睡前减少刺激，保持舒适环境`,
              icon: '😴',
            });
          }
          if (periodPhase.avgInterruptions > 2) {
            keyInsights.push({
              type: 'warning',
              title: '经期易中断睡眠',
              description: `月经期夜间平均中断 ${periodPhase.avgInterruptions} 次，可能与痛经、频繁如厕有关`,
              icon: '🔔',
            });
          }
          if (periodPhase.avgQuality >= 4 && periodPhase.avgDuration >= 7) {
            keyInsights.push({
              type: 'good',
              title: '经期睡眠习惯良好',
              description: '月经期保持了良好的睡眠质量和时长，有助于缓解经期不适',
              icon: '✨',
            });
          }
        }

        if (lutealPhase && follicularPhase && lutealPhase.sampleCount > 0 && follicularPhase.sampleCount > 0) {
          if (lutealPhase.avgQuality < follicularPhase.avgQuality - 0.5) {
            keyInsights.push({
              type: 'info',
              title: '黄体期睡眠波动',
              description: `黄体期睡眠质量比卵泡期低 ${(follicularPhase.avgQuality - lutealPhase.avgQuality).toFixed(1)} 分，与黄体酮波动有关`,
              icon: '📊',
            });
          }
          if (lutealPhase.nightSweatRate > follicularPhase.nightSweatRate + 20) {
            keyInsights.push({
              type: 'info',
              title: '经前期夜间盗汗增加',
              description: `黄体期夜间盗汗发生率比卵泡期高 ${(lutealPhase.nightSweatRate - follicularPhase.nightSweatRate).toFixed(0)}%`,
              icon: '💧',
            });
          }
        }

        if (stats.regularityScore < 60 && overallScore < 60) {
          keyInsights.push({
            type: 'warning',
            title: '睡眠与周期相关性',
            description: '睡眠规律性评分较低，同时周期规律性也偏低，改善睡眠可能有助于周期恢复',
            icon: '🔗',
          });
        }

        if (keyInsights.length === 0) {
          keyInsights.push({
            type: 'info',
            title: '数据收集中',
            description: '继续记录睡眠和周期数据，将获得更多个性化洞察',
            icon: '📈',
          });
        }

        const correlationData = associations.map((a) => ({
          date: a.date,
          duration: a.sleepDuration,
          quality: a.sleepQuality,
          periodDay: a.cyclePhase === 'period' ? a.cycleDay : null,
          isPeriod: a.cyclePhase === 'period',
        }));

        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        const recentAssociations = associations.filter(
          (a) => new Date(a.date) >= last30Days
        );

        const weekMap = new Map<string, { durations: number[]; qualities: number[]; interruptions: number[]; periodStart?: string }>();
        for (const a of recentAssociations) {
          const d = new Date(a.date);
          const weekStart = new Date(d);
          weekStart.setDate(d.getDate() - d.getDay());
          const weekKey = dateStr(weekStart);
          const entry = weekMap.get(weekKey) || { durations: [], qualities: [], interruptions: [] };
          entry.durations.push(a.sleepDuration);
          entry.qualities.push(a.sleepQuality);
          entry.interruptions.push(a.interruptions);

          const starts = state.extractPeriodStartDates();
          const periodInWeek = starts.find((s) => {
            const sd = new Date(s);
            return sd >= weekStart && sd < addDays(weekStart, 7);
          });
          if (periodInWeek) {
            entry.periodStart = periodInWeek;
          }

          weekMap.set(weekKey, entry);
        }

        const weeklyTrend = Array.from(weekMap.entries())
          .map(([date, { durations, qualities, interruptions, periodStart }]) => ({
            date,
            avgDuration: Number((durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1)),
            avgQuality: Number((qualities.reduce((a, b) => a + b, 0) / qualities.length).toFixed(1)),
            avgInterruptions: Number((interruptions.reduce((a, b) => a + b, 0) / interruptions.length).toFixed(1)),
            periodStart,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        return {
          overallScore,
          periodImpact: {
            cycleLengthVariation: Number(cycleLengthVariation.toFixed(1)),
            periodLengthVariation: Number(periodLengthVariation.toFixed(1)),
            painLevelCorrelation: Number(painCorrelation.toFixed(0)),
            severity,
            description: impactDescription,
          },
          phasePatterns: phaseStats,
          keyInsights,
          recommendations: [],
          correlationData,
          weeklyTrend,
        };
      },

      getSleepRecommendations: (analysis: SleepImpactAnalysis): SleepRecommendation[] => {
        const state = get();
        const { periodImpact, phasePatterns, overallScore } = analysis;
        const recommendations: SleepRecommendation[] = [];

        const periodPhase = phasePatterns.find((p) => p.phase === 'period');
        const lutealPhase = phasePatterns.find((p) => p.phase === 'luteal');
        const follicularPhase = phasePatterns.find((p) => p.phase === 'follicular');

        if (periodPhase && periodPhase.avgDuration < 7) {
          recommendations.push({
            id: generateId(),
            priority: 'high',
            category: 'schedule',
            categoryName: '作息调整',
            title: '经期提前入睡',
            description: '经期身体疲劳感更强，需要更多睡眠时间帮助恢复',
            actionableSteps: [
              '经期每晚提前30分钟上床准备',
              '睡前1小时停止使用电子设备',
              '建立固定的睡前放松仪式（如泡脚、冥想）',
              '保证每天7-8小时睡眠时长',
            ],
            expectedBenefit: '改善经期疲劳感，减少头晕乏力',
            relatedPhase: 'period',
            timeToEffect: '1-3天',
          });
        }

        if (periodPhase && periodPhase.avgQuality < 3.5) {
          recommendations.push({
            id: generateId(),
            priority: 'high',
            category: 'environment',
            categoryName: '环境优化',
            title: '营造经期舒适睡眠环境',
            description: '经期身体对环境更敏感，适宜的环境有助于提升睡眠质量',
            actionableSteps: [
              '保持卧室温度在18-22℃，避免过热',
              '使用透气舒适的床品和经期专用用品',
              '睡前准备好温水、止痛药等以备夜间需要',
              '使用遮光窗帘，保持卧室黑暗',
            ],
            expectedBenefit: '减少夜间醒来次数，提升深睡比例',
            relatedPhase: 'period',
            timeToEffect: '立即',
          });
        }

        if (lutealPhase && follicularPhase && lutealPhase.avgQuality < follicularPhase.avgQuality - 0.5) {
          recommendations.push({
            id: generateId(),
            priority: 'medium',
            category: 'lifestyle',
            categoryName: '生活方式',
            title: '黄体期睡眠调理',
            description: '黄体期孕激素波动会影响睡眠质量，需要额外关注',
            actionableSteps: [
              '经前1周减少咖啡因摄入，下午2点后不喝咖啡',
              '睡前避免进食过饱，减少辛辣油腻食物',
              '适当进行轻度拉伸或瑜伽，帮助放松',
              '睡前可听舒缓音乐或白噪音',
            ],
            expectedBenefit: '缓解经前期睡眠问题，改善情绪波动',
            relatedPhase: 'luteal',
            timeToEffect: '1-2个周期',
          });
        }

        if (overallScore < 60) {
          recommendations.push({
            id: generateId(),
            priority: 'high',
            category: 'schedule',
            categoryName: '作息调整',
            title: '建立规律作息',
            description: '不规律的作息会影响内分泌，进而影响月经周期',
            actionableSteps: [
              '每天固定时间上床和起床，包括周末',
              '入睡时间控制在22:00-23:00之间',
              '起床后开窗通风，接受自然光照射',
              '白天适当运动，帮助建立睡眠节律',
            ],
            expectedBenefit: '改善内分泌节律，提高周期规律性',
            timeToEffect: '2-4周',
          });
        }

        const avgInterruptions = phasePatterns.reduce((sum, p) => sum + p.avgInterruptions, 0) / Math.max(1, phasePatterns.filter(p => p.sampleCount > 0).length);
        if (avgInterruptions > 1.5) {
          recommendations.push({
            id: generateId(),
            priority: 'medium',
            category: 'lifestyle',
            categoryName: '生活方式',
            title: '减少夜间中断',
            description: '频繁的夜间中断会严重影响睡眠质量和激素分泌',
            actionableSteps: [
              '睡前2小时减少饮水量，避免夜间频繁如厕',
              '经期睡前排空膀胱，准备好夜间用品',
              '如果有痛经，睡前可预防性服用止痛药',
              '保持卧室安静，必要时使用耳塞',
            ],
            expectedBenefit: '增加深睡时间，提升白天精力',
            timeToEffect: '3-7天',
          });
        }

        const avgNightSweatRate = phasePatterns.reduce((sum, p) => sum + p.nightSweatRate, 0) / Math.max(1, phasePatterns.filter(p => p.sampleCount > 0).length);
        if (avgNightSweatRate > 30) {
          recommendations.push({
            id: generateId(),
            priority: 'medium',
            category: 'environment',
            categoryName: '环境优化',
            title: '应对夜间盗汗',
            description: '夜间盗汗与激素波动有关，适当的环境调整可减轻影响',
            actionableSteps: [
              '使用透气吸汗的纯棉睡衣和床品',
              '卧室保持通风，温度略低（18-20℃）',
              '床边准备毛巾和替换衣物',
              '睡前避免饮酒和辛辣食物',
            ],
            expectedBenefit: '减少盗汗对睡眠的干扰，提升舒适度',
            timeToEffect: '立即',
          });
        }

        if (periodImpact.severity === 'high') {
          recommendations.push({
            id: generateId(),
            priority: 'high',
            category: 'medical',
            categoryName: '医疗建议',
            title: '关注睡眠对周期的影响',
            description: '睡眠问题已明显影响到您的月经周期，建议积极改善',
            actionableSteps: [
              '持续记录睡眠和周期数据，观察变化规律',
              '如果改善睡眠2个月后周期仍不规律，建议咨询妇科医生',
              '可考虑进行激素水平检查',
              '必要时寻求睡眠专科医生的帮助',
            ],
            expectedBenefit: '明确原因，针对性改善周期健康',
            timeToEffect: '持续关注',
          });
        }

        if (overallScore >= 70 && periodImpact.severity === 'low') {
          recommendations.push({
            id: generateId(),
            priority: 'low',
            category: 'lifestyle',
            categoryName: '生活方式',
            title: '保持良好的睡眠习惯',
            description: '您的睡眠状况良好，继续保持将对周期健康产生积极影响',
            actionableSteps: [
              '继续保持规律的作息时间',
              '经期特别注意休息和保暖',
              '每周保持3-4次适度运动',
              '均衡饮食，避免过度疲劳',
            ],
            expectedBenefit: '维持良好的周期健康状态',
            timeToEffect: '持续',
          });
        }

        const validPhases = phasePatterns.filter(p => p.sampleCount >= 2).length;
        if (validPhases < 2) {
          recommendations.push({
            id: generateId(),
            priority: 'low',
            category: 'schedule',
            categoryName: '数据记录',
            title: '继续记录获取更准确建议',
            description: '需要更多周期的睡眠数据来生成更个性化的建议',
            actionableSteps: [
              '每天记录睡眠情况，包括周末',
              '完整记录至少2-3个周期',
              '备注影响睡眠的特殊情况',
              '同时记录经期症状和疼痛程度',
            ],
            expectedBenefit: '获得更精准的个性化分析和建议',
            timeToEffect: '2-3个周期',
          });
        }

        return recommendations.sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
      },

      addFamilyMember: (member: Omit<FamilyMember, 'id' | 'createdAt'>) =>
        set((state) => ({
          familyMembers: [
            ...state.familyMembers,
            {
              ...member,
              id: generateId(),
              createdAt: new Date().toISOString().split('T')[0],
            },
          ],
        })),

      updateFamilyMember: (id: string, data: Partial<FamilyMember>) =>
        set((state) => ({
          familyMembers: state.familyMembers.map((m) =>
            m.id === id ? { ...m, ...data } : m
          ),
        })),

      removeFamilyMember: (id: string) =>
        set((state) => ({
          familyMembers: state.familyMembers.filter((m) => m.id !== id),
        })),

      updateMemberPermissions: (id: string, permissions: PermissionConfig) =>
        set((state) => ({
          familyMembers: state.familyMembers.map((m) =>
            m.id === id ? { ...m, permissions } : m
          ),
        })),

      generateShareCode: (permissions: PermissionConfig, validHours: number = 24) => {
        const newCode: ShareCode = {
          id: generateId(),
          code: generateShareCodeString(),
          permissions,
          expiresAt: new Date(Date.now() + validHours * 3600 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          used: false,
        };
        set((state) => ({
          shareCodes: [...state.shareCodes, newCode],
        }));
        return newCode;
      },

      revokeShareCode: (codeId: string) =>
        set((state) => ({
          shareCodes: state.shareCodes.filter((c) => c.id !== codeId),
        })),

      redeemShareCode: (code: string, memberName: string, relation: FamilyRelation) => {
        const state = get();
        const shareCode = state.shareCodes.find(
          (c) => c.code === code.toUpperCase() && !c.used && new Date(c.expiresAt) > new Date()
        );
        if (!shareCode) return null;

        const newMember: FamilyMember = {
          id: generateId(),
          name: memberName,
          relation,
          permissions: shareCode.permissions,
          createdAt: new Date().toISOString().split('T')[0],
          active: true,
        };

        set((s) => ({
          familyMembers: [...s.familyMembers, newMember],
          shareCodes: s.shareCodes.map((c) =>
            c.id === shareCode.id ? { ...c, used: true, usedBy: newMember.id } : c
          ),
        }));

        return newMember;
      },

      getMaskedHealthData: (permissions: PermissionConfig): MaskedHealthData => {
        const state = get();
        const result: MaskedHealthData = {};

        if (permissions.cycle || permissions.pain) {
          const pred = state.getPeriodPrediction();
          const todayPain = state.getTodayPainLevel();
          const phaseNames: Record<string, string> = {
            period: '月经期',
            follicular: '卵泡期',
            ovulation: '排卵期',
            fertile: '易孕期',
            luteal: '黄体期',
            predicted_period: '预期经期',
          };
          let painLevel: 'none' | 'mild' | 'moderate' | 'severe' = 'none';
          if (todayPain > 0 && todayPain <= 3) painLevel = 'mild';
          else if (todayPain > 3 && todayPain <= 6) painLevel = 'moderate';
          else if (todayPain > 6) painLevel = 'severe';

          if (permissions.cycle) {
            result.cycle = {
              cyclePhase: phaseNames[pred.cyclePhase] || '未知',
              daysUntilNextPeriod: pred.daysUntilNextPeriod,
              hasPainToday: todayPain > 0,
              painLevel: permissions.pain ? painLevel : undefined,
            };
          }
        }

        if (permissions.sleep) {
          const trend = state.getSleepTrend();
          const last7 = trend.slice(-7);
          if (last7.length > 0) {
            const avgDuration = last7.reduce((s, r) => s + r.avgDuration, 0) / last7.length;
            const avgQuality = last7.reduce((s, r) => s + r.avgQuality, 0) / last7.length;
            const poorDays = last7.filter((r) => r.avgQuality <= 2 || r.avgDuration < 6).length;
            result.sleep = {
              avgDuration: Number(avgDuration.toFixed(1)),
              avgQuality: Number(avgQuality.toFixed(1)),
              poorSleepDays: poorDays,
            };
          }
        }

        if (permissions.mood) {
          const recent = state.moodRecords.slice(-7);
          if (recent.length > 0) {
            const latestMood = recent[recent.length - 1].mood;
            let trend: 'improving' | 'stable' | 'declining' | 'unknown' = 'unknown';
            if (recent.length >= 3) {
              const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
              const secondHalf = recent.slice(Math.floor(recent.length / 2));
              const firstIntensity = firstHalf.reduce((s, r) => s + r.intensity, 0) / firstHalf.length;
              const secondIntensity = secondHalf.reduce((s, r) => s + r.intensity, 0) / secondHalf.length;
              if (secondIntensity - firstIntensity > 1) trend = 'improving';
              else if (firstIntensity - secondIntensity > 1) trend = 'declining';
              else trend = 'stable';
            }
            result.mood = {
              recentMood: latestMood,
              moodTrend: trend,
            };
          }
        }

        if (permissions.medication) {
          const adherence = state.getMedicationAdherence();
          result.medication = {
            todayTotal: adherence.total,
            todayTaken: adherence.taken,
            adherenceRate: adherence.rate,
          };
        }

        if (permissions.pain && !permissions.cycle) {
          const today = new Date().toISOString().split('T')[0];
          const todayPain = state.painRecords.find((p) => p.date === today);
          const todayLevel = todayPain ? todayPain.level : 0;
          const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
          const recentPains = state.painRecords.filter((p) => p.date >= weekAgo);
          const painDays7d = new Set(recentPains.map((p) => p.date)).size;
          const recentAve = recentPains.length > 0
            ? Math.round(recentPains.reduce((s, p) => s + p.level, 0) / recentPains.length * 10) / 10
            : 0;
          result.pain = {
            todayLevel,
            hasPainToday: todayLevel > 0,
            recentAveLevel: recentAve,
            painDays7d,
          };
        }

        if (permissions.pregnancy) {
          const week = state.getCurrentWeek();
          const dueDate = state.getDueDate();
          const today = new Date().toISOString().split('T')[0];
          const upcoming = state.prenatalCheckups.filter((c) => !c.completed && c.date >= today).length;
          const completed = state.prenatalCheckups.filter((c) => c.completed).length;
          if (week > 0 || dueDate) {
            result.pregnancy = {
              currentWeek: week,
              dueDate,
              upcomingCheckupCount: upcoming,
              completedCheckupCount: completed,
            };
          }
        }

        if (permissions.postpartum) {
          const days = state.getDaysPostpartum();
          const hasPostpartumData =
            state.postpartumData.deliveryDate ||
            state.lochiaRecords.length > 0 ||
            state.breastfeedingRecords.length > 0 ||
            state.pelvicFloorRecords.length > 0 ||
            state.postpartumCheckups.length > 0;

          if (hasPostpartumData) {
            let phase = '未知';
            if (days <= 7) phase = '产褥期';
            else if (days <= 42) phase = '产褥期恢复';
            else if (days <= 90) phase = '产后恢复期';
            else if (days <= 180) phase = '产后调理期';
            else phase = '已过恢复期';

            const breastfeedingStats = state.getBreastfeedingStats();
            const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
            const recentExercises = state.pelvicFloorRecords.filter((r) => r.date >= weekAgo).length;
            const today = new Date().toISOString().split('T')[0];
            const upcomingCheckups = state.postpartumCheckups.filter((c) => !c.completed && c.date >= today).length;

            result.postpartum = {
              daysPostpartum: days,
              recoveryPhase: phase,
              breastfeedingTodayCount: breastfeedingStats.todayCount,
              pelvicFloorExercisesThisWeek: recentExercises,
              upcomingCheckupCount: upcomingCheckups,
            };
          }
        }

        if (permissions.nutrition) {
          try {
            const nutritionStore = useNutritionStore.getState();
            const today = new Date().toISOString().split('T')[0];
            const summary = nutritionStore.getDailyNutritionSummary(today);
            const target = nutritionStore.getCalorieTarget();
            const gaps = nutritionStore.getNutrientGapAnalysis(today);
            const keyDeficits = gaps
              .filter((g) => g.percentage < 70)
              .slice(0, 3)
              .map((g) => g.nutrientName);

            result.nutrition = {
              todayCalories: summary.totalCalories,
              calorieTarget: target,
              proteinAdequacy: summary.totalProtein > 0
                ? Math.min(100, Math.round((summary.totalProtein / 60) * 100))
                : 0,
              keyGaps: keyDeficits,
            };
          } catch {
            result.nutrition = {
              todayCalories: 0,
              calorieTarget: 2000,
              proteinAdequacy: 0,
              keyGaps: [],
            };
          }
        }

        return result;
      },

      createRehabPlan: (plan: Omit<RehabPlan, 'id' | 'createdAt'>) => {
        const newPlan: RehabPlan = {
          ...plan,
          id: generateId(),
          createdAt: new Date().toISOString().split('T')[0],
        };
        set((state) => ({
          rehabPlans: [...state.rehabPlans, newPlan],
          activeRehabPlanId: state.activeRehabPlanId || newPlan.id,
        }));
        return newPlan;
      },

      updateRehabPlan: (id: string, data: Partial<RehabPlan>) =>
        set((state) => ({
          rehabPlans: state.rehabPlans.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),

      deleteRehabPlan: (id: string) =>
        set((state) => ({
          rehabPlans: state.rehabPlans.filter((p) => p.id !== id),
          rehabCheckins: state.rehabCheckins.filter((c) => c.planId !== id),
          activeRehabPlanId: state.activeRehabPlanId === id ? null : state.activeRehabPlanId,
        })),

      setActiveRehabPlan: (id: string | null) =>
        set({ activeRehabPlanId: id }),

      addRehabCheckin: (checkin: Omit<RehabCheckin, 'id'>) =>
        set((state) => ({
          rehabCheckins: [
            ...state.rehabCheckins,
            { ...checkin, id: generateId() },
          ],
        })),

      getRehabCheckinsByPlan: (planId: string) => {
        const { rehabCheckins } = get();
        return rehabCheckins
          .filter((c) => c.planId === planId)
          .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
      },

      getRehabCheckinsByDate: (date: string) => {
        const { rehabCheckins } = get();
        return rehabCheckins.filter((c) => c.date === date);
      },

      getCurrentRehabPhase: (planId: string): RehabPhase | null => {
        const state = get();
        const plan = state.rehabPlans.find((p) => p.id === planId);
        if (!plan) return null;

        const startDate = new Date(plan.startDate);
        const now = new Date();
        const daysSinceStart = diffDays(now, startDate);
        const weeksSinceStart = daysSinceStart / 7;

        let accumulatedWeeks = 0;
        for (const phase of plan.phases) {
          accumulatedWeeks += phase.durationWeeks;
          if (weeksSinceStart <= accumulatedWeeks) {
            return phase;
          }
        }
        return plan.phases[plan.phases.length - 1];
      },

      getRehabProgress: (planId: string) => {
        const state = get();
        const plan = state.rehabPlans.find((p) => p.id === planId);
        const checkins = state.rehabCheckins.filter((c) => c.planId === planId);
        const currentPhase = state.getCurrentRehabPhase(planId);

        const phaseProgress = {} as Record<RehabPhaseType, number>;
        if (plan) {
          const startDate = new Date(plan.startDate);
          const now = new Date();
          const daysSinceStart = diffDays(now, startDate);

          let accumulatedDays = 0;
          for (const phase of plan.phases) {
            const phaseDays = phase.durationWeeks * 7;
            const phaseStart = accumulatedDays;
            const phaseEnd = accumulatedDays + phaseDays;

            if (daysSinceStart <= phaseStart) {
              phaseProgress[phase.id] = 0;
            } else if (daysSinceStart >= phaseEnd) {
              phaseProgress[phase.id] = 100;
            } else {
              phaseProgress[phase.id] = Math.round(
                ((daysSinceStart - phaseStart) / phaseDays) * 100
              );
            }
            accumulatedDays = phaseEnd;
          }
        }

        const weekAgo = new Date(Date.now() - 7 * 86400000);
        const weeklyCheckins = checkins.filter(
          (c) => new Date(c.date) >= weekAgo
        );

        let streak = 0;
        const checkinDates = new Set(checkins.map((c) => c.date));
        let checkDate = new Date();
        while (checkinDates.has(dateStr(checkDate))) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }

        const milestones = plan?.milestones || [];
        const milestonesAchieved = milestones.filter((m) => m.achieved).length;

        return {
          planId,
          currentPhase: currentPhase?.id || 'phase1',
          startDate: plan?.startDate || '',
          totalCheckins: checkins.length,
          weeklyStreak: streak,
          phaseProgress,
          milestonesAchieved,
          totalMilestones: milestones.length,
        };
      },

      getWeeklyRehabStats: (planId: string) => {
        const state = get();
        const weekAgo = new Date(Date.now() - 7 * 86400000);
        const weekAgoStr = dateStr(weekAgo);
        const checkins = state.rehabCheckins.filter(
          (c) => c.planId === planId && c.date >= weekAgoStr
        );

        const completedDays = Array.from(new Set(checkins.map((c) => c.date)));
        const totalMinutes = checkins.reduce((sum, c) => sum + c.totalDuration, 0);
        const avgPain = checkins.length > 0
          ? Number((checkins.reduce((sum, c) => sum + c.painLevel, 0) / checkins.length).toFixed(1))
          : 0;

        return {
          checkins: checkins.length,
          totalMinutes,
          avgPain,
          completedDays,
        };
      },

      getDefaultRehabPlan: (type: RehabPlan['type']) => {
        const phasesBuilder = type === 'postpartum' ? buildDefaultRehabPhases :
                              type === 'pelvic-floor' ? buildPelvicFloorPhases :
                              type === 'core' ? buildCorePhases :
                              type === 'general' ? buildGeneralPhases :
                              buildCustomPhases;
        return {
          name: type === 'postpartum' ? '产后综合康复计划' :
                type === 'pelvic-floor' ? '盆底肌专项康复' :
                type === 'core' ? '核心肌群康复计划' :
                type === 'general' ? '通用康复计划' : '自定义康复计划',
          type,
          startDate: new Date().toISOString().split('T')[0],
          phases: phasesBuilder(),
          milestones: [],
        };
      },

      addRehabBodyMetric: (metric: Omit<RehabBodyMetric, 'id'>) =>
        set((state) => ({
          rehabBodyMetrics: [...state.rehabBodyMetrics, { ...metric, id: generateId() }],
        })),

      getRehabBodyMetricsByPlan: (planId: string) => {
        const { rehabBodyMetrics } = get();
        return rehabBodyMetrics
          .filter((m) => m.planId === planId)
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      updateRehabMilestone: (planId: string, milestoneId: string, data: Partial<RehabMilestone>) =>
        set((state) => ({
          rehabPlans: state.rehabPlans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  milestones: (p.milestones || []).map((m) =>
                    m.id === milestoneId ? { ...m, ...data } : m
                  ),
                }
              : p
          ),
        })),

      getRehabMilestonesByPlan: (planId: string) => {
        const { rehabPlans } = get();
        const plan = rehabPlans.find((p) => p.id === planId);
        return plan?.milestones || [];
      },

      updateRehabWeeklyGoal: (planId: string, goalId: string, data: Partial<RehabWeeklyGoal>) =>
        set((state) => ({
          rehabPlans: state.rehabPlans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  weeklyGoals: (p.weeklyGoals || []).map((g) =>
                    g.id === goalId ? { ...g, ...data } : g
                  ),
                }
              : p
          ),
        })),

      getRehabBodyMetricTrend: (planId: string) => {
        const { rehabBodyMetrics } = get();
        return rehabBodyMetrics
          .filter((m) => m.planId === planId)
          .map((m) => ({
            date: m.date,
            weight: m.weight,
            pelvicFloorScore: m.pelvicFloorScore,
            diastasisRecti: m.diastasisRecti,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      addVisitRecord: (record: VisitRecord) =>
        set((state) => ({
          visitRecords: [...state.visitRecords, record],
        })),

      updateVisitRecord: (id: string, data: Partial<VisitRecord>) =>
        set((state) => ({
          visitRecords: state.visitRecords.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        })),

      deleteVisitRecord: (id: string) =>
        set((state) => ({
          visitRecords: state.visitRecords.filter((r) => r.id !== id),
          testReports: state.testReports.filter((r) => r.visitRecordId !== id),
        })),

      addTestReport: (report: TestReport) =>
        set((state) => ({
          testReports: [...state.testReports, report],
        })),

      updateTestReport: (id: string, data: Partial<TestReport>) =>
        set((state) => ({
          testReports: state.testReports.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        })),

      deleteTestReport: (id: string) =>
        set((state) => ({
          testReports: state.testReports.filter((r) => r.id !== id),
        })),

      getVisitRecordsByDate: (date: string) => {
        const { visitRecords } = get();
        return visitRecords.filter((r) => r.date === date);
      },

      getLinkedPainRecords: (visitId: string) => {
        const { visitRecords, painRecords } = get();
        const visit = visitRecords.find((r) => r.id === visitId);
        if (!visit || !visit.linkedPainRecordIds?.length) return [];
        return painRecords.filter((r) =>
          visit.linkedPainRecordIds!.includes(r.id)
        );
      },

      getLinkedPrenatalCheckup: (visitId: string) => {
        const { visitRecords, prenatalCheckups } = get();
        const visit = visitRecords.find((r) => r.id === visitId);
        if (!visit?.linkedPrenatalCheckupId) return undefined;
        return prenatalCheckups.find(
          (c) => c.id === visit.linkedPrenatalCheckupId
        );
      },

      getLinkedPostpartumCheckup: (visitId: string) => {
        const { visitRecords, postpartumCheckups } = get();
        const visit = visitRecords.find((r) => r.id === visitId);
        if (!visit?.linkedPostpartumCheckupId) return undefined;
        return postpartumCheckups.find(
          (c) => c.id === visit.linkedPostpartumCheckupId
        );
      },

      addTemperatureRecord: (record: Omit<TemperatureRecord, 'id'>) => {
        const newRecord = { ...record, id: generateId() };
        let merged: TemperatureRecord[] = [];
        set((state) => {
          merged = mergeRecords(state.temperatureRecords, [newRecord]);
          const syncItems = syncTemperatureToOvulation(merged);
          const existingOvDates = new Set(state.ovulationRecords.map((r) => r.date));
          const newOvRecords = syncItems
            .filter((s) => !existingOvDates.has(s.date))
            .map((s) => ({
              id: s.id,
              date: s.date,
              basalTemp: s.basalTemp,
              tempShift: s.tempShift,
              fertileWindow: s.fertileWindow,
              cervicalMucus: undefined,
              ovulationTest: 'none' as const,
              lhTest: 'none' as const,
            }));
          const updatedOv = state.ovulationRecords.map((ov) => {
            const sync = syncItems.find((s) => s.date === ov.date);
            if (!sync) return ov;
            return {
              ...ov,
              basalTemp: ov.basalTemp ?? sync.basalTemp,
              tempShift: ov.tempShift || sync.tempShift,
              fertileWindow: ov.fertileWindow || sync.fertileWindow,
            };
          });
          return {
            temperatureRecords: merged,
            ovulationRecords: [...updatedOv, ...newOvRecords],
          };
        });
        get().detectTemperatureAnomalies();
      },

      addTemperatureRecords: (records: Omit<TemperatureRecord, 'id'>[]) => {
        const newRecords = records.map((r) => ({ ...r, id: generateId() }));
        let merged: TemperatureRecord[] = [];
        set((state) => {
          merged = mergeRecords(state.temperatureRecords, newRecords);
          const syncItems = syncTemperatureToOvulation(merged);
          const existingOvDates = new Set(state.ovulationRecords.map((r) => r.date));
          const newOvRecords = syncItems
            .filter((s) => !existingOvDates.has(s.date))
            .map((s) => ({
              id: s.id,
              date: s.date,
              basalTemp: s.basalTemp,
              tempShift: s.tempShift,
              fertileWindow: s.fertileWindow,
              cervicalMucus: undefined,
              ovulationTest: 'none' as const,
              lhTest: 'none' as const,
            }));
          const updatedOv = state.ovulationRecords.map((ov) => {
            const sync = syncItems.find((s) => s.date === ov.date);
            if (!sync) return ov;
            return {
              ...ov,
              basalTemp: ov.basalTemp ?? sync.basalTemp,
              tempShift: ov.tempShift || sync.tempShift,
              fertileWindow: ov.fertileWindow || sync.fertileWindow,
            };
          });
          return {
            temperatureRecords: merged,
            ovulationRecords: [...updatedOv, ...newOvRecords],
          };
        });
        get().detectTemperatureAnomalies();
        return merged;
      },

      deleteTemperatureRecord: (id: string) =>
        set((state) => ({
          temperatureRecords: state.temperatureRecords.filter((r) => r.id !== id),
        })),

      updateTemperatureRecord: (id: string, data: Partial<TemperatureRecord>) =>
        set((state) => ({
          temperatureRecords: state.temperatureRecords.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        })),

      getTemperatureRecordsByDateRange: (startDate: string, endDate: string) => {
        const { temperatureRecords } = get();
        return temperatureRecords.filter(
          (r) => r.date >= startDate && r.date <= endDate
        ).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
      },

      getLatestTemperature: (): TemperatureRecord | undefined => {
        const { temperatureRecords } = get();
        if (temperatureRecords.length === 0) return undefined;
        return [...temperatureRecords].sort(
          (a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)
        )[0];
      },

      getTemperatureStatistics: (): TemperatureStatistics => {
        const { temperatureRecords } = get();
        return calculateTemperatureStatistics(temperatureRecords);
      },

      getTemperatureTrend: (days: number = 30) => {
        const { temperatureRecords } = get();
        return generateTemperatureTrend(temperatureRecords, days);
      },

      detectTemperatureAnomalies: (records?: TemperatureRecord[]): TemperatureAnomalyAlert[] => {
        const state = get();
        const targetRecords = records || state.temperatureRecords;
        const freshAlerts = detectAnomalies(targetRecords);

        const existingMap = new Map(state.temperatureAlerts.map((a) => [`${a.type}-${a.date}`, a]));
        const merged: TemperatureAnomalyAlert[] = [];
        const seenKeys = new Set<string>();

        for (const alert of freshAlerts) {
          const key = `${alert.type}-${alert.date}`;
          seenKeys.add(key);
          const existing = existingMap.get(key);
          if (existing) {
            merged.push({
              ...alert,
              id: existing.id,
              acknowledged: existing.acknowledged,
            });
          } else {
            merged.push(alert);
          }
        }

        for (const [key, existing] of existingMap) {
          if (!seenKeys.has(key)) {
            merged.push(existing);
          }
        }

        merged.sort((a, b) => b.date.localeCompare(a.date));

        if (
          merged.length !== state.temperatureAlerts.length ||
          merged.some((a, i) => a.id !== state.temperatureAlerts[i]?.id || a.acknowledged !== state.temperatureAlerts[i]?.acknowledged)
        ) {
          set({ temperatureAlerts: merged });
        }

        return merged;
      },

      acknowledgeTemperatureAlert: (alertId: string) =>
        set((state) => ({
          temperatureAlerts: state.temperatureAlerts.map((a) =>
            a.id === alertId ? { ...a, acknowledged: true } : a
          ),
        })),

      addBluetoothDevice: (device: Omit<BluetoothDeviceInfo, 'id'>) =>
        set((state) => ({
          bluetoothDevices: [...state.bluetoothDevices, { ...device, id: generateId() }],
        })),

      removeBluetoothDevice: (deviceId: string) =>
        set((state) => ({
          bluetoothDevices: state.bluetoothDevices.filter((d) => d.id !== deviceId),
        })),

      updateBluetoothDevice: (deviceId: string, data: Partial<BluetoothDeviceInfo>) =>
        set((state) => ({
          bluetoothDevices: state.bluetoothDevices.map((d) =>
            d.id === deviceId ? { ...d, ...data } : d
          ),
        })),
    }),
    {
      name: 'her-cycle-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cycleData: state.cycleData,
        pregnancyData: state.pregnancyData,
        postpartumData: state.postpartumData,
        overtimeRecords: state.overtimeRecords,
        ovulationRecords: state.ovulationRecords,
        prenatalCheckups: state.prenatalCheckups,
        moodRecords: state.moodRecords,
        hotFlashRecords: state.hotFlashRecords,
        sleepRecords: state.sleepRecords,
        hormoneRecords: state.hormoneRecords,
        pelvicFloorRecords: state.pelvicFloorRecords,
        lochiaRecords: state.lochiaRecords,
        breastfeedingRecords: state.breastfeedingRecords,
        postpartumCheckups: state.postpartumCheckups,
        medicationReminders: state.medicationReminders,
        medicationRecords: state.medicationRecords,
        painRecords: state.painRecords,
        temperatureRecords: state.temperatureRecords,
        temperatureAlerts: state.temperatureAlerts,
        bluetoothDevices: state.bluetoothDevices,
        familyMembers: state.familyMembers,
        shareCodes: state.shareCodes,
        rehabPlans: state.rehabPlans,
        rehabCheckins: state.rehabCheckins,
        rehabBodyMetrics: state.rehabBodyMetrics,
        activeRehabPlanId: state.activeRehabPlanId,
        visitRecords: state.visitRecords,
        testReports: state.testReports,
      }),
    }
  )
);
