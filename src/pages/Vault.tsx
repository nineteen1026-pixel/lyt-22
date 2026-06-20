import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Lock,
  Unlock,
  Plus,
  X,
  Trash2,
  PenLine,
  Heart,
  Eye,
  EyeOff,
  Settings,
  AlertTriangle,
  Fingerprint,
  Clock,
} from 'lucide-react';
import { useVaultStore } from '@/store/useVaultStore';
import { cn } from '@/lib/utils';

const emotionOptions = [
  { id: 'calm', name: '平静', icon: '😌', color: 'from-sky-400 to-blue-500' },
  { id: 'sad', name: '低落', icon: '😢', color: 'from-indigo-400 to-purple-500' },
  { id: 'anxious', name: '焦虑', icon: '😰', color: 'from-amber-400 to-yellow-500' },
  { id: 'angry', name: '愤怒', icon: '😤', color: 'from-red-400 to-rose-600' },
  { id: 'confused', name: '困惑', icon: '😕', color: 'from-gray-400 to-slate-500' },
  { id: 'hopeful', name: '期待', icon: '🌟', color: 'from-emerald-400 to-teal-500' },
  { id: 'grateful', name: '感恩', icon: '🥰', color: 'from-pink-400 to-rose-500' },
  { id: 'lonely', name: '孤独', icon: '🥺', color: 'from-violet-400 to-indigo-500' },
];

const tagOptions = ['自我对话', '亲密关系', '身体感受', '压力释放', '成长感悟', '秘密心愿', '疗愈时刻', '深夜思绪'];

export default function Vault() {
  const {
    entries,
    isUnlocked,
    hasPin,
    setupPin,
    unlock,
    lock,
    addEntry,
    deleteEntry,
    changePin,
  } = useVaultStore();

  const [pinInput, setPinInput] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStep, setPinStep] = useState<'set' | 'confirm'>('set');
  const [pinError, setPinError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newPinConfirm, setNewPinConfirm] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  const [emotion, setEmotion] = useState('calm');
  const [intensity, setIntensity] = useState(5);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const needsSetup = !hasPin();

  const handlePinDigit = useCallback((digit: string) => {
    setPinInput((prev) => {
      if (prev.length >= 6) return prev;
      return prev + digit;
    });
  }, []);

  const handlePinDelete = useCallback(() => {
    setPinInput((prev) => prev.slice(0, -1));
  }, []);

  useEffect(() => {
    if (needsSetup || isUnlocked) return;
    if (pinInput.length !== 4 && pinInput.length !== 6) return;

    const verify = async () => {
      setIsUnlocking(true);
      const ok = await unlock(pinInput);
      if (ok) {
        setPinInput('');
        setPinError('');
      } else {
        setPinError('PIN 码错误，请重试');
        setTimeout(() => {
          setPinInput('');
          setPinError('');
        }, 1500);
      }
      setIsUnlocking(false);
    };
    verify();
  }, [pinInput, needsSetup, isUnlocked, unlock]);

  const handleSetupPin = async () => {
    if (pinStep === 'set') {
      if (pinInput.length < 4) {
        setPinError('PIN 码至少4位');
        return;
      }
      setConfirmPin(pinInput);
      setPinInput('');
      setPinStep('confirm');
      setPinError('');
      return;
    }
    if (pinInput !== confirmPin) {
      setPinError('两次输入不一致，请重新设置');
      setPinInput('');
      setPinStep('set');
      return;
    }
    await setupPin(pinInput);
    setPinInput('');
    setConfirmPin('');
    setPinStep('set');
  };

  const handleSaveEntry = async () => {
    if (!content.trim()) return;
    const now = new Date();
    await addEntry({
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      emotion,
      intensity,
      content: content.trim(),
      tags: tags.length > 0 ? tags : undefined,
    });
    setShowAddModal(false);
    setContent('');
    setIntensity(5);
    setEmotion('calm');
    setTags([]);
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleChangePin = async () => {
    if (newPin !== newPinConfirm) {
      setPinChangeError('两次输入不一致');
      return;
    }
    if (newPin.length < 4) {
      setPinChangeError('PIN 码至少4位');
      return;
    }
    const ok = await changePin(oldPin, newPin);
    if (ok) {
      setPinChangeSuccess(true);
      setTimeout(() => {
        setShowSettings(false);
        setOldPin('');
        setNewPin('');
        setNewPinConfirm('');
        setPinChangeError('');
        setPinChangeSuccess(false);
      }, 1500);
    } else {
      setPinChangeError('原 PIN 码错误');
    }
  };

  const renderPinPad = (onSubmit?: () => void) => (
    <div className="w-full max-w-xs mx-auto">
      <div className="flex justify-center gap-3 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-3.5 h-3.5 rounded-full transition-all duration-200',
              i < pinInput.length
                ? 'bg-violet-500 scale-110'
                : 'bg-gray-200'
            )}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map(
          (key) => {
            if (key === '') return <div key="empty" />;
            if (key === 'del') {
              return (
                <button
                  key="del"
                  onClick={handlePinDelete}
                  className="h-14 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors active:scale-95"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                    <line x1="18" y1="9" x2="12" y2="15" />
                    <line x1="12" y1="9" x2="18" y2="15" />
                  </svg>
                </button>
              );
            }
            return (
              <button
                key={key}
                onClick={() => handlePinDigit(key)}
                disabled={isUnlocking}
                className="h-14 rounded-xl flex items-center justify-center text-xl font-semibold text-gray-800 bg-gray-50 hover:bg-gray-100 transition-all active:scale-95 active:bg-gray-200 disabled:opacity-50"
              >
                {key}
              </button>
            );
          }
        )}
      </div>
      {onSubmit && pinInput.length >= 4 && (
        <button
          onClick={onSubmit}
          className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all"
        >
          确认
        </button>
      )}
    </div>
  );

  if (needsSetup) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-300/50 mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">私密保险库</h1>
          <p className="text-gray-500 mb-8 text-center">
            设置 PIN 码以保护你的私密日记<br />
            <span className="text-xs text-gray-400">PIN 码为4-6位数字，请牢记</span>
          </p>

          {pinError && (
            <div className="mb-4 px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {pinError}
            </div>
          )}

          <p className="text-sm text-gray-600 mb-4">
            {pinStep === 'set' ? '请输入 PIN 码' : '请再次确认 PIN 码'}
          </p>
          {renderPinPad(handleSetupPin)}

          {pinInput.length >= 4 && (
            <button
              onClick={handleSetupPin}
              className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all"
            >
              {pinStep === 'set' ? '下一步' : '确认设置'}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-300/50 mb-6 relative">
            <Lock className="w-10 h-10 text-white" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-violet-400 rounded-full animate-ping opacity-75" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">私密保险库</h1>
          <p className="text-gray-500 mb-8">输入 PIN 码解锁</p>

          {pinError && (
            <div className="mb-4 px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {pinError}
            </div>
          )}

          {isUnlocking && (
            <p className="text-sm text-violet-500 mb-4 animate-pulse">验证中...</p>
          )}
          {renderPinPad()}
        </div>
      </div>
    );
  }

  const detailEntry = entries.find((e) => e.id === selectedEntry);
  const emotionMeta = emotionOptions.find((e) => e.id === emotion);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200/50">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-800">私密保险库</h1>
              <p className="text-gray-500">你的私人情绪空间，安全加密</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">设置</span>
            </button>
            <button
              onClick={lock}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
            >
              <Lock className="w-4 h-4" />
              锁定
            </button>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6 bg-gradient-to-r from-violet-400 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-white/80 text-sm mb-1">加密存储</p>
            <h2 className="font-display text-4xl font-bold mb-1">
              {entries.length} 篇日记
            </h2>
            <p className="text-white/90 text-sm flex items-center gap-2">
              <Unlock className="w-4 h-4" />
              AES-256 加密 · 数据仅存于本地
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-3xl mb-1">🔐</div>
              <p className="text-xs text-white/80">加密保护</p>
              <p className="font-bold">PIN 码</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">🛡️</div>
              <p className="text-xs text-white/80">数据隔离</p>
              <p className="font-bold">独立存储</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-violet-500" />
          私密日记
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          写日记
        </button>
      </div>

      {entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map((entry) => {
            const entryEmotion = emotionOptions.find((e) => e.id === entry.emotion);
            return (
              <button
                key={entry.id}
                onClick={() => {
                  setSelectedEntry(entry.id);
                  setShowDetailModal(true);
                }}
                className="w-full card p-5 text-left card-hover group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{entryEmotion?.icon || '🔒'}</span>
                    <div>
                      <p className="font-medium text-gray-800">{entryEmotion?.name || '私密'}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {entry.date} {entry.time}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-violet-500 bg-violet-50 px-2 py-1 rounded-full">
                    {entry.intensity}/10
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {entry.content}
                </p>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-50 flex items-center justify-center">
            <Heart className="w-8 h-8 text-violet-300" />
          </div>
          <p className="text-gray-400 mb-2">这里还是空的</p>
          <p className="text-sm text-gray-300">点击「写日记」记录你的私密心事</p>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <PenLine className="w-5 h-5 text-violet-500" />
                写私密日记
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">此刻感受</label>
                <div className="grid grid-cols-4 gap-2">
                  {emotionOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setEmotion(opt.id)}
                      className={cn(
                        'p-2 rounded-xl text-center transition-all',
                        emotion === opt.id
                          ? 'bg-gradient-to-br from-violet-100 to-purple-100 ring-2 ring-violet-400'
                          : 'bg-gray-50 hover:bg-gray-100'
                      )}
                    >
                      <span className="text-2xl block mb-1">{opt.icon}</span>
                      <span className="text-xs text-gray-600">{opt.name}</span>
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
                  className="w-full accent-violet-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  写下你的心事
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="在这里，只有你自己能看到..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">标签 (可选)</label>
                <div className="flex flex-wrap gap-2">
                  {tagOptions.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        'px-3 py-1 rounded-full text-sm transition-all',
                        tags.includes(tag)
                          ? 'bg-violet-100 text-violet-600 border border-violet-300'
                          : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-violet-50'
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-violet-50 rounded-xl">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-violet-600">🔒 安全提示：</span>
                  内容经 AES-256 加密存储，仅你能解密查看。忘记 PIN 码将无法恢复数据。
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEntry}
                  disabled={!content.trim()}
                  className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  加密保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && detailEntry && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">日记详情</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await deleteEntry(detailEntry.id);
                    setShowDetailModal(false);
                  }}
                  className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {emotionOptions.find((e) => e.id === detailEntry.emotion)?.icon || '🔒'}
                </span>
                <div>
                  <p className="font-bold text-gray-800 text-lg">
                    {emotionOptions.find((e) => e.id === detailEntry.emotion)?.name || '私密'}
                  </p>
                  <p className="text-sm text-gray-500">{detailEntry.date} {detailEntry.time}</p>
                </div>
                <span className="ml-auto text-sm font-medium text-violet-500 bg-violet-50 px-3 py-1 rounded-full">
                  强度 {detailEntry.intensity}/10
                </span>
              </div>

              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {detailEntry.content}
                </p>
              </div>

              {detailEntry.tags && detailEntry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {detailEntry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-400 pt-2">
                <Lock className="w-3 h-3" />
                已加密存储 · 创建于 {new Date(detailEntry.createdAt).toLocaleString('zh-CN')}
              </div>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">保险库设置</h2>
              <button
                onClick={() => {
                  setShowSettings(false);
                  setOldPin('');
                  setNewPin('');
                  setNewPinConfirm('');
                  setPinChangeError('');
                  setPinChangeSuccess(false);
                }}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-violet-50 flex items-start gap-3">
                <Shield className="w-5 h-5 text-violet-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800 text-sm">安全状态</p>
                  <p className="text-xs text-gray-500 mt-1">
                    保险库已通过 PIN 码加密保护。数据使用 AES-256-GCM 加密算法，独立于普通情绪日记存储。
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">原 PIN 码</label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="输入当前 PIN 码"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all pr-10"
                  />
                  <button
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">新 PIN 码</label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="输入新 PIN 码 (4-6位)"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">确认新 PIN 码</label>
                <input
                  type="password"
                  value={newPinConfirm}
                  onChange={(e) => setNewPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="再次输入新 PIN 码"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>

              {pinChangeError && (
                <div className="px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {pinChangeError}
                </div>
              )}

              {pinChangeSuccess && (
                <div className="px-4 py-2 rounded-lg bg-green-50 text-green-600 text-sm">
                  ✅ PIN 码修改成功
                </div>
              )}

              <button
                onClick={handleChangePin}
                disabled={!oldPin || !newPin || !newPinConfirm}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                修改 PIN 码
              </button>

              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="text-sm text-amber-700">
                  <strong>⚠️ 重要提示：</strong>忘记 PIN 码将无法恢复保险库数据。请务必牢记你的 PIN 码。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
