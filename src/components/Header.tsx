import { Plus, LogOut, Mail, User } from 'lucide-react';
import CompanyLogo from './CompanyLogo';
import { MEMBERS } from '../types';

interface HeaderProps {
  currentUserCode: string;
  onLogout: () => void;
  onOpenWriteModal: () => void;
  onOpenInboxModal: () => void;
  unreadNotesCount: number;
}

export default function Header({
  currentUserCode,
  onLogout,
  onOpenWriteModal,
  onOpenInboxModal,
  unreadNotesCount,
}: HeaderProps) {
  const currentMember = MEMBERS[currentUserCode] || {
    code: currentUserCode,
    name: '사내 구성원',
    role: '사내 구성원',
  };

  return (
    <header className="sticky top-0 z-30 bg-[#073991] border-b border-[#1D5276] shadow-md">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFFFFF] p-1.5 flex items-center justify-center shadow-xs">
            <CompanyLogo className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg sm:text-xl text-[#FFFFFF] tracking-tight">익명 게시판</h1>
              {/* Logged in member badge without exposing the secret numeric code */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 text-[#FFFFFF] border border-white/30 shadow-2xs">
                <User className="w-3 h-3 text-sky-200" />
                <span>{currentMember.name}</span>
              </span>
            </div>
            <p className="text-[11px] text-white/75 hidden sm:block">
              자유롭고 솔직한 임직원 익명 소통 공간
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Note Inbox button */}
          <button
            id="header-inbox-btn"
            onClick={onOpenInboxModal}
            className="relative flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF]/15 hover:bg-[#FFFFFF]/25 text-[#FFFFFF] rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-[#FFFFFF]/20"
            title={`${currentMember.name} 전용 쪽지함 열기`}
          >
            <Mail className="w-3.5 h-3.5 text-[#FFFFFF]" />
            <span className="hidden sm:inline">쪽지함</span>
            {unreadNotesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#DC2626] text-white animate-pulse">
                {unreadNotesCount}
              </span>
            )}
          </button>

          {/* Write post button */}
          <button
            id="header-write-post-btn"
            onClick={onOpenWriteModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-slate-100 active:bg-slate-200 text-[#073991] rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#073991]" />
            <span>글쓰기</span>
          </button>

          {/* Logout button */}
          <button
            id="header-logout-btn"
            onClick={onLogout}
            className="flex items-center gap-1 text-xs sm:text-sm text-white/80 hover:text-[#FFFFFF] px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer font-medium"
            title="로그아웃"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/80" />
            <span className="hidden sm:inline">로그아웃</span>
          </button>
        </div>
      </div>
    </header>
  );
}
