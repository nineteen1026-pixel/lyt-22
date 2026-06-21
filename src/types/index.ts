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
  adjustedOvulationDate?: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  adjustedFertileStart?: string;
  adjustedFertileEnd?: string;
  daysUntilNextPeriod: number;
  cyclePhase: 'period' | 'follicular' | 'ovulation' | 'fertile' | 'luteal' | 'predicted_period';
  statistics: CycleStatistics;
  conceptionProbabilities?: ConceptionProbability[];
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
  | 'fertile_high'
  | 'fertile_peak'
  | 'lh_surge'
  | 'temp_shift'
  | 'today';

export interface ConceptionProbability {
  date: string;
  probability: number;
  level: 'low' | 'medium' | 'high' | 'peak';
  factors: {
    cyclePrediction: number;
    lhTest?: number;
    basalTemp?: number;
    cervicalMucus?: number;
  };
}

export interface CalendarDayInfo {
  type: CalendarDayType;
  date: string;
  isToday: boolean;
  confidence?: number;
  conceptionProbability?: number;
  hasLHPositive?: boolean;
  hasTempShift?: boolean;
  hasRecord?: boolean;
}

export interface OvertimeRecord {
  id: string;
  date: string;
  hours: number;
  stressLevel: number;
  sleepHours: number;
  periodImpact?: string;
  dysmenorrheaLevel?: number;
  isPeriodDay?: boolean;
  cyclePhase?: 'period' | 'follicular' | 'ovulation' | 'luteal';
}

export type LHResult = 'negative' | 'faint' | 'positive' | 'strong_positive' | 'none';

export interface OvulationRecord {
  id: string;
  date: string;
  basalTemp?: number;
  cervicalMucus?: string;
  ovulationTest?: 'positive' | 'negative' | 'none';
  lhTest?: LHResult;
  lhIntensity?: number;
  tempShift?: boolean;
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

export type CyclePhase = 'period' | 'follicular' | 'ovulation' | 'luteal' | 'unknown';

export interface SleepCycleAssociation {
  date: string;
  cyclePhase: CyclePhase;
  cycleDay: number;
  sleepDuration: number;
  sleepQuality: number;
  interruptions: number;
  nightSweats: boolean;
}

export interface PhaseSleepStatistics {
  phase: CyclePhase;
  phaseName: string;
  sampleCount: number;
  avgDuration: number;
  avgQuality: number;
  avgInterruptions: number;
  nightSweatRate: number;
  durationStdDev?: number;
  qualityStdDev?: number;
}

export interface SleepImpactAnalysis {
  overallScore: number;
  periodImpact: {
    cycleLengthVariation: number;
    periodLengthVariation: number;
    painLevelCorrelation: number;
    severity: 'low' | 'moderate' | 'high';
    description: string;
  };
  phasePatterns: PhaseSleepStatistics[];
  keyInsights: {
    type: 'warning' | 'info' | 'good';
    title: string;
    description: string;
    icon: string;
  }[];
  recommendations: SleepRecommendation[];
  correlationData: {
    date: string;
    duration: number;
    quality: number;
    periodDay: number | null;
    isPeriod: boolean;
  }[];
  weeklyTrend: {
    date: string;
    avgDuration: number;
    avgQuality: number;
    avgInterruptions: number;
    periodStart?: string;
  }[];
}

export interface SleepRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: 'schedule' | 'environment' | 'lifestyle' | 'medical';
  categoryName: string;
  title: string;
  description: string;
  actionableSteps: string[];
  expectedBenefit: string;
  relatedPhase?: CyclePhase;
  timeToEffect: string;
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

export interface MigrationFieldMapping {
  sourceField: string;
  sourceLabel: string;
  targetField: string;
  targetLabel: string;
  transform?: 'direct' | 'date-offset' | 'value-map' | 'derive';
  transformHint?: string;
  valueMap?: Record<string, string>;
}

export interface MigrationMappingSet {
  from: LifeStage;
  to: LifeStage;
  label: string;
  description: string;
  fieldMappings: MigrationFieldMapping[];
  autoDerivedFields: { targetField: string; targetLabel: string; derivation: string }[];
}

export interface MigrationPreview {
  mapping: MigrationMappingSet;
  sourceDataCount: number;
  migratedDataCount: number;
  temperatureCount: number;
  periodRecordsCount: number;
  estimatedOvulationRecordsCount: number;
  warnings: string[];
}

export interface MigrationResult {
  from: LifeStage;
  to: LifeStage;
  timestamp: string;
  migratedFields: string[];
  derivedFields: string[];
  skippedFields: string[];
  warnings: string[];
  recordCounts: {
    temperatureRecords: number;
    periodRecords: number;
    ovulationRecords: number;
    medicationReminders: number;
  };
}

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

export type FamilyRelation = 'partner' | 'mother' | 'father' | 'other';
export type DataCategory = 'cycle' | 'sleep' | 'mood' | 'medication' | 'pregnancy' | 'postpartum' | 'nutrition' | 'pain';

export interface PermissionConfig {
  cycle: boolean;
  sleep: boolean;
  mood: boolean;
  medication: boolean;
  pregnancy: boolean;
  postpartum: boolean;
  nutrition: boolean;
  pain: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: FamilyRelation;
  avatar?: string;
  permissions: PermissionConfig;
  createdAt: string;
  lastAccessedAt?: string;
  active: boolean;
}

export interface ShareCode {
  id: string;
  code: string;
  permissions: PermissionConfig;
  expiresAt: string;
  createdAt: string;
  used: boolean;
  usedBy?: string;
}

export interface MaskedCycleSummary {
  cyclePhase: string;
  daysUntilNextPeriod?: number;
  hasPainToday: boolean;
  painLevel?: 'none' | 'mild' | 'moderate' | 'severe';
}

export interface MaskedSleepSummary {
  avgDuration: number;
  avgQuality: number;
  poorSleepDays: number;
}

export interface MaskedMoodSummary {
  recentMood: string;
  moodTrend: 'improving' | 'stable' | 'declining' | 'unknown';
}

export interface MaskedMedicationSummary {
  todayTotal: number;
  todayTaken: number;
  adherenceRate: number;
}

export interface MaskedPainSummary {
  todayLevel: number;
  hasPainToday: boolean;
  recentAveLevel: number;
  painDays7d: number;
}

export interface MaskedPregnancySummary {
  currentWeek: number;
  dueDate: string;
  upcomingCheckupCount: number;
  completedCheckupCount: number;
}

export interface MaskedPostpartumSummary {
  daysPostpartum: number;
  recoveryPhase: string;
  breastfeedingTodayCount?: number;
  pelvicFloorExercisesThisWeek: number;
  upcomingCheckupCount: number;
}

export interface MaskedNutritionSummary {
  todayCalories: number;
  calorieTarget: number;
  proteinAdequacy: number;
  keyGaps: string[];
}

export interface MaskedHealthData {
  cycle?: MaskedCycleSummary;
  sleep?: MaskedSleepSummary;
  mood?: MaskedMoodSummary;
  medication?: MaskedMedicationSummary;
  pain?: MaskedPainSummary;
  pregnancy?: MaskedPregnancySummary;
  postpartum?: MaskedPostpartumSummary;
  nutrition?: MaskedNutritionSummary;
}

export interface CommunityTag {
  id: string;
  name: string;
  color: string;
}

export interface CommunityTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
  lifeStage: LifeStage;
  questionCount: number;
  isHot: boolean;
}

export interface CommunityAnswer {
  id: string;
  questionId: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  isExpert: boolean;
  isFeatured: boolean;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

export interface CommunityQuestion {
  id: string;
  title: string;
  content: string;
  isAnonymous: boolean;
  authorName: string;
  authorAvatar?: string;
  topicId: string;
  topicName: string;
  lifeStage: LifeStage;
  tags: CommunityTag[];
  createdAt: string;
  views: number;
  likes: number;
  isLiked: boolean;
  answerCount: number;
  answers: CommunityAnswer[];
  hasFeaturedAnswer: boolean;
}

export type ReportRange = 'week' | 'month';

export interface ModuleHealthScore {
  module: string;
  moduleName: string;
  score: number;
  maxScore: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  color: string;
  icon: string;
}

export interface SleepReportData {
  avgDuration: number;
  avgQuality: number;
  avgInterruptions: number;
  nightSweatRate: number;
  totalRecords: number;
  weeklyTrend: { date: string; duration: number; quality: number }[];
  phaseBreakdown: PhaseSleepStatistics[];
}

export interface NutritionReportData {
  avgCalories: number;
  calorieTarget: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  totalRecords: number;
  weeklyTrend: { date: string; calories: number; protein: number }[];
  topGaps: NutrientGapItem[];
  averageGaps: NutrientGapItem[];
}

export interface CycleReportData {
  avgCycleLength: number;
  avgPeriodLength: number;
  regularityScore: number;
  cycleCount: number;
  periodDays: number;
  totalSymptomRecords: number;
  commonSymptoms: { symptom: string; count: number }[];
}

export interface PostpartumReportData {
  totalPelvicFloorSessions: number;
  avgPelvicFloorDuration: number;
  totalBreastfeedingSessions: number;
  avgBreastfeedingDuration: number;
  lochiaRecordsCount: number;
  completedCheckups: number;
  totalCheckups: number;
  pelvicFloorTrend: { date: string; count: number; totalDuration: number }[];
}

export interface MedicationReportData {
  totalReminders: number;
  activeReminders: number;
  adherenceRate: number;
  totalTaken: number;
  totalSkipped: number;
  totalRecords: number;
  adherenceByCategory: { category: MedicationCategory; rate: number; total: number; taken: number }[];
}

export interface MoodReportData {
  totalRecords: number;
  avgIntensity: number;
  moodDistribution: { mood: string; count: number; emotion: string }[];
  recentMoodTrend: { date: string; intensity: number; mood: string }[];
}

export interface PainReportData {
  totalRecords: number;
  avgLevel: number;
  painDays: number;
  severePainDays: number;
  levelDistribution: { level: number; count: number }[];
}

export interface MenopauseReportData {
  totalHotFlashRecords: number;
  avgHotFlashSeverity: number;
  avgHotFlashDuration: number;
  hotFlashTrend: { date: string; count: number; avgSeverity: number }[];
  hormoneRecordsCount: number;
  latestHormones?: { date: string; estrogen?: number; progesterone?: number; fsh?: number; lh?: number };
}

export interface HealthReport {
  generatedAt: string;
  range: ReportRange;
  startDate: string;
  endDate: string;
  overallScore: number;
  moduleScores: ModuleHealthScore[];
  keyInsights: { type: 'warning' | 'info' | 'good'; title: string; description: string; icon: string }[];
  sleep?: SleepReportData;
  nutrition?: NutritionReportData;
  cycle?: CycleReportData;
  postpartum?: PostpartumReportData;
  medication?: MedicationReportData;
  mood?: MoodReportData;
  pain?: PainReportData;
  menopause?: MenopauseReportData;
}

export type RehabPhaseType = 'phase1' | 'phase2' | 'phase3' | 'phase4';

export interface RehabExercise {
  id: string;
  name: string;
  description: string;
  duration: number;
  sets: number;
  reps: number;
  restSeconds: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tips: string[];
  precautions?: string[];
  category: 'warmup' | 'strength' | 'cardio' | 'flexibility' | 'breathing' | 'cool-down';
  bodyParts?: string[];
}

export interface RehabPhase {
  id: RehabPhaseType;
  name: string;
  description: string;
  durationWeeks: number;
  goals: string[];
  exercises: RehabExercise[];
  weeklyFrequency: number;
  color: string;
  gradient: string;
  schedule?: RehabWeeklySchedule;
}

export interface RehabWeeklySchedule {
  monday: RehabScheduleSlot[];
  tuesday: RehabScheduleSlot[];
  wednesday: RehabScheduleSlot[];
  thursday: RehabScheduleSlot[];
  friday: RehabScheduleSlot[];
  saturday: RehabScheduleSlot[];
  sunday: RehabScheduleSlot[];
}

export interface RehabScheduleSlot {
  exerciseId: string;
  completed: boolean;
}

export interface RehabMilestone {
  id: string;
  planId: string;
  phaseId: RehabPhaseType;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  achieved: boolean;
  achievedDate?: string;
  icon: string;
}

export interface RehabBodyMetric {
  id: string;
  planId: string;
  date: string;
  weight?: number;
  waistCircumference?: number;
  hipCircumference?: number;
  bellyCircumference?: number;
  pelvicFloorScore?: number;
  diastasisRecti?: number;
  notes?: string;
}

export interface RehabWeeklyGoal {
  id: string;
  planId: string;
  weekStartDate: string;
  targetSessions: number;
  completedSessions: number;
  targetMinutes: number;
  completedMinutes: number;
}

export interface RehabPlan {
  id: string;
  name: string;
  type: 'postpartum' | 'pelvic-floor' | 'core' | 'general' | 'custom';
  startDate: string;
  phases: RehabPhase[];
  milestones?: RehabMilestone[];
  weeklyGoals?: RehabWeeklyGoal[];
  notes?: string;
  createdAt: string;
}

export interface RehabCheckin {
  id: string;
  planId: string;
  phaseId: RehabPhaseType;
  date: string;
  time: string;
  completedExercises: string[];
  totalDuration: number;
  painLevel: number;
  fatigueLevel: number;
  mood: 'good' | 'normal' | 'tired' | 'bad';
  bodyMetrics?: {
    weight?: number;
    pelvicFloorScore?: number;
    diastasisRecti?: number;
  };
  notes?: string;
  photoUrl?: string;
}

export interface VaultEntry {
  id: string;
  date: string;
  time: string;
  emotion: string;
  intensity: number;
  content: string;
  tags?: string[];
  createdAt: string;
}

export interface VaultState {
  entries: VaultEntry[];
  pinHash: string | null;
  isUnlocked: boolean;
  currentPin: string | null;
}

export interface RehabProgress {
  planId: string;
  currentPhase: RehabPhaseType;
  startDate: string;
  totalCheckins: number;
  weeklyStreak: number;
  phaseProgress: Record<RehabPhaseType, number>;
  milestonesAchieved: number;
  totalMilestones: number;
}

export interface DepartmentRecommendation {
  id: string;
  name: string;
  category: string;
  description: string;
  commonSymptoms: string[];
  relatedLifeStages: LifeStage[];
  icon: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface VisitRecord {
  id: string;
  date: string;
  department: string;
  hospital: string;
  doctor?: string;
  chiefComplaint: string;
  diagnosis?: string;
  prescription?: string;
  followUpDate?: string;
  linkedPrenatalCheckupId?: string;
  linkedPostpartumCheckupId?: string;
  linkedPainRecordIds?: string[];
  notes?: string;
}

export interface TestReport {
  id: string;
  visitRecordId?: string;
  date: string;
  name: string;
  department: string;
  result?: string;
  abnormalItems?: string[];
  referenceRange?: string;
  images?: string[];
  notes?: string;
  createdAt: string;
}

export type TemperatureSource = 'manual' | 'csv' | 'bluetooth' | 'device';
export type TemperatureAnomalyType = 'high_fever' | 'low_temp' | 'sudden_rise' | 'sudden_drop' | 'irregular_pattern' | 'luteal_phase_short' | 'no_temp_shift';
export type MeasurementMethod = 'oral' | 'axillary' | 'tympanic' | 'rectal' | 'forehead';

export interface TemperatureRecord {
  id: string;
  date: string;
  time: string;
  temperature: number;
  source: TemperatureSource;
  method?: MeasurementMethod;
  deviceId?: string;
  deviceName?: string;
  notes?: string;
  cyclePhase?: CyclePhase;
  basalTemp?: boolean;
}

export interface TemperatureAnomalyAlert {
  id: string;
  type: TemperatureAnomalyType;
  typeName: string;
  severity: 'low' | 'medium' | 'high';
  date: string;
  temperature?: number;
  description: string;
  suggestion?: string;
  acknowledged: boolean;
}

export interface BluetoothDeviceInfo {
  id: string;
  name: string;
  macAddress?: string;
  brand?: string;
  model?: string;
  lastConnected?: string;
  batteryLevel?: number;
  isSimulated?: boolean;
}

export interface BluetoothScanResult {
  devices: BluetoothDeviceInfo[];
  isSimulated: boolean;
  warning?: string;
}

export interface CSVColumnMapping {
  dateColumn?: string;
  timeColumn?: string;
  tempColumn: string;
  dateFormat?: string;
  hasHeader?: boolean;
  encoding?: 'utf-8' | 'gbk' | 'gb2312';
  separator?: ',' | ';' | '\t';
}

export interface TemperatureImportResult {
  success: boolean;
  totalRecords: number;
  importedRecords: number;
  skippedRecords: number;
  errorRecords: { line: number; reason: string; rawData?: string }[];
  newRecords: TemperatureRecord[];
}

export interface TemperatureStatistics {
  avgTemperature: number;
  minTemperature: number;
  maxTemperature: number;
  latestTemperature?: number;
  latestTemperatureDate?: string;
  tempShiftDetected: boolean;
  tempShiftDate?: string;
  follicularPhaseAvg?: number;
  lutealPhaseAvg?: number;
  tempDiff?: number;
  anomalyCount: number;
  recordCount: number;
  continuousDays: number;
}

export type ReminderCategory = 'period' | 'ovulation' | 'prenatal' | 'postpartum' | 'medication' | 'custom';
export type ReminderPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ReminderStatus = 'pending' | 'active' | 'completed' | 'snoozed' | 'dismissed';

export interface SmartReminder {
  id: string;
  category: ReminderCategory;
  title: string;
  description: string;
  date: string;
  time?: string;
  priority: ReminderPriority;
  status: ReminderStatus;
  ruleId?: string;
  snoozedUntil?: string;
  completedAt?: string;
  dismissedAt?: string;
  actionUrl?: string;
  metadata?: Record<string, string>;
}

export type RuleOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'between';
export type RuleLogicGate = 'and' | 'or';

export interface RuleCondition {
  field: string;
  operator: RuleOperator;
  value: string | number | string[];
  label?: string;
}

export interface ReminderRule {
  id: string;
  name: string;
  description: string;
  category: ReminderCategory;
  conditions: RuleCondition[];
  logicGate: RuleLogicGate;
  priority: ReminderPriority;
  titleTemplate: string;
  descriptionTemplate: string;
  advanceDays: number;
  time?: string;
  active: boolean;
  builtIn: boolean;
  createdAt: string;
}

export interface NotificationCategoryPref {
  enabled: boolean;
  advanceDays: number;
  times: string[];
}

export interface NotificationPreferences {
  enabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  snoozeDuration: number;
  categories: Record<ReminderCategory, NotificationCategoryPref>;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
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
  temperatureRecords: TemperatureRecord[];
  temperatureAlerts: TemperatureAnomalyAlert[];
  bluetoothDevices: BluetoothDeviceInfo[];
  familyMembers: FamilyMember[];
  shareCodes: ShareCode[];
  rehabPlans: RehabPlan[];
  rehabCheckins: RehabCheckin[];
  rehabBodyMetrics: RehabBodyMetric[];
  activeRehabPlanId: string | null;
  visitRecords: VisitRecord[];
  testReports: TestReport[];
  smartReminders: SmartReminder[];
  reminderRules: ReminderRule[];
  notificationPreferences: NotificationPreferences;
  setLifeStage: (stage: LifeStage) => void;
  migrateLifeStage: (targetStage: LifeStage) => MigrationResult;
  getMigrationMapping: (from: LifeStage, to: LifeStage) => MigrationMappingSet;
  getMigrationPreview: (from: LifeStage, to: LifeStage) => MigrationPreview;
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
  getAdjustedOvulationDate: () => string | null;
  getConceptionProbability: (date: string) => ConceptionProbability | null;
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
  getCyclePhaseForDate: (date: string) => { phase: CyclePhase; cycleDay: number; periodStartDate: string | null };
  getSleepCycleAssociation: () => SleepCycleAssociation[];
  getPhaseSleepStatistics: () => PhaseSleepStatistics[];
  getSleepImpactAnalysis: () => SleepImpactAnalysis;
  getSleepRecommendations: (analysis: SleepImpactAnalysis) => SleepRecommendation[];
  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'createdAt'>) => void;
  updateFamilyMember: (id: string, data: Partial<FamilyMember>) => void;
  removeFamilyMember: (id: string) => void;
  updateMemberPermissions: (id: string, permissions: PermissionConfig) => void;
  generateShareCode: (permissions: PermissionConfig, validHours?: number) => ShareCode;
  revokeShareCode: (codeId: string) => void;
  redeemShareCode: (code: string, memberName: string, relation: FamilyRelation) => FamilyMember | null;
  getMaskedHealthData: (permissions: PermissionConfig) => MaskedHealthData;
  createRehabPlan: (plan: Omit<RehabPlan, 'id' | 'createdAt'>) => RehabPlan;
  updateRehabPlan: (id: string, data: Partial<RehabPlan>) => void;
  deleteRehabPlan: (id: string) => void;
  setActiveRehabPlan: (id: string | null) => void;
  addRehabCheckin: (checkin: Omit<RehabCheckin, 'id'>) => void;
  getRehabCheckinsByPlan: (planId: string) => RehabCheckin[];
  getRehabCheckinsByDate: (date: string) => RehabCheckin[];
  getRehabProgress: (planId: string) => RehabProgress;
  getCurrentRehabPhase: (planId: string) => RehabPhase | null;
  getWeeklyRehabStats: (planId: string) => { checkins: number; totalMinutes: number; avgPain: number; completedDays: string[] };
  getDefaultRehabPlan: (type: RehabPlan['type']) => Omit<RehabPlan, 'id' | 'createdAt'>;
  addRehabBodyMetric: (metric: Omit<RehabBodyMetric, 'id'>) => void;
  getRehabBodyMetricsByPlan: (planId: string) => RehabBodyMetric[];
  updateRehabMilestone: (planId: string, milestoneId: string, data: Partial<RehabMilestone>) => void;
  getRehabMilestonesByPlan: (planId: string) => RehabMilestone[];
  updateRehabWeeklyGoal: (planId: string, goalId: string, data: Partial<RehabWeeklyGoal>) => void;
  getRehabBodyMetricTrend: (planId: string) => { date: string; weight?: number; pelvicFloorScore?: number; diastasisRecti?: number }[];
  addVisitRecord: (record: VisitRecord) => void;
  updateVisitRecord: (id: string, data: Partial<VisitRecord>) => void;
  deleteVisitRecord: (id: string) => void;
  addTestReport: (report: TestReport) => void;
  updateTestReport: (id: string, data: Partial<TestReport>) => void;
  deleteTestReport: (id: string) => void;
  getVisitRecordsByDate: (date: string) => VisitRecord[];
  getLinkedPainRecords: (visitId: string) => PainRecord[];
  getLinkedPrenatalCheckup: (visitId: string) => PrenatalCheckup | undefined;
  getLinkedPostpartumCheckup: (visitId: string) => PostpartumCheckup | undefined;
  addTemperatureRecord: (record: Omit<TemperatureRecord, 'id'>) => void;
  addTemperatureRecords: (records: Omit<TemperatureRecord, 'id'>[]) => TemperatureRecord[];
  deleteTemperatureRecord: (id: string) => void;
  updateTemperatureRecord: (id: string, data: Partial<TemperatureRecord>) => void;
  getTemperatureRecordsByDateRange: (startDate: string, endDate: string) => TemperatureRecord[];
  getLatestTemperature: () => TemperatureRecord | undefined;
  getTemperatureStatistics: () => TemperatureStatistics;
  getTemperatureTrend: (days?: number) => { date: string; temperature?: number; phase?: CyclePhase }[];
  detectTemperatureAnomalies: (records?: TemperatureRecord[]) => TemperatureAnomalyAlert[];
  acknowledgeTemperatureAlert: (alertId: string) => void;
  addBluetoothDevice: (device: Omit<BluetoothDeviceInfo, 'id'>) => void;
  removeBluetoothDevice: (deviceId: string) => void;
  updateBluetoothDevice: (deviceId: string, data: Partial<BluetoothDeviceInfo>) => void;
  addSmartReminder: (reminder: SmartReminder) => void;
  updateSmartReminder: (id: string, data: Partial<SmartReminder>) => void;
  deleteSmartReminder: (id: string) => void;
  snoozeSmartReminder: (id: string, minutes: number) => void;
  completeSmartReminder: (id: string) => void;
  dismissSmartReminder: (id: string) => void;
  addReminderRule: (rule: ReminderRule) => void;
  updateReminderRule: (id: string, data: Partial<ReminderRule>) => void;
  deleteReminderRule: (id: string) => void;
  setNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;
  evaluateRulesAndGenerateReminders: () => void;
  getActiveReminders: () => SmartReminder[];
  getRemindersByCategory: (category: ReminderCategory) => SmartReminder[];
  getUpcomingReminders: (days?: number) => SmartReminder[];
  getTodayReminders: () => SmartReminder[];
}
