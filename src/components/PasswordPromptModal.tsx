import React, { useState } from 'react';
import { KeyRound, X, AlertCircle } from 'lucide-react';

interface PasswordPromptModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<boolean | void>;
}

export default function PasswordPromptModal({
  isOpen,
  title,
  description = '작성 시 입력했던 비밀번호를 입력해 주세요.',
  confirmLabel = '확인',
  isDestructive = false,
  onClose,
  onConfirm,
}: PasswordPromptModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('비밀번호를 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await onConfirm(password);
      if (res === false) {
        setError('비밀번호가 일치하지 않습니다.');
      } else {
        setPassword('');
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '비밀번호 검증에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDestructive ? 'bg-red-50 text-[#DC2626]' : 'bg-[#073991]/10 text-[#073991]'}`}>
              <KeyRound className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-[#073991] text-sm">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-[#1D5276]/80">{description}</p>

          <div>
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#073991]/20 focus:border-[#073991]"
              autoFocus
            />
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-[#DC2626]/30 rounded-lg text-xs font-medium text-[#DC2626] flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-xs font-semibold text-[#FFFFFF] rounded-lg shadow-xs transition-colors cursor-pointer ${
                isDestructive
                  ? 'bg-[#DC2626] hover:bg-red-700'
                  : 'bg-[#073991] hover:bg-[#1D5276]'
              } disabled:opacity-50`}
            >
              {loading ? '확인 중...' : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
