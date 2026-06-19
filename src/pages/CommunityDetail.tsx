import { useState } from 'react';
import {
  MessageCircle,
  Heart,
  Eye,
  ArrowRight,
  Award,
  Send,
  Share2,
  Bookmark,
  User,
  CheckCircle,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getQuestionById, communityTopics } from '@/mock/community';
import type { CommunityAnswer, LifeStage } from '@/types';

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

export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const question = id ? getQuestionById(id) : undefined;

  const [likedQuestion, setLikedQuestion] = useState(false);
  const [likedAnswers, setLikedAnswers] = useState<Set<string>>(new Set());
  const [bookmarked, setBookmarked] = useState(false);
  const [newAnswer, setNewAnswer] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">问题不存在</h2>
          <p className="text-gray-500 mb-6">该问题可能已被删除或不存在</p>
          <button
            onClick={() => navigate('/community')}
            className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-medium"
          >
            返回社区
          </button>
        </div>
      </div>
    );
  }

  const topic = communityTopics.find((t) => t.id === question.topicId);
  const stageInfo = lifeStageLabels[question.lifeStage];
  const featuredAnswer = question.answers.find((a) => a.isFeatured);
  const otherAnswers = question.answers.filter((a) => !a.isFeatured);

  const handleLikeQuestion = () => {
    setLikedQuestion(!likedQuestion);
  };

  const handleLikeAnswer = (answerId: string) => {
    setLikedAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(answerId)) {
        next.delete(answerId);
      } else {
        next.add(answerId);
      }
      return next;
    });
  };

  const handleSubmitAnswer = () => {
    if (!newAnswer.trim()) return;
    setNewAnswer('');
  };

  const renderAnswerCard = (answer: CommunityAnswer, isFeatured: boolean = false) => {
    const isLiked = likedAnswers.has(answer.id);

    return (
      <div
        key={answer.id}
        className={cn(
          'card p-5',
          isFeatured ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200' : ''
        )}
      >
        {isFeatured && (
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 text-sm bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-full font-medium">
              <Award className="w-4 h-4" />
              精选解答
            </span>
            {answer.isExpert && (
              <span className="inline-flex items-center gap-1 text-sm bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full">
                <CheckCircle className="w-4 h-4" />
                认证专家
              </span>
            )}
          </div>
        )}

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold',
                answer.isExpert
                  ? 'bg-gradient-to-br from-blue-400 to-indigo-500'
                  : 'bg-gradient-to-br from-gray-400 to-gray-500'
              )}
            >
              {answer.authorName.charAt(0)}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-gray-800">{answer.authorName}</span>
              {answer.isExpert && (
                <CheckCircle className="w-4 h-4 text-blue-500" />
              )}
              <span className="text-xs text-gray-400">· {formatTimeAgo(answer.createdAt)}</span>
            </div>

            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
              {answer.content}
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => handleLikeAnswer(answer.id)}
                className={cn(
                  'flex items-center gap-1.5 text-sm transition-colors',
                  isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'
                )}
              >
                <Heart className={cn('w-4 h-4', isLiked ? 'fill-rose-500' : '')} />
                <span>{answer.likes + (isLiked ? 1 : 0)}</span>
              </button>
              <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>回复</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/community')}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
        </button>
        <div>
          <p className="text-sm text-gray-500">
            <span className="hover:text-pink-500 cursor-pointer" onClick={() => navigate('/community')}>
              社区问答
            </span>
            <span className="mx-1">/</span>
            <span>{topic?.title || '问题详情'}</span>
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
                {question.topicName}
              </span>
              {question.isAnonymous && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                  匿名
                </span>
              )}
              {question.hasFeaturedAnswer && (
                <span className="text-xs bg-emerald-100 text-emerald-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Award className="w-3 h-3" /> 已获精选解答
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-4">{question.title}</h1>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {question.tags.map((tag) => (
                <span
                  key={tag.id}
                  className={cn('text-xs px-2.5 py-1 rounded-full', tag.color)}
                >
                  #{tag.name}
                </span>
              ))}
            </div>

            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">
              {question.content}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-medium">
                  {question.authorName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{question.authorName}</p>
                  <p className="text-xs text-gray-400">{formatTimeAgo(question.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleLikeQuestion}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all',
                    likedQuestion
                      ? 'bg-rose-50 text-rose-500'
                      : 'bg-gray-50 text-gray-500 hover:bg-rose-50 hover:text-rose-500'
                  )}
                >
                  <Heart className={cn('w-4 h-4', likedQuestion ? 'fill-rose-500' : '')} />
                  <span className="text-sm">{question.likes + (likedQuestion ? 1 : 0)}</span>
                </button>
                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all',
                    bookmarked
                      ? 'bg-amber-50 text-amber-500'
                      : 'bg-gray-50 text-gray-500 hover:bg-amber-50 hover:text-amber-500'
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

            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>{question.views} 浏览</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" />
                <span>{question.answerCount} 回答</span>
              </div>
            </div>
          </div>

          {featuredAnswer && (
            <div>
              <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-500" />
                精选解答
              </h2>
              {renderAnswerCard(featuredAnswer, true)}
            </div>
          )}

          <div>
            <h2 className="font-bold text-lg text-gray-800 mb-4">
              全部回答 <span className="text-gray-400 font-normal">({otherAnswers.length})</span>
            </h2>
            {otherAnswers.length > 0 ? (
              <div className="space-y-4">
                {otherAnswers.map((answer) => renderAnswerCard(answer))}
              </div>
            ) : (
              <div className="card p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">暂无其他回答，快来发表你的见解吧！</p>
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">撰写回答</h3>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">匿名回答</span>
                <button
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={cn(
                    'w-10 h-5 rounded-full transition-all relative',
                    isAnonymous ? 'bg-pink-500' : 'bg-gray-300'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all',
                      isAnonymous ? 'left-5.5' : 'left-0.5'
                    )}
                    style={{ left: isAnonymous ? '22px' : '2px' }}
                  />
                </button>
              </div>
            </div>

            <textarea
              placeholder="分享你的经验和见解，帮助更多有需要的人..."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none mb-4"
            />

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                💡 尊重他人，友善交流，专业问题建议咨询医生
              </p>
              <button
                onClick={handleSubmitAnswer}
                disabled={!newAnswer.trim()}
                className={cn(
                  'flex items-center gap-2 px-6 py-2.5 rounded-full font-medium shadow-lg transition-all',
                  newAnswer.trim()
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                <Send className="w-4 h-4" />
                提交回答
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {topic && (
            <div className="card p-5">
              <h3 className="font-bold text-gray-800 mb-4">话题信息</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-3xl shadow-sm">
                  {topic.icon}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{topic.title}</h4>
                  <p className="text-xs text-gray-500">{topic.questionCount} 个问题</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">{topic.description}</p>
              <span className={cn('text-xs px-2.5 py-1 rounded-full', stageInfo.color)}>
                {stageInfo.label}
              </span>
            </div>
          )}

          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-4">社区公约</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-0.5">•</span>
                <span>尊重他人隐私，不泄露个人信息</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-0.5">•</span>
                <span>友善交流，避免攻击性言论</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-0.5">•</span>
                <span>分享真实经验，不发布广告</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-0.5">•</span>
                <span>专业问题请咨询医生，社区建议仅供参考</span>
              </li>
            </ul>
          </div>

          <div className="card p-5 bg-gradient-to-br from-pink-50 to-rose-50">
            <div className="text-center">
              <div className="text-4xl mb-3">💝</div>
              <h3 className="font-bold text-gray-800 mb-2">温馨提示</h3>
              <p className="text-sm text-gray-600 mb-4">
                社区问答仅作为经验分享，不能替代专业医疗建议。如有身体不适，请及时就医。
              </p>
              <button className="w-full py-2.5 bg-white text-pink-500 rounded-xl font-medium hover:bg-pink-50 transition-colors">
                了解更多
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
