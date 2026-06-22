import type { Symptom, SymptomCategory, PossibleCondition, SelfCareAdvice, MedicalGuidance, UrgencyLevel } from '@/types';

export const symptomCategories: SymptomCategory[] = [
  {
    id: 'gynecology',
    name: '妇科常见',
    description: '月经、白带、盆腔等常见妇科症状',
    icon: '🌸',
    color: 'text-pink-600',
    gradient: 'from-pink-400 to-rose-500',
    subcategories: [
      { id: 'menstrual', name: '月经相关' },
      { id: 'vaginal', name: '阴道分泌物' },
      { id: 'pelvic', name: '盆腔疼痛' },
      { id: 'breast', name: '乳房不适' },
    ],
  },
  {
    id: 'pregnancy',
    name: '孕期症状',
    description: '孕期常见不适与异常症状',
    icon: '🤰',
    color: 'text-sky-600',
    gradient: 'from-sky-400 to-blue-500',
    subcategories: [
      { id: 'early', name: '孕早期' },
      { id: 'mid', name: '孕中期' },
      { id: 'late', name: '孕晚期' },
      { id: 'fetal', name: '胎动相关' },
    ],
  },
  {
    id: 'postpartum',
    name: '产后恢复',
    description: '产后身体恢复相关症状',
    icon: '👶',
    color: 'text-fuchsia-600',
    gradient: 'from-fuchsia-400 to-pink-500',
    subcategories: [
      { id: 'wound', name: '伤口恢复' },
      { id: 'lochia', name: '恶露相关' },
      { id: 'breastfeeding', name: '哺乳相关' },
      { id: 'pelvic', name: '盆底恢复' },
    ],
  },
  {
    id: 'menopause',
    name: '更年期',
    description: '围绝经期相关症状',
    icon: '🌺',
    color: 'text-purple-600',
    gradient: 'from-purple-400 to-violet-500',
    subcategories: [
      { id: 'vasomotor', name: '血管舒缩' },
      { id: 'sleep', name: '睡眠障碍' },
      { id: 'mood', name: '情绪波动' },
      { id: 'physical', name: '身体不适' },
    ],
  },
  {
    id: 'general',
    name: '全身症状',
    description: '疲劳、发热、体重变化等全身症状',
    icon: '💫',
    color: 'text-teal-600',
    gradient: 'from-teal-400 to-emerald-500',
    subcategories: [
      { id: 'fatigue', name: '疲劳乏力' },
      { id: 'fever', name: '发热畏寒' },
      { id: 'weight', name: '体重变化' },
      { id: 'digestive', name: '消化不适' },
    ],
  },
];

export const symptoms: Symptom[] = [
  { id: 'g1', name: '月经推迟', category: 'gynecology', subcategory: 'menstrual', icon: '📅', description: '月经周期延长，超过预期时间未来潮', commonTriggers: ['怀孕', '压力', '内分泌失调', '体重变化'] },
  { id: 'g2', name: '月经量多', category: 'gynecology', subcategory: 'menstrual', icon: '💧', description: '经量明显多于平时，或经期延长超过7天', commonTriggers: ['子宫肌瘤', '内膜息肉', '内分泌紊乱'] },
  { id: 'g3', name: '痛经严重', category: 'gynecology', subcategory: 'menstrual', icon: '😣', description: '经期下腹疼痛明显，影响日常生活', commonTriggers: ['原发性痛经', '子宫内膜异位症', '子宫腺肌症'] },
  { id: 'g4', name: '月经不规律', category: 'gynecology', subcategory: 'menstrual', icon: '🔄', description: '月经周期时长时短，缺乏规律性', commonTriggers: ['多囊卵巢综合征', '甲状腺问题', '压力'] },
  { id: 'g5', name: '白带异常增多', category: 'gynecology', subcategory: 'vaginal', icon: '💦', description: '阴道分泌物明显增多，可能伴有颜色或气味改变', commonTriggers: ['阴道炎', '宫颈炎', '排卵期'] },
  { id: 'g6', name: '白带发黄/发绿', category: 'gynecology', subcategory: 'vaginal', icon: '🟡', description: '白带颜色异常，呈黄色或绿色', commonTriggers: ['滴虫性阴道炎', '细菌性阴道炎', '宫颈炎'] },
  { id: 'g7', name: '外阴瘙痒', category: 'gynecology', subcategory: 'vaginal', icon: '🦟', description: '外阴或阴道瘙痒不适', commonTriggers: ['霉菌性阴道炎', '滴虫性阴道炎', '皮肤过敏'] },
  { id: 'g8', name: '下腹部疼痛', category: 'gynecology', subcategory: 'pelvic', icon: '🩹', description: '下腹部持续或间歇性疼痛', commonTriggers: ['盆腔炎', '卵巢囊肿', '痛经'] },
  { id: 'g9', name: '性交疼痛', category: 'gynecology', subcategory: 'pelvic', icon: '💔', description: '性生活时出现疼痛不适', commonTriggers: ['阴道干涩', '子宫内膜异位症', '盆腔炎'] },
  { id: 'g10', name: '乳房胀痛', category: 'gynecology', subcategory: 'breast', icon: '💝', description: '乳房胀满、疼痛或触痛', commonTriggers: ['经前期综合征', '乳腺增生', '怀孕'] },
  { id: 'g11', name: '乳房肿块', category: 'gynecology', subcategory: 'breast', icon: '🔘', description: '乳房内可触及肿块或结节', commonTriggers: ['乳腺纤维瘤', '乳腺增生', '需排除恶性病变'] },
  { id: 'g12', name: '非经期出血', category: 'gynecology', subcategory: 'menstrual', icon: '🩸', description: '非月经期间出现阴道出血', commonTriggers: ['排卵期出血', '宫颈息肉', '内膜病变'] },

  { id: 'p1', name: '孕吐严重', category: 'pregnancy', subcategory: 'early', icon: '🤢', description: '恶心呕吐频繁，影响进食', commonTriggers: ['妊娠剧吐', '正常早孕反应', '双胎妊娠'] },
  { id: 'p2', name: '阴道出血', category: 'pregnancy', subcategory: 'early', icon: '🚨', description: '孕期出现阴道出血，量多少不一', commonTriggers: ['先兆流产', '宫外孕', '着床出血'] },
  { id: 'p3', name: '腹痛', category: 'pregnancy', subcategory: 'early', icon: '😣', description: '孕早期下腹部疼痛', commonTriggers: ['子宫增大', '先兆流产', '宫外孕'] },
  { id: 'p4', name: '头晕乏力', category: 'pregnancy', subcategory: 'early', icon: '😵', description: '头晕、疲乏、无力感', commonTriggers: ['低血糖', '贫血', '早孕反应'] },
  { id: 'p5', name: '胎动减少', category: 'pregnancy', subcategory: 'fetal', icon: '👶', description: '感觉胎动比平时明显减少或减弱', commonTriggers: ['胎儿睡眠', '胎儿缺氧', '羊水异常'] },
  { id: 'p6', name: '下肢水肿', category: 'pregnancy', subcategory: 'late', icon: '🦵', description: '脚踝或小腿水肿，按压有凹陷', commonTriggers: ['正常孕晚期水肿', '妊娠期高血压', '低蛋白血症'] },
  { id: 'p7', name: '头痛严重', category: 'pregnancy', subcategory: 'late', icon: '🤕', description: '持续性剧烈头痛，休息后不缓解', commonTriggers: ['妊娠期高血压', '先兆子痫', '睡眠不足'] },
  { id: 'p8', name: '阴道流液', category: 'pregnancy', subcategory: 'late', icon: '💧', description: '阴道突然有液体流出，可能是破水', commonTriggers: ['胎膜早破', '尿失禁', '阴道分泌物增多'] },
  { id: 'p9', name: '规律宫缩', category: 'pregnancy', subcategory: 'late', icon: '⏰', description: '腹部一阵阵发紧变硬，有规律性', commonTriggers: ['先兆临产', '假性宫缩', '早产征兆'] },
  { id: 'p10', name: '皮肤瘙痒', category: 'pregnancy', subcategory: 'mid', icon: '🦟', description: '皮肤瘙痒，尤其是腹部或手脚', commonTriggers: ['皮肤拉伸', '妊娠期肝内胆汁淤积症', '过敏'] },
  { id: 'p11', name: '体重增长过快', category: 'pregnancy', subcategory: 'mid', icon: '⚖️', description: '短期内体重增加过快，超过正常范围', commonTriggers: ['水肿', '饮食过量', '妊娠期糖尿病'] },
  { id: 'p12', name: '心慌气短', category: 'pregnancy', subcategory: 'late', icon: '💨', description: '活动后心慌、呼吸困难', commonTriggers: ['子宫增大压迫', '贫血', '心脏负担加重'] },

  { id: 'pp1', name: '恶露量多', category: 'postpartum', subcategory: 'lochia', icon: '💧', description: '产后恶露量多，超过月经量', commonTriggers: ['子宫复旧不良', '胎盘残留', '正常排出'] },
  { id: 'pp2', name: '恶露有臭味', category: 'postpartum', subcategory: 'lochia', icon: '👃', description: '恶露有明显臭味或异味', commonTriggers: ['产褥感染', '宫腔残留', '卫生不佳'] },
  { id: 'pp3', name: '发热', category: 'postpartum', subcategory: 'general', icon: '🌡️', description: '产后体温升高，超过38℃', commonTriggers: ['产褥感染', '乳腺炎', '上呼吸道感染'] },
  { id: 'pp4', name: '乳房红肿疼痛', category: 'postpartum', subcategory: 'breastfeeding', icon: '🔴', description: '乳房局部红肿、发热、疼痛', commonTriggers: ['乳腺炎', '乳汁淤积', '乳头皲裂'] },
  { id: 'pp5', name: '乳头皲裂', category: 'postpartum', subcategory: 'breastfeeding', icon: '💔', description: '乳头皮肤破损、出血，哺乳时疼痛', commonTriggers: ['哺乳姿势不正确', '乳头皮肤娇嫩', '吸吮力强'] },
  { id: 'pp6', name: '产后抑郁情绪', category: 'postpartum', subcategory: 'general', icon: '😢', description: '情绪低落、焦虑、易哭泣，对事物失去兴趣', commonTriggers: ['产后激素变化', '角色适应', '睡眠不足'] },
  { id: 'pp7', name: '下腹坠痛', category: 'postpartum', subcategory: 'pelvic', icon: '🩹', description: '下腹部坠胀、疼痛感', commonTriggers: ['子宫收缩', '盆底肌松弛', '盆腔感染'] },
  { id: 'pp8', name: '漏尿', category: 'postpartum', subcategory: 'pelvic', icon: '💦', description: '咳嗽、打喷嚏或运动时不自主漏尿', commonTriggers: ['盆底肌松弛', '分娩损伤', '尿道括约肌功能减弱'] },
  { id: 'pp9', name: '伤口疼痛', category: 'postpartum', subcategory: 'wound', icon: '🩹', description: '顺产侧切或剖腹产伤口疼痛', commonTriggers: ['正常愈合', '伤口感染', '缝线反应'] },
  { id: 'pp10', name: '伤口红肿渗液', category: 'postpartum', subcategory: 'wound', icon: '🔴', description: '伤口部位红肿、有渗出液或脓液', commonTriggers: ['伤口感染', '脂肪液化', '愈合不良'] },

  { id: 'm1', name: '潮热盗汗', category: 'menopause', subcategory: 'vasomotor', icon: '🔥', description: '突然感到发热、出汗，持续数分钟', commonTriggers: ['雌激素下降', '血管舒缩功能不稳定'] },
  { id: 'm2', name: '失眠多梦', category: 'menopause', subcategory: 'sleep', icon: '🌙', description: '入睡困难、多梦、易醒', commonTriggers: ['潮热影响', '激素变化', '情绪焦虑'] },
  { id: 'm3', name: '情绪波动', category: 'menopause', subcategory: 'mood', icon: '🎭', description: '情绪不稳定，易怒、焦虑或抑郁', commonTriggers: ['激素波动', '生活压力', '睡眠不足'] },
  { id: 'm4', name: '心悸心慌', category: 'menopause', subcategory: 'physical', icon: '💓', description: '突然感到心跳加快、心慌', commonTriggers: ['血管舒缩功能紊乱', '自主神经功能失调'] },
  { id: 'm5', name: '阴道干涩', category: 'menopause', subcategory: 'physical', icon: '🏜️', description: '阴道分泌物减少，干涩不适', commonTriggers: ['雌激素水平下降', '阴道黏膜萎缩'] },
  { id: 'm6', name: '关节肌肉疼痛', category: 'menopause', subcategory: 'physical', icon: '🦴', description: '关节酸痛、肌肉疼痛', commonTriggers: ['雌激素下降', '骨量流失', '肌肉松弛'] },
  { id: 'm7', name: '记忆力下降', category: 'menopause', subcategory: 'mood', icon: '🧠', description: '注意力不集中，记忆力减退', commonTriggers: ['睡眠不足', '激素变化', '情绪影响'] },
  { id: 'm8', name: '性欲减退', category: 'menopause', subcategory: 'physical', icon: '💕', description: '性欲下降，对性生活兴趣降低', commonTriggers: ['雌激素下降', '阴道干涩', '情绪因素'] },

  { id: 'ge1', name: '疲劳乏力', category: 'general', subcategory: 'fatigue', icon: '😴', description: '持续感到疲劳，休息后也不能缓解', commonTriggers: ['贫血', '甲状腺功能异常', '睡眠不足', '压力过大'] },
  { id: 'ge2', name: '发热', category: 'general', subcategory: 'fever', icon: '🤒', description: '体温升高，超过正常范围', commonTriggers: ['感染', '炎症', '免疫反应'] },
  { id: 'ge3', name: '体重骤变', category: 'general', subcategory: 'weight', icon: '⚖️', description: '短期内体重明显增加或减少', commonTriggers: ['内分泌疾病', '饮食变化', '代谢异常'] },
  { id: 'ge4', name: '恶心呕吐', category: 'general', subcategory: 'digestive', icon: '🤢', description: '恶心、呕吐，可能伴有胃部不适', commonTriggers: ['消化系统疾病', '妊娠反应', '药物副作用'] },
  { id: 'ge5', name: '便秘腹泻', category: 'general', subcategory: 'digestive', icon: '🚽', description: '排便习惯改变，便秘或腹泻交替', commonTriggers: ['肠道功能紊乱', '饮食因素', '消化系统疾病'] },
  { id: 'ge6', name: '头痛头晕', category: 'general', subcategory: 'fatigue', icon: '😵', description: '头痛、头晕，可能伴有恶心', commonTriggers: ['紧张性头痛', '偏头痛', '血压异常', '贫血'] },
];

export const possibleConditions: Record<string, PossibleCondition[]> = {
  'g5,g7,g6': [
    {
      id: 'c1',
      name: '阴道炎',
      description: '阴道黏膜的炎症反应，常伴有白带异常和瘙痒',
      probability: 85,
      urgency: 'consult',
      matchingSymptoms: ['白带异常增多', '外阴瘙痒', '白带颜色异常'],
      keySymptoms: ['白带性状改变', '外阴瘙痒', '可能有异味'],
    },
  ],
  'g3,g4': [
    {
      id: 'c2',
      name: '痛经 / 月经不调',
      description: '月经周期不规律伴有经期疼痛',
      probability: 75,
      urgency: 'observation',
      matchingSymptoms: ['痛经严重', '月经不规律'],
      keySymptoms: ['经期腹痛', '周期紊乱', '可能经量异常'],
    },
  ],
  'g8,g5': [
    {
      id: 'c3',
      name: '盆腔炎性疾病',
      description: '女性上生殖道感染性疾病，需要及时治疗',
      probability: 65,
      urgency: 'consult',
      matchingSymptoms: ['下腹部疼痛', '白带异常增多'],
      keySymptoms: ['下腹痛', '白带异常', '可能发热'],
    },
  ],
  'p2,p3': [
    {
      id: 'c4',
      name: '先兆流产',
      description: '孕早期出现流产征兆，需要密切观察',
      probability: 70,
      urgency: 'urgent',
      matchingSymptoms: ['阴道出血', '腹痛'],
      keySymptoms: ['阴道流血', '下腹坠痛', '腰酸'],
    },
    {
      id: 'c5',
      name: '宫外孕待排除',
      description: '受精卵在子宫体腔以外着床，属于急症',
      probability: 25,
      urgency: 'emergency',
      matchingSymptoms: ['阴道出血', '腹痛'],
      keySymptoms: ['不规则阴道出血', '一侧下腹痛', '严重时晕厥休克'],
    },
  ],
  'p5': [
    {
      id: 'c6',
      name: '胎动异常',
      description: '胎动减少需要警惕胎儿宫内情况',
      probability: 50,
      urgency: 'urgent',
      matchingSymptoms: ['胎动减少'],
      keySymptoms: ['胎动比平时减少一半以上', '胎动强度减弱', '持续半天无改善'],
    },
  ],
  'p7,p6,p11': [
    {
      id: 'c7',
      name: '子痫前期 / 妊娠期高血压',
      description: '妊娠期特有的疾病，严重影响母婴健康',
      probability: 60,
      urgency: 'emergency',
      matchingSymptoms: ['头痛严重', '下肢水肿', '体重增长过快'],
      keySymptoms: ['高血压', '蛋白尿', '水肿', '头痛眼花'],
    },
  ],
  'pp3,pp2': [
    {
      id: 'c8',
      name: '产褥感染',
      description: '产后生殖道感染，需要及时治疗',
      probability: 70,
      urgency: 'urgent',
      matchingSymptoms: ['发热', '恶露有臭味'],
      keySymptoms: ['发热', '恶露有臭味', '下腹疼痛'],
    },
  ],
  'pp4,pp3': [
    {
      id: 'c9',
      name: '急性乳腺炎',
      description: '乳腺的急性化脓性感染，常见于哺乳期',
      probability: 80,
      urgency: 'consult',
      matchingSymptoms: ['乳房红肿疼痛', '发热'],
      keySymptoms: ['乳房红肿热痛', '可触及硬块', '可能发热'],
    },
  ],
  'm1,m2,m3': [
    {
      id: 'c10',
      name: '围绝经期综合征',
      description: '绝经前后因性激素波动或减少所致的一系列症状',
      probability: 85,
      urgency: 'observation',
      matchingSymptoms: ['潮热盗汗', '失眠多梦', '情绪波动'],
      keySymptoms: ['潮热出汗', '月经紊乱', '情绪波动', '睡眠障碍'],
    },
  ],
  'pp8': [
    {
      id: 'c11',
      name: '盆底功能障碍',
      description: '盆底肌肉和筋膜损伤导致的功能障碍',
      probability: 75,
      urgency: 'consult',
      matchingSymptoms: ['漏尿'],
      keySymptoms: ['压力性尿失禁', '阴道坠胀感', '性生活质量下降'],
    },
  ],
  'pp6': [
    {
      id: 'c12',
      name: '产后情绪障碍',
      description: '产后出现的情绪问题，需要关注和干预',
      probability: 65,
      urgency: 'consult',
      matchingSymptoms: ['产后抑郁情绪'],
      keySymptoms: ['情绪低落', '兴趣减退', '睡眠障碍', '自责自罪'],
    },
  ],
};

export const selfCareAdvices: Record<UrgencyLevel, SelfCareAdvice[]> = {
  normal: [
    { id: 'sc1', title: '规律作息', description: '保持充足睡眠，避免熬夜', steps: ['每天保证7-8小时睡眠', '尽量固定作息时间', '睡前1小时避免使用电子设备'], category: 'lifestyle' },
    { id: 'sc2', title: '均衡饮食', description: '注意营养均衡，多吃蔬果', steps: ['每天摄入充足的蔬菜和水果', '适量蛋白质摄入', '减少辛辣刺激食物'], category: 'diet' },
  ],
  observation: [
    { id: 'sc3', title: '症状观察', description: '密切观察症状变化，做好记录', steps: ['记录症状出现的时间和频率', '注意症状加重或缓解的因素', '如有加重及时就医'], category: 'lifestyle' },
    { id: 'sc4', title: '适当休息', description: '保证充分休息，避免劳累', steps: ['减少剧烈活动', '保证充足睡眠', '避免长时间站立或坐着'], category: 'rest' },
    { id: 'sc5', title: '个人卫生', description: '保持外阴清洁，注意个人卫生', steps: ['每日用温水清洗外阴', '勤换内裤', '选择棉质透气内裤'], category: 'hygiene' },
  ],
  consult: [
    { id: 'sc6', title: '就医前准备', description: '做好就医前的准备工作', steps: ['整理症状出现时间和变化', '准备既往病史资料', '记录用过的药物'], category: 'lifestyle' },
    { id: 'sc7', title: '避免自行用药', description: '不要随意使用药物', steps: ['不要自行服用处方药', '使用非处方药前仔细阅读说明', '症状不缓解及时就医'], category: 'medication' },
  ],
  urgent: [
    { id: 'sc8', title: '立即休息', description: '立即停止活动，卧床休息', steps: ['取舒适体位休息', '避免紧张焦虑', '密切观察症状变化'], category: 'rest' },
    { id: 'sc9', title: '及时联系医生', description: '尽快联系医生或前往医院', steps: ['描述清楚当前症状', '告知孕周/病史等重要信息', '听取医生指导意见'], category: 'lifestyle' },
  ],
  emergency: [
    { id: 'sc10', title: '立即拨打急救', description: '情况紧急，请立即拨打120', steps: ['保持冷静，拨打急救电话', '清楚说明地址和症状', '不要自行驾车前往'], category: 'lifestyle' },
    { id: 'sc11', title: '保持正确体位', description: '等待急救时保持正确姿势', steps: ['取平卧位，头偏向一侧', '如有出血可适当抬高臀部', '避免随意搬动'], category: 'rest' },
  ],
};

export const urgencyGuidance: Record<UrgencyLevel, MedicalGuidance> = {
  normal: {
    urgency: 'normal',
    urgencyLabel: '情况正常',
    urgencyColor: 'text-emerald-600',
    urgencyBg: 'from-emerald-400 to-teal-500',
    description: '根据您的症状，目前情况较为平稳，可以先观察。',
    recommendedAction: '建议继续观察，注意休息和个人卫生。如果症状加重或出现新的不适，请及时就医。',
    recommendedDepartment: '妇科',
    timeFrame: '可在下次常规体检时咨询医生',
    warningSigns: ['症状加重', '出现新的不适', '持续超过1周无缓解'],
    preparationTips: ['记录症状变化', '保持良好生活习惯', '定期进行妇科检查'],
  },
  observation: {
    urgency: 'observation',
    urgencyLabel: '建议观察',
    urgencyColor: 'text-sky-600',
    urgencyBg: 'from-sky-400 to-blue-500',
    description: '您的症状可能与常见的健康问题相关，建议密切观察。',
    recommendedAction: '建议先进行自我观察和护理。如果症状持续超过3-5天没有改善，或有加重趋势，请安排门诊就诊。',
    recommendedDepartment: '妇科门诊',
    timeFrame: '建议3-5天内观察，无改善则就医',
    warningSigns: ['症状明显加重', '出现发热', '疼痛难以忍受', '异常出血增多'],
    preparationTips: ['记录症状出现的规律', '注意休息避免劳累', '保持外阴清洁干燥'],
  },
  consult: {
    urgency: 'consult',
    urgencyLabel: '建议就医',
    urgencyColor: 'text-amber-600',
    urgencyBg: 'from-amber-400 to-orange-500',
    description: '您的症状需要医生进一步评估，建议尽早就医。',
    recommendedAction: '建议尽快到医院妇科就诊，进行相关检查以明确诊断。请携带好相关病史资料。',
    recommendedDepartment: '妇科',
    timeFrame: '建议1-3天内就诊',
    warningSigns: ['症状加重', '出现发热', '疼痛加剧', '异常出血'],
    preparationTips: ['整理症状详细描述', '准备既往检查报告', '记录近期用药情况', '建议有人陪同就诊'],
  },
  urgent: {
    urgency: 'urgent',
    urgencyLabel: '需要尽快就医',
    urgencyColor: 'text-rose-600',
    urgencyBg: 'from-rose-400 to-red-500',
    description: '您的症状可能提示较严重的健康问题，需要尽快就医。',
    recommendedAction: '请立即联系医生或前往医院急诊。如果是孕期，请直接前往产科急诊。不要自行用药，以免延误病情。',
    recommendedDepartment: '急诊 / 妇科急诊 / 产科急诊',
    timeFrame: '建议立即就医，不要拖延',
    warningSigns: ['剧烈腹痛', '大量出血', '头晕晕厥', '高热不退', '胎动消失'],
    preparationTips: ['立即拨打急救电话或前往医院', '携带产检本/病历资料', '有家属陪同', '途中保持平卧休息'],
  },
  emergency: {
    urgency: 'emergency',
    urgencyLabel: '紧急情况！',
    urgencyColor: 'text-red-600',
    urgencyBg: 'from-red-500 to-rose-600',
    description: '您的症状可能提示严重急症，请立即寻求紧急医疗帮助！',
    recommendedAction: '这是紧急情况！请立即拨打120急救电话，或让家人立即送您去医院急诊。不要自行驾车前往。',
    recommendedDepartment: '急诊抢救',
    timeFrame: '立即！不要有任何拖延',
    warningSigns: ['意识模糊或晕厥', '大量出血不止', '剧烈腹痛难以忍受', '呼吸困难', '高热伴寒战'],
    preparationTips: ['立即拨打120', '保持平卧位', '头偏向一侧防止呕吐窒息', '注意保暖', '有专人看护'],
  },
};

export const getSymptomById = (id: string): Symptom | undefined => {
  return symptoms.find((s) => s.id === id);
};

export const getCategoryById = (id: string): SymptomCategory | undefined => {
  return symptomCategories.find((c) => c.id === id);
};
