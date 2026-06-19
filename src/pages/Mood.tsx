import { useState } from 'react';
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

const relaxationActivities = [
  { id: 1, name: '深呼吸练习', duration: '5分钟', icon: <Wind className="w-5 h-5" />, color: 'from-sky-400 to-blue-500' },
  { id: 2, name: '冥想放松', duration: '10分钟', icon: <Leaf className="w-5 h-5" />, color: 'from-mint-400 to-emerald-500' },
  { id: 3, name: '听轻音乐', duration: '15分钟', icon: <Music className="w-5 h-5" />, color: 'from-purple-400 to-pink-500' },
  { id: 4, name: '正念行走', duration: '20分钟', icon: <Sparkles className="w-5 h-5" />, color: 'from-amber-400 to-orange-500' },
];

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function MoodPage() {
  const { moodRecords, addMoodRecord } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState('平静');
  const [selectedEmotion, setSelectedEmotion] = useState('calm');
  const [intensity, setIntensity] = useState(5);
  const [journal, setJournal] = useState('');
  const [currentQuote, setCurrentQuote] = useState(0);

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

  const recentMoods = moodRecords.slice(0, 5);

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
            <div className="space-y-3">
              {relaxationActivities.map((activity) => (
                <button
                  key={activity.id}
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 flex items-center gap-3 hover:shadow-md transition-all text-left"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activity.color} flex items-center justify-center text-white shadow-sm`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{activity.name}</p>
                    <p className="text-xs text-gray-400">{activity.duration}</p>
                  </div>
                  <Sun className="w-4 h-4 text-gray-300" />
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
    </div>
  );
}
