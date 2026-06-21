import type {
  ReminderRule,
  RuleCondition,
  SmartReminder,
  ReminderCategory,
  ReminderPriority,
  NotificationPreferences,
  MedicationReminder,
  MedicationRecord,
  ReminderStatus,
} from '@/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const dateStr = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const defaultNotificationPreferences: NotificationPreferences = {
  enabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  snoozeDuration: 15,
  categories: {
    period: { enabled: true, advanceDays: 3, times: ['08:00', '20:00'] },
    ovulation: { enabled: true, advanceDays: 2, times: ['08:00'] },
    prenatal: { enabled: true, advanceDays: 3, times: ['09:00'] },
    postpartum: { enabled: true, advanceDays: 3, times: ['09:00'] },
    medication: { enabled: true, advanceDays: 0, times: ['08:00', '14:00', '20:00'] },
    custom: { enabled: true, advanceDays: 1, times: ['09:00'] },
  },
  soundEnabled: true,
  vibrationEnabled: true,
};

export const defaultReminderRules: ReminderRule[] = [
  {
    id: 'rule-period-approaching',
    name: '经期临近提醒',
    description: '根据周期预测，在下次月经来临前提前提醒',
    category: 'period',
    conditions: [
      { field: 'daysUntilNextPeriod', operator: 'lte', value: 3, label: '距离下次经期≤3天' },
    ],
    logicGate: 'and',
    priority: 'high',
    titleTemplate: '经期即将到来',
    descriptionTemplate: '预计{daysUntilNextPeriod}天后（{predictedDate}）来月经，请做好准备',
    advanceDays: 3,
    time: '08:00',
    active: true,
    builtIn: true,
    createdAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'rule-period-day1',
    name: '经期首日提醒',
    description: '月经来潮当天提醒记录经期数据',
    category: 'period',
    conditions: [
      { field: 'isPeriodDay', operator: 'eq', value: 'true', label: '今天是经期第1天' },
    ],
    logicGate: 'and',
    priority: 'urgent',
    titleTemplate: '月经来潮提醒',
    descriptionTemplate: '今天是月经第1天，记得记录经期数据',
    advanceDays: 0,
    time: '07:30',
    active: true,
    builtIn: true,
    createdAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'rule-ovulation-approaching',
    name: '排卵日临近提醒',
    description: '排卵日前提醒注意备孕或避孕',
    category: 'ovulation',
    conditions: [
      { field: 'daysUntilOvulation', operator: 'lte', value: 2, label: '距离排卵日≤2天' },
    ],
    logicGate: 'and',
    priority: 'high',
    titleTemplate: '排卵日即将到来',
    descriptionTemplate: '预计{daysUntilOvulation}天后排卵，注意合理安排',
    advanceDays: 2,
    time: '08:00',
    active: true,
    builtIn: true,
    createdAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'rule-fertile-window',
    name: '易孕期提醒',
    description: '进入易孕期窗口时提醒',
    category: 'ovulation',
    conditions: [
      { field: 'isInFertileWindow', operator: 'eq', value: 'true', label: '当前处于易孕期' },
    ],
    logicGate: 'and',
    priority: 'medium',
    titleTemplate: '易孕期提醒',
    descriptionTemplate: '您目前处于易孕期窗口，受孕概率较高',
    advanceDays: 0,
    time: '08:00',
    active: true,
    builtIn: true,
    createdAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'rule-prenatal-checkup',
    name: '产检提前提醒',
    description: '产检日期前3天自动提醒准备',
    category: 'prenatal',
    conditions: [
      { field: 'hasUpcomingPrenatalCheckup', operator: 'eq', value: 'true', label: '3天内有产检' },
    ],
    logicGate: 'and',
    priority: 'high',
    titleTemplate: '产检提醒',
    descriptionTemplate: '您的{checkupType}将在{checkupDate}进行，请提前准备',
    advanceDays: 3,
    time: '09:00',
    active: true,
    builtIn: true,
    createdAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'rule-prenatal-checkup-overdue',
    name: '产检逾期提醒',
    description: '产检日期已过但未完成时发出逾期提醒',
    category: 'prenatal',
    conditions: [
      { field: 'hasOverduePrenatalCheckup', operator: 'eq', value: 'true', label: '存在逾期产检' },
    ],
    logicGate: 'and',
    priority: 'urgent',
    titleTemplate: '产检逾期提醒',
    descriptionTemplate: '您的{checkupType}（预约日期{checkupDate}）已逾期，请尽快安排补检',
    advanceDays: 0,
    time: '08:00',
    active: true,
    builtIn: true,
    createdAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'rule-postpartum-checkup',
    name: '产后复查提醒',
    description: '产后复查日期前3天自动提醒',
    category: 'postpartum',
    conditions: [
      { field: 'hasUpcomingPostpartumCheckup', operator: 'eq', value: 'true', label: '3天内有产后复查' },
    ],
    logicGate: 'and',
    priority: 'high',
    titleTemplate: '产后复查提醒',
    descriptionTemplate: '您的{checkupName}将在{checkupDate}进行，请提前准备',
    advanceDays: 3,
    time: '09:00',
    active: true,
    builtIn: true,
    createdAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'rule-medication-adherence',
    name: '服药依从性提醒',
    description: '检测到漏服药物时发出提醒',
    category: 'medication',
    conditions: [
      { field: 'hasMissedMedication', operator: 'eq', value: 'true', label: '存在漏服药物' },
    ],
    logicGate: 'and',
    priority: 'urgent',
    titleTemplate: '服药提醒',
    descriptionTemplate: '您有药物尚未服用，请及时补服',
    advanceDays: 0,
    time: '20:00',
    active: true,
    builtIn: true,
    createdAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'rule-pain-medication',
    name: '痛经用药提醒',
    description: '检测到痛经记录时提醒服用止痛药',
    category: 'medication',
    conditions: [
      { field: 'todayPainLevel', operator: 'gte', value: 5, label: '今日疼痛≥5级' },
    ],
    logicGate: 'and',
    priority: 'high',
    titleTemplate: '痛经用药建议',
    descriptionTemplate: '检测到今日痛经较严重（{painLevel}级），建议服用止痛药',
    advanceDays: 0,
    time: '08:00',
    active: true,
    builtIn: true,
    createdAt: new Date().toISOString().split('T')[0],
  },
];

interface RuleContext {
  daysUntilNextPeriod?: number;
  isPeriodDay?: boolean;
  daysUntilOvulation?: number;
  isInFertileWindow?: boolean;
  hasUpcomingPrenatalCheckup?: boolean;
  hasUpcomingPostpartumCheckup?: boolean;
  hasOverduePrenatalCheckup?: boolean;
  hasMissedMedication?: boolean;
  todayPainLevel?: number;
  predictedNextPeriod?: string;
  predictedOvulation?: string;
  upcomingPrenatalCheckups?: { type: string; date: string }[];
  upcomingPostpartumCheckups?: { name: string; date: string }[];
  overduePrenatalCheckups?: { type: string; date: string }[];
  missedMedications?: { name: string; dosage: string; time: string }[];
}

function evaluateCondition(condition: RuleCondition, context: RuleContext): boolean {
  const fieldValue = getFieldValue(condition.field, context);
  if (fieldValue === undefined) return false;

  switch (condition.operator) {
    case 'eq':
      return String(fieldValue) === String(condition.value);
    case 'neq':
      return String(fieldValue) !== String(condition.value);
    case 'gt':
      return Number(fieldValue) > Number(condition.value);
    case 'gte':
      return Number(fieldValue) >= Number(condition.value);
    case 'lt':
      return Number(fieldValue) < Number(condition.value);
    case 'lte':
      return Number(fieldValue) <= Number(condition.value);
    case 'in':
      return Array.isArray(condition.value) && condition.value.includes(String(fieldValue));
    case 'contains':
      return String(fieldValue).includes(String(condition.value));
    case 'between': {
      const arr = Array.isArray(condition.value) ? condition.value : [condition.value];
      const num = Number(fieldValue);
      return num >= Number(arr[0]) && num <= Number(arr[1]);
    }
    default:
      return false;
  }
}

function getFieldValue(field: string, context: RuleContext): string | number | boolean | undefined {
  const key = field as keyof RuleContext;
  return context[key] as string | number | boolean | undefined;
}

export function evaluateRule(rule: ReminderRule, context: RuleContext): boolean {
  if (!rule.active) return false;
  if (rule.conditions.length === 0) return true;

  if (rule.logicGate === 'and') {
    return rule.conditions.every((c) => evaluateCondition(c, context));
  }
  return rule.conditions.some((c) => evaluateCondition(c, context));
}

export function buildRuleContext(state: {
  getPeriodPrediction: () => {
    daysUntilNextPeriod: number;
    predictedNextStart: string;
    ovulationDate: string;
    adjustedOvulationDate?: string;
    cyclePhase: string;
    fertileWindowStart: string;
    fertileWindowEnd: string;
  };
  getCyclePhaseForDate: (date: string) => { phase: string };
  prenatalCheckups: { date: string; type: string; completed: boolean }[];
  postpartumCheckups: { date: string; typeName: string; completed: boolean }[];
  medicationReminders: { id: string; active: boolean; times: string[]; name: string; dosage: string; category: string }[];
  medicationRecords: { reminderId: string; date: string; time: string; taken: boolean; skipped: boolean }[];
  getTodayPainLevel: () => number;
}): RuleContext {
  const today = new Date();
  const todayStr = dateStr(today);
  const pred = state.getPeriodPrediction();
  const currentPhase = state.getCyclePhaseForDate(todayStr);

  const daysUntilNextPeriod = pred.daysUntilNextPeriod;
  const isPeriodDay = currentPhase.phase === 'period';

  const ovDate = pred.adjustedOvulationDate || pred.ovulationDate;
  const ovD = new Date(ovDate);
  const daysUntilOvulation = Math.floor((ovD.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const isInFertileWindow = pred.cyclePhase === 'fertile' || pred.cyclePhase === 'ovulation' || pred.cyclePhase === 'fertile_high' || pred.cyclePhase === 'fertile_peak';

  const upcomingPrenatal = state.prenatalCheckups
    .filter((c) => !c.completed)
    .map((c) => {
      const d = new Date(c.date);
      const diff = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { type: c.type, date: c.date, diff };
    })
    .filter((c) => c.diff >= 0 && c.diff <= 3);

  const upcomingPostpartum = state.postpartumCheckups
    .filter((c) => !c.completed)
    .map((c) => {
      const d = new Date(c.date);
      const diff = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { name: c.typeName, date: c.date, diff };
    })
    .filter((c) => c.diff >= 0 && c.diff <= 3);

  const hasUpcomingPrenatalCheckup = upcomingPrenatal.length > 0;
  const hasUpcomingPostpartumCheckup = upcomingPostpartum.length > 0;

  const overduePrenatal = state.prenatalCheckups
    .filter((c) => !c.completed)
    .map((c) => {
      const d = new Date(c.date);
      const diff = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { type: c.type, date: c.date, diff };
    })
    .filter((c) => c.diff < 0);

  const hasOverduePrenatalCheckup = overduePrenatal.length > 0;

  const missedMeds: { name: string; dosage: string; time: string }[] = [];
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  for (const reminder of state.medicationReminders) {
    if (!reminder.active) continue;
    for (const time of reminder.times) {
      if (time <= currentTime) {
        const record = state.medicationRecords.find(
          (r) => r.reminderId === reminder.id && r.date === todayStr && r.time === time
        );
        if (!record || (!record.taken && !record.skipped)) {
          missedMeds.push({ name: reminder.name, dosage: reminder.dosage, time });
        }
      }
    }
  }

  return {
    daysUntilNextPeriod,
    isPeriodDay,
    daysUntilOvulation,
    isInFertileWindow,
    hasUpcomingPrenatalCheckup,
    hasUpcomingPostpartumCheckup,
    hasOverduePrenatalCheckup,
    hasMissedMedication: missedMeds.length > 0,
    todayPainLevel: state.getTodayPainLevel(),
    predictedNextPeriod: pred.predictedNextStart,
    predictedOvulation: ovDate,
    upcomingPrenatalCheckups: upcomingPrenatal.map((c) => ({ type: c.type, date: c.date })),
    upcomingPostpartumCheckups: upcomingPostpartum.map((c) => ({ name: c.name, date: c.date })),
    overduePrenatalCheckups: overduePrenatal.map((c) => ({ type: c.type, date: c.date })),
    missedMedications: missedMeds,
  };
}

function fillTemplate(template: string, vars: Record<string, string | number | undefined>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const val = vars[key];
    return val !== undefined ? String(val) : '';
  });
}

export function generateRemindersFromRules(
  rules: ReminderRule[],
  context: RuleContext,
  existingReminders: SmartReminder[],
  prefs: NotificationPreferences
): SmartReminder[] {
  const newReminders: SmartReminder[] = [];

  const existingKeys = new Set(
    existingReminders
      .filter((r) => r.status === 'pending' || r.status === 'active')
      .map((r) => `${r.ruleId}-${r.date}`)
  );

  for (const rule of rules) {
    if (!rule.active) continue;

    const categoryPref = prefs.categories[rule.category];
    if (!categoryPref?.enabled) continue;
    if (!prefs.enabled) continue;

    if (!evaluateRule(rule, context)) continue;

    const targetDate = dateStr(addDays(new Date(), rule.advanceDays));
    const dedupeKey = `${rule.id}-${targetDate}`;
    if (existingKeys.has(dedupeKey)) continue;

    const templateVars: Record<string, string | number | undefined> = {
      daysUntilNextPeriod: context.daysUntilNextPeriod,
      daysUntilOvulation: context.daysUntilOvulation,
      predictedDate: context.predictedNextPeriod,
      predictedOvulation: context.predictedOvulation,
      painLevel: context.todayPainLevel,
      checkupType: context.upcomingPrenatalCheckups?.[0]?.type || context.overduePrenatalCheckups?.[0]?.type,
      checkupDate: context.upcomingPrenatalCheckups?.[0]?.date || context.upcomingPostpartumCheckups?.[0]?.date || context.overduePrenatalCheckups?.[0]?.date,
      checkupName: context.upcomingPostpartumCheckups?.[0]?.name,
    };

    newReminders.push({
      id: generateId(),
      category: rule.category,
      title: fillTemplate(rule.titleTemplate, templateVars),
      description: fillTemplate(rule.descriptionTemplate, templateVars),
      date: targetDate,
      time: rule.time || categoryPref.times[0] || '09:00',
      priority: rule.priority,
      status: 'pending',
      ruleId: rule.id,
      metadata: Object.fromEntries(
        Object.entries(templateVars).filter(([, v]) => v !== undefined) as [string, string][]
      ),
    });
  }

  return newReminders;
}

export const categoryMeta: Record<ReminderCategory, { label: string; icon: string; color: string; bg: string; gradient: string }> = {
  period: { label: '经期提醒', icon: 'Droplets', color: 'text-rose-600', bg: 'from-rose-50 to-pink-50', gradient: 'from-rose-400 to-pink-500' },
  ovulation: { label: '排卵提醒', icon: 'Sparkles', color: 'text-amber-600', bg: 'from-amber-50 to-orange-50', gradient: 'from-amber-400 to-orange-500' },
  prenatal: { label: '产检提醒', icon: 'Stethoscope', color: 'text-sky-600', bg: 'from-sky-50 to-blue-50', gradient: 'from-sky-400 to-blue-500' },
  postpartum: { label: '产后复查', icon: 'Baby', color: 'text-fuchsia-600', bg: 'from-fuchsia-50 to-pink-50', gradient: 'from-fuchsia-400 to-pink-500' },
  medication: { label: '服药提醒', icon: 'Pill', color: 'text-violet-600', bg: 'from-violet-50 to-purple-50', gradient: 'from-violet-400 to-purple-500' },
  custom: { label: '自定义提醒', icon: 'Bell', color: 'text-teal-600', bg: 'from-teal-50 to-cyan-50', gradient: 'from-teal-400 to-cyan-500' },
};

export const priorityMeta: Record<ReminderPriority, { label: string; color: string; dot: string }> = {
  low: { label: '低', color: 'text-gray-500', dot: 'bg-gray-400' },
  medium: { label: '中', color: 'text-blue-500', dot: 'bg-blue-400' },
  high: { label: '高', color: 'text-orange-500', dot: 'bg-orange-400' },
  urgent: { label: '紧急', color: 'text-red-500', dot: 'bg-red-500' },
};

export function createCustomRule(partial: Partial<ReminderRule>): ReminderRule {
  return {
    id: generateId(),
    name: partial.name || '自定义规则',
    description: partial.description || '',
    category: partial.category || 'custom',
    conditions: partial.conditions || [],
    logicGate: partial.logicGate || 'and',
    priority: partial.priority || 'medium',
    titleTemplate: partial.titleTemplate || '自定义提醒',
    descriptionTemplate: partial.descriptionTemplate || '',
    advanceDays: partial.advanceDays ?? 0,
    time: partial.time || '09:00',
    active: partial.active ?? true,
    builtIn: false,
    createdAt: dateStr(new Date()),
  };
}

export function isTimeInQuietHours(time: string, quietStart: string, quietEnd: string): boolean {
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const t = toMinutes(time);
  const s = toMinutes(quietStart);
  const e = toMinutes(quietEnd);
  if (s <= e) {
    return t >= s && t <= e;
  }
  return t >= s || t <= e;
}

export function isReminderInQuietHours(
  reminder: SmartReminder,
  prefs: NotificationPreferences
): boolean {
  if (!reminder.time) return false;
  return isTimeInQuietHours(reminder.time, prefs.quietHoursStart, prefs.quietHoursEnd);
}

export function filterRemindersByQuietHours(
  reminders: SmartReminder[],
  prefs: NotificationPreferences
): SmartReminder[] {
  if (!prefs.enabled) return [];
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const nowInQuiet = isTimeInQuietHours(currentTime, prefs.quietHoursStart, prefs.quietHoursEnd);
  if (!nowInQuiet) return reminders;
  return [];
}

const medicationCategoryToReminderCategory = (cat: string): ReminderCategory => {
  switch (cat) {
    case 'dysmenorrhea': return 'medication';
    case 'pregnancy': return 'medication';
    case 'ovulation': return 'medication';
    default: return 'medication';
  }
};

export function generateMedicationSmartReminders(
  medicationReminders: MedicationReminder[],
  medicationRecords: MedicationRecord[],
  existingSmartReminders: SmartReminder[],
  prefs: NotificationPreferences,
  days: number = 7
): SmartReminder[] {
  const today = new Date();
  const todayStr = dateStr(today);
  const newReminders: SmartReminder[] = [];

  const categoryPref = prefs.categories.medication;
  if (!categoryPref?.enabled || !prefs.enabled) return [];

  const existingMedKeys = new Set(
    existingSmartReminders
      .filter((r) => r.category === 'medication' && (r.status === 'pending' || r.status === 'active' || r.status === 'snoozed'))
      .map((r) => `${r.metadata?.medicationId}-${r.date}-${r.time}`)
  );

  for (const med of medicationReminders) {
    if (!med.active) continue;

    for (let dayOffset = 0; dayOffset < days; dayOffset++) {
      const targetDate = dateStr(addDays(today, dayOffset));

      if (med.startDate > targetDate) continue;
      if (med.endDate && med.endDate < targetDate) continue;

      for (const time of med.times) {
        const dedupeKey = `${med.id}-${targetDate}-${time}`;
        if (existingMedKeys.has(dedupeKey)) continue;

        const record = medicationRecords.find(
          (r) => r.reminderId === med.id && r.date === targetDate && r.time === time
        );

        let status: ReminderStatus = 'pending';
        let completedAt: string | undefined;
        let dismissedAt: string | undefined;

        if (record) {
          if (record.taken) {
            status = 'completed';
            completedAt = record.date;
          } else if (record.skipped) {
            status = 'dismissed';
            dismissedAt = record.date;
          }
        }

        const isToday = targetDate === todayStr;
        const isPast = targetDate < todayStr;
        const timePassed = isToday && time < `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

        if (isPast || (isToday && timePassed && status === 'pending')) {
          continue;
        }

        let priority: ReminderPriority = 'medium';
        if (med.category === 'dysmenorrhea') priority = 'high';
        if (med.category === 'pregnancy') priority = 'high';

        newReminders.push({
          id: generateId(),
          category: medicationCategoryToReminderCategory(med.category),
          title: `${med.name} - 服药提醒`,
          description: `剂量：${med.dosage}${med.notes ? ` | ${med.notes}` : ''}`,
          date: targetDate,
          time,
          priority,
          status,
          completedAt,
          dismissedAt,
          metadata: {
            medicationId: med.id,
            medicationName: med.name,
            medicationCategory: med.category,
            dosage: med.dosage,
            frequency: med.frequency,
          },
        });
      }
    }
  }

  return newReminders;
}

export function syncMedicationRecordsToSmartReminders(
  smartReminders: SmartReminder[],
  medicationRecords: MedicationRecord[]
): SmartReminder[] {
  return smartReminders.map((reminder) => {
    if (reminder.category !== 'medication' || !reminder.metadata?.medicationId) {
      return reminder;
    }
    const medId = reminder.metadata.medicationId;
    const record = medicationRecords.find(
      (r) => r.reminderId === medId && r.date === reminder.date && r.time === reminder.time
    );
    if (!record) return reminder;
    if (record.taken && reminder.status !== 'completed') {
      return { ...reminder, status: 'completed' as const, completedAt: record.date };
    }
    if (record.skipped && reminder.status !== 'dismissed') {
      return { ...reminder, status: 'dismissed' as const, dismissedAt: record.date };
    }
    return reminder;
  });
}
