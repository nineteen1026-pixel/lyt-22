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
  FoodItem,
  Recipe,
  FoodIntakeRecord,
  NutrientRDAByStage,
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

const mockFoodItems: FoodItem[] = [
  {
    id: 'egg',
    name: '鸡蛋',
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    servingSize: '100g',
    nutrients: [
      { nutrientId: 'protein', amount: 13 },
      { nutrientId: 'vitamin_d', amount: 2 },
      { nutrientId: 'iron', amount: 1.8 },
    ],
  },
  {
    id: 'milk',
    name: '牛奶',
    calories: 42,
    protein: 3.4,
    carbs: 5,
    fat: 1,
    servingSize: '100ml',
    nutrients: [
      { nutrientId: 'protein', amount: 3.4 },
      { nutrientId: 'calcium', amount: 125 },
      { nutrientId: 'vitamin_d', amount: 1.2 },
    ],
  },
  {
    id: 'spinach',
    name: '菠菜',
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    servingSize: '100g',
    nutrients: [
      { nutrientId: 'iron', amount: 2.7 },
      { nutrientId: 'vitamin_c', amount: 28 },
      { nutrientId: 'folic_acid', amount: 194 },
      { nutrientId: 'fiber', amount: 2.2 },
    ],
  },
  {
    id: 'salmon',
    name: '三文鱼',
    calories: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    servingSize: '100g',
    nutrients: [
      { nutrientId: 'protein', amount: 20 },
      { nutrientId: 'omega3', amount: 2.3 },
      { nutrientId: 'vitamin_d', amount: 11 },
      { nutrientId: 'iron', amount: 0.8 },
    ],
  },
  {
    id: 'oatmeal',
    name: '燕麦粥',
    calories: 68,
    protein: 2.4,
    carbs: 12,
    fat: 1.4,
    servingSize: '100g',
    nutrients: [
      { nutrientId: 'fiber', amount: 1.7 },
      { nutrientId: 'iron', amount: 1.2 },
      { nutrientId: 'protein', amount: 2.4 },
    ],
  },
  {
    id: 'chicken',
    name: '鸡胸肉',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    servingSize: '100g',
    nutrients: [
      { nutrientId: 'protein', amount: 31 },
      { nutrientId: 'iron', amount: 0.7 },
    ],
  },
  {
    id: 'broccoli',
    name: '西兰花',
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    servingSize: '100g',
    nutrients: [
      { nutrientId: 'vitamin_c', amount: 89 },
      { nutrientId: 'folic_acid', amount: 63 },
      { nutrientId: 'fiber', amount: 2.6 },
      { nutrientId: 'calcium', amount: 47 },
    ],
  },
  {
    id: 'orange',
    name: '橙子',
    calories: 47,
    protein: 0.9,
    carbs: 12,
    fat: 0.1,
    servingSize: '100g',
    nutrients: [
      { nutrientId: 'vitamin_c', amount: 53 },
      { nutrientId: 'folic_acid', amount: 30 },
      { nutrientId: 'fiber', amount: 2.4 },
    ],
  },
  {
    id: 'yogurt',
    name: '酸奶',
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.7,
    servingSize: '100g',
    nutrients: [
      { nutrientId: 'protein', amount: 10 },
      { nutrientId: 'calcium', amount: 183 },
      { nutrientId: 'vitamin_d', amount: 1.3 },
    ],
  },
  {
    id: 'almonds',
    name: '杏仁',
    calories: 579,
    protein: 21,
    carbs: 22,
    fat: 50,
    servingSize: '100g',
    nutrients: [
      { nutrientId: 'protein', amount: 21 },
      { nutrientId: 'fiber', amount: 12 },
      { nutrientId: 'calcium', amount: 269 },
      { nutrientId: 'iron', amount: 3.7 },
    ],
  },
];

const mockRecipes: Recipe[] = [
  {
    id: 'recipe1',
    name: '营养燕麦早餐碗',
    description: '富含膳食纤维和维生素的健康早餐，适合忙碌的早晨',
    image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&h=300&fit=crop',
    lifeStages: ['teen', 'career', 'pregnancy-prep', 'pregnancy', 'postpartum', 'menopause'],
    category: 'breakfast',
    cookTime: 15,
    difficulty: 'easy',
    calories: 350,
    protein: 15,
    carbs: 55,
    fat: 8,
    ingredients: [
      { name: '燕麦片', amount: '50g' },
      { name: '牛奶', amount: '200ml' },
      { name: '蓝莓', amount: '30g' },
      { name: '香蕉', amount: '半根' },
      { name: '杏仁片', amount: '10g' },
      { name: '蜂蜜', amount: '适量' },
    ],
    instructions: [
      '将燕麦片用牛奶或水煮软',
      '香蕉切片，蓝莓洗净',
      '将水果摆放在燕麦粥上',
      '撒上杏仁片，淋上蜂蜜即可',
    ],
    nutrients: [
      { nutrientId: 'fiber', amount: 8 },
      { nutrientId: 'calcium', amount: 300 },
      { nutrientId: 'vitamin_c', amount: 15 },
      { nutrientId: 'iron', amount: 3 },
    ],
    tags: ['快手', '低脂', '高纤'],
  },
  {
    id: 'recipe2',
    name: '菠菜三文鱼沙拉',
    description: '富含Omega-3和铁质的营养沙拉，有助于血液循环',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    lifeStages: ['career', 'pregnancy', 'postpartum', 'menopause'],
    category: 'lunch',
    cookTime: 25,
    difficulty: 'medium',
    calories: 420,
    protein: 32,
    carbs: 18,
    fat: 24,
    ingredients: [
      { name: '三文鱼', amount: '150g' },
      { name: '新鲜菠菜', amount: '100g' },
      { name: '圣女果', amount: '50g' },
      { name: '牛油果', amount: '半个' },
      { name: '柠檬汁', amount: '1勺' },
      { name: '橄榄油', amount: '1勺' },
    ],
    instructions: [
      '三文鱼用盐和黑胡椒腌制15分钟',
      '平底锅煎至两面金黄，切块备用',
      '菠菜洗净沥干，圣女果切半',
      '牛油果切片，与其他食材混合',
      '淋上柠檬汁和橄榄油，撒上三文鱼块',
    ],
    nutrients: [
      { nutrientId: 'omega3', amount: 2.5 },
      { nutrientId: 'iron', amount: 4.5 },
      { nutrientId: 'vitamin_c', amount: 30 },
      { nutrientId: 'folic_acid', amount: 150 },
    ],
    tags: ['高蛋白', '补铁', '低卡'],
  },
  {
    id: 'recipe3',
    name: '钙奶布丁',
    description: '富含钙质和蛋白质的甜品，适合青少年骨骼发育',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
    lifeStages: ['teen', 'postpartum', 'menopause'],
    category: 'snack',
    cookTime: 30,
    difficulty: 'medium',
    calories: 180,
    protein: 12,
    carbs: 20,
    fat: 5,
    ingredients: [
      { name: '牛奶', amount: '300ml' },
      { name: '淡奶油', amount: '50ml' },
      { name: '糖', amount: '30g' },
      { name: '吉利丁片', amount: '2片' },
      { name: '香草精', amount: '少许' },
    ],
    instructions: [
      '吉利丁片用冷水泡软',
      '牛奶加糖加热至糖融化，不要煮沸',
      '加入泡软的吉利丁片搅拌至融化',
      '过筛后倒入模具，冷藏4小时凝固',
    ],
    nutrients: [
      { nutrientId: 'calcium', amount: 450 },
      { nutrientId: 'protein', amount: 12 },
      { nutrientId: 'vitamin_d', amount: 3 },
    ],
    tags: ['补钙', '甜品', '养颜'],
  },
  {
    id: 'recipe4',
    name: '叶酸蔬菜卷',
    description: '富含叶酸和维生素，特别适合备孕期和孕早期',
    image: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=400&h=300&fit=crop',
    lifeStages: ['pregnancy-prep', 'pregnancy'],
    category: 'lunch',
    cookTime: 20,
    difficulty: 'easy',
    calories: 280,
    protein: 18,
    carbs: 35,
    fat: 8,
    ingredients: [
      { name: '全麦卷饼', amount: '2张' },
      { name: '鸡胸肉', amount: '100g' },
      { name: '菠菜', amount: '50g' },
      { name: '西兰花', amount: '50g' },
      { name: '胡萝卜', amount: '30g' },
      { name: '低脂沙拉酱', amount: '适量' },
    ],
    instructions: [
      '鸡胸肉煮熟撕成丝',
      '西兰花焯水，胡萝卜切丝',
      '菠菜洗净沥干水分',
      '将所有食材铺在卷饼上',
      '淋上沙拉酱，卷起切段即可',
    ],
    nutrients: [
      { nutrientId: 'folic_acid', amount: 300 },
      { nutrientId: 'vitamin_c', amount: 60 },
      { nutrientId: 'iron', amount: 3.5 },
      { nutrientId: 'protein', amount: 18 },
    ],
    tags: ['备孕首选', '高铁', '高纤维'],
  },
  {
    id: 'recipe5',
    name: '更年期安神汤',
    description: '有助于缓解潮热、改善睡眠的调养汤品',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
    lifeStages: ['menopause'],
    category: 'dinner',
    cookTime: 60,
    difficulty: 'medium',
    calories: 180,
    protein: 15,
    carbs: 20,
    fat: 6,
    ingredients: [
      { name: '银耳', amount: '10g' },
      { name: '莲子', amount: '20g' },
      { name: '百合', amount: '15g' },
      { name: '红枣', amount: '5颗' },
      { name: '枸杞', amount: '5g' },
      { name: '冰糖', amount: '适量' },
    ],
    instructions: [
      '银耳提前泡发，撕成小朵',
      '莲子去芯，百合、红枣洗净',
      '所有食材放入锅中，加水煮沸',
      '转小火炖煮40分钟',
      '加入冰糖调味即可',
    ],
    nutrients: [
      { nutrientId: 'calcium', amount: 80 },
      { nutrientId: 'iron', amount: 3 },
      { nutrientId: 'fiber', amount: 6 },
    ],
    tags: ['安神', '滋阴', '润燥'],
  },
  {
    id: 'recipe6',
    name: '产后养血粥',
    description: '补气血、促恢复的营养粥品，适合产后调养',
    image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=400&h=300&fit=crop',
    lifeStages: ['postpartum'],
    category: 'breakfast',
    cookTime: 45,
    difficulty: 'easy',
    calories: 320,
    protein: 12,
    carbs: 60,
    fat: 4,
    ingredients: [
      { name: '大米', amount: '30g' },
      { name: '小米', amount: '20g' },
      { name: '红豆', amount: '20g' },
      { name: '红枣', amount: '5颗' },
      { name: '花生', amount: '15g' },
      { name: '红糖', amount: '适量' },
    ],
    instructions: [
      '红豆提前浸泡4小时',
      '所有食材洗净放入锅中',
      '加水煮沸后转小火熬煮',
      '熬至软烂粘稠，加入红糖调味',
    ],
    nutrients: [
      { nutrientId: 'iron', amount: 5 },
      { nutrientId: 'protein', amount: 12 },
      { nutrientId: 'fiber', amount: 5 },
      { nutrientId: 'folic_acid', amount: 80 },
    ],
    tags: ['补血', '通乳', '易消化'],
  },
  {
    id: 'recipe7',
    name: '香煎鸡胸肉配时蔬',
    description: '高蛋白低脂的减脂餐，适合职场女性保持身材',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
    lifeStages: ['career', 'teen'],
    category: 'dinner',
    cookTime: 30,
    difficulty: 'easy',
    calories: 380,
    protein: 42,
    carbs: 25,
    fat: 12,
    ingredients: [
      { name: '鸡胸肉', amount: '200g' },
      { name: '西兰花', amount: '100g' },
      { name: '胡萝卜', amount: '50g' },
      { name: '芦笋', amount: '50g' },
      { name: '橄榄油', amount: '1勺' },
      { name: '黑胡椒', amount: '适量' },
    ],
    instructions: [
      '鸡胸肉用盐和黑胡椒腌制20分钟',
      '平底锅加热，煎至两面金黄',
      '时蔬焯水后用橄榄油快炒',
      '鸡胸肉切片，与时蔬一同装盘',
    ],
    nutrients: [
      { nutrientId: 'protein', amount: 42 },
      { nutrientId: 'vitamin_c', amount: 45 },
      { nutrientId: 'iron', amount: 2 },
      { nutrientId: 'fiber', amount: 4 },
    ],
    tags: ['高蛋白', '低脂', '健身餐'],
  },
  {
    id: 'recipe8',
    name: '维生素C鲜果杯',
    description: '富含维生素C的清爽饮品，增强免疫力',
    image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop',
    lifeStages: ['teen', 'career', 'pregnancy', 'postpartum', 'menopause'],
    category: 'snack',
    cookTime: 10,
    difficulty: 'easy',
    calories: 120,
    protein: 2,
    carbs: 28,
    fat: 0.5,
    ingredients: [
      { name: '橙子', amount: '1个' },
      { name: '猕猴桃', amount: '1个' },
      { name: '草莓', amount: '5颗' },
      { name: '酸奶', amount: '100g' },
      { name: '蜂蜜', amount: '1勺' },
    ],
    instructions: [
      '所有水果洗净切块',
      '放入杯中，淋上酸奶',
      '淋上蜂蜜即可享用',
    ],
    nutrients: [
      { nutrientId: 'vitamin_c', amount: 120 },
      { nutrientId: 'folic_acid', amount: 60 },
      { nutrientId: 'fiber', amount: 5 },
      { nutrientId: 'calcium', amount: 150 },
    ],
    tags: ['高维C', '低卡', '快手'],
  },
];

const mockFoodIntakeRecords: FoodIntakeRecord[] = [
  {
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    mealType: 'breakfast',
    foodItems: [
      { foodItemId: 'oatmeal', servings: 1.5 },
      { foodItemId: 'milk', servings: 2 },
      { foodItemId: 'egg', servings: 1 },
    ],
    notes: '今天早餐吃得挺饱',
  },
  {
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    time: '12:30',
    mealType: 'lunch',
    foodItems: [
      { foodItemId: 'chicken', servings: 1.5 },
      { foodItemId: 'broccoli', servings: 1.5 },
      { foodItemId: 'spinach', servings: 1 },
    ],
  },
  {
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    time: '15:30',
    mealType: 'snack',
    foodItems: [
      { foodItemId: 'yogurt', servings: 1.5 },
      { foodItemId: 'orange', servings: 1 },
    ],
  },
  {
    id: generateId(),
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: '08:30',
    mealType: 'breakfast',
    foodItems: [
      { foodItemId: 'egg', servings: 2 },
      { foodItemId: 'milk', servings: 2.5 },
    ],
  },
  {
    id: generateId(),
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: '13:00',
    mealType: 'lunch',
    foodItems: [
      { foodItemId: 'salmon', servings: 1.5 },
      { foodItemId: 'spinach', servings: 2 },
      { foodItemId: 'broccoli', servings: 1 },
    ],
  },
  {
    id: generateId(),
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    time: '09:00',
    mealType: 'breakfast',
    foodItems: [
      { foodItemId: 'oatmeal', servings: 2 },
      { foodItemId: 'almonds', servings: 0.3 },
    ],
  },
  {
    id: generateId(),
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    time: '19:00',
    mealType: 'dinner',
    foodItems: [
      { foodItemId: 'chicken', servings: 1 },
      { foodItemId: 'broccoli', servings: 2 },
      { foodItemId: 'orange', servings: 1 },
    ],
  },
];

const mockNutrientRDAs: NutrientRDAByStage[] = [
  {
    lifeStage: 'teen',
    nutrients: [
      { nutrientId: 'protein', rda: 52 },
      { nutrientId: 'calcium', rda: 1300 },
      { nutrientId: 'iron', rda: 15 },
      { nutrientId: 'vitamin_c', rda: 75 },
      { nutrientId: 'vitamin_d', rda: 15 },
      { nutrientId: 'folic_acid', rda: 400 },
      { nutrientId: 'omega3', rda: 1.1 },
      { nutrientId: 'fiber', rda: 26 },
    ],
  },
  {
    lifeStage: 'career',
    nutrients: [
      { nutrientId: 'protein', rda: 50 },
      { nutrientId: 'calcium', rda: 1000 },
      { nutrientId: 'iron', rda: 18 },
      { nutrientId: 'vitamin_c', rda: 75 },
      { nutrientId: 'vitamin_d', rda: 15 },
      { nutrientId: 'folic_acid', rda: 400 },
      { nutrientId: 'omega3', rda: 1.1 },
      { nutrientId: 'fiber', rda: 25 },
    ],
  },
  {
    lifeStage: 'pregnancy-prep',
    nutrients: [
      { nutrientId: 'protein', rda: 55 },
      { nutrientId: 'calcium', rda: 1000 },
      { nutrientId: 'iron', rda: 18 },
      { nutrientId: 'vitamin_c', rda: 85 },
      { nutrientId: 'vitamin_d', rda: 15 },
      { nutrientId: 'folic_acid', rda: 800 },
      { nutrientId: 'omega3', rda: 1.4 },
      { nutrientId: 'fiber', rda: 28 },
    ],
  },
  {
    lifeStage: 'pregnancy',
    nutrients: [
      { nutrientId: 'protein', rda: 71 },
      { nutrientId: 'calcium', rda: 1000 },
      { nutrientId: 'iron', rda: 27 },
      { nutrientId: 'vitamin_c', rda: 85 },
      { nutrientId: 'vitamin_d', rda: 15 },
      { nutrientId: 'folic_acid', rda: 600 },
      { nutrientId: 'omega3', rda: 1.4 },
      { nutrientId: 'fiber', rda: 28 },
    ],
  },
  {
    lifeStage: 'postpartum',
    nutrients: [
      { nutrientId: 'protein', rda: 71 },
      { nutrientId: 'calcium', rda: 1000 },
      { nutrientId: 'iron', rda: 10 },
      { nutrientId: 'vitamin_c', rda: 120 },
      { nutrientId: 'vitamin_d', rda: 15 },
      { nutrientId: 'folic_acid', rda: 500 },
      { nutrientId: 'omega3', rda: 1.3 },
      { nutrientId: 'fiber', rda: 29 },
    ],
  },
  {
    lifeStage: 'menopause',
    nutrients: [
      { nutrientId: 'protein', rda: 50 },
      { nutrientId: 'calcium', rda: 1200 },
      { nutrientId: 'iron', rda: 8 },
      { nutrientId: 'vitamin_c', rda: 75 },
      { nutrientId: 'vitamin_d', rda: 20 },
      { nutrientId: 'folic_acid', rda: 400 },
      { nutrientId: 'omega3', rda: 1.1 },
      { nutrientId: 'fiber', rda: 22 },
    ],
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
      medicationReminders: mockMedicationReminders,
      medicationRecords: mockMedicationRecords,
      painRecords: mockPainRecords,
      foodItems: mockFoodItems,
      recipes: mockRecipes,
      foodIntakeRecords: mockFoodIntakeRecords,
      nutrientRDAs: mockNutrientRDAs,

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

      addFoodIntakeRecord: (record: FoodIntakeRecord) =>
        set((state) => ({
          foodIntakeRecords: [...state.foodIntakeRecords, record],
        })),

      deleteFoodIntakeRecord: (id: string) =>
        set((state) => ({
          foodIntakeRecords: state.foodIntakeRecords.filter((r) => r.id !== id),
        })),

      getRecipesByLifeStage: (stage: LifeStage) => {
        const { recipes } = get();
        return recipes.filter((r) => r.lifeStages.includes(stage));
      },

      getDailyNutritionSummary: (date: string) => {
        const { foodIntakeRecords, foodItems } = get();
        const dayRecords = foodIntakeRecords.filter((r) => r.date === date);

        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;
        const nutrientMap = new Map<string, number>();

        for (const record of dayRecords) {
          for (const item of record.foodItems) {
            const food = foodItems.find((f) => f.id === item.foodItemId);
            if (food) {
              totalCalories += food.calories * item.servings;
              totalProtein += food.protein * item.servings;
              totalCarbs += food.carbs * item.servings;
              totalFat += food.fat * item.servings;

              for (const n of food.nutrients) {
                const current = nutrientMap.get(n.nutrientId) || 0;
                nutrientMap.set(n.nutrientId, current + n.amount * item.servings);
              }
            }
          }
        }

        return {
          date,
          totalCalories: Math.round(totalCalories),
          totalProtein: Math.round(totalProtein * 10) / 10,
          totalCarbs: Math.round(totalCarbs * 10) / 10,
          totalFat: Math.round(totalFat * 10) / 10,
          nutrients: Array.from(nutrientMap.entries()).map(([nutrientId, amount]) => ({
            nutrientId,
            amount: Math.round(amount * 10) / 10,
          })),
        };
      },

      getNutrientGapAnalysis: (date: string) => {
        const { nutrientRDAs, lifeStage, getDailyNutritionSummary } = get();
        const summary = getDailyNutritionSummary(date);
        const stageRDA = nutrientRDAs.find((n) => n.lifeStage === lifeStage);

        if (!stageRDA) return [];

        const nutrientNames: Record<string, { name: string; unit: string; category: 'vitamin' | 'mineral' | 'macronutrient' }> = {
          protein: { name: '蛋白质', unit: 'g', category: 'macronutrient' },
          calcium: { name: '钙', unit: 'mg', category: 'mineral' },
          iron: { name: '铁', unit: 'mg', category: 'mineral' },
          vitamin_c: { name: '维生素C', unit: 'mg', category: 'vitamin' },
          vitamin_d: { name: '维生素D', unit: 'μg', category: 'vitamin' },
          folic_acid: { name: '叶酸', unit: 'μg', category: 'vitamin' },
          omega3: { name: 'Omega-3', unit: 'g', category: 'macronutrient' },
          fiber: { name: '膳食纤维', unit: 'g', category: 'macronutrient' },
        };

        const result = [];
        for (const rdaItem of stageRDA.nutrients) {
          const currentNutrient = summary.nutrients.find((n) => n.nutrientId === rdaItem.nutrientId);
          const current = currentNutrient ? currentNutrient.amount : 0;
          const rda = rdaItem.rda;
          const gap = rda - current;
          const percentage = Math.round((current / rda) * 100);
          const info = nutrientNames[rdaItem.nutrientId];

          if (info) {
            result.push({
              nutrientId: rdaItem.nutrientId,
              nutrientName: info.name,
              unit: info.unit,
              rda,
              current,
              gap,
              percentage,
              category: info.category,
            });
          }
        }

        return result.sort((a, b) => a.gap - b.gap);
      },

      getWeeklyNutritionTrend: () => {
        const { getDailyNutritionSummary } = get();
        const result = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const summary = getDailyNutritionSummary(dateStr);
          result.push({
            date: dateStr,
            calories: summary.totalCalories,
            protein: summary.totalProtein,
          });
        }
        return result;
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
        foodIntakeRecords: state.foodIntakeRecords,
      }),
    }
  )
);
