import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smile,
  Heart,
  Sun,
  Cloud,
  CloudRain,
  Zap,
  Moon,
  Sparkles,
  Plus,
  X,
  PenLine,
  Quote,
  Music,
  Leaf,
  Wind,
  Pause,
  Play,
  RotateCcw,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { MoodRecord } from '@/types';

const emotions = [
  { id: 'joy', name: '开心', icon: '😊', color: 'from-yellow-400 to-orange-400' },
  { id: 'calm', name: '平静', icon: '😌', color: 'from-mint-400 to-emerald-500' },
  { id: 'excited', name: '兴奋', icon: '🤩', color: 'from-pink-400 to-rose-500' },
  { id: 'tired', name: '疲惫', icon: '😴', color: 'from-blue-400 to-indigo-500' },
  { id: 'sad', name: '低落', icon: '😢', color: 'from-sky-400 to-blue-500' },
  { id: 'anxious', name: '焦虑', icon: '😰', color: 'from-amber-400 to-yellow-500' },
  { id: 'angry', name: '生气', icon: '😤', color: 'from-red-400 to-rose-600' },
  { id: 'grateful', name: '感恩', icon: '🥰', color: 'from-pink-400 to-purple-500' },
];

const moodOptions = ['开心', '平静', '烦躁', '低落', '焦虑', '感动', '幸福', '疲惫'];

const healingQuotes = [
  {
    text: '你不需要完美，只需要做真实的自己。',
    author: '— 心灵语录',
  },
  {
    text: '每一种情绪都是有意义的，允许自己感受它们。',
    author: '— 成长日记',
  },
  {
    text: '今天的不开心，明天醒来就会过去的。',
    author: '— 温柔时光',
  },
  {
    text: '你值得被爱，值得被温柔以待。',
    author: '— 治愈小屋',
  },
];

interface RelaxationActivity {
  id: number;
  name: string;
  duration: string;
  durationMinutes: number;
  icon: React.ReactNode;
  color: string;
  steps: string[];
  tips: string;
}

const relaxationActivities: RelaxationActivity[] = [
  {
    id: 1,
    name: '深呼吸练习',
    duration: '5分钟',
    durationMinutes: 5,
    icon: <Wind className="w-5 h-5" />,
    color: 'from-sky-400 to-blue-500',
    steps: [
      '找一个安静舒适的地方坐下',
      '闭上眼睛，肩膀放松',
      '用鼻子慢慢吸气，数到4',
      '屏住呼吸，数到4',
      '用嘴慢慢呼气，数到6',
      '重复以上步骤',
    ],
    tips: '专注于呼吸的节奏，让思绪自然流动',
  },
  {
    id: 2,
    name: '冥想放松',
    duration: '10分钟',
    durationMinutes: 10,
    icon: <Leaf className="w-5 h-5" />,
    color: 'from-mint-400 to-emerald-500',
    steps: [
      '舒适地坐下或躺下',
      '闭上眼睛，做几次深呼吸',
      '将注意力集中在呼吸上',
      '当思绪飘走时，温和地拉回来',
      '不做评判，只是观察',
      '慢慢将意识带回身体',
    ],
    tips: '初学者可以从5分钟开始，逐渐延长',
  },
  {
    id: 3,
    name: '听轻音乐',
    duration: '15分钟',
    durationMinutes: 15,
    icon: <Music className="w-5 h-5" />,
    color: 'from-purple-400 to-pink-500',
    steps: [
      '选择舒缓的纯音乐或自然声音',
      '找一个舒适的姿势',
      '闭上眼睛，让音乐包裹你',
      '专注于旋律和节奏',
      '让思绪随音乐飘荡',
      '感受音乐带来的平静',
    ],
    tips: '推荐古典音乐、雨声、海浪声等',
  },
  {
    id: 4,
    name: '正念行走',
    duration: '20分钟',
    durationMinutes: 20,
    icon: <Sparkles className="w-5 h-5" />,
    color: 'from-amber-400 to-orange-500',
    steps: [
      '找一条安全安静的小路',
      '放慢脚步，感受每一步',
      '注意脚掌接触地面的感觉',
      '感受身体的移动和平衡',
      '观察周围的声音、气味、景色',
      '当思绪飘走时，回到当下的脚步',
    ],
    tips: '不需要快走，重点是觉察每一个动作',
  },
];

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function MoodPage() {
  const { moodRecords, addMoodRecord } = useAppStore();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState('平静');
  const [selectedEmotion, setSelectedEmotion] = useState('calm');
  const [intensity, setIntensity] = useState(5);
  const [journal, setJournal] = useState('');
  const [currentQuote, setCurrentQuote] = useState(0);

  const [activeActivity, setActiveActivity] = useState<RelaxationActivity | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsCompleted(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const handleSaveRecord = () => {
    addMoodRecord({
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      mood: selectedMood,
      emotion: selectedEmotion,
      intensity,
      journal: journal || undefined,
    });
    setShowAddModal(false);
    setJournal('');
    setIntensity(5);
  };

  const nextQuote = () => {
    setCurrentQuote((prev) => (prev + 1) % healingQuotes.length);
  };

  const startRelaxation = useCallback((activity: RelaxationActivity) => {
    setActiveActivity(activity);
    setTimeLeft(activity.durationMinutes * 60);
    setIsRunning(false);
    setIsCompleted(false);
    setShowActivityModal(true);
  }, []);

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    if (activeActivity) {
      setTimeLeft(activeActivity.durationMinutes * 60);
      setIsRunning(false);
      setIsCompleted(false);
    }
  };

  const closeActivityModal = () => {
    setShowActivityModal(false);
    setIsRunning(false);
    setIsCompleted(false);
    setActiveActivity(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const recentMoods = moodRecords.slice(0, 5);

  const progress = activeActivity
    ? ((activeActivity.durationMinutes * 60 - timeLeft) / (activeActivity.durationMinutes * 60)) * 100
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-peach-400 to-orange-400 flex items-center justify-center shadow-lg shadow-peach-200/50">
            <Smile className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">情绪治愈</h1>
            <p className="text-gray-500">接纳每一种情绪，做情绪的好朋友</p>
          </div>
          <button
            onClick={() => navigate('/vault')}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
          >
            <Shield className="w-4 h-4" />
            私密保险库
          </button>
        </div>
      </div>

      <div
        className="card p-8 mb-8 bg-gradient-to-r from-peach-100 via-pink-100 to-lavender-100 cursor-pointer hover:shadow-xl transition-all"
        onClick={nextQuote}
      >
        <div className="text-center">
          <Quote className="w-8 h-8 mx-auto mb-4 text-peach-400 opacity-50" />
          <p className="font-display text-xl md:text-2xl text-gray-700 mb-4 leading-relaxed">
            "{healingQuotes[currentQuote].text}"
          </p>
          <p className="text-sm text-gray-500">{healingQuotes[currentQuote].author}</p>
          <p className="text-xs text-gray-400 mt-2">点击换一句 ✨</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {emotions.slice(0, 4).map((emotion) => (
          <button
            key={emotion.id}
            onClick={() => {
              setSelectedEmotion(emotion.id);
              setSelectedMood(emotion.name);
              setShowAddModal(true);
            }}
            className="card p-4 text-center card-hover"
          >
            <div className="text-4xl mb-2">{emotion.icon}</div>
            <p className="text-sm font-medium text-gray-700">{emotion.name}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <PenLine className="w-5 h-5 text-peach-500" />
                情绪日记
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-peach-400 to-orange-400 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                记录心情
              </button>
            </div>

            {recentMoods.length > 0 ? (
              <div className="space-y-4">
                {recentMoods.map((record) => {
                  const emotion = emotions.find((e) => e.id === record.emotion);
                  return (
                    <div
                      key={record.id}
                      className="p-4 rounded-xl bg-gradient-to-r from-peach-50 to-orange-50 border border-peach-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{emotion?.icon || '😊'}</span>
                          <div>
                            <p className="font-medium text-gray-800">{record.mood}</p>
                            <p className="text-xs text-gray-400">{record.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">强度</span>
                          <span className="text-sm font-bold text-orange-500">{record.intensity}/10</span>
                        </div>
                      </div>
                      {record.journal && (
                        <p className="text-sm text-gray-600 mt-2 pt-2 border-t border-peach-100">
                          {record.journal}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>还没有情绪记录</p>
                <p className="text-sm">记录下今天的心情吧~</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-peach-500" />
              放松一下
            </h3>
            <p className="text-xs text-gray-500 mb-3">点击开始放松练习</p>
            <div className="space-y-3">
              {relaxationActivities.map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => startRelaxation(activity)}
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activity.color} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{activity.name}</p>
                    <p className="text-xs text-gray-400">{activity.duration}</p>
                  </div>
                  <Play className="w-4 h-4 text-gray-300 group-hover:text-peach-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-lavender-50 to-purple-50">
            <div className="flex items-center gap-3 mb-3">
              <Moon className="w-5 h-5 text-purple-500" />
              <h3 className="font-bold text-gray-800">今日心情</h3>
            </div>
            <div className="flex items-center justify-center py-4">
              <div className="text-6xl mb-2 floating">
                {emotions.find((e) => e.id === 'joy')?.icon}
              </div>
            </div>
            <p className="text-center text-gray-600 text-sm">
              愿你今天也有好心情 💕
            </p>
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-sky-500" />
              情绪天气
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: <Sun className="w-5 h-5" />, label: '晴', color: 'text-yellow-500', bg: 'bg-yellow-50' },
                { icon: <Cloud className="w-5 h-5" />, label: '多云', color: 'text-gray-500', bg: 'bg-gray-50' },
                { icon: <CloudRain className="w-5 h-5" />, label: '雨', color: 'text-blue-500', bg: 'bg-blue-50' },
                { icon: <Zap className="w-5 h-5" />, label: '雷', color: 'text-purple-500', bg: 'bg-purple-50' },
              ].map((weather, idx) => (
                <div key={idx} className={`p-2 rounded-lg ${weather.bg} text-center`}>
                  <div className={`${weather.color} flex justify-center mb-1`}>
                    {weather.icon}
                  </div>
                  <span className="text-xs text-gray-500">{weather.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">记录心情</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">选择情绪</label>
                <div className="grid grid-cols-4 gap-2">
                  {emotions.map((emotion) => (
                    <button
                      key={emotion.id}
                      onClick={() => {
                        setSelectedEmotion(emotion.id);
                        setSelectedMood(emotion.name);
                      }}
                      className={cn(
                        'p-2 rounded-xl text-center transition-all',
                        selectedEmotion === emotion.id
                          ? 'bg-gradient-to-br from-peach-100 to-orange-100 ring-2 ring-peach-400'
                          : 'bg-gray-50 hover:bg-gray-100'
                      )}
                    >
                      <span className="text-2xl block mb-1">{emotion.icon}</span>
                      <span className="text-xs text-gray-600">{emotion.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  情绪强度: {intensity}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  心情描述
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setSelectedMood(mood)}
                      className={cn(
                        'px-3 py-1 rounded-full text-sm transition-all',
                        selectedMood === mood
                          ? 'bg-peach-100 text-peach-600 border border-peach-300'
                          : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-peach-50'
                      )}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  写点什么 (可选)
                </label>
                <textarea
                  value={journal}
                  onChange={(e) => setJournal(e.target.value)}
                  placeholder="今天发生了什么让你有这样的感受？"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-peach-400 focus:ring-2 focus:ring-peach-100 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveRecord}
                  className="flex-1 bg-gradient-to-r from-peach-400 to-orange-400 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showActivityModal && activeActivity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activeActivity.color} flex items-center justify-center text-white shadow-lg`}>
                  {activeActivity.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{activeActivity.name}</h2>
                  <p className="text-sm text-gray-500">{activeActivity.duration}</p>
                </div>
              </div>
              <button
                onClick={closeActivityModal}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isCompleted ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-mint-400 to-emerald-500 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">太棒了！</h3>
                <p className="text-gray-500 mb-6">你完成了 {activeActivity.name}，感觉怎么样？</p>
                <div className="flex gap-3">
                  <button
                    onClick={closeActivityModal}
                    className="flex-1 btn-secondary"
                  >
                    完成
                  </button>
                  <button
                    onClick={() => {
                      resetTimer();
                      setIsCompleted(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-mint-400 to-emerald-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    再来一次
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="relative w-48 h-48 mx-auto mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fb923c" />
                          <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-gray-800 font-display">
                        {formatTime(timeLeft)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {isRunning ? '进行中...' : '准备开始'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={resetTimer}
                      className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <RotateCcw className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={toggleTimer}
                      className={cn(
                        'w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105',
                        isRunning
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                          : 'bg-gradient-to-br from-peach-400 to-orange-500'
                      )}
                    >
                      {isRunning ? (
                        <Pause className="w-7 h-7 text-white" fill="white" />
                      ) : (
                        <Play className="w-7 h-7 text-white ml-1" fill="white" />
                      )}
                    </button>
                    <div className="w-12" />
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-peach-500" />
                    练习步骤
                  </h3>
                  <ol className="space-y-2">
                    {activeActivity.steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="w-5 h-5 rounded-full bg-gradient-to-br from-peach-400 to-orange-400 text-white text-xs flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="p-4 bg-peach-50 rounded-xl">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-peach-600">💡 小贴士：</span>{' '}
                    {activeActivity.tips}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
