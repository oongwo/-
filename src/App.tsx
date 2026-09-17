import React, { useState, useEffect, useCallback } from 'react';
import { Post, Comment, Note, Category, CATEGORIES } from './types';
import {
  apiFetchPosts,
  apiCreatePost,
  apiUpdatePost,
  apiDeletePost,
  apiToggleLike,
  apiFetchComments,
  apiCreateComment,
  apiDeleteComment,
  getLikedPostIds,
  getLocalNotes,
  apiSendNote,
  apiMarkNoteAsRead,
  apiDeleteNote,
} from './lib/supabase';
import PasscodeGate from './components/PasscodeGate';
import Header from './components/Header';
import PostCard from './components/PostCard';
import PostFormModal from './components/PostFormModal';
import PasswordPromptModal from './components/PasswordPromptModal';
import SendNoteModal from './components/SendNoteModal';
import NoteInboxModal from './components/NoteInboxModal';
import ReplyNoteModal from './components/ReplyNoteModal';
import { Search, Flame, Clock } from 'lucide-react';

export default function App() {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [currentUserCode, setCurrentUserCode] = useState<string>(
    () => localStorage.getItem('currentUserCode') || '0613'
  );
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'likes'>('latest');
  const [loading, setLoading] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [noteTargetPost, setNoteTargetPost] = useState<Post | null>(null);
  const [replyTargetNote, setReplyTargetNote] = useState<Note | null>(null);

  // Modals state
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deleteTargetPostId, setDeleteTargetPostId] = useState<string | null>(null);

  // Session verification from localStorage
  useEffect(() => {
    if (localStorage.getItem('isAuthorized') === 'true') {
      setIsAuthorized(true);
      const savedCode = localStorage.getItem('currentUserCode') || '0613';
      setCurrentUserCode(savedCode);
    }
  }, []);

  const handleLogout = () => {
    setIsAuthorized(false);
    localStorage.removeItem('isAuthorized');
    localStorage.removeItem('currentUserCode');
  };

  // Load notes isolated by recipient code
  const loadNotes = useCallback((code?: string) => {
    const targetCode = code || currentUserCode || localStorage.getItem('currentUserCode') || '0613';
    const loaded = getLocalNotes(targetCode);
    setNotes(loaded);
  }, [currentUserCode]);

  // Fetch posts
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetchPosts();
      setPosts(res.posts);
      setLikedPostIds(getLikedPostIds());
      loadNotes();

      // Fetch initial comments for each post
      const cMap: Record<string, Comment[]> = {};
      for (const p of res.posts) {
        const cList = await apiFetchComments(p.id);
        cMap[p.id] = cList;
      }
      setCommentsMap(cMap);
    } catch (e) {
      console.error('Error fetching posts:', e);
    } finally {
      setLoading(false);
    }
  }, [loadNotes]);

  useEffect(() => {
    if (isAuthorized) {
      loadPosts();
    }
  }, [isAuthorized, loadPosts]);

  // When currentUserCode changes, reload isolated notes
  useEffect(() => {
    if (isAuthorized) {
      loadNotes(currentUserCode);
    }
  }, [currentUserCode, isAuthorized, loadNotes]);

  // Note actions
  const handleSendNote = async (data: {
    post_id: string;
    post_title: string;
    recipient_nickname: string;
    recipient_code?: string;
    sender_nickname?: string;
    sender_code?: string;
    content: string;
  }) => {
    const res = await apiSendNote(data);
    if (res.success && res.note) {
      // Only append to the active inbox view if the recipient matches the current user
      if (res.note.recipient_code === currentUserCode) {
        setNotes((prev) => [res.note!, ...prev]);
      }
      return true;
    }
    return false;
  };

  const handleMarkNoteAsRead = async (noteId: string) => {
    await apiMarkNoteAsRead(noteId);
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, read: true } : n))
    );
  };

  const handleDeleteNote = async (noteId: string) => {
    await apiDeleteNote(noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const handleSendReply = async (data: {
    post_id: string;
    post_title: string;
    recipient_nickname: string;
    recipient_code?: string;
    sender_nickname?: string;
    sender_code?: string;
    content: string;
    parent_note_id: string;
    reply_to_content: string;
  }) => {
    const res = await apiSendNote(data);
    if (res.success && res.note) {
      if (res.note.recipient_code === currentUserCode) {
        setNotes((prev) => [res.note!, ...prev]);
      }
      return true;
    }
    return false;
  };

  const unreadNotesCount = notes.filter((n) => !n.read).length;

  // Modal full post submit / edit
  const handleFormModalSubmit = async (data: {
    title: string;
    content: string;
    nickname: string;
    password_hash: string;
    category: string;
  }) => {
    if (editingPost) {
      const res = await apiUpdatePost(editingPost.id, data.password_hash, {
        title: data.title,
        content: data.content,
        category: data.category,
      });
      if (!res.success) {
        throw new Error(res.error || '수정에 실패했습니다. 비밀번호를 확인해 주세요.');
      }
      setEditingPost(null);
      await loadPosts();
    } else {
      const res = await apiCreatePost(data);
      if (!res.success) {
        throw new Error(res.error || '글 등록에 실패했습니다.');
      }
      await loadPosts();
    }
  };

  // Post like toggle
  const handleToggleLike = async (postId: string) => {
    const res = await apiToggleLike(postId);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes_count: res.likesCount } : p))
    );
    setLikedPostIds(getLikedPostIds());
  };

  // Post delete with password
  const handleDeletePostConfirm = async (password: string) => {
    if (!deleteTargetPostId) return;
    const res = await apiDeletePost(deleteTargetPostId, password);
    if (!res.success) {
      throw new Error(res.error || '비밀번호가 일치하지 않습니다.');
    }
    setPosts((prev) => prev.filter((p) => p.id !== deleteTargetPostId));
    setDeleteTargetPostId(null);
  };

  // Comment Add
  const handleAddComment = async (data: {
    post_id: string;
    content: string;
    nickname: string;
    password_hash: string;
  }) => {
    const res = await apiCreateComment(data);
    if (res.success && res.comment) {
      setCommentsMap((prev) => ({
        ...prev,
        [data.post_id]: [...(prev[data.post_id] || []), res.comment!],
      }));
    } else {
      throw new Error(res.error || '댓글 등록에 실패했습니다.');
    }
  };

  // Comment Delete
  const handleDeleteComment = async (commentId: string, password: string): Promise<boolean> => {
    const res = await apiDeleteComment(commentId, password);
    if (res.success) {
      setCommentsMap((prev) => {
        const next: Record<string, Comment[]> = {};
        for (const [pId, list] of Object.entries(prev)) {
          next[pId] = (list as Comment[]).filter((c) => c.id !== commentId);
        }
        return next;
      });
      return true;
    }
    return false;
  };

  // Filtered and sorted posts
  const filteredPosts = posts
    .filter((post) => {
      const matchCategory = selectedCategory === '전체' || post.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.nickname.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'likes') {
        return (b.likes_count || 0) - (a.likes_count || 0);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // If not authorized by passcode, show company login gate
  if (!isAuthorized) {
    return (
      <PasscodeGate
        onSuccess={(code) => {
          setCurrentUserCode(code);
          setIsAuthorized(true);
          loadNotes(code);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f9] font-sans text-slate-800 pb-16">
      {/* Header */}
      <Header
        currentUserCode={currentUserCode}
        onLogout={handleLogout}
        onOpenWriteModal={() => {
          setEditingPost(null);
          setIsWriteModalOpen(true);
        }}
        onOpenInboxModal={() => setIsInboxOpen(true)}
        unreadNotesCount={unreadNotesCount}
      />

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-5">
        {/* Filters & Search Toolbar */}
        <div className="space-y-3">
          {/* Categories Tab Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#073991] text-[#FFFFFF] shadow-xs'
                    : 'bg-[#FFFFFF] text-[#1D5276] hover:bg-[#1D5276]/5 border border-slate-200/90'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar & Sort selector */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="제목, 내용, 작성자 검색..."
                className="w-full pl-9 pr-3 py-2 bg-[#FFFFFF] border border-slate-200/90 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#073991]/20 focus:border-[#073991]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center bg-[#FFFFFF] p-1 rounded-xl border border-slate-200/90 text-xs">
              <button
                type="button"
                onClick={() => setSortBy('latest')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                  sortBy === 'latest'
                    ? 'bg-[#073991]/10 text-[#073991] font-bold'
                    : 'text-[#1D5276]/70 hover:text-[#1D5276]'
                }`}
              >
                <Clock className="w-3 h-3 text-[#1D5276]" />
                <span>최신순</span>
              </button>
              <button
                type="button"
                onClick={() => setSortBy('likes')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                  sortBy === 'likes'
                    ? 'bg-[#DC2626]/10 text-[#DC2626] font-bold'
                    : 'text-[#1D5276]/70 hover:text-[#1D5276]'
                }`}
              >
                <Flame className="w-3 h-3 text-[#DC2626]" />
                <span>인기순</span>
              </button>
            </div>
          </div>
        </div>

        {/* Post List Component */}
        <div className="space-y-3.5">
          {loading && posts.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-2xl p-12 text-center text-slate-400 border border-slate-200/80 text-xs">
              게시글을 불러오는 중입니다...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-2xl p-12 text-center text-slate-400 border border-slate-200/80 space-y-2">
              <p className="text-sm font-semibold text-[#1D5276]">등록된 게시글이 없습니다.</p>
              <p className="text-xs text-slate-400">
                {searchQuery || selectedCategory !== '전체'
                  ? '검색 조건에 맞는 글이 없습니다. 필터를 초기화해 보세요.'
                  : '첫 번째 익명 글의 주인공이 되어보세요!'}
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isLiked={likedPostIds.includes(post.id)}
                comments={commentsMap[post.id] || []}
                onToggleLike={handleToggleLike}
                onEdit={(p) => {
                  setEditingPost(p);
                  setIsWriteModalOpen(true);
                }}
                onDelete={(postId) => setDeleteTargetPostId(postId)}
                onOpenSendNote={(p) => setNoteTargetPost(p)}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
              />
            ))
          )}
        </div>
      </main>

      {/* Full Write / Edit Post Modal */}
      <PostFormModal
        isOpen={isWriteModalOpen}
        onClose={() => {
          setIsWriteModalOpen(false);
          setEditingPost(null);
        }}
        currentUserCode={currentUserCode}
        onSubmit={handleFormModalSubmit}
        editingPost={editingPost}
      />

      {/* Send Note Modal */}
      <SendNoteModal
        isOpen={!!noteTargetPost}
        onClose={() => setNoteTargetPost(null)}
        post={noteTargetPost}
        currentUserCode={currentUserCode}
        onSend={handleSendNote}
      />

      {/* Note Inbox Modal */}
      <NoteInboxModal
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
        notes={notes}
        currentUserCode={currentUserCode}
        onMarkAsRead={handleMarkNoteAsRead}
        onDeleteNote={handleDeleteNote}
        onOpenReplyModal={(note) => setReplyTargetNote(note)}
      />

      {/* Reply Note Modal */}
      <ReplyNoteModal
        isOpen={!!replyTargetNote}
        onClose={() => setReplyTargetNote(null)}
        originalNote={replyTargetNote}
        currentUserCode={currentUserCode}
        onSendReply={handleSendReply}
      />

      {/* Delete Post Password Prompt Modal */}
      <PasswordPromptModal
        isOpen={!!deleteTargetPostId}
        title="게시글 삭제"
        description="게시글 작성 시 설정했던 비밀번호를 입력해 주세요."
        confirmLabel="게시글 삭제"
        isDestructive={true}
        onClose={() => setDeleteTargetPostId(null)}
        onConfirm={handleDeletePostConfirm}
      />
    </div>
  );
}
