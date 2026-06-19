import { Link } from 'react-router-dom';
import {
  Sparkles,
  Briefcase,
  Baby,
  Stethoscope,
  Leaf,
  Heart,
  Smile,
  Flower2,
  ChevronRight,
  Calendar,
  Droplets,
  Moon,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const stages = [
  {
    id: 'teen',
    title: '少女期',
    subtitle: '初潮与周期记录',
    description: '温柔记录成长的每一步，科学了解自己的身体',
    icon: Sparkles,
    color: 'from-pink-400 to-rose-400',
    bgColor: 'bg-pink-50',
    path: '/teen',
  },
  {
    id: 'career',
    title: '职场期',
    subtitle: '加班与经期管理',
    description: '平衡工作与健康，让努力不伤身',
    icon: Briefcase,
    color: 'from-lavender-400 to-purple-500',
    bgColor: 'bg-lavender-50',
    path: '/career',
  },
  {
    id: 'pregnancy-prep',
    title: '备孕期',
    subtitle: '排卵追踪',
    description: '精准把握黄金时期，迎接新生命的到来',
    icon: Baby,
    color: 'from-mint-400 to-emerald-500',
    bgColor: 'bg-mint-50',
    path: '/pregnancy-prep',
  },
  {
    id: 'pregnancy',
    title: '孕期',
    subtitle: '产检记录',
    description: '全程陪伴产检之旅，记录宝宝成长点滴',
    icon: Stethoscope,
    color: 'from-sky-400 to-blue-500',
    bgColor: 'bg-sky-50',
    path: '/pregnancy',
  },
  {
    id: 'postpartum',
    title: '产后恢复',
    subtitle: '盆底·恶露·哺乳·复查',
    description: '科学恢复，温柔守护新生妈妈的每一天',
    icon: Leaf,
    color: 'from-fuchsia-400 via-pink-400 to-rose-400',
    bgColor: 'bg-pink-50',
    path: '/postpartum',
  },
  {
    id: 'relief',
    title: '痛经舒缓',
    subtitle: '科学缓解方案',
    description: '多维度舒缓方法，让那几天不再难熬',
    icon: Heart,
    color: 'from-rose-400 to-red-400',
    bgColor: 'bg-rose-50',
    path: '/relief',
  },
  {
    id: 'mood',
    title: '情绪治愈',
    subtitle: '心灵疗愈空间',
    description: '接纳每一种情绪，做情绪的好朋友',
    icon: Smile,
    color: 'from-peach-400 to-orange-400',
    bgColor: 'bg-peach-50',
    path: '/mood',
  },
  {
    id: 'menopause',
    title: '更年期照护',
    subtitle: '潮热·睡眠·激素',
    description: '科学应对更年期，温柔呵护每一天',
    icon: Flower2,
    color: 'from-lavender-400 to-purple-500',
    bgColor: 'bg-lavender-50',
    path: '/menopause',
  },
];

export default function Home() {
  const { cycleData, getNextPeriodDate, getOvulationDate } = useAppStore();

  const nextPeriod = getNextPeriodDate();
  const ovulationDate = getOvulationDate();

  const today = new Date();
  const lastPeriodDate = new Date(cycleData.lastPeriodDate);
  const daysSinceLastPeriod = Math.floor(
    (today.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const cycleDay = daysSinceLastPeriod + 1;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="text-center mb-12 md:mb-16">
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary-300 via-pink-400 to-lavender-400 flex items-center justify-center shadow-2xl shadow-pink-200/50 floating">
            <Heart className="w-12 h-12 md:w-16 md:h-16 text-white" fill="white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center shadow-lg floating-delayed">
            <span className="text-lg">✨</span>
          </div>
        </div>
        
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
          你好，
          <span className="gradient-text"> 亲爱的 </span>
        </h1>
        <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto">
          陪伴你走过人生的每一个阶段，温柔守护你的健康与美丽
        </p>
      </section>

      <section className="mb-12 md:mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="card p-6 card-hover">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-200/50">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">今日周期</p>
                <p className="text-2xl font-bold text-gray-800">第 {cycleDay} 天</p>
              </div>
            </div>
            <div className="w-full bg-pink-100 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-pink-400 to-rose-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((cycleDay / cycleData.cycleLength) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="card p-6 card-hover">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lavender-400 to-purple-500 flex items-center justify-center shadow-lg shadow-lavender-200/50">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">下次例假</p>
                <p className="text-2xl font-bold text-gray-800">
                  {nextPeriod}
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              还有 {cycleData.cycleLength - daysSinceLastPeriod} 天
            </p>
          </div>

          <div className="card p-6 card-hover">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-mint-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-mint-200/50">
                <Moon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">排卵期</p>
                <p className="text-2xl font-bold text-gray-800">
                  {ovulationDate}
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              易孕期请注意
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="text-center mb-8">
          <h2 className="section-title">选择你的人生阶段</h2>
          <p className="section-subtitle">每个阶段都有专属的健康守护</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stages.map((stage) => (
            <Link
              key={stage.id}
              to={stage.path}
              className="card p-6 card-hover group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stage.color} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <stage.icon className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {stage.title}
              </h3>
              <p className="text-primary-500 font-medium text-sm mb-3">
                {stage.subtitle}
              </p>
              <p className="text-gray-500 text-sm mb-4">
                {stage.description}
              </p>
              
              <div className="flex items-center text-primary-500 font-medium text-sm group-hover:text-primary-600">
                <span>了解更多</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="card p-8 md:p-12 bg-gradient-to-r from-primary-400 via-pink-400 to-lavender-500 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 max-w-2xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              你的健康，值得被温柔以待
            </h2>
            <p className="text-white/90 text-lg mb-6">
              从青涩少女到优雅母亲，我们陪你走过每一个重要时刻。
              记录、理解、呵护，让每个阶段都绽放独特光彩。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/teen" className="bg-white text-primary-500 px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                开始记录
              </Link>
              <Link to="/mood" className="bg-white/20 backdrop-blur text-white px-6 py-3 rounded-full font-medium border border-white/30 hover:bg-white/30 transition-all">
                情绪治愈
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
