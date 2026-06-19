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

const mockPainRecords: PainRecord[] = [
  {
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    time: '07:30',
    level: 6,
    symptoms: '下腹部绞痛、腰酸',
  },
  {
    id: generateId(),
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: '10:00',
    level: 4,
    symptoms: '轻微腹胀',
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
          const periodPhaseData = associations.filter((a) => a.cyclePhase === 'period');
          if (periodPhaseData.length > 1) {
            const periodDurations: number[] = [];
            const starts = state.extractPeriodStartDates();
            for (const start of starts) {
              const periodRecords = periodPhaseData.filter(
                (p) => p.date >= start && p.date <= dateStr(addDays(new Date(start), stats.avgPeriodLength + 2))
              );
              if (periodRecords.length > 0) {
                periodDurations.push(periodRecords.length);
              }
            }
            if (periodDurations.length > 1) {
              const avgPL = periodDurations.reduce((a, b) => a + b, 0) / periodDurations.length;
              periodLengthVariation = Math.sqrt(
                periodDurations.reduce((a, b) => a + Math.pow(b - avgPL, 2), 0) / periodDurations.length
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
      }),
    }
  )
);
