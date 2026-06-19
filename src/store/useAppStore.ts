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
} from '@/types';

const today = new Date();
const lastPeriod = new Date(today);
lastPeriod.setDate(lastPeriod.getDate() - 5);

const generateId = () => Math.random().toString(36).substr(2, 9);

const initialCycleData: CycleData = {
  cycleLength: 28,
  periodLength: 5,
  firstPeriodDate: '',
  lastPeriodDate: lastPeriod.toISOString().split('T')[0],
  records: [
    {
      id: generateId(),
      date: lastPeriod.toISOString().split('T')[0],
      flow: 'medium',
      symptoms: ['轻微腹痛'],
      mood: '平静',
    },
  ],
};

const initialPregnancyData: PregnancyData = {
  lastMenstrualPeriodDate: '',
  manualWeek: null,
};

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
      overtimeRecords: mockOvertimeRecords,
      ovulationRecords: mockOvulationRecords,
      prenatalCheckups: mockCheckups,
      moodRecords: mockMoodRecords,
      hotFlashRecords: mockHotFlashRecords,
      sleepRecords: mockSleepRecords,
      hormoneRecords: mockHormoneRecords,

      setLifeStage: (stage: LifeStage) => set({ lifeStage: stage }),

      addPeriodRecord: (record: PeriodRecord) =>
        set((state) => ({
          cycleData: {
            ...state.cycleData,
            records: [...state.cycleData.records, record],
          },
        })),

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

      getNextPeriodDate: () => {
        const state = get();
        const lastDate = new Date(state.cycleData.lastPeriodDate);
        lastDate.setDate(lastDate.getDate() + state.cycleData.cycleLength);
        return lastDate.toISOString().split('T')[0];
      },

      getOvulationDate: () => {
        const state = get();
        const nextPeriod = new Date(state.getNextPeriodDate());
        nextPeriod.setDate(nextPeriod.getDate() - 14);
        return nextPeriod.toISOString().split('T')[0];
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
        overtimeRecords: state.overtimeRecords,
        ovulationRecords: state.ovulationRecords,
        prenatalCheckups: state.prenatalCheckups,
        moodRecords: state.moodRecords,
        hotFlashRecords: state.hotFlashRecords,
        sleepRecords: state.sleepRecords,
        hormoneRecords: state.hormoneRecords,
      }),
    }
  )
);
