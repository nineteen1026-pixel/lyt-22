export interface PeriodRecord {
  id: string;
  date: string;
  flow: 'light' | 'medium' | 'heavy';
  symptoms: string[];
  mood: string;
  notes?: string;
}

export interface CycleData {
  cycleLength: number;
  periodLength: number;
  firstPeriodDate: string;
  lastPeriodDate: string;
  records: PeriodRecord[];
}

export interface OvertimeRecord {
  id: string;
  date: string;
  hours: number;
  stressLevel: number;
  sleepHours: number;
  periodImpact?: string;
}

export interface OvulationRecord {
  id: string;
  date: string;
  basalTemp?: number;
  cervicalMucus?: string;
  ovulationTest?: 'positive' | 'negative' | 'none';
  fertileWindow: boolean;
}

export interface PrenatalCheckup {
  id: string;
  date: string;
  week: number;
  type: string;
  doctor?: string;
  notes?: string;
  weight?: number;
  bloodPressure?: string;
  babyHeartbeat?: number;
  completed: boolean;
}

export interface MoodRecord {
  id: string;
  date: string;
  mood: string;
  emotion: string;
  intensity: number;
  journal?: string;
}

export interface ReliefMethod {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: string;
  effectiveness: number;
}

export interface PregnancyData {
  lastMenstrualPeriodDate: string;
  manualWeek: number | null;
}

export interface HotFlashRecord {
  id: string;
  date: string;
  time: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: number;
  triggers: string[];
  notes?: string;
}

export interface SleepRecord {
  id: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  duration: number;
  quality: 1 | 2 | 3 | 4 | 5;
  interruptions: number;
  nightSweats: boolean;
  notes?: string;
}

export interface HormoneRecord {
  id: string;
  date: string;
  estrogenLevel?: number;
  progesteroneLevel?: number;
  fshLevel?: number;
  lhLevel?: number;
  phase: 'follicular' | 'ovulatory' | 'luteal' | 'perimenopausal' | 'postmenopausal';
  notes?: string;
}

export type LifeStage = 'teen' | 'career' | 'pregnancy-prep' | 'pregnancy' | 'menopause';

export interface AppState {
  lifeStage: LifeStage;
  cycleData: CycleData;
  pregnancyData: PregnancyData;
  overtimeRecords: OvertimeRecord[];
  ovulationRecords: OvulationRecord[];
  prenatalCheckups: PrenatalCheckup[];
  moodRecords: MoodRecord[];
  hotFlashRecords: HotFlashRecord[];
  sleepRecords: SleepRecord[];
  hormoneRecords: HormoneRecord[];
  setLifeStage: (stage: LifeStage) => void;
  addPeriodRecord: (record: PeriodRecord) => void;
  addOvertimeRecord: (record: OvertimeRecord) => void;
  addOvulationRecord: (record: OvulationRecord) => void;
  addPrenatalCheckup: (checkup: PrenatalCheckup) => void;
  toggleCheckupComplete: (id: string) => void;
  addMoodRecord: (record: MoodRecord) => void;
  addHotFlashRecord: (record: HotFlashRecord) => void;
  addSleepRecord: (record: SleepRecord) => void;
  addHormoneRecord: (record: HormoneRecord) => void;
  setCycleData: (data: Partial<CycleData>) => void;
  setPregnancyData: (data: Partial<PregnancyData>) => void;
  getCurrentWeek: () => number;
  getNextPeriodDate: () => string;
  getOvulationDate: () => string;
  getDueDate: () => string;
  getHotFlashTrend: () => { date: string; count: number; avgSeverity: number }[];
  getSleepTrend: () => { date: string; avgQuality: number; avgDuration: number }[];
  getHormoneTrend: () => { date: string; estrogen?: number; progesterone?: number; fsh?: number; lh?: number }[];
}
