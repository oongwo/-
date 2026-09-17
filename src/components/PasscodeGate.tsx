import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import LeeNTechLogo from './LeeNTechLogo';

interface PasscodeGateProps {
  onSuccess: (userCode: string) => void;
}

export default function PasscodeGate({ onSuccess }: PasscodeGateProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('leentech_custom_logo');
    if (saved) {
      setCustomLogoUrl(saved);
    }
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = passcode.trim();
    if (trimmed === '0613' || trimmed === '0828') {
      localStorage.setItem('isAuthorized', 'true');
      localStorage.setItem('currentUserCode', trimmed);
      onSuccess(trimmed);
    } else {
      setError('올바른 구성원 코드가 아닙니다. 등록된 코드를 확인해 주세요.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f9] p-4 font-sans antialiased text-slate-800">
      <div className="w-full max-w-md bg-[#FFFFFF] rounded-2xl shadow-xl border border-slate-200/90 p-8">
        <div className="text-center mb-8 flex flex-col items-center">
          {/* 업로드된 회사 원본 로고 고정 디스플레이 영역 */}
          <div className="w-full max-w-[300px] sm:max-w-[340px] px-4 py-3 mb-4 rounded-xl bg-white flex items-center justify-center border border-slate-200/80 shadow-2xs">
            {customLogoUrl ? (
              <img
                src={customLogoUrl}
                alt="LeeNTech 리앤테크(주) 원본 로고"
                className="w-full h-auto max-h-16 object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <LeeNTechLogo className="w-full h-auto max-h-16" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-[#073991] tracking-tight">회사 전용 익명 게시판</h2>
          <p className="text-[#1D5276]/80 text-sm mt-1.5 font-medium">
            사내 구성원 인증을 위해 본인의 로그인 코드를 입력해 주세요
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="company-passcode-input" className="block text-xs font-semibold text-[#1D5276] uppercase tracking-wider mb-2">
              구성원 인증 코드
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="company-passcode-input"
                type="password"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#073991]/20 focus:border-[#073991] transition-colors"
                placeholder="개인 인증 코드를 입력하세요"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-[#DC2626]/30 rounded-xl text-xs font-medium text-[#DC2626] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            id="company-login-submit-btn"
            type="submit"
            className="w-full bg-[#073991] hover:bg-[#1D5276] active:bg-[#073991] text-[#FFFFFF] py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span>입장하기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#073991] flex-shrink-0" />
            <span>인증 코드는 개인 전용 보안 식별 정보입니다</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            타인에게 공유되지 않도록 유의하세요. 분실 시 사내 관리자에게 문의 바랍니다.
          </p>
        </div>
      </div>
    </div>
  );
}
