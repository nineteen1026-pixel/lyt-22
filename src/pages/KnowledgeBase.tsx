import { useState, useMemo } from 'react';
import {
  BookOpen,
  Headphones,
  Search,
  Filter,
  X,
  Heart,
  Bookmark,
  ArrowRight,
  Clock,
  Eye,
  Flame,
  Award,
  Tag,
  Play,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import {
  knowledgeTopics,
  knowledgeArticles,
  getTopicsByLifeStage,
  getFeaturedArticles,
  getAudioArticles,
  searchArticles,
  lifeStageLabels,
  difficultyLabels,
  difficultyColors,
} from '@/mock/knowledgeBase';
import type { KnowledgeArticle, KnowledgeTopic, LifeStage } from '@/types';

type TabKey = 'topics' | 'articles' | 'audios' | 'featured';
type FilterDifficulty = 'all' | 'beginner' | 'intermediate' | 'advanced';

const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { key: 'topics', label: '分阶段专题', icon: BookOpen, color: 'from-amber-400 via-orange-400 to-rose-400' },
  { key: 'articles', label: '科普文章', icon: BookOpen, color: 'from-sky-400 to-blue-500' },
  { key: 'audios', label: '音频资源', icon: Headphones, color: 'from-fuchsia-400 via-pink-400 to-rose-400' },
  { key: 'featured', label: '精选推荐', icon: Award, color: 'from-emerald-400 to-teal-500' },
];

const formatTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  return `${Math.floor(diffDays / 30)}个月前`;
};

const formatAudioDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const formatViews = (n: number): string => {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

export default function KnowledgeBase() {
  const navigate = useNavigate();
  const { lifeStage } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabKey>('topics');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<KnowledgeTopic | null>(null);
  const [selectedStage, setSelectedStage] = useState<LifeStage | 'all'>(lifeStage);
  const [difficultyFilter, setDifficultyFilter] = useState<FilterDifficulty>('all');
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set());
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set());

  const currentStageLabel = lifeStageLabels[lifeStage];

  const filteredArticles = useMemo(() => {
    let result: KnowledgeArticle[] = [...knowledgeArticles];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.tags.some((t) => t.includes(q))
      );
    }

    if (selectedStage !== 'all') {
      result = result.filter((a) => a.lifeStage === selectedStage);
    }

    if (selectedTopic) {
      result = result.filter((a) => a.category === selectedTopic.title);
    }

    if (difficultyFilter !== 'all') {
      result = result.filter((a) => a.difficulty === difficultyFilter);
    }

    if (activeTab === 'articles') {
      result = result.filter((a) => a.type === 'article');
    } else if (activeTab === 'audios') {
      result = result.filter((a) => a.type === 'audio');
    } else if (activeTab === 'featured') {
      result = result.filter((a) => a.type === 'article');
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activeTab, searchQuery, selectedStage, selectedTopic, difficultyFilter]);

  const featuredArticles = useMemo(() => getFeaturedArticles(selectedStage === 'all' ? undefined : selectedStage), [selectedStage]);
  const audioArticles = useMemo(() => getAudioArticles(selectedStage === 'all' ? undefined : selectedStage), [selectedStage]);
  const totalArticles = knowledgeArticles.filter((a) => a.type === 'article').length;
  const totalAudios = knowledgeArticles.filter((a) => a.type === 'audio').length;

  const handleLike = (articleId: string) => {
    setLikedArticles((prev) => {
      const next = new Set(prev);
      if (next.has(articleId)) next.delete(articleId);
      else next.add(articleId);
      return next;
    });
  };

  const handleBookmark = (articleId: string) => {
    setBookmarkedArticles((prev) => {
      const next = new Set(prev);
      if (next.has(articleId)) next.delete(articleId);
      else next.add(articleId);
      return next;
    });
  };

  const renderArticleCard = (article: KnowledgeArticle) => {
    const isLiked = likedArticles.has(article.id);
    const isBookmarked = bookmarkedArticles.has(article.id);
    const stageInfo = lifeStageLabels[article.lifeStage];

    return (
      <div
        key={article.id}
        className="card p-5 card-hover cursor-pointer group"
        onClick={() => navigate(`/knowledge/${article.id}`)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('text-xs px-2 py-1 rounded-full', stageInfo.color)}>
              {stageInfo.label}
            </span>
            {article.type === 'audio' && (
              <span className="text-xs bg-fuchsia-100 text-fuchsia-600 px-2 py-1 rounded-full flex items-center gap-1">
                <Headphones className="w-3 h-3" /> 音频
              </span>
            )}
            <span className={cn('text-xs px-2 py-1 rounded-full', difficultyColors[article.difficulty])}>
              {difficultyLabels[article.difficulty]}
            </span>
            {article.isExpert && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full flex items-center gap-1">
                <Award className="w-3 h-3" /> 专家
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">{formatTimeAgo(article.createdAt)}</span>
        </div>

        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-pink-500 transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{article.summary}</p>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {article.tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white text-xs font-bold">
              {article.author.charAt(0)}
            </div>
            <span className="text-sm text-gray-600">{article.author}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-1 text-gray-400 hover:text-rose-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleLike(article.id);
              }}
            >
              <Heart className={cn('w-4 h-4', isLiked ? 'fill-rose-500 text-rose-500' : '')} />
              <span className="text-xs">{article.likes + (isLiked ? 1 : 0)}</span>
            </button>
            <button
              className="flex items-center gap-1 text-gray-400 hover:text-amber-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleBookmark(article.id);
              }}
            >
              <Bookmark className={cn('w-4 h-4', isBookmarked ? 'fill-amber-500 text-amber-500' : '')} />
            </button>
            <div className="flex items-center gap-1 text-gray-400">
              <Eye className="w-4 h-4" />
              <span className="text-xs">{formatViews(article.views)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAudioCard = (article: KnowledgeArticle) => {
    const isLiked = likedArticles.has(article.id);
    const stageInfo = lifeStageLabels[article.lifeStage];

    return (
      <div
        key={article.id}
        className="card p-5 card-hover cursor-pointer group"
        onClick={() => navigate(`/knowledge/${article.id}`)}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-400 via-pink-400 to-rose-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Play className="w-7 h-7 text-white ml-0.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={cn('text-xs px-2 py-0.5 rounded-full', stageInfo.color)}>
                {stageInfo.label}
              </span>
              <span className={cn('text-xs px-2 py-0.5 rounded-full', difficultyColors[article.difficulty])}>
                {difficultyLabels[article.difficulty]}
              </span>
            </div>
            <h3 className="font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-pink-500 transition-colors">
              {article.title}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-1 mb-2">{article.summary}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Headphones className="w-3.5 h-3.5" />
                {formatAudioDuration(article.audioDuration || 0)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {formatViews(article.views)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className={cn('w-3.5 h-3.5', isLiked ? 'fill-rose-500 text-rose-500' : '')} />
                {article.likes + (isLiked ? 1 : 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTopicsContent = () => {
    if (selectedTopic) {
      const articles = filteredArticles;

      return (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => {
                setSelectedTopic(null);
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

          {articles.length > 0 ? (
            <div className="space-y-4">
              {articles.map(renderArticleCard)}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">该专题下暂无文章</p>
            </div>
          )}
        </div>
      );
    }

    const stages: LifeStage[] = ['teen', 'career', 'pregnancy-prep', 'pregnancy', 'postpartum', 'menopause'];

    return (
      <div className="space-y-8">
        {stages.map((stage) => {
          const topics = getTopicsByLifeStage(stage);
          const stageInfo = lifeStageLabels[stage];
          if (topics.length === 0) return null;

          return (
            <div key={stage}>
              <div className="flex items-center gap-3 mb-4">
                <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold', stageInfo.gradient)}>
                  {stageInfo.label.charAt(0)}
                </div>
                <h2 className="font-bold text-lg text-gray-800">{stageInfo.label}</h2>
                {stage === lifeStage && (
                  <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">当前阶段</span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic)}
                    className="card p-5 text-left card-hover group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-2xl shadow-sm">
                        {topic.icon}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">{topic.title}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{topic.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {topic.articleCount} 篇
                      </span>
                      <span className="flex items-center gap-1">
                        <Headphones className="w-3.5 h-3.5" />
                        {topic.audioCount} 音频
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'topics':
        return renderTopicsContent();
      case 'audios':
        return (
          <div>
            {filteredArticles.length > 0 ? (
              <div className="space-y-4">
                {filteredArticles.map(renderAudioCard)}
              </div>
            ) : (
              <div className="text-center py-12">
                <Headphones className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">暂无相关音频资源</p>
              </div>
            )}
          </div>
        );
      case 'featured':
        return (
          <div>
            <div className="mb-6">
              <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                热门推荐
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {featuredArticles.map((article) => {
                  const stageInfo = lifeStageLabels[article.lifeStage];
                  return (
                    <div
                      key={article.id}
                      className="card p-5 card-hover cursor-pointer bg-gradient-to-br from-amber-50 to-orange-50"
                      onClick={() => navigate(`/knowledge/${article.id}`)}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded-full flex items-center gap-1">
                          <Flame className="w-3 h-3" /> 热门
                        </span>
                        <span className={cn('text-xs px-2 py-1 rounded-full', stageInfo.color)}>
                          {stageInfo.label}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{article.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.summary}</p>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs">
                            {article.author.charAt(0)}
                          </div>
                          <span className="text-xs text-gray-500">
                            {article.author} · {article.readTimeMinutes > 0 ? `${article.readTimeMinutes}分钟` : formatAudioDuration(article.audioDuration || 0)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {article.likes}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="font-bold text-lg text-gray-800 mb-4">全部精选</h2>
              {filteredArticles.length > 0 ? (
                <div className="space-y-4">
                  {filteredArticles.map(renderArticleCard)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400">暂无精选内容</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'articles':
      default:
        return (
          <div>
            {filteredArticles.length > 0 ? (
              <div className="space-y-4">
                {filteredArticles.map(renderArticleCard)}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">暂无相关文章</p>
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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 flex items-center justify-center shadow-lg shadow-amber-200/50">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-800">知识库</h1>
              <p className="text-gray-500">分阶段科普，专业守护</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-white/80 text-sm mb-1">当前人生阶段</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold bg-white/20 text-white px-3 py-1 rounded-full">
                {currentStageLabel.label}
              </span>
            </div>
            <p className="text-white/90 mt-2">
              为你精选 <span className="font-bold">{knowledgeArticles.filter((a) => a.lifeStage === lifeStage).length}</span> 篇科普内容
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-3xl mb-1">📚</div>
              <p className="text-xs text-white/80">科普文章</p>
              <p className="font-bold">{totalArticles}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">🎧</div>
              <p className="text-xs text-white/80">音频资源</p>
              <p className="font-bold">{totalAudios}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">📂</div>
              <p className="text-xs text-white/80">专题分类</p>
              <p className="font-bold">{knowledgeTopics.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索科普内容..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value as LifeStage | 'all')}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none bg-white"
          >
            <option value="all">全部阶段</option>
            <option value="teen">青春期</option>
            <option value="career">职场期</option>
            <option value="pregnancy-prep">备孕期</option>
            <option value="pregnancy">孕期</option>
            <option value="postpartum">产后期</option>
            <option value="menopause">更年期</option>
          </select>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as FilterDifficulty)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none bg-white"
          >
            <option value="all">全部难度</option>
            <option value="beginner">入门</option>
            <option value="intermediate">进阶</option>
            <option value="advanced">专业</option>
          </select>
        </div>
      </div>

      {(selectedStage !== 'all' || difficultyFilter !== 'all' || searchQuery) && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {selectedStage !== 'all' && (
            <span className="inline-flex items-center gap-1 text-sm bg-amber-100 text-amber-600 px-3 py-1.5 rounded-full">
              {lifeStageLabels[selectedStage].label}
              <button onClick={() => setSelectedStage('all')} className="hover:bg-amber-200 rounded-full p-0.5 ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {difficultyFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 text-sm bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full">
              {difficultyLabels[difficultyFilter]}
              <button onClick={() => setDifficultyFilter('all')} className="hover:bg-blue-200 rounded-full p-0.5 ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 text-sm bg-pink-100 text-pink-600 px-3 py-1.5 rounded-full">
              "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:bg-pink-200 rounded-full p-0.5 ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setSelectedStage('all');
              setDifficultyFilter('all');
              setSearchQuery('');
            }}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            清除筛选
          </button>
        </div>
      )}

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

      {renderTabContent()}
    </div>
  );
}
