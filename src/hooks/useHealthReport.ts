import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useNutritionStore } from '@/store/useNutritionStore';
import type {
  ReportRange,
  HealthReport,
  ModuleHealthScore,
  SleepReportData,
  NutritionReportData,
  CycleReportData,
  PostpartumReportData,
  MedicationReportData,
  MoodReportData,
  PainReportData,
  MenopauseReportData,
  SleepRecord,
  PeriodRecord,
  PelvicFloorRecord,
  LochiaRecord,
  BreastfeedingRecord,
  MedicationRecord,
  MedicationReminder,
  MoodRecord,
  PainRecord,
  HotFlashRecord,
  HormoneRecord,
  PostpartumCheckup,
  MedicationCategory,
} from '@/types';


type AppStoreState = ReturnType<typeof useAppStore.getState>;
type NutritionStoreState = ReturnType<typeof useNutritionStore.getState>;

const getDateRange = (range: ReportRange): { start: Date; end: Date; prevStart: Date; prevEnd: Date } => {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  const days = range === 'week' ? 7 : 30;
  start.setDate(start.getDate() - days + 1);

  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - days + 1);

  return { start, end, prevStart, prevEnd };
};

const isInRange = (dateStr: string, start: Date, end: Date): boolean => {
  const d = new Date(dateStr);
  return d >= start && d <= end;
};

const avg = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
};

export function useHealthReport(range: ReportRange) {
  const appState = useAppStore();
  const nutritionState = useNutritionStore();

  const report = useMemo((): HealthReport => {
    const { start, end, prevStart, prevEnd } = getDateRange(range);
    const dateRangeFilter = (d: string) => isInRange(d, start, end);
    const prevDateRangeFilter = (d: string) => isInRange(d, prevStart, prevEnd);

    const sleepReport = computeSleepReport(appState, dateRangeFilter, prevDateRangeFilter);
    const nutritionReport = computeNutritionReport(nutritionState, start, end, prevStart, prevEnd);
    const cycleReport = computeCycleReport(appState, dateRangeFilter);
    const postpartumReport = computePostpartumReport(appState, dateRangeFilter);
    const medicationReport = computeMedicationReport(appState, dateRangeFilter, start, end);
    const moodReport = computeMoodReport(appState, dateRangeFilter);
    const painReport = computePainReport(appState, dateRangeFilter);
    const menopauseReport = computeMenopauseReport(appState, dateRangeFilter);

    const moduleScores = buildModuleScores(
      sleepReport,
      nutritionReport,
      cycleReport,
      postpartumReport,
      medicationReport,
      moodReport,
      painReport,
      menopauseReport
    );

    const overallScore =
      moduleScores.length > 0
        ? Math.round(moduleScores.reduce((s, m) => s + m.score, 0) / moduleScores.length)
        : 0;

    const keyInsights = buildKeyInsights(
      sleepReport,
      nutritionReport,
      cycleReport,
      postpartumReport,
      medicationReport,
      moodReport,
      painReport,
      menopauseReport
    );

    return {
      generatedAt: new Date().toISOString(),
      range,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      overallScore,
      moduleScores,
      keyInsights,
      sleep: sleepReport.hasData ? sleepReport.data : undefined,
      nutrition: nutritionReport.hasData ? nutritionReport.data : undefined,
      cycle: cycleReport.hasData ? cycleReport.data : undefined,
      postpartum: postpartumReport.hasData ? postpartumReport.data : undefined,
      medication: medicationReport.hasData ? medicationReport.data : undefined,
      mood: moodReport.hasData ? moodReport.data : undefined,
      pain: painReport.hasData ? painReport.data : undefined,
      menopause: menopauseReport.hasData ? menopauseReport.data : undefined,
    };
  }, [range, appState, nutritionState]);

  return report;
}

type ComputeResult<T> = { hasData: boolean; data: T } & Record<string, unknown>;

function computeSleepReport(
  appState: AppStoreState,
  filter: (d: string) => boolean,
  prevFilter: (d: string) => boolean
): ComputeResult<SleepReportData> & { prevAvgQuality: number } {
  const records: SleepRecord[] = appState.sleepRecords.filter((r: SleepRecord) => filter(r.date));
  const prevRecords: SleepRecord[] = appState.sleepRecords.filter((r: SleepRecord) => prevFilter(r.date));

  if (records.length === 0) {
    return { hasData: false, data: {} as SleepReportData, prevAvgQuality: 0 };
  }

  const durations = records.map((r: SleepRecord) => r.duration);
  const qualities = records.map((r: SleepRecord) => r.quality);
  const interruptions = records.map((r: SleepRecord) => r.interruptions);
  const nightSweats = records.filter((r: SleepRecord) => r.nightSweats).length;

  const trend = [...records]
    .sort((a: SleepRecord, b: SleepRecord) => a.date.localeCompare(b.date))
    .map((r: SleepRecord) => ({ date: r.date, duration: r.duration, quality: r.quality }));

  const phaseBreakdown = appState.getPhaseSleepStatistics ? appState.getPhaseSleepStatistics() : [];

  const prevAvgQuality = prevRecords.length > 0 ? avg(prevRecords.map((r: SleepRecord) => r.quality)) : 0;

  return {
    hasData: true,
    prevAvgQuality,
    data: {
      avgDuration: Number(avg(durations).toFixed(1)),
      avgQuality: Number(avg(qualities).toFixed(1)),
      avgInterruptions: Number(avg(interruptions).toFixed(1)),
      nightSweatRate: Math.round((nightSweats / records.length) * 100),
      totalRecords: records.length,
      weeklyTrend: trend,
      phaseBreakdown,
    },
  };
}

function computeNutritionReport(
  nutritionState: NutritionStoreState,
  start: Date,
  end: Date,
  prevStart: Date,
  prevEnd: Date
): ComputeResult<NutritionReportData> & { prevAvgCalories: number } {
  const daysInRange: string[] = [];
  const prevDaysInRange: string[] = [];
  const d = new Date(start);
  while (d <= end) {
    daysInRange.push(d.toISOString().split('T')[0]);
    d.setDate(d.getDate() + 1);
  }
  const pd = new Date(prevStart);
  while (pd <= prevEnd) {
    prevDaysInRange.push(pd.toISOString().split('T')[0]);
    pd.setDate(pd.getDate() + 1);
  }

  const summaries = daysInRange.map((date) => nutritionState.getDailyNutritionSummary(date));
  const prevSummaries = prevDaysInRange.map((date) => nutritionState.getDailyNutritionSummary(date));
  const records = nutritionState.foodIntakeRecords.filter((r) =>
    isInRange(r.date, start, end)
  );

  const validSummaries = summaries.filter((s) => s.totalCalories > 0);
  if (validSummaries.length === 0 && records.length === 0) {
    return { hasData: false, data: {} as NutritionReportData, prevAvgCalories: 0 };
  }

  const calories = summaries.map((s) => s.totalCalories);
  const proteins = summaries.map((s) => s.totalProtein);
  const carbs = summaries.map((s) => s.totalCarbs);
  const fats = summaries.map((s) => s.totalFat);

  const validPrev = prevSummaries.filter((s) => s.totalCalories > 0);
  const prevAvgCalories = validPrev.length > 0 ? avg(validPrev.map((s) => s.totalCalories)) : 0;

  const trend = summaries.map((s) => ({
    date: s.date,
    calories: s.totalCalories,
    protein: s.totalProtein,
  }));

  const today = new Date().toISOString().split('T')[0];
  const todayGaps = nutritionState.getNutrientGapAnalysis(today);
  const avgGaps = todayGaps.slice(0, 5);

  return {
    hasData: true,
    prevAvgCalories,
    data: {
      avgCalories: Math.round(avg(calories)),
      calorieTarget: nutritionState.getCalorieTarget(),
      avgProtein: Number(avg(proteins).toFixed(1)),
      avgCarbs: Number(avg(carbs).toFixed(1)),
      avgFat: Number(avg(fats).toFixed(1)),
      totalRecords: records.length,
      weeklyTrend: trend,
      topGaps: todayGaps.filter((g) => g.gap > 0).slice(0, 5),
      averageGaps: avgGaps,
    },
  };
}

function computeCycleReport(
  appState: AppStoreState,
  filter: (d: string) => boolean
): ComputeResult<CycleReportData> {
  const records: PeriodRecord[] = appState.cycleData.records.filter((r: PeriodRecord) => filter(r.date));
  const stats = appState.getCycleStatistics ? appState.getCycleStatistics() : null;

  if (records.length === 0 && !stats) {
    return { hasData: false, data: {} as CycleReportData };
  }

  const symptomMap = new Map<string, number>();
  for (const r of records) {
    for (const s of r.symptoms || []) {
      symptomMap.set(s, (symptomMap.get(s) || 0) + 1);
    }
  }
  const commonSymptoms = Array.from(symptomMap.entries())
    .map(([symptom, count]) => ({ symptom, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    hasData: true,
    data: {
      avgCycleLength: stats?.avgCycleLength || appState.cycleData.cycleLength,
      avgPeriodLength: stats?.avgPeriodLength || appState.cycleData.periodLength,
      regularityScore: stats?.regularityScore || 50,
      cycleCount: stats?.cycleCount || 0,
      periodDays: records.length,
      totalSymptomRecords: records.filter((r: PeriodRecord) => r.symptoms && r.symptoms.length > 0).length,
      commonSymptoms,
    },
  };
}

function computePostpartumReport(
  appState: AppStoreState,
  filter: (d: string) => boolean
): ComputeResult<PostpartumReportData> {
  const pelvicRecords: PelvicFloorRecord[] = appState.pelvicFloorRecords.filter((r: PelvicFloorRecord) =>
    filter(r.date)
  );
  const breastfeedingRecords: BreastfeedingRecord[] = appState.breastfeedingRecords.filter(
    (r: BreastfeedingRecord) => filter(r.date)
  );
  const lochiaRecords: LochiaRecord[] = appState.lochiaRecords.filter((r: LochiaRecord) => filter(r.date));

  if (pelvicRecords.length === 0 && breastfeedingRecords.length === 0 && lochiaRecords.length === 0) {
    return { hasData: false, data: {} as PostpartumReportData };
  }

  const pelvicTrendMap = new Map<string, { count: number; totalDuration: number }>();
  for (const r of pelvicRecords) {
    const existing = pelvicTrendMap.get(r.date) || { count: 0, totalDuration: 0 };
    existing.count += 1;
    existing.totalDuration += r.duration || 0;
    pelvicTrendMap.set(r.date, existing);
  }
  const pelvicTrend = Array.from(pelvicTrendMap.entries())
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const checkups: PostpartumCheckup[] = appState.postpartumCheckups;

  return {
    hasData: true,
    data: {
      totalPelvicFloorSessions: pelvicRecords.length,
      avgPelvicFloorDuration:
        pelvicRecords.length > 0
          ? Number(avg(pelvicRecords.map((r: PelvicFloorRecord) => r.duration)).toFixed(1))
          : 0,
      totalBreastfeedingSessions: breastfeedingRecords.length,
      avgBreastfeedingDuration:
        breastfeedingRecords.length > 0
          ? Number(avg(breastfeedingRecords.map((r: BreastfeedingRecord) => r.duration || 0)).toFixed(1))
          : 0,
      lochiaRecordsCount: lochiaRecords.length,
      completedCheckups: checkups.filter((c: PostpartumCheckup) => c.completed).length,
      totalCheckups: checkups.length,
      pelvicFloorTrend: pelvicTrend,
    },
  };
}

type CatStat = { category: MedicationCategory; rate: number; total: number; taken: number };

function getDatesInRange(start: Date, end: Date): string[] {
  const dates: string[] = [];
  const d = new Date(start);
  while (d <= end) {
    dates.push(d.toISOString().split('T')[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function getPainLevelForDate(appState: AppStoreState, date: string): number {
  const todays = appState.painRecords.filter((r: PainRecord) => r.date === date);
  if (todays.length === 0) return 0;
  const sorted = [...todays].sort((a, b) => b.time.localeCompare(a.time));
  return sorted[0].level;
}

function isReminderActiveOnDate(
  reminder: MedicationReminder,
  date: string,
  painLevel: number
): boolean {
  if (!reminder.active) return false;
  if (reminder.startDate > date) return false;
  if (reminder.endDate && reminder.endDate < date) return false;
  if (reminder.category === 'dysmenorrhea' && reminder.linkedPainLevel && painLevel < reminder.linkedPainLevel) {
    return false;
  }
  return true;
}

function computeMedicationReport(
  appState: AppStoreState,
  filter: (d: string) => boolean,
  start: Date,
  end: Date
): ComputeResult<MedicationReportData> {
  const records: MedicationRecord[] = appState.medicationRecords.filter((r: MedicationRecord) =>
    filter(r.date)
  );

  const datesInRange = getDatesInRange(start, end);

  let expectedTotal = 0;
  let actualTaken = 0;
  const categoryExpected = new Map<MedicationCategory, number>();
  const categoryTaken = new Map<MedicationCategory, number>();

  for (const date of datesInRange) {
    const painLevel = getPainLevelForDate(appState, date);
    for (const reminder of appState.medicationReminders) {
      if (!isReminderActiveOnDate(reminder, date, painLevel)) continue;
      const dailyDoses = reminder.times.length;
      expectedTotal += dailyDoses;
      const catExpected = categoryExpected.get(reminder.category) || 0;
      categoryExpected.set(reminder.category, catExpected + dailyDoses);

      const dateRecords = records.filter(
        (r: MedicationRecord) => r.reminderId === reminder.id && r.date === date
      );
      const takenToday = dateRecords.filter((r: MedicationRecord) => r.taken).length;
      actualTaken += takenToday;
      const catTaken = categoryTaken.get(reminder.category) || 0;
      categoryTaken.set(reminder.category, catTaken + takenToday);
    }
  }

  if (expectedTotal === 0 && records.length === 0 && appState.medicationReminders.length === 0) {
    return { hasData: false, data: {} as MedicationReportData };
  }

  const adherenceRate = expectedTotal > 0 ? Math.round((actualTaken / expectedTotal) * 100) : 0;

  const categories = new Set<MedicationCategory>([
    ...Array.from(categoryExpected.keys()),
    ...Array.from(categoryTaken.keys()),
  ]);
  const adherenceByCategory: CatStat[] = Array.from(categories).map((category) => {
    const total = categoryExpected.get(category) || 0;
    const taken = categoryTaken.get(category) || 0;
    return {
      category,
      total,
      taken,
      rate: total > 0 ? Math.round((taken / total) * 100) : 0,
    };
  }).filter((c) => c.total > 0);

  return {
    hasData: true,
    data: {
      totalReminders: appState.medicationReminders.length,
      activeReminders: appState.medicationReminders.filter((r: MedicationReminder) => r.active).length,
      adherenceRate,
      totalTaken: actualTaken,
      totalSkipped: records.filter((r: MedicationRecord) => r.skipped).length,
      totalRecords: records.length,
      adherenceByCategory,
    },
  };
}

type MoodDist = { mood: string; count: number; emotion: string };

function computeMoodReport(
  appState: AppStoreState,
  filter: (d: string) => boolean
): ComputeResult<MoodReportData> {
  const records: MoodRecord[] = appState.moodRecords.filter((r: MoodRecord) => filter(r.date));

  if (records.length === 0) {
    return { hasData: false, data: {} as MoodReportData };
  }

  const moodMap = new Map<string, { count: number; emotion: string }>();
  for (const r of records) {
    const existing = moodMap.get(r.mood) || { count: 0, emotion: r.emotion };
    existing.count += 1;
    moodMap.set(r.mood, existing);
  }
  const moodDistribution: MoodDist[] = Array.from(moodMap.entries())
    .map(([mood, v]) => ({ mood, ...v }))
    .sort((a, b) => b.count - a.count);

  const trend = [...records]
    .sort((a: MoodRecord, b: MoodRecord) => a.date.localeCompare(b.date))
    .map((r: MoodRecord) => ({ date: r.date, intensity: r.intensity, mood: r.mood }));

  return {
    hasData: true,
    data: {
      totalRecords: records.length,
      avgIntensity: Number(avg(records.map((r: MoodRecord) => r.intensity)).toFixed(1)),
      moodDistribution,
      recentMoodTrend: trend,
    },
  };
}

type PainDist = { level: number; count: number };

function computePainReport(
  appState: AppStoreState,
  filter: (d: string) => boolean
): ComputeResult<PainReportData> {
  const records: PainRecord[] = appState.painRecords.filter((r: PainRecord) => filter(r.date));

  if (records.length === 0) {
    return { hasData: false, data: {} as PainReportData };
  }

  const levelMap = new Map<number, number>();
  for (const r of records) {
    const bucket = Math.round(r.level);
    levelMap.set(bucket, (levelMap.get(bucket) || 0) + 1);
  }
  const levelDistribution: PainDist[] = Array.from(levelMap.entries())
    .map(([level, count]) => ({ level, count }))
    .sort((a, b) => a.level - b.level);

  const uniqueDays = new Set(records.map((r: PainRecord) => r.date)).size;

  return {
    hasData: true,
    data: {
      totalRecords: records.length,
      avgLevel: Number(avg(records.map((r: PainRecord) => r.level)).toFixed(1)),
      painDays: uniqueDays,
      severePainDays: records.filter((r: PainRecord) => r.level >= 7).length,
      levelDistribution,
    },
  };
}

function computeMenopauseReport(
  appState: AppStoreState,
  filter: (d: string) => boolean
): ComputeResult<MenopauseReportData> {
  const hotFlashRecords: HotFlashRecord[] = appState.hotFlashRecords.filter((r: HotFlashRecord) =>
    filter(r.date)
  );
  const hormoneRecords: HormoneRecord[] = appState.hormoneRecords;

  if (hotFlashRecords.length === 0 && hormoneRecords.length === 0) {
    return { hasData: false, data: {} as MenopauseReportData };
  }

  const severityMap = new Map<string, { count: number; totalSeverity: number }>();
  for (const r of hotFlashRecords) {
    const existing = severityMap.get(r.date) || { count: 0, totalSeverity: 0 };
    existing.count += 1;
    existing.totalSeverity += r.severity === 'mild' ? 1 : r.severity === 'moderate' ? 2 : 3;
    severityMap.set(r.date, existing);
  }
  const hotFlashTrend = Array.from(severityMap.entries())
    .map(([date, v]) => ({
      date,
      count: v.count,
      avgSeverity: Number((v.totalSeverity / v.count).toFixed(1)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const sortedHormones = [...hormoneRecords].sort((a: HormoneRecord, b: HormoneRecord) =>
    b.date.localeCompare(a.date)
  );
  const latest = sortedHormones[0];

  return {
    hasData: true,
    data: {
      totalHotFlashRecords: hotFlashRecords.length,
      avgHotFlashSeverity:
        hotFlashRecords.length > 0
          ? Number(
              avg(
                hotFlashRecords.map((r: HotFlashRecord) =>
                  r.severity === 'mild' ? 1 : r.severity === 'moderate' ? 2 : 3
                )
              ).toFixed(1)
            )
          : 0,
      avgHotFlashDuration:
        hotFlashRecords.length > 0
          ? Number(avg(hotFlashRecords.map((r: HotFlashRecord) => r.duration)).toFixed(1))
          : 0,
      hotFlashTrend,
      hormoneRecordsCount: hormoneRecords.length,
      latestHormones: latest
        ? {
            date: latest.date,
            estrogen: latest.estrogenLevel,
            progesterone: latest.progesteroneLevel,
            fsh: latest.fshLevel,
            lh: latest.lhLevel,
          }
        : undefined,
    },
  };
}

function buildModuleScores(
  sleep: ComputeResult<SleepReportData> & { prevAvgQuality: number },
  nutrition: ComputeResult<NutritionReportData> & { prevAvgCalories: number },
  cycle: ComputeResult<CycleReportData>,
  postpartum: ComputeResult<PostpartumReportData>,
  medication: ComputeResult<MedicationReportData>,
  mood: ComputeResult<MoodReportData>,
  pain: ComputeResult<PainReportData>,
  menopause: ComputeResult<MenopauseReportData>
): ModuleHealthScore[] {
  const scores: ModuleHealthScore[] = [];

  if (sleep.hasData) {
    const qualityScore = Math.min(100, (sleep.data.avgQuality / 5) * 100);
    const durationScore = Math.min(100, (sleep.data.avgDuration / 8) * 100);
    const interruptionPenalty = sleep.data.avgInterruptions * 5;
    const score = Math.max(0, Math.round((qualityScore + durationScore) / 2 - interruptionPenalty));
    const trendValue = sleep.data.avgQuality - sleep.prevAvgQuality;
    scores.push({
      module: 'sleep',
      moduleName: '睡眠健康',
      score,
      maxScore: 100,
      trend: trendValue > 0.2 ? 'up' : trendValue < -0.2 ? 'down' : 'stable',
      trendValue: Number(trendValue.toFixed(1)),
      color: 'from-indigo-400 via-purple-400 to-pink-400',
      icon: '🌙',
    });
  }

  if (nutrition.hasData && nutrition.data.avgCalories > 0) {
    const target = nutrition.data.calorieTarget;
    const calDiff = Math.abs(nutrition.data.avgCalories - target) / target;
    const calorieScore = Math.max(0, Math.round((1 - calDiff) * 100));
    const proteinTarget = nutrition.data.avgProtein > 0 ? 1 : 0;
    const score = Math.round(calorieScore * 0.7 + proteinTarget * 100 * 0.3);
    const trendValue = nutrition.data.avgCalories - nutrition.prevAvgCalories;
    scores.push({
      module: 'nutrition',
      moduleName: '营养膳食',
      score,
      maxScore: 100,
      trend:
        Math.abs(trendValue) < 100
          ? 'stable'
          : nutrition.data.avgCalories < target
          ? trendValue > 0
            ? 'up'
            : 'down'
          : trendValue < 0
          ? 'up'
          : 'down',
      trendValue: Math.round(trendValue),
      color: 'from-emerald-400 to-teal-500',
      icon: '🥗',
    });
  }

  if (cycle.hasData) {
    const score = cycle.data.regularityScore;
    scores.push({
      module: 'cycle',
      moduleName: '周期健康',
      score,
      maxScore: 100,
      trend: 'stable',
      trendValue: 0,
      color: 'from-pink-400 to-rose-400',
      icon: '🌸',
    });
  }

  if (postpartum.hasData) {
    const pelvicScore = postpartum.data.totalPelvicFloorSessions > 0 ? 80 : 40;
    const checkupProgress =
      postpartum.data.totalCheckups > 0
        ? (postpartum.data.completedCheckups / postpartum.data.totalCheckups) * 100
        : 50;
    const score = Math.round((pelvicScore + checkupProgress) / 2);
    scores.push({
      module: 'postpartum',
      moduleName: '产后恢复',
      score,
      maxScore: 100,
      trend: 'stable',
      trendValue: 0,
      color: 'from-fuchsia-400 via-pink-400 to-rose-400',
      icon: '👶',
    });
  }

  if (medication.hasData) {
    const score = medication.data.adherenceRate;
    scores.push({
      module: 'medication',
      moduleName: '用药依从',
      score,
      maxScore: 100,
      trend: 'stable',
      trendValue: 0,
      color: 'from-sky-400 to-blue-500',
      icon: '💊',
    });
  }

  if (mood.hasData) {
    const score = Math.min(100, Math.round((mood.data.avgIntensity / 10) * 100));
    scores.push({
      module: 'mood',
      moduleName: '情绪状态',
      score,
      maxScore: 100,
      trend: 'stable',
      trendValue: 0,
      color: 'from-peach-400 to-orange-400',
      icon: '😊',
    });
  }

  if (pain.hasData) {
    const score = Math.max(0, Math.round(100 - pain.data.avgLevel * 10));
    scores.push({
      module: 'pain',
      moduleName: '疼痛管理',
      score,
      maxScore: 100,
      trend: 'stable',
      trendValue: 0,
      color: 'from-rose-400 to-red-400',
      icon: '❤️',
    });
  }

  if (menopause.hasData) {
    const severityScore = Math.max(0, 100 - menopause.data.avgHotFlashSeverity * 25);
    const frequencyScore = Math.max(0, 100 - menopause.data.totalHotFlashRecords * 5);
    const score = Math.round((severityScore + frequencyScore) / 2);
    scores.push({
      module: 'menopause',
      moduleName: '更年期',
      score,
      maxScore: 100,
      trend: 'stable',
      trendValue: 0,
      color: 'from-lavender-400 to-purple-500',
      icon: '🌺',
    });
  }

  return scores;
}

function buildKeyInsights(
  sleep: ComputeResult<SleepReportData> & { prevAvgQuality: number },
  nutrition: ComputeResult<NutritionReportData> & { prevAvgCalories: number },
  cycle: ComputeResult<CycleReportData>,
  postpartum: ComputeResult<PostpartumReportData>,
  medication: ComputeResult<MedicationReportData>,
  _mood: ComputeResult<MoodReportData>,
  pain: ComputeResult<PainReportData>,
  menopause: ComputeResult<MenopauseReportData>
): HealthReport['keyInsights'] {
  const insights: HealthReport['keyInsights'] = [];

  if (sleep.hasData) {
    if (sleep.data.avgQuality < 3) {
      insights.push({
        type: 'warning',
        title: '睡眠质量偏低',
        description: `本周期平均睡眠质量仅 ${sleep.data.avgQuality}/5，建议保持规律作息，睡前减少使用电子设备。`,
        icon: '😴',
      });
    } else if (sleep.data.avgQuality >= 4) {
      insights.push({
        type: 'good',
        title: '睡眠质量良好',
        description: `本周期平均睡眠质量 ${sleep.data.avgQuality}/5，继续保持良好的睡眠习惯！`,
        icon: '✨',
      });
    }
    if (sleep.data.avgDuration < 6.5) {
      insights.push({
        type: 'warning',
        title: '睡眠时长不足',
        description: `平均睡眠 ${sleep.data.avgDuration} 小时，建议保证 7-8 小时的充足睡眠。`,
        icon: '⏰',
      });
    }
  }

  if (nutrition.hasData && nutrition.data.avgCalories > 0) {
    const calRatio = nutrition.data.avgCalories / nutrition.data.calorieTarget;
    if (calRatio < 0.7) {
      insights.push({
        type: 'warning',
        title: '热量摄入偏低',
        description: `平均每日摄入 ${nutrition.data.avgCalories} 千卡，仅为目标的 ${Math.round(calRatio * 100)}%，请注意营养均衡。`,
        icon: '🍽️',
      });
    } else if (calRatio > 1.2) {
      insights.push({
        type: 'info',
        title: '热量摄入偏高',
        description: `平均每日摄入 ${nutrition.data.avgCalories} 千卡，超出目标 ${Math.round((calRatio - 1) * 100)}%。`,
        icon: '🍱',
      });
    }
    if (nutrition.data.topGaps.length > 0) {
      const topGap = nutrition.data.topGaps[0];
      insights.push({
        type: 'info',
        title: `注意补充 ${topGap.nutrientName}`,
        description: `${topGap.nutrientName} 摄入仅达推荐量的 ${topGap.percentage}%，建议多摄入相关食物。`,
        icon: '💡',
      });
    }
  }

  if (cycle.hasData && cycle.data.regularityScore < 60) {
    insights.push({
      type: 'warning',
      title: '周期规律性待提升',
      description: `周期规律得分 ${cycle.data.regularityScore}/100，建议记录更多周期数据以获得更准确的分析。`,
      icon: '📊',
    });
  }

  if (pain.hasData && pain.data.avgLevel >= 5) {
    insights.push({
      type: 'warning',
      title: '疼痛水平偏高',
      description: `平均疼痛等级 ${pain.data.avgLevel}/10，严重疼痛 ${pain.data.severePainDays} 天，建议关注并采取缓解措施。`,
      icon: '💊',
    });
  }

  if (medication.hasData && medication.data.adherenceRate < 70) {
    insights.push({
      type: 'warning',
      title: '用药依从性需改善',
      description: `用药依从率 ${medication.data.adherenceRate}%，建议设置提醒并按时服药。`,
      icon: '💊',
    });
  }

  if (menopause.hasData && menopause.data.avgHotFlashSeverity >= 2) {
    insights.push({
      type: 'info',
      title: '潮热症状关注',
      description: `平均潮热严重程度 ${menopause.data.avgHotFlashSeverity}/3，建议保持室内通风，避免辛辣刺激食物。`,
      icon: '🔥',
    });
  }

  if (postpartum.hasData && postpartum.data.totalPelvicFloorSessions === 0) {
    insights.push({
      type: 'info',
      title: '建议开始盆底训练',
      description: '产后恢复黄金期，建议开始盆底肌训练以促进恢复。',
      icon: '🏋️',
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: 'good',
      title: '健康状态良好',
      description: '继续保持健康的生活习惯，定期记录健康数据。',
      icon: '💖',
    });
  }

  return insights.slice(0, 6);
}
