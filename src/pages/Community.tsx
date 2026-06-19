import { useState, useMemo } from 'react';
import {
  MessageCircle,
  Users,
  Heart,
  Eye,
  Plus,
  Search,
  Filter,
  X,
  Send,
  ArrowRight,
  Flame,
  Award,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import {
  communityTopics,
  communityQuestions,
  getFeaturedQuestions,
  communityTags,
} from '@/mock/community';
import type { CommunityQuestion, LifeStage, CommunityTopic } from '@/types';

type TabKey = 'topics' | 'anonymous' | 'featured' | 'all';

const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { key: 'topics', label: '分阶段话题', icon: Users, color: 'from-violet-400 to-purple-500' },
  { key: 'anonymous', label: '匿名提问', icon: User, color: 'from-amber-400 to-orange-500' },
  { key: 'featured', label: '精选解答', icon: Award, color: 'from-emerald-400 to-teal-500' },
  { key: 'all', label: '全部问题', icon: MessageCircle, color: 'from-pink-400 to-rose-500' },
];

const lifeStageLabels: Record<LifeStage, { label: string; color: string }> = {
  teen: { label: '青春期', color: 'bg-pink-100 text-pink-600' },
  career: { label: '职场期', color: 'bg-blue-100 text-blue-600' },
  'pregnancy-prep': { label: '备孕期', color: 'bg-amber-100 text-amber-600' },
  pregnancy: { label: '孕期', color: 'bg-emerald-100 text-emerald-600' },
  postpartum: { label: '产后期', color: 'bg-rose-100 text-rose-600' },
  menopause: { label: '更年期', color: 'bg-violet-100 text-violet-600' },
};

const formatTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  return `${Math.floor(diffDays / 30)}个月前`;
};

export default function Community() {
  const navigate = useNavigate();
  const { lifeStage } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabKey>('topics');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<CommunityTopic | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showAskModal, setShowAskModal] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '' });
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [likedQuestions, setLikedQuestions] = useState<Set<string>>(new Set());

  const currentStageLabel = lifeStageLabels[lifeStage];

  const filteredQuestions = useMemo(() => {
    let result: CommunityQuestion[] = [...communityQuestions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (q) =>
          q.title.toLowerCase().includes(query) ||
          q.content.toLowerCase().includes(query)
      );
    }

    if (selectedTopic) {
      result = result.filter((q) => q.topicId === selectedTopic.id);
    }

    if (selectedTag) {
      result = result.filter((q) => q.tags.some((t) => t.id === selectedTag));
    }

    if (activeTab === 'anonymous') {
      result = result.filter((q) => q.isAnonymous);
    } else if (activeTab === 'featured') {
      result = result.filter((q) => q.hasFeaturedAnswer);
    } else if (activeTab === 'topics' && !selectedTopic) {
      result = [];
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activeTab, searchQuery, selectedTopic, selectedTag]);

  const featuredQuestions = useMemo(() => getFeaturedQuestions(), []);

  const handleLikeQuestion = (questionId: string) => {
    setLikedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const handleSubmitQuestion = () => {
    if (!newQuestion.title.trim() || !newQuestion.content.trim()) return;
    setShowAskModal(false);
    setNewQuestion({ title: '', content: '' });
    setSelectedTags([]);
    setSelectedTopicId('');
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const renderQuestionCard = (question: CommunityQuestion) => {
    const isLiked = likedQuestions.has(question.id);
    const stageInfo = lifeStageLabels[question.lifeStage];

    return (
      <div
        key={question.id}
        className="card p-5 card-hover cursor-pointer"
        onClick={() => navigate(`/community/${question.id}`)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('text-xs px-2 py-1 rounded-full', stageInfo.color)}>
              {stageInfo.label}
            </span>
            <span className="text-xs text-gray-400">{question.topicName}</span>
            {question.isAnonymous && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                匿名
              </span>
            )}
            {question.hasFeaturedAnswer && (
              <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full flex items-center gap-1">
                <Award className="w-3 h-3" /> 精选解答
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">{formatTimeAgo(question.createdAt)}</span>
        </div>

        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 hover:text-pink-500 transition-colors">
          {question.title}
        </h3>

        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{question.content}</p>

        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {question.tags.map((tag) => (
            <span
              key={tag.id}
              className={cn('text-xs px-2 py-0.5 rounded-full', tag.color)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTag(tag.id);
              }}
            >
              #{tag.name}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white text-xs">
              {question.authorName.charAt(0)}
            </div>
            <span className="text-sm text-gray-600">{question.authorName}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-1 text-gray-400 hover:text-rose-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleLikeQuestion(question.id);
              }}
            >
              <Heart
                className={cn('w-4 h-4', isLiked ? 'fill-rose-500 text-rose-500' : '')}
              />
              <span className="text-xs">{question.likes + (isLiked ? 1 : 0)}</span>
            </button>
            <div className="flex items-center gap-1 text-gray-400">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{question.answerCount}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Eye className="w-4 h-4" />
              <span className="text-xs">{question.views}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTopicsContent = () => {
    if (selectedTopic) {
      const questions = filteredQuestions;

      return (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => {
                setSelectedTopic(null);
                setSelectedTag(null);
              }}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{selectedTopic.icon}</span>
                <h2 className="font-bold text-xl text-gray-800">{selectedTopic.title}</h2>
              </div>
              <p className="text-sm text-gray-500">{selectedTopic.description}</p>
            </div>
          </div>

          {selectedTag && (
            <div className="mb-4">
              <span className="inline-flex items-center gap-1 text-sm bg-pink-100 text-pink-600 px-3 py-1.5 rounded-full">
                #{communityTags.find((t) => t.id === selectedTag)?.name}
                <button
                  onClick={() => setSelectedTag(null)}
                  className="hover:bg-pink-200 rounded-full p-0.5 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}

          {questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map(renderQuestionCard)}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">该话题下暂无问题</p>
              <button
                onClick={() => setShowAskModal(true)}
                className="mt-4 text-pink-500 font-medium hover:underline"
              >
                成为第一个提问的人
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        <div className="mb-6">
          <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            热门话题
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communityTopics.map((topic) => {
              const stageInfo = lifeStageLabels[topic.lifeStage];
              const isCurrentStage = topic.lifeStage === lifeStage;
              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={cn(
                    'card p-5 text-left card-hover group',
                    isCurrentStage ? 'ring-2 ring-pink-400 ring-offset-2' : ''
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-2xl shadow-sm">
                      {topic.icon}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full', stageInfo.color)}>
                      {stageInfo.label}
                    </span>
                    {isCurrentStage && (
                      <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">
                        当前阶段
                      </span>
                    )}
                    {topic.isHot && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Flame className="w-3 h-3" /> 热门
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{topic.title}</h3>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{topic.description}</p>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-pink-500">{topic.questionCount}</span>{' '}
                    个问题
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'topics':
        return renderTopicsContent();
      case 'anonymous':
      case 'featured':
      case 'all':
      default:
        return (
          <div>
            {selectedTag && (
              <div className="mb-4">
                <span className="inline-flex items-center gap-1 text-sm bg-pink-100 text-pink-600 px-3 py-1.5 rounded-full">
                  #{communityTags.find((t) => t.id === selectedTag)?.name}
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="hover:bg-pink-200 rounded-full p-0.5 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              </div>
            )}

            {filteredQuestions.length > 0 ? (
              <div className="space-y-4">
                {filteredQuestions.map(renderQuestionCard)}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">暂无相关问题</p>
                <button
                  onClick={() => setShowAskModal(true)}
                  className="mt-4 text-pink-500 font-medium hover:underline"
                >
                  发起第一个提问
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 via-purple-400 to-pink-400 flex items-center justify-center shadow-lg shadow-purple-200/50">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-800">社区问答</h1>
              <p className="text-gray-500">互帮互助，共同成长</p>
            </div>
          </div>
          <button
            onClick={() => setShowAskModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-medium shadow-lg shadow-pink-200/50 hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>我要提问</span>
          </button>
        </div>
      </div>

      <div className="card p-6 mb-6 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-white/80 text-sm mb-1">当前人生阶段</p>
            <div className="flex items-center gap-2">
              <span className={cn('text-lg font-bold', currentStageLabel.color, 'bg-white/20 text-white px-3 py-1 rounded-full')}>
                {currentStageLabel.label}
              </span>
            </div>
            <p className="text-white/90 mt-2">
              已有 <span className="font-bold">{communityQuestions.filter((q) => q.lifeStage === lifeStage).length}</span> 位姐妹在此分享经验
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-3xl mb-1">💬</div>
              <p className="text-xs text-white/80">总问题数</p>
              <p className="font-bold">{communityQuestions.length}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">⭐</div>
              <p className="text-xs text-white/80">精选解答</p>
              <p className="font-bold">{featuredQuestions.length}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">👥</div>
              <p className="text-xs text-white/80">话题数量</p>
              <p className="font-bold">{communityTopics.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索问题..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {communityTags.slice(0, 5).map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
              className={cn(
                'flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                selectedTag === tag.id
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-pink-300'
              )}
            >
              #{tag.name}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-2 mb-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSelectedTopic(null);
                }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                  isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'featured' && !selectedTopic && (
        <div className="mb-6">
          <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" />
            本周精选解答
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {featuredQuestions.slice(0, 4).map((question) => {
              const featuredAnswer = question.answers.find((a) => a.isFeatured);
              return (
                <div
                  key={question.id}
                  className="card p-5 card-hover cursor-pointer bg-gradient-to-br from-emerald-50 to-teal-50"
                  onClick={() => navigate(`/community/${question.id}`)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full flex items-center gap-1">
                      <Award className="w-3 h-3" /> 精选
                    </span>
                    <span className="text-xs text-gray-400">{question.topicName}</span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{question.title}</h3>
                  {featuredAnswer && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      <span className="text-emerald-600 font-medium">专家解答：</span>
                      {featuredAnswer.content}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs">
                        {featuredAnswer?.authorName.charAt(0)}
                      </div>
                      <span className="text-xs text-gray-500">
                        {featuredAnswer?.authorName} · {featuredAnswer?.isExpert ? '认证专家' : '热心用户'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {featuredAnswer?.likes}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {renderTabContent()}

      {showAskModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">发起提问</h2>
              <button
                onClick={() => setShowAskModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">匿名提问</span>
                </div>
                <button
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={cn(
                    'w-12 h-6 rounded-full transition-all relative',
                    isAnonymous ? 'bg-pink-500' : 'bg-gray-300'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 w-4 h-4 bg-white rounded-full transition-all',
                      isAnonymous ? 'left-7' : 'left-1'
                    )}
                  />
                </button>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">选择话题</label>
                <div className="grid grid-cols-3 gap-2">
                  {communityTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopicId(topic.id)}
                      className={cn(
                        'p-3 rounded-xl text-sm font-medium transition-all text-left',
                        selectedTopicId === topic.id
                          ? 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-600 border-2 border-pink-300'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
                      )}
                    >
                      <span className="text-lg">{topic.icon}</span>
                      <p className="mt-1">{topic.title}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">问题标题</label>
                <input
                  type="text"
                  placeholder="请输入问题标题..."
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">问题描述</label>
                <textarea
                  placeholder="详细描述您的问题，方便获得更准确的回答..."
                  value={newQuestion.content}
                  onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">添加标签</label>
                <div className="flex flex-wrap gap-2">
                  {communityTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm transition-all',
                        selectedTags.includes(tag.id)
                          ? tag.color + ' ring-2 ring-offset-1 ring-pink-300'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      )}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-pink-50 rounded-xl">
                <p className="text-sm text-gray-600">
                  <strong>💡 小提示：</strong>清晰完整的问题描述有助于获得更专业、更有针对性的回答。
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAskModal(false)} className="flex-1 btn-secondary">
                  取消
                </button>
                <button
                  onClick={handleSubmitQuestion}
                  disabled={!newQuestion.title.trim() || !newQuestion.content.trim()}
                  className={cn(
                    'flex-1 px-6 py-3 rounded-full font-medium shadow-lg transition-all flex items-center justify-center gap-2',
                    newQuestion.title.trim() && newQuestion.content.trim()
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-xl'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  )}
                >
                  <Send className="w-4 h-4" />
                  提交问题
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
