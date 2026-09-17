import React, { useState } from 'react';
import { Send, X, Mail, Sparkles, AlertCircle, Shield } from 'lucide-react';
import { Post, MEMBERS } from '../types';

interface SendNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  currentUserCode: string;
  onSend: (data: {
    post_id: string;
    post_title: string;
    recipient_nickname: string;
    recipient_code?: string;
    sender_nickname?: string;
    sender_code?: string;
    content: string;
  }) => Promise<boolean>;
}

export default function SendNoteModal({
  isOpen,
  onClose,
  post,
  currentUserCode,
  onSend,
}: SendNoteModalProps) {
  const [senderNickname, setSenderNickname] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !post) return null;

  const recipientCode = post.author_code || '0613';
  const recipientMember = MEMBERS[recipientCode] || { name: `구성원 (${recipientCode})` };
  const currentMember = MEMBERS[currentUserCode] || { name: `구성원 (${currentUserCode})` };

  const handleRandomSender = () => {
    const adjectives = ['따뜻한', '비밀스런', '용기있는', '친절한', '익명의', '응원하는'];
    const nouns = ['동료', '직원', '루돌프', '커피러버', '동기', '선배'];
    const rAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const rNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 90 + 10);
    setSenderNickname(`${rAdj}${rNoun}${num}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('쪽지 내용을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const ok = await onSend({
        post_id: post.id,
        post_title: post.title,
        recipient_nickname: post.nickname,
        recipient_code: recipientCode,
        sender_nickname: senderNickname,
        sender_code: currentUserCode,
        content,
      });

      if (ok) {
        setContent('');
        setSenderNickname('');
        onClose();
      } else {
        setError('쪽지 전송에 실패했습니다. 다시 시도해 주세요.');
      }
    } catch {
      setError('오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-[#FFFFFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#073991]/10 text-[#073991] flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#073991] text-sm">작성자에게 익명 쪽지 보내기</h3>
              <p className="text-[11px] text-[#1D5276]/70 truncate max-w-[240px]">
                수신: <span className="font-semibold text-[#1D5276]">{post.nickname}</span> 님
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Post Reference Box */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-[#1D5276] uppercase tracking-wider block">
                관련 게시글
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                작성자: {post.nickname}
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium line-clamp-1">
              {post.title}
            </p>
          </div>

          {/* Recipient Isolation Info Banner */}
          <div className="p-2.5 bg-blue-50/60 rounded-xl border border-[#073991]/20 text-[11px] text-[#073991] flex items-start gap-2">
            <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#073991]" />
            <div className="leading-snug">
              이 쪽지는 해당 작성자 본인의 비공개 쪽지함으로만 안전하게 전달되며, 타 구성원은 열람할 수 없습니다.
            </div>
          </div>

          {/* Sender Nickname */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="sender-nickname-input" className="text-xs font-semibold text-[#1D5276] uppercase tracking-wider">
                보내는 사람 닉네임 (익명)
              </label>
              <button
                type="button"
                onClick={handleRandomSender}
                className="text-xs text-[#073991] hover:text-[#1D5276] font-medium flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>랜덤 생성</span>
              </button>
            </div>
            <input
              id="sender-nickname-input"
              type="text"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#073991]/20 focus:border-[#073991]"
              placeholder="미입력 시 '익명의 동료'로 전송됩니다"
              value={senderNickname}
              onChange={(e) => setSenderNickname(e.target.value)}
              maxLength={20}
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="note-content-input" className="block text-xs font-semibold text-[#1D5276] uppercase tracking-wider mb-1.5">
              쪽지 내용
            </label>
            <textarea
              id="note-content-input"
              rows={4}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#073991]/20 focus:border-[#073991] resize-none leading-relaxed"
              placeholder="게시글 작성자에게 전하고 싶은 이야기나 응원의 메시지를 솔직하게 남겨보세요."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (error) setError('');
              }}
              maxLength={500}
            />
            <div className="text-right text-[11px] text-slate-400 mt-1">
              {content.length}/500자
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-[#DC2626]/30 rounded-lg text-xs font-medium text-[#DC2626] flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#073991] hover:bg-[#1D5276] active:bg-[#073991] text-[#FFFFFF] rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? '전송 중...' : '쪽지 보내기'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
