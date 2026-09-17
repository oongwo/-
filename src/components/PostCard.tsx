import React, { useState } from 'react';
import { Heart, MessageSquare, MoreHorizontal, Edit3, Trash2, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { Post, Comment } from '../types';
import { formatRelativeTime } from '../utils/date';
import CommentSection from './CommentSection';

interface PostCardProps {
  key?: string;
  post: Post;
  isLiked: boolean;
  comments: Comment[];
  onToggleLike: (postId: string) => void;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
  onOpenSendNote: (post: Post) => void;
  onAddComment: (data: {
    post_id: string;
    content: string;
    nickname: string;
    password_hash: string;
  }) => Promise<void>;
  onDeleteComment: (commentId: string, password: string) => Promise<boolean>;
}

export default function PostCard({
  post,
  isLiked,
  comments,
  onToggleLike,
  onEdit,
  onDelete,
  onOpenSendNote,
  onAddComment,
  onDeleteComment,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [expandedContent, setExpandedContent] = useState(false);

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case '회사생활':
        return 'bg-[#073991]/10 text-[#073991] border-[#073991]/25';
      case '건의사항':
        return 'bg-[#1D5276]/10 text-[#1D5276] border-[#1D5276]/25';
      case '질문':
        return 'bg-sky-50 text-[#1D5276] border-sky-200';
      case '비밀이야기':
        return 'bg-red-50 text-[#DC2626] border-[#DC2626]/25';
      case '잡담':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const isLongContent = post.content.length > 180 || post.content.split('\n').length > 4;

  return (
    <article className="bg-[#FFFFFF] rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow p-5 relative overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getCategoryBadgeClass(post.category)}`}>
            {post.category || '일반'}
          </span>
          <span className="text-xs font-semibold text-[#1D5276]">{post.nickname}</span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-400">{formatRelativeTime(post.created_at)}</span>
        </div>

        {/* More dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="더보기"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-28 bg-[#FFFFFF] border border-slate-200 rounded-xl shadow-lg py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit(post);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-[#073991]/5 hover:text-[#073991] flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#073991]" />
                <span>수정</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete(post.id);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-[#DC2626] hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                <span>삭제</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Title & Content */}
      <h3 className="font-bold text-[#073991] text-base mb-2 leading-snug tracking-tight">
        {post.title}
      </h3>

      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-4">
        {isLongContent && !expandedContent ? (
          <>
            {post.content.slice(0, 180)}...
            <button
              onClick={() => setExpandedContent(true)}
              className="ml-1 text-[#073991] hover:text-[#1D5276] text-xs font-semibold inline-flex items-center gap-0.5 cursor-pointer"
            >
              더보기 <ChevronDown className="w-3 h-3" />
            </button>
          </>
        ) : (
          <>
            {post.content}
            {isLongContent && expandedContent && (
              <button
                onClick={() => setExpandedContent(false)}
                className="ml-2 text-[#073991] hover:text-[#1D5276] text-xs font-semibold inline-flex items-center gap-0.5 cursor-pointer"
              >
                접기 <ChevronUp className="w-3 h-3" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          {/* Like Button */}
          <button
            onClick={() => onToggleLike(post.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              isLiked
                ? 'bg-red-50 text-[#DC2626] border border-[#DC2626]/30'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#DC2626] text-[#DC2626]' : 'text-slate-400'}`} />
            <span>좋아요 {post.likes_count}</span>
          </button>

          {/* Comments Toggle Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              showComments
                ? 'bg-[#073991]/10 text-[#073991] border border-[#073991]/25'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <MessageSquare className={`w-3.5 h-3.5 ${showComments ? 'text-[#073991]' : 'text-slate-400'}`} />
            <span>댓글 {comments.length}</span>
          </button>

          {/* Send Note to Author Button */}
          <button
            onClick={() => onOpenSendNote(post)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold bg-slate-50 text-[#1D5276] hover:bg-[#1D5276]/10 border border-slate-200/80 transition-colors cursor-pointer"
            title="작성자에게 익명 쪽지 보내기"
          >
            <Mail className="w-3.5 h-3.5 text-[#1D5276]" />
            <span>쪽지</span>
          </button>
        </div>

        {/* Quick Edit/Delete link */}
        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
          <button
            onClick={() => onEdit(post)}
            className="hover:text-[#073991] underline cursor-pointer"
          >
            수정
          </button>
          <span>/</span>
          <button
            onClick={() => onDelete(post.id)}
            className="hover:text-[#DC2626] underline cursor-pointer"
          >
            삭제
          </button>
        </div>
      </div>

      {/* Expandable Comment Section */}
      {showComments && (
        <CommentSection
          comments={comments}
          postId={post.id}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
        />
      )}
    </article>
  );
}
