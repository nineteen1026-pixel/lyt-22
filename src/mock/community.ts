import type { CommunityTopic, CommunityQuestion, CommunityAnswer, CommunityTag, LifeStage } from '@/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const communityTags: CommunityTag[] = [
  { id: 'tag1', name: '痛经', color: 'bg-rose-100 text-rose-600' },
  { id: 'tag2', name: '月经不调', color: 'bg-pink-100 text-pink-600' },
  { id: 'tag3', name: '备孕', color: 'bg-amber-100 text-amber-600' },
  { id: 'tag4', name: '孕期营养', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'tag5', name: '产后恢复', color: 'bg-teal-100 text-teal-600' },
  { id: 'tag6', name: '盆底肌', color: 'bg-cyan-100 text-cyan-600' },
  { id: 'tag7', name: '更年期', color: 'bg-violet-100 text-violet-600' },
  { id: 'tag8', name: '失眠', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'tag9', name: '情绪管理', color: 'bg-purple-100 text-purple-600' },
  { id: 'tag10', name: '护肤', color: 'bg-fuchsia-100 text-fuchsia-600' },
];

export const communityTopics: CommunityTopic[] = [
  {
    id: 'topic1',
    title: '青春期健康',
    description: '关注少女成长中的生理与心理变化',
    icon: '🌸',
    lifeStage: 'teen',
    questionCount: 128,
    isHot: true,
  },
  {
    id: 'topic2',
    title: '职场女性健康',
    description: '平衡工作与生活，守护职场女性健康',
    icon: '💼',
    lifeStage: 'career',
    questionCount: 256,
    isHot: true,
  },
  {
    id: 'topic3',
    title: '科学备孕',
    description: '孕前准备、排卵期计算、备孕注意事项',
    icon: '🌱',
    lifeStage: 'pregnancy-prep',
    questionCount: 189,
    isHot: true,
  },
  {
    id: 'topic4',
    title: '孕期关怀',
    description: '孕期产检、营养、运动全方位指南',
    icon: '🤰',
    lifeStage: 'pregnancy',
    questionCount: 342,
    isHot: true,
  },
  {
    id: 'topic5',
    title: '产后恢复',
    description: '科学坐月子，助力新妈妈完美蜕变',
    icon: '👶',
    lifeStage: 'postpartum',
    questionCount: 421,
    isHot: true,
  },
  {
    id: 'topic6',
    title: '更年期调养',
    description: '从容面对更年期，优雅度过人生新阶段',
    icon: '🌺',
    lifeStage: 'menopause',
    questionCount: 167,
    isHot: false,
  },
];

const mockAnswers: Record<string, CommunityAnswer[]> = {
  q1: [
    {
      id: 'a1',
      questionId: 'q1',
      content: '您好！产后42天恶露还没干净确实需要关注。一般来说，产后恶露会持续4-6周，颜色会从红色逐渐变浅。如果超过6周还有恶露，可能的原因有：1）子宫复旧不良；2）宫腔内有残留；3）感染。建议您尽快去医院做B超检查，看看子宫恢复情况和是否有残留。同时注意观察恶露是否有异味、是否伴有腹痛或发热，如果有这些症状要立即就医。平时要注意个人卫生，避免劳累，适当活动有助于恶露排出。',
      authorName: '李医生',
      isExpert: true,
      isFeatured: true,
      createdAt: formatDate(2),
      likes: 128,
      isLiked: false,
    },
    {
      id: 'a2',
      questionId: 'q1',
      content: '我那时候也是40多天还有，去医院检查说是子宫复旧不良，医生开了益母草颗粒，喝了一周左右就干净了。不过每个人情况不一样，还是建议去医院看看放心。',
      authorName: '小雨妈妈',
      isExpert: false,
      isFeatured: false,
      createdAt: formatDate(1),
      likes: 45,
      isLiked: false,
    },
  ],
  q2: [
    {
      id: 'a3',
      questionId: 'q2',
      content: '多囊卵巢综合征（PCOS）确实会影响怀孕，但通过科学调理，很多患者都能成功受孕。建议您：1）先进行全面的内分泌检查，了解激素水平；2）调整生活方式，控制体重（如果超重的话）；3）在医生指导下进行促排卵治疗；4）监测排卵，把握受孕时机。另外，保持良好的心态也很重要，不要给自己太大压力。建议您到正规医院的生殖内分泌科就诊，制定个性化的治疗方案。',
      authorName: '王医生',
      isExpert: true,
      isFeatured: true,
      createdAt: formatDate(3),
      likes: 256,
      isLiked: true,
    },
  ],
  q3: [
    {
      id: 'a4',
      questionId: 'q3',
      content: '宝妈别太担心！宝宝6个月后，母乳的营养确实会逐渐不能满足宝宝的生长需求，但这并不意味着母乳就没营养了。世界卫生组织建议纯母乳喂养到6个月，之后添加辅食，同时继续母乳喂养到2岁或更久。6个月后可以开始添加米粉、蔬菜泥、水果泥等辅食，循序渐进。母乳仍然是宝宝重要的营养来源和情感纽带。',
      authorName: '张医生',
      isExpert: true,
      isFeatured: true,
      createdAt: formatDate(1),
      likes: 89,
      isLiked: false,
    },
    {
      id: 'a5',
      questionId: 'q3',
      content: '我家宝宝现在1岁了还在吃母乳呢！6个月开始加辅食，现在辅食吃得很好，母乳就是早晚和睡前吃。宝宝身体很棒，很少生病。坚持下去，母乳是最好的！',
      authorName: '安安妈妈',
      isExpert: false,
      isFeatured: false,
      createdAt: formatDate(0),
      likes: 67,
      isLiked: false,
    },
  ],
  q4: [
    {
      id: 'a6',
      questionId: 'q4',
      content: '月经量突然变少可能有多种原因，需要结合您的具体情况来分析：1）内分泌失调，如雌激素水平降低；2）子宫内膜损伤，如之前有过人流手术；3）卵巢功能开始下降；4）情绪压力、过度节食、熬夜等也会影响。建议您先观察1-2个周期，如果持续减少，可以在月经来潮的第2-4天去医院查性激素六项，同时做B超了解子宫内膜情况。平时要注意规律作息，保持心情舒畅，避免过度节食减肥。',
      authorName: '陈医生',
      isExpert: true,
      isFeatured: true,
      createdAt: formatDate(4),
      likes: 178,
      isLiked: false,
    },
  ],
  q5: [
    {
      id: 'a7',
      questionId: 'q5',
      content: '怀孕3个月可以进行适度的性生活，但需要注意以下几点：1）确保胎儿稳定，没有阴道出血、腹痛等先兆流产症状；2）动作要轻柔，避免压迫腹部；3）注意卫生，避免感染；4）如果有前置胎盘、胎盘低置等情况，需要禁止性生活。其实孕期适度的性生活对夫妻感情和身心健康都是有益的，只要注意安全就好。如果有任何不适，要立即停止并咨询医生。',
      authorName: '刘医生',
      isExpert: true,
      isFeatured: true,
      createdAt: formatDate(2),
      likes: 234,
      isLiked: false,
    },
    {
      id: 'a8',
      questionId: 'q5',
      content: '我们整个孕期都有，医生说只要身体没问题就可以。注意姿势就好，别压到肚子。',
      authorName: '匿名用户',
      isExpert: false,
      isFeatured: false,
      createdAt: formatDate(1),
      likes: 89,
      isLiked: false,
    },
  ],
  q6: [
    {
      id: 'a9',
      questionId: 'q6',
      content: '更年期潮热出汗是由于雌激素水平下降引起的血管舒缩功能不稳定。以下方法可以帮助缓解：1）生活方式调整：保持规律作息，避免辛辣刺激食物、咖啡、酒精等；2）适度运动：如瑜伽、太极、散步等；3）放松技巧：深呼吸、冥想等；4）如果症状严重影响生活，可以在医生指导下进行激素替代治疗，但需要先评估适应症和禁忌症。另外，大豆异黄酮等植物雌激素也有一定的辅助作用，但效果因人而异。',
      authorName: '赵医生',
      isExpert: true,
      isFeatured: true,
      createdAt: formatDate(5),
      likes: 145,
      isLiked: false,
    },
  ],
};

export const communityQuestions: CommunityQuestion[] = [
  {
    id: 'q1',
    title: '产后42天恶露还没干净正常吗？需要去医院检查吗？',
    content: '我是顺产的，现在已经42天了，恶露还是断断续续的，颜色是淡红色，量不多，但就是不干净。有点担心是不是子宫恢复不好，需要去医院做检查吗？有没有同样情况的宝妈？',
    isAnonymous: false,
    authorName: '新妈妈小琳',
    topicId: 'topic5',
    topicName: '产后恢复',
    lifeStage: 'postpartum',
    tags: [communityTags[4], communityTags[5]],
    createdAt: formatDate(3),
    views: 1256,
    likes: 89,
    isLiked: false,
    answerCount: 2,
    answers: mockAnswers['q1'],
    hasFeaturedAnswer: true,
  },
  {
    id: 'q2',
    title: '多囊卵巢综合征能自然怀孕吗？需要怎么调理？',
    content: '结婚两年了一直没怀上，去医院检查说是多囊卵巢综合征。医生说这个病会影响排卵，怀孕比较困难。有没有同样情况的姐妹成功怀孕的？能不能分享一下经验？需要怎么调理才能提高受孕几率？',
    isAnonymous: true,
    authorName: '匿名用户',
    topicId: 'topic3',
    topicName: '科学备孕',
    lifeStage: 'pregnancy-prep',
    tags: [communityTags[2], communityTags[1]],
    createdAt: formatDate(5),
    views: 3421,
    likes: 256,
    isLiked: true,
    answerCount: 1,
    answers: mockAnswers['q2'],
    hasFeaturedAnswer: true,
  },
  {
    id: 'q3',
    title: '宝宝6个月了，母乳还有营养吗？要不要断奶？',
    content: '宝宝马上6个月了，身边很多人说6个月后母乳就没营养了，应该断奶喂奶粉。但我看一些文章说可以喂到2岁。想问问大家都是什么时候断奶的？6个月后母乳真的没营养了吗？',
    isAnonymous: false,
    authorName: '母乳喂养中',
    topicId: 'topic5',
    topicName: '产后恢复',
    lifeStage: 'postpartum',
    tags: [communityTags[4]],
    createdAt: formatDate(2),
    views: 2189,
    likes: 167,
    isLiked: false,
    answerCount: 2,
    answers: mockAnswers['q3'],
    hasFeaturedAnswer: true,
  },
  {
    id: 'q4',
    title: '月经量突然变少是怎么回事？需要调理吗？',
    content: '这两个月月经量突然变少了，以前都是5-7天，现在3天就差不多干净了，而且量也比以前少很多。我今年32岁，还没生孩子，很担心会不会影响以后怀孕。这种情况需要去医院检查吗？',
    isAnonymous: true,
    authorName: '匿名用户',
    topicId: 'topic2',
    topicName: '职场女性健康',
    lifeStage: 'career',
    tags: [communityTags[1], communityTags[8]],
    createdAt: formatDate(7),
    views: 4532,
    likes: 312,
    isLiked: false,
    answerCount: 1,
    answers: mockAnswers['q4'],
    hasFeaturedAnswer: true,
  },
  {
    id: 'q5',
    title: '怀孕3个月可以同房吗？对胎儿有影响吗？',
    content: '现在怀孕12周了，孕吐减轻了，老公有点忍不住。想问一下怀孕中期可以同房吗？会不会对宝宝有影响？需要注意什么？有没有有经验的宝妈分享一下？',
    isAnonymous: true,
    authorName: '匿名用户',
    topicId: 'topic4',
    topicName: '孕期关怀',
    lifeStage: 'pregnancy',
    tags: [communityTags[3]],
    createdAt: formatDate(4),
    views: 5678,
    likes: 423,
    isLiked: false,
    answerCount: 2,
    answers: mockAnswers['q5'],
    hasFeaturedAnswer: true,
  },
  {
    id: 'q6',
    title: '更年期潮热出汗太难受了，有什么好办法缓解？',
    content: '今年51岁，最近半年总是突然一阵发热出汗，尤其是晚上，经常热醒，睡眠质量差了很多。去医院看了，医生说这是更年期正常现象，但真的很难受。有没有什么好的方法可以缓解？吃什么药比较好？',
    isAnonymous: false,
    authorName: '优雅变老',
    topicId: 'topic6',
    topicName: '更年期调养',
    lifeStage: 'menopause',
    tags: [communityTags[6], communityTags[7]],
    createdAt: formatDate(6),
    views: 2876,
    likes: 198,
    isLiked: false,
    answerCount: 1,
    answers: mockAnswers['q6'],
    hasFeaturedAnswer: true,
  },
  {
    id: 'q7',
    title: '14岁女儿月经不规律，需要去看医生吗？',
    content: '女儿今年14岁，去年第一次来月经，但是一直不规律，有时候隔两个月才来一次，量也不稳定。这是正常的吗？需不需要带她去看医生或者吃中药调理？',
    isAnonymous: false,
    authorName: '焦虑的妈妈',
    topicId: 'topic1',
    topicName: '青春期健康',
    lifeStage: 'teen',
    tags: [communityTags[1]],
    createdAt: formatDate(8),
    views: 1543,
    likes: 76,
    isLiked: false,
    answerCount: 0,
    answers: [],
    hasFeaturedAnswer: false,
  },
  {
    id: 'q8',
    title: '盆底肌修复有必要做吗？自己在家练行不行？',
    content: '产后42天复查，医生说我盆底肌肌力不好，建议做盆底肌修复。但是医院的疗程好贵，要好几千。想问问大家有没有必要做？自己在家做凯格尔运动行不行？效果一样吗？',
    isAnonymous: true,
    authorName: '匿名用户',
    topicId: 'topic5',
    topicName: '产后恢复',
    lifeStage: 'postpartum',
    tags: [communityTags[4], communityTags[5]],
    createdAt: formatDate(1),
    views: 3210,
    likes: 234,
    isLiked: false,
    answerCount: 0,
    answers: [],
    hasFeaturedAnswer: false,
  },
];

export const getTopicsByLifeStage = (lifeStage: LifeStage): CommunityTopic[] => {
  return communityTopics.filter((topic) => topic.lifeStage === lifeStage);
};

export const getQuestionsByTopic = (topicId: string): CommunityQuestion[] => {
  return communityQuestions.filter((q) => q.topicId === topicId);
};

export const getQuestionsByLifeStage = (lifeStage: LifeStage): CommunityQuestion[] => {
  return communityQuestions.filter((q) => q.lifeStage === lifeStage);
};

export const getQuestionById = (id: string): CommunityQuestion | undefined => {
  return communityQuestions.find((q) => q.id === id);
};

export const getFeaturedQuestions = (): CommunityQuestion[] => {
  return communityQuestions.filter((q) => q.hasFeaturedAnswer);
};

export const getHotTopics = (): CommunityTopic[] => {
  return communityTopics.filter((topic) => topic.isHot);
};
