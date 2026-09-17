import React, { useState } from 'react';
import { MessageSquare, Trash2, Send, Sparkles, Lock } from 'lucide-react';
import { Comment } from '../types';
import { formatRelativeTime, getRandomNickname } from '../utils/date';
import PasswordPromptModal from './PasswordPromptModal';

interface CommentSectionProps {
  comments: Comment[];
  postId: string;
  onAddComment: (data: {
    post_id: string;
    content: string;
    nickname: string;
    password_hash: string;
  }) => Promise<void>;
  onDeleteComment: (commentId: string, password: string) => Promise<boolean>;
}

export default function CommentSection({
  comments,
  postId,
  onAddComment,
  onDeleteComment,
}: CommentSectionProps) {
  const [content, setContent] = useState('');
  const [nickname, setNickname] = useState('익명');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Password modal for comment deletion
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleRandomNickname = () => {
    setNickname(getRandomNickname());
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('댓글 내용을 입력하세요.');
      return;
    }
    if (!password.trim()) {
      setError('삭제용 비밀번호를 입력하세요.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onAddComment({
        post_id: postId,
        content: content.trim(),
        nickname: nickname.trim() || '익명',
        password_hash: password.trim(),
      });
      setContent('');
      setPassword('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '댓글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-4 border-t border-slate-100 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-[#073991] uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-[#073991]" />
          <span>댓글 {comments.length}개</span>
        </h4>
      </div>

      {/* Comment List */}
      <div className="space-y-2.5">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center bg-slate-50/70 rounded-xl">
            가장 먼저 첫 댓글을 남겨보세요.
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col gap-1.5 group transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1D5276]">{comment.nickname}</span>
                  <span className="text-slate-400 text-[11px]">{formatRelativeTime(comment.created_at)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(comment.id)}
                  className="text-slate-400 hover:text-[#DC2626] transition-colors p-1 rounded-md opacity-70 group-hover:opacity-100 cursor-pointer"
                  title="댓글 삭제"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* New Comment Input */}
      <form onSubmit={handleCreateComment} className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#1D5276]">익명 댓글 쓰기</span>
          <button
            type="button"
            onClick={handleRandomNickname}
            className="text-[11px] text-[#073991] hover:text-[#1D5276] font-medium flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>랜덤 닉네임</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="px-2.5 py-1.5 bg-[#FFFFFF] border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#073991] focus:border-[#073991]"
            maxLength={15}
          />
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-3 h-3" />
            </div>
            <input
              type="password"
              placeholder="삭제용 비번"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1.5 bg-[#FFFFFF] border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#073991] focus:border-[#073991]"
              maxLength={20}
            />
          </div>
        </div>

        <div className="relative">
          <textarea
            rows={2}
            placeholder="익명으로 따뜻한 댓글을 남겨보세요..."
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError('');
            }}
            className="w-full p-2.5 bg-[#FFFFFF] border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#073991] focus:border-[#073991] resize-none leading-relaxed"
          />
        </div>

        {error && (
          <p className="text-[11px] text-[#DC2626] font-medium">{error}</p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-3.5 py-1.5 bg-[#073991] hover:bg-[#1D5276] text-[#FFFFFF] rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3 h-3" />
            <span>{submitting ? '등록 중...' : '댓글 등록'}</span>
          </button>
        </div>
      </form>

      {/* Delete Comment Password Prompt Modal */}
      <PasswordPromptModal
        isOpen={!!deleteTargetId}
        title="댓글 삭제"
        description="댓글 작성 시 설정한 비밀번호를 입력해 주세요."
        confirmLabel="삭제하기"
        isDestructive={true}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={async (pwd) => {
          if (!deleteTargetId) return;
          const ok = await onDeleteComment(deleteTargetId, pwd);
          return ok;
        }}
      />
    </div>
  );
}
