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
  periodStartDates?: string[];
}

export interface CycleStatistics {
  avgCycleLength: number;
  avgPeriodLength: number;
  medianCycleLength: number;
  stdDevCycle: number;
  minCycleLength: number;
  maxCycleLength: number;
  cycleCount: number;
  regularityScore: number;
}

export interface PredictionResult {
  predictedNextStart: string;
  predictedNextEnd: string;
  confidenceIntervalStart: string;
  confidenceIntervalEnd: string;
  confidenceLevel: 'low' | 'medium' | 'high';
  confidencePercent: number;
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  daysUntilNextPeriod: number;
  cyclePhase: 'period' | 'follicular' | 'ovulation' | 'fertile' | 'luteal' | 'predicted_period';
  statistics: CycleStatistics;
}

export type CalendarDayType =
  | 'empty'
  | 'normal'
  | 'period'
  | 'predicted_period'
  | 'predicted_early'
  | 'predicted_late'
  | 'ovulation'
  | 'fertile'
  | 'today';

export interface CalendarDayInfo {
  type: CalendarDayType;
  date: string;
  isToday: boolean;
  confidence?: number;
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

export interface PelvicFloorRecord {
  id: string;
  date: string;
  time: string;
  exerciseType: 'kegel' | 'squeeze' | 'breathing' | 'biofeedback' | 'other';
  duration: number;
  sets?: number;
  reps?: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface LochiaRecord {
  id: string;
  date: string;
  amount: 'none' | 'light' | 'medium' | 'heavy' | 'excessive';
  color: 'red' | 'pink' | 'brown' | 'yellow' | 'white';
  odor: 'normal' | 'slight' | 'strong' | 'foul';
  clots: 'none' | 'small' | 'medium' | 'large';
  symptoms: string[];
  notes?: string;
}

export type FeedingType = 'breast' | 'formula' | 'mixed' | 'pumped';
export type BreastSide = 'left' | 'right' | 'both';

export interface BreastfeedingRecord {
  id: string;
  date: string;
  startTime: string;
  endTime?: string;
  type: FeedingType;
  side?: BreastSide;
  amount?: number;
  duration?: number;
  mood?: 'calm' | 'fussy' | 'sleepy' | 'hungry';
  notes?: string;
}

export interface PostpartumCheckup {
  id: string;
  date: string;
  type: '6week' | '3month' | '6month' | '1year' | 'other';
  typeName: string;
  hospital?: string;
  doctor?: string;
  completed: boolean;
  weight?: number;
  bloodPressure?: string;
  uterineRecovery?: string;
  pelvicFloorScore?: number;
  notes?: string;
}

export interface PostpartumData {
  deliveryDate: string;
  deliveryType: 'vaginal' | 'cesarean' | 'unknown';
}

export type MedicationCategory = 'dysmenorrhea' | 'pregnancy' | 'ovulation';

export interface MedicationReminder {
  id: string;
  category: MedicationCategory;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate?: string;
  notes?: string;
  active: boolean;
  linkedPainLevel?: number;
  linkedCheckupId?: string;
}

export interface MedicationRecord {
  id: string;
  reminderId: string;
  date: string;
  time: string;
  taken: boolean;
  skipped: boolean;
  sideEffects?: string;
  notes?: string;
}

export interface PainRecord {
  id: string;
  date: string;
  time: string;
  level: number;
  symptoms?: string;
  notes?: string;
}

export type LifeStage = 'teen' | 'career' | 'pregnancy-prep' | 'pregnancy' | 'postpartum' | 'menopause';

export interface Nutrient {
  id: string;
  name: string;
  unit: string;
  rda: number;
  category: 'vitamin' | 'mineral' | 'macronutrient';
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  nutrients: { nutrientId: string; amount: number }[];
  servingSize: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  image: string;
  lifeStages: LifeStage[];
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: { name: string; amount: string }[];
  instructions: string[];
  nutrients: { nutrientId: string; amount: number }[];
  tags: string[];
}

export interface FoodIntakeRecord {
  id: string;
  date: string;
  time: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodItems: { foodItemId: string; servings: number }[];
  recipeNutrition?: {
    recipeId: string;
    recipeName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    nutrients: { nutrientId: string; amount: number }[];
  };
  notes?: string;
}

export interface NutrientRDAByStage {
  lifeStage: LifeStage;
  nutrients: { nutrientId: string; rda: number }[];
}

export interface NutrientGapItem {
  nutrientId: string;
  nutrientName: string;
  unit: string;
  rda: number;
  current: number;
  gap: number;
  percentage: number;
  category: 'vitamin' | 'mineral' | 'macronutrient';
}

export interface DailyNutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  nutrients: { nutrientId: string; amount: number }[];
}

export interface AppState {
  lifeStage: LifeStage;
  cycleData: CycleData;
  pregnancyData: PregnancyData;
  postpartumData: PostpartumData;
  overtimeRecords: OvertimeRecord[];
  ovulationRecords: OvulationRecord[];
  prenatalCheckups: PrenatalCheckup[];
  moodRecords: MoodRecord[];
  hotFlashRecords: HotFlashRecord[];
  sleepRecords: SleepRecord[];
  hormoneRecords: HormoneRecord[];
  pelvicFloorRecords: PelvicFloorRecord[];
  lochiaRecords: LochiaRecord[];
  breastfeedingRecords: BreastfeedingRecord[];
  postpartumCheckups: PostpartumCheckup[];
  medicationReminders: MedicationReminder[];
  medicationRecords: MedicationRecord[];
  painRecords: PainRecord[];
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
  setPostpartumData: (data: Partial<PostpartumData>) => void;
  addPelvicFloorRecord: (record: PelvicFloorRecord) => void;
  addLochiaRecord: (record: LochiaRecord) => void;
  addBreastfeedingRecord: (record: BreastfeedingRecord) => void;
  addPostpartumCheckup: (checkup: PostpartumCheckup) => void;
  togglePostpartumCheckupComplete: (id: string) => void;
  addMedicationReminder: (reminder: MedicationReminder) => void;
  updateMedicationReminder: (id: string, data: Partial<MedicationReminder>) => void;
  deleteMedicationReminder: (id: string) => void;
  addMedicationRecord: (record: MedicationRecord) => void;
  addPainRecord: (record: PainRecord) => void;
  getTodayPainLevel: () => number;
  getMedicationRemindersByCategory: (category: MedicationCategory) => MedicationReminder[];
  getTodayMedicationSchedule: () => { reminder: MedicationReminder; time: string; record?: MedicationRecord }[];
  getMedicationAdherence: () => { total: number; taken: number; rate: number };
  getCurrentWeek: () => number;
  getNextPeriodDate: () => string;
  getOvulationDate: () => string;
  getDueDate: () => string;
  getDaysPostpartum: () => number;
  getPelvicFloorTrend: () => { date: string; count: number; avgDifficulty: number; totalDuration: number }[];
  getBreastfeedingStats: () => { todayCount: number; todayTotalMinutes: number; last24hCount: number };
  getHotFlashTrend: () => { date: string; count: number; avgSeverity: number }[];
  getSleepTrend: () => { date: string; avgQuality: number; avgDuration: number }[];
  getHormoneTrend: () => { date: string; estrogen?: number; progesterone?: number; fsh?: number; lh?: number }[];
  extractPeriodStartDates: () => string[];
  getCycleStatistics: () => CycleStatistics;
  getPeriodPrediction: () => PredictionResult;
  getCalendarDayInfo: (year: number, month: number, day: number) => CalendarDayInfo;
}
