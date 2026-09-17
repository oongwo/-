import React, { useState } from 'react';
import { Send, X, Reply, Sparkles, AlertCircle, MessageSquare, Shield } from 'lucide-react';
import { Note, MEMBERS } from '../types';

interface ReplyNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalNote: Note | null;
  currentUserCode: string;
  onSendReply: (data: {
    post_id: string;
    post_title: string;
    recipient_nickname: string;
    recipient_code?: string;
    sender_nickname?: string;
    sender_code?: string;
    content: string;
    parent_note_id: string;
    reply_to_content: string;
  }) => Promise<boolean>;
}

export default function ReplyNoteModal({
  isOpen,
  onClose,
  originalNote,
  currentUserCode,
  onSendReply,
}: ReplyNoteModalProps) {
  const [senderNickname, setSenderNickname] = useState(
    originalNote ? originalNote.recipient_nickname : ''
  );
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Update default sender nickname if originalNote changes
  React.useEffect(() => {
    if (originalNote) {
      setSenderNickname(originalNote.recipient_nickname);
      setContent('');
      setError('');
    }
  }, [originalNote]);

  if (!isOpen || !originalNote) return null;

  const targetRecipientCode = originalNote.sender_code || (currentUserCode === '0613' ? '0828' : '0613');
  const targetRecipientMember = MEMBERS[targetRecipientCode] || { name: `구성원 (${targetRecipientCode})` };

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
      setError('회신할 쪽지 내용을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const ok = await onSendReply({
        post_id: originalNote.post_id,
        post_title: originalNote.post_title,
        recipient_nickname: originalNote.sender_nickname,
        recipient_code: targetRecipientCode,
        sender_nickname: senderNickname.trim() || originalNote.recipient_nickname,
        sender_code: currentUserCode,
        content: content.trim(),
        parent_note_id: originalNote.id,
        reply_to_content: originalNote.content,
      });

      if (ok) {
        setContent('');
        onClose();
      } else {
        setError('회신 쪽지 전송에 실패했습니다. 다시 시도해 주세요.');
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
              <Reply className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#073991] text-sm">쪽지 회신하기</h3>
              <p className="text-[11px] text-[#1D5276]/70 truncate max-w-[240px]">
                받는이: <span className="font-semibold text-[#1D5276]">{originalNote.sender_nickname}</span> 님
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
          {/* Original Note Preview Box */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-medium text-[#1D5276] flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                원문 쪽지 ({originalNote.sender_nickname})
              </span>
            </div>
            <p className="text-xs text-slate-600 line-clamp-3 bg-white/80 p-2 rounded-lg border border-slate-200/50 italic leading-relaxed">
              "{originalNote.content}"
            </p>
          </div>

          {/* Sender Nickname */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="reply-sender-nickname-input" className="text-xs font-semibold text-[#1D5276] uppercase tracking-wider">
                보내는 사람 닉네임
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
              id="reply-sender-nickname-input"
              type="text"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#073991]/20 focus:border-[#073991]"
              placeholder="내 닉네임 (예: 글 작성자 닉네임 또는 익명)"
              value={senderNickname}
              onChange={(e) => setSenderNickname(e.target.value)}
              maxLength={20}
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="reply-note-content-input" className="block text-xs font-semibold text-[#1D5276] uppercase tracking-wider mb-1.5">
              회신 내용
            </label>
            <textarea
              id="reply-note-content-input"
              rows={4}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#073991]/20 focus:border-[#073991] resize-none leading-relaxed"
              placeholder="보내주신 쪽지에 대한 답장을 작성해 주세요."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (error) setError('');
              }}
              maxLength={500}
              autoFocus
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
              <span>{isSubmitting ? '회신 전송 중...' : '회신 보내기'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
