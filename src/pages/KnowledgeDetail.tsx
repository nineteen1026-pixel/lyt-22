import { useState } from 'react';
import {
  BookOpen,
  Headphones,
  Heart,
  Eye,
  ArrowRight,
  Award,
  Share2,
  Bookmark,
  CheckCircle,
  Clock,
  Play,
  Pause,
  Volume2,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getArticleById, knowledgeArticles, lifeStageLabels, difficultyLabels, difficultyColors } from '@/mock/knowledgeBase';
import type { KnowledgeArticle } from '@/types';

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

export default function KnowledgeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const article = id ? getArticleById(id) : undefined;

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [likedRelated, setLikedRelated] = useState<Set<string>>(new Set());

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">内容不存在</h2>
          <p className="text-gray-500 mb-6">该科普内容可能已被删除或不存在</p>
          <button
            onClick={() => navigate('/knowledge')}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full font-medium"
          >
            返回知识库
          </button>
        </div>
      </div>
    );
  }

  const stageInfo = lifeStageLabels[article.lifeStage];
  const relatedArticles = knowledgeArticles.filter(
    (a) => article.relatedIds.includes(a.id)
  );

  const handleLike = () => setLiked(!liked);
  const handleBookmark = () => setBookmarked(!bookmarked);

  const handleTogglePlay = () => {
    if (article.type !== 'audio') return;
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      const interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.5;
        });
      }, (article.audioDuration || 100) * 10);
    }
  };

  const handleLikeRelated = (aId: string) => {
    setLikedRelated((prev) => {
      const next = new Set(prev);
      if (next.has(aId)) next.delete(aId);
      else next.add(aId);
      return next;
    });
  };

  const renderRelatedCard = (related: KnowledgeArticle) => {
    const isLiked = likedRelated.has(related.id);
    const relStage = lifeStageLabels[related.lifeStage];

    return (
      <div
        key={related.id}
        className="card p-4 card-hover cursor-pointer"
        onClick={() => navigate(`/knowledge/${related.id}`)}
      >
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={cn('text-xs px-2 py-0.5 rounded-full', relStage.color)}>
            {relStage.label}
          </span>
          {related.type === 'audio' && (
            <span className="text-xs bg-fuchsia-100 text-fuchsia-600 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Headphones className="w-3 h-3" /> 音频
            </span>
          )}
        </div>
        <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2 hover:text-pink-500 transition-colors">
          {related.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{related.summary}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{related.author}</span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Heart className={cn('w-3 h-3', isLiked ? 'fill-rose-500 text-rose-500' : '')} />
            {related.likes + (isLiked ? 1 : 0)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/knowledge')}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
        </button>
        <div>
          <p className="text-sm text-gray-500">
            <span className="hover:text-pink-500 cursor-pointer" onClick={() => navigate('/knowledge')}>
              知识库
            </span>
            <span className="mx-1">/</span>
            <span>{article.category}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className={cn('text-xs px-2.5 py-1 rounded-full', stageInfo.color)}>
                {stageInfo.label}
              </span>
              <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                {article.category}
              </span>
              <span className={cn('text-xs px-2.5 py-1 rounded-full', difficultyColors[article.difficulty])}>
                {difficultyLabels[article.difficulty]}
              </span>
              {article.isExpert && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Award className="w-3 h-3" /> 专家撰写
                </span>
              )}
              {article.type === 'audio' && (
                <span className="text-xs bg-fuchsia-100 text-fuchsia-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Headphones className="w-3 h-3" /> 音频课程
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-3">{article.title}</h1>
            <p className="text-gray-500 mb-4 leading-relaxed">{article.summary}</p>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {article.tags.map((tag) => (
                <span key={tag} className="text-xs bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white font-medium">
                  {article.author.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {article.author}
                    {article.isExpert && (
                      <CheckCircle className="w-4 h-4 text-blue-500 inline ml-1" />
                    )}
                  </p>
                  <p className="text-xs text-gray-400">{formatTimeAgo(article.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleLike}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all',
                    liked ? 'bg-rose-50 text-rose-500' : 'bg-gray-50 text-gray-500 hover:bg-rose-50 hover:text-rose-500'
                  )}
                >
                  <Heart className={cn('w-4 h-4', liked ? 'fill-rose-500' : '')} />
                  <span className="text-sm">{article.likes + (liked ? 1 : 0)}</span>
                </button>
                <button
                  onClick={handleBookmark}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all',
                    bookmarked ? 'bg-amber-50 text-amber-500' : 'bg-gray-50 text-gray-500 hover:bg-amber-50 hover:text-amber-500'
                  )}
                >
                  <Bookmark className={cn('w-4 h-4', bookmarked ? 'fill-amber-500' : '')} />
                  <span className="text-sm">{bookmarked ? '已收藏' : '收藏'}</span>
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-500 transition-all">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">分享</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>{article.views} 浏览</span>
              </div>
              {article.readTimeMinutes > 0 && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{article.readTimeMinutes} 分钟阅读</span>
                </div>
              )}
              {article.type === 'audio' && article.audioDuration && (
                <div className="flex items-center gap-1.5">
                  <Headphones className="w-4 h-4" />
                  <span>{formatAudioDuration(article.audioDuration)}</span>
                </div>
              )}
            </div>
          </div>

          {article.type === 'audio' && (
            <div className="card p-5 bg-gradient-to-r from-fuchsia-50 via-pink-50 to-rose-50">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleTogglePlay}
                  className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-fuchsia-400 via-pink-400 to-rose-400 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white ml-0.5" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="w-4 h-4 text-fuchsia-500" />
                    <span className="text-sm text-gray-600">音频播放</span>
                  </div>
                  <div className="w-full bg-pink-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-rose-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
                    <span>
                      {formatAudioDuration(Math.floor((audioProgress / 100) * (article.audioDuration || 0)))}
                    </span>
                    <span>{formatAudioDuration(article.audioDuration || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card p-6">
            <div className="prose prose-gray max-w-none">
              {article.content.map((paragraph, idx) => (
                <div key={idx} className="mb-5">
                  {paragraph.includes('：') && paragraph.indexOf('：') < 10 ? (
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2 text-base">
                        {paragraph.substring(0, paragraph.indexOf('：') + 1)}
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {paragraph.substring(paragraph.indexOf('：') + 1)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{paragraph}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-pink-50 to-rose-50">
            <div className="text-center">
              <div className="text-4xl mb-3">💡</div>
              <h3 className="font-bold text-gray-800 mb-2">温馨提示</h3>
              <p className="text-sm text-gray-600 mb-4">
                科普内容仅供参考，不构成医疗建议。如有身体不适，请及时就医咨询专业医生。
              </p>
              <button
                onClick={() => navigate('/knowledge')}
                className="px-6 py-2.5 bg-white text-pink-500 rounded-xl font-medium hover:bg-pink-50 transition-colors"
              >
                浏览更多科普
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-4">作者信息</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white text-xl font-bold shadow-sm">
                {article.author.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-gray-800">{article.author}</h4>
                {article.isExpert && (
                  <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" /> 认证专家
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {article.isExpert
                ? '具有丰富临床经验的专业医生/康复师，致力于女性健康科普。'
                : '热心科普分享者，关注女性健康话题。'}
            </p>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-4">内容标签</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span key={tag} className="text-sm bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {relatedArticles.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-gray-800 mb-4">相关推荐</h3>
              <div className="space-y-3">
                {relatedArticles.map(renderRelatedCard)}
              </div>
            </div>
          )}

          <div className="card p-5 bg-gradient-to-br from-amber-50 to-orange-50">
            <div className="text-center">
              <div className="text-4xl mb-3">📖</div>
              <h3 className="font-bold text-gray-800 mb-2">持续学习</h3>
              <p className="text-sm text-gray-600 mb-4">
                知识库持续更新，关注你感兴趣的阶段获取最新科普。
              </p>
              <button
                onClick={() => navigate('/knowledge')}
                className="w-full py-2.5 bg-white text-amber-600 rounded-xl font-medium hover:bg-amber-50 transition-colors"
              >
                返回知识库
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
