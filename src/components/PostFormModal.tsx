import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send, PenSquare, Lock } from 'lucide-react';
import { Post, POST_CATEGORIES } from '../types';
import { getRandomNickname } from '../utils/date';

interface PostFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserCode?: string;
  onSubmit: (data: {
    title: string;
    content: string;
    nickname: string;
    password_hash: string;
    category: string;
    author_code?: string;
  }) => Promise<void>;
  editingPost?: Post | null;
}

export default function PostFormModal({
  isOpen,
  onClose,
  currentUserCode,
  onSubmit,
  editingPost,
}: PostFormModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [nickname, setNickname] = useState('익명');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState<string>('회사생활');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setContent(editingPost.content);
      setNickname(editingPost.nickname);
      setCategory(editingPost.category);
      setPassword('');
    } else {
      setTitle('');
      setContent('');
      setNickname('익명');
      setPassword('');
      setCategory('회사생활');
    }
    setError('');
  }, [editingPost, isOpen]);

  if (!isOpen) return null;

  const handleRandomNickname = () => {
    setNickname(getRandomNickname());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('제목을 입력해 주세요.');
      return;
    }
    if (!content.trim()) {
      setError('내용을 입력해 주세요.');
      return;
    }
    if (!password.trim()) {
      setError(editingPost ? '수정을 위한 비밀번호를 입력해 주세요.' : '수정 및 삭제 시 필요한 비밀번호를 설정해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        nickname: nickname.trim() || '익명',
        password_hash: password.trim(),
        category,
        author_code: editingPost ? editingPost.author_code : (currentUserCode || '0613'),
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '게시글 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#073991]/10 text-[#073991] flex items-center justify-center">
              <PenSquare className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-[#073991] text-base">
              {editingPost ? '게시글 수정' : '새 익명 글쓰기'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-[#DC2626]/30 rounded-xl text-xs font-medium text-[#DC2626]">
              {error}
            </div>
          )}

          {/* Category selection */}
          <div>
            <label className="block text-xs font-semibold text-[#1D5276] uppercase tracking-wider mb-2">
              카테고리 선택
            </label>
            <div className="flex flex-wrap gap-2">
              {POST_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-[#073991] text-[#FFFFFF] shadow-xs'
                      : 'bg-slate-100 text-[#1D5276] hover:bg-[#1D5276]/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="post-title" className="block text-xs font-semibold text-[#1D5276] uppercase tracking-wider mb-1.5">
              제목
            </label>
            <input
              id="post-title"
              type="text"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#073991]/20 focus:border-[#073991]"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Nickname & Password row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="post-nickname" className="text-xs font-semibold text-[#1D5276] uppercase tracking-wider">
                  작성자 닉네임
                </label>
                <button
                  type="button"
                  onClick={handleRandomNickname}
                  className="text-xs text-[#073991] hover:text-[#1D5276] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>랜덤 생성</span>
                </button>
              </div>
              <input
                id="post-nickname"
                type="text"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#073991]/20 focus:border-[#073991]"
                placeholder="익명 또는 닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
              />
            </div>

            <div>
              <label htmlFor="post-password" className="block text-xs font-semibold text-[#1D5276] uppercase tracking-wider mb-1.5">
                비밀번호 {editingPost ? '(인증용 입력)' : '(수정/삭제용)'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  id="post-password"
                  type="password"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#073991]/20 focus:border-[#073991]"
                  placeholder="비밀번호 설정"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={20}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="post-content" className="block text-xs font-semibold text-[#1D5276] uppercase tracking-wider mb-1.5">
              내용
            </label>
            <textarea
              id="post-content"
              rows={6}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#073991]/20 focus:border-[#073991] resize-none leading-relaxed"
              placeholder="동료들과 나누고 싶은 이야기를 솔직하게 적어주세요. (건전한 사내 문화를 위해 비방이나 욕설은 자제해 주세요)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              id="submit-post-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#073991] hover:bg-[#1D5276] active:bg-[#073991] text-[#FFFFFF] rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? '저장 중...' : editingPost ? '수정 완료' : '글 등록'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
