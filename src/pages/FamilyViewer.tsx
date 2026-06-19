import { useState, useEffect } from 'react';
import {
  Users,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Check,
  Heart,
  Shield,
  Activity,
  Home,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import type { FamilyRelation } from '@/types';
import { cn } from '@/lib/utils';
import { MaskedDataCards } from '@/components/family/MaskedDataCards';

const relationLabels: Record<FamilyRelation, string> = {
  partner: '伴侣',
  mother: '母亲',
  father: '父亲',
  other: '其他',
};

const relationColors: Record<FamilyRelation, string> = {
  partner: 'from-rose-400 to-pink-500',
  mother: 'from-lavender-400 to-purple-500',
  father: 'from-sky-400 to-blue-500',
  other: 'from-gray-400 to-gray-500',
};

const VIEWER_STORAGE_KEY = 'family-viewer-member-id';

export default function FamilyViewer() {
  const navigate = useNavigate();
  const { familyMembers, redeemShareCode, getMaskedHealthData } = useAppStore();

  const [storedMemberId, setStoredMemberId] = useState<string | null>(null);
  const [redeemCodeInput, setRedeemCodeInput] = useState('');
  const [redeemName, setRedeemName] = useState('');
  const [redeemRelation, setRedeemRelation] = useState<FamilyRelation>('partner');
  const [redeemError, setRedeemError] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState(false);
  const [selectedViewerId, setSelectedViewerId] = useState<string | null>(null);
  const [showSwitcher, setShowSwitcher] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(VIEWER_STORAGE_KEY);
    if (saved) {
      const exists = familyMembers.find((m) => m.id === saved);
      if (exists) {
        setStoredMemberId(saved);
        setSelectedViewerId(saved);
      }
    }
  }, [familyMembers]);

  const selectedViewer = familyMembers.find((m) => m.id === selectedViewerId);
  const viewerData = selectedViewer ? getMaskedHealthData(selectedViewer.permissions) : null;

  const hasAnyData = selectedViewer && viewerData
    ? Object.keys(viewerData).some((k) => viewerData[k as keyof typeof viewerData] !== undefined)
    : false;

  const handleRedeemCode = () => {
    setRedeemError('');
    setRedeemSuccess(false);
    if (!redeemCodeInput.trim()) {
      setRedeemError('请输入共享码');
      return;
    }
    if (!redeemName.trim()) {
      setRedeemError('请输入您的称呼');
      return;
    }
    const member = redeemShareCode(
      redeemCodeInput.trim().toUpperCase(),
      redeemName.trim(),
      redeemRelation
    );
    if (!member) {
      setRedeemError('共享码无效、已使用或已过期');
      return;
    }
    setRedeemSuccess(true);
    setSelectedViewerId(member.id);
    setStoredMemberId(member.id);
    localStorage.setItem(VIEWER_STORAGE_KEY, member.id);
    setRedeemCodeInput('');
    setRedeemName('');
    setRedeemRelation('partner');
  };

  const handleSwitchIdentity = (id: string) => {
    setSelectedViewerId(id);
    setStoredMemberId(id);
    localStorage.setItem(VIEWER_STORAGE_KEY, id);
    setShowSwitcher(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(VIEWER_STORAGE_KEY);
    setStoredMemberId(null);
    setSelectedViewerId(null);
    setShowSwitcher(false);
  };

  const anyMemberExists = familyMembers.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-8 md:mb-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-sky-400 via-blue-400 to-indigo-500 flex items-center justify-center shadow-xl shadow-sky-200/50">
          <Eye className="w-10 h-10 text-white" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          家人查看端
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          以家人视角查看被授权的脱敏健康数据，时刻给予关怀
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          <Home className="w-4 h-4" />返回首页
        </button>
      </div>

      {!storedMemberId ? (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
              <LogIn className="w-5 h-5 text-primary-500" />兑换共享码
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              输入对方分享的 6 位共享码，即可加入家庭共享空间
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">共享码</label>
                  <input
                    type="text"
                    value={redeemCodeInput}
                    onChange={(e) => {
                      setRedeemCodeInput(e.target.value.toUpperCase());
                      setRedeemError('');
                      setRedeemSuccess(false);
                    }}
                    placeholder="6位共享码"
                    maxLength={6}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-mono text-center text-lg tracking-widest"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">您的称呼</label>
                  <input
                    type="text"
                    value={redeemName}
                    onChange={(e) => {
                      setRedeemName(e.target.value);
                      setRedeemError('');
                      setRedeemSuccess(false);
                    }}
                    placeholder="例如：老公"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">关系</label>
                  <select
                    value={redeemRelation}
                    onChange={(e) => setRedeemRelation(e.target.value as FamilyRelation)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all bg-white"
                  >
                    {(Object.keys(relationLabels) as FamilyRelation[]).map((r) => (
                      <option key={r} value={r}>
                        {relationLabels[r]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {redeemError && (
                <div className="flex items-center gap-2 text-rose-500 text-sm bg-rose-50 px-4 py-2.5 rounded-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {redeemError}
                </div>
              )}

              {redeemSuccess && (
                <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 px-4 py-2.5 rounded-xl">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  兑换成功！已加入家庭共享空间
                </div>
              )}

              <button
                onClick={handleRedeemCode}
                disabled={!redeemCodeInput.trim() || !redeemName.trim()}
                className="w-full bg-gradient-to-r from-primary-400 to-lavender-500 text-white py-3 rounded-xl font-medium shadow-lg shadow-primary-200/50 hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogIn className="w-5 h-5" />
                兑换共享码并进入
              </button>
            </div>
          </div>

          {anyMemberExists && (
            <div className="card p-6 bg-gradient-to-br from-primary-50/60 to-lavender-50/60 border-2 border-primary-100">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary-500" />
                或选择已授权的身份直接查看
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {familyMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSwitchIdentity(m.id)}
                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-primary-300 transition-all shadow-sm hover:shadow-md"
                  >
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center shadow-sm',
                        relationColors[m.relation]
                      )}
                    >
                      <Heart className="w-6 h-6 text-white" fill="white" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-800 text-sm">{m.name}</p>
                      <p className="text-xs text-gray-500">{relationLabels[m.relation]}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {selectedViewer && (
                  <div
                    className={cn(
                      'w-14 h-14 rounded-full bg-gradient-to-br flex items-center justify-center shadow-md',
                      relationColors[selectedViewer.relation]
                    )}
                  >
                    <Heart className="w-7 h-7 text-white" fill="white" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    你好，{selectedViewer?.name || '家人'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {selectedViewer && relationLabels[selectedViewer.relation]} ·
                    当前可查看 {selectedViewer ? Object.values(selectedViewer.permissions).filter(Boolean).length : 0} 类数据
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSwitcher(true)}
                  className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 font-medium transition-all flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  切换身份
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg text-sm text-rose-500 hover:bg-rose-50 font-medium transition-all"
                >
                  退出
                </button>
              </div>
            </div>

            {showSwitcher && (
              <div className="mb-6 p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-gray-700 text-sm">选择身份</p>
                  <button
                    onClick={() => setShowSwitcher(false)}
                    className="text-gray-400 hover:text-gray-600 text-xs"
                  >
                    收起
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {familyMembers.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSwitchIdentity(m.id)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all',
                        selectedViewerId === m.id
                          ? 'border-primary-400 bg-primary-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      )}
                    >
                      <div
                        className={cn(
                          'w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center',
                          relationColors[m.relation]
                        )}
                      >
                        <Heart className="w-4 h-4 text-white" fill="white" />
                      </div>
                      <p className="text-xs font-medium text-gray-800">{m.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedViewer && (
              <div className="p-4 bg-gradient-to-br from-primary-50/40 to-lavender-50/40 rounded-2xl mb-2">
                <div className="flex items-start gap-2 mb-2">
                  <Shield className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    您已被授权查看以下类别的脱敏健康数据。原始详细记录不可见，仅展示对关怀有意义的摘要信息。
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="card p-6 bg-gradient-to-br from-gray-50 to-white">
            <div className="flex items-center gap-2 mb-6">
              <Eye className="w-5 h-5 text-gray-400" />
              <h3 className="font-bold text-gray-700">共享数据</h3>
            </div>

            {!selectedViewer || !viewerData ? null : !hasAnyData || Object.values(selectedViewer.permissions).every((v) => !v) ? (
              <div className="text-center py-12">
                <EyeOff className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                {Object.values(selectedViewer.permissions).every((v) => !v) ? (
                  <p className="text-gray-500">对方尚未授予您任何数据查看权限</p>
                ) : (
                  <p className="text-gray-500">暂无可查看的健康数据</p>
                )}
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
                  <span>以「{selectedViewer.name}」的身份查看</span>
                  <span>·</span>
                  <span>仅展示脱敏后的摘要数据</span>
                </div>
                <MaskedDataCards data={viewerData} permissions={selectedViewer.permissions} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
