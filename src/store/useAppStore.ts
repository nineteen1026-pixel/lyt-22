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
} from '@/types';

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

const defaultPostpartumCheckups: PostpartumCheckup[] = [
  {
    id: generateId(),
    date: new Date(Date.now() + 28 * 86400000).toISOString().split('T')[0],
    type: '6week',
    typeName: '产后6周复查',
    hospital: '妇幼保健院',
    doctor: '张医生',
    completed: false,
    notes: '盆底评估、子宫恢复检查',
  },
  {
    id: generateId(),
    date: new Date(Date.now() + 76 * 86400000).toISOString().split('T')[0],
    type: '3month',
    typeName: '产后3个月复查',
    hospital: '妇幼保健院',
    completed: false,
    notes: '全面恢复评估',
  },
];

const mockOvertimeRecords: OvertimeRecord[] = [
  {
    id: generateId(),
    date: '2024-01-15',
    hours: 3,
    stressLevel: 7,
    sleepHours: 5,
    periodImpact: '经期推迟2天',
  },
  {
    id: generateId(),
    date: '2024-01-20',
    hours: 2,
    stressLevel: 5,
    sleepHours: 6,
  },
];

const mockOvulationRecords: OvulationRecord[] = [
  {
    id: generateId(),
    date: '2024-01-25',
    basalTemp: 36.5,
    cervicalMucus: '蛋清状',
    ovulationTest: 'positive',
    fertileWindow: true,
  },
];

const todayDate = new Date();
const mockCheckups: PrenatalCheckup[] = [
  {
    id: generateId(),
    date: new Date(todayDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    week: 12,
    type: 'NT检查',
    doctor: '李医生',
    notes: '检查胎儿颈部透明带',
    completed: false,
  },
  {
    id: generateId(),
    date: new Date(todayDate.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    week: 16,
    type: '唐筛检查',
    doctor: '李医生',
    completed: false,
  },
  {
    id: generateId(),
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

const mockSleepRecords: SleepRecord[] = [
  {
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    bedTime: '23:00',
    wakeTime: '06:30',
    duration: 7.5,
    quality: 3,
    interruptions: 2,
    nightSweats: true,
  },
  {
    id: generateId(),
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    bedTime: '23:30',
    wakeTime: '05:30',
    duration: 6,
    quality: 2,
    interruptions: 3,
    nightSweats: true,
    notes: '潮热醒来两次',
  },
];

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

      setLifeStage: (stage: LifeStage) => set({ lifeStage: stage }),

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
        set((state) => ({
          ovulationRecords: [...state.ovulationRecords, record],
        })),

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
        set((state) => ({
          cycleData: { ...state.cycleData, ...data },
        })),

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
        return pred.ovulationDate;
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

        const daysUntilNext = diffDays(predictedStart, todayD);

        let cyclePhase: PredictionResult['cyclePhase'] = 'follicular';
        const currentPeriodEnd = addDays(lastStart, periodLen - 1);
        if (todayD >= lastStart && todayD <= currentPeriodEnd) {
          cyclePhase = 'period';
        } else if (todayD >= fertileStart && todayD <= fertileEnd) {
          const diffO = diffDays(todayD, ovulation);
          if (Math.abs(diffO) <= 1) cyclePhase = 'ovulation';
          else cyclePhase = 'fertile';
        } else if (todayD > currentPeriodEnd && todayD < ovulation) {
          cyclePhase = 'follicular';
        } else if (todayD > fertileEnd && todayD < predictedStart) {
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
          fertileWindowStart: dateStr(fertileStart),
          fertileWindowEnd: dateStr(fertileEnd),
          daysUntilNextPeriod: daysUntilNext,
          cyclePhase,
          statistics: stats,
        };
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

        for (const s of starts) {
          const sd = new Date(s);
          sd.setHours(0, 0, 0, 0);
          const ed = addDays(sd, periodLen - 1);
          if (date >= sd && date <= ed) {
            return { type: 'period', date: dateString, isToday };
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
          return { type: 'predicted_period', date: dateString, isToday, confidence: conf };
        }

        const ciStart = new Date(pred.confidenceIntervalStart);
        ciStart.setHours(0, 0, 0, 0);
        const ciEnd = new Date(pred.confidenceIntervalEnd);
        ciEnd.setHours(0, 0, 0, 0);
        if (date >= ciStart && date < predStart) {
          const d = diffDays(predStart, date);
          const conf = Math.max(10, 60 - d * 10);
          return { type: 'predicted_early', date: dateString, isToday, confidence: conf };
        }
        if (date > predEnd && date <= ciEnd) {
          const d = diffDays(date, predEnd);
          const conf = Math.max(10, 60 - d * 10);
          return { type: 'predicted_late', date: dateString, isToday, confidence: conf };
        }

        const ovuD = new Date(pred.ovulationDate);
        ovuD.setHours(0, 0, 0, 0);
        if (diffDays(date, ovuD) === 0) {
          return { type: 'ovulation', date: dateString, isToday };
        }

        const fertS = new Date(pred.fertileWindowStart);
        fertS.setHours(0, 0, 0, 0);
        const fertE = new Date(pred.fertileWindowEnd);
        fertE.setHours(0, 0, 0, 0);
        if (date >= fertS && date <= fertE) {
          return { type: 'fertile', date: dateString, isToday };
        }

        return { type: 'normal', date: dateString, isToday };
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
      }),
    }
  )
);
