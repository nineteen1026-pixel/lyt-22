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

export type LifeStage = 'teen' | 'career' | 'pregnancy-prep' | 'pregnancy';

export interface AppState {
  lifeStage: LifeStage;
  cycleData: CycleData;
  overtimeRecords: OvertimeRecord[];
  ovulationRecords: OvulationRecord[];
  prenatalCheckups: PrenatalCheckup[];
  moodRecords: MoodRecord[];
  setLifeStage: (stage: LifeStage) => void;
  addPeriodRecord: (record: PeriodRecord) => void;
  addOvertimeRecord: (record: OvertimeRecord) => void;
  addOvulationRecord: (record: OvulationRecord) => void;
  addPrenatalCheckup: (checkup: PrenatalCheckup) => void;
  toggleCheckupComplete: (id: string) => void;
  addMoodRecord: (record: MoodRecord) => void;
  setCycleData: (data: Partial<CycleData>) => void;
  getNextPeriodDate: () => string;
  getOvulationDate: () => string;
}
