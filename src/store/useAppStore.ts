import { create } from 'zustand';
import type {
  AppState,
  PeriodRecord,
  OvertimeRecord,
  OvulationRecord,
  PrenatalCheckup,
  MoodRecord,
  LifeStage,
  CycleData,
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

export const useAppStore = create<AppState>((set, get) => ({
  lifeStage: 'teen',
  cycleData: initialCycleData,
  overtimeRecords: mockOvertimeRecords,
  ovulationRecords: mockOvulationRecords,
  prenatalCheckups: mockCheckups,
  moodRecords: mockMoodRecords,

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
}));
