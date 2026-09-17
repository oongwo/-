import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Post, Comment, Note } from '../types';

const STORAGE_KEY_POSTS = 'company_anonymous_board_posts';
const STORAGE_KEY_COMMENTS = 'company_anonymous_board_comments';
const STORAGE_KEY_NOTES = 'company_anonymous_board_notes';
const STORAGE_KEY_SUPABASE_URL = 'company_board_supabase_url';
const STORAGE_KEY_SUPABASE_KEY = 'company_board_supabase_key';
const STORAGE_KEY_LIKED_POSTS = 'company_board_liked_posts';

// Initial sample data if no data exists locally
const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    title: '익명게시판이 새로 오픈되었습니다! 자유롭게 이야기 나눠요.',
    content: '회사 임직원 전용 익명 소통 공간입니다. 상호 존중과 배려를 바탕으로 건설적인 피드백과 소소한 일상을 공유해 주세요.\n\n* 글/댓글 작성 시 설정한 비밀번호로 언제든 수정 및 삭제가 가능합니다.',
    nickname: '운영자',
    password_hash: '0000',
    category: '회사생활',
    likes_count: 14,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    author_code: '0613', // 구성원 A씨
  },
  {
    id: 'post-2',
    title: '이번 주 금요일 점심 구내식당 메뉴 보셨나요?',
    content: '돈까스랑 메밀소바 나온다는데 다들 몇 시에 내려가실 건가요? 11시 40분쯤 내려가야 줄 안 설 것 같아요 ㅎㅎ',
    nickname: '배고픈개발자',
    password_hash: '0000',
    category: '잡담',
    likes_count: 8,
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    author_code: '0828', // 구성원 B씨
  },
  {
    id: 'post-3',
    title: '탕비실 간식 건의: 디카페인 캡슐 커피 추가 요청드립니다',
    content: '오후 3시 넘어가면 카페인 때문에 잠을 잘 못 자서 디카페인 커피가 있었으면 좋겠어요. 경영지원팀에 건의해 봅니다!',
    nickname: '카페인취약자',
    password_hash: '0000',
    category: '건의사항',
    likes_count: 21,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    author_code: '0613', // 구성원 A씨
  },
  {
    id: 'post-4',
    title: '반차 사용 시 결재 라인 문의드립니다',
    content: '당일 오전 반차 쓸 때 팀장님 전결인지 본부장님까지 가야 하는지 최근 규정 바뀐 게 있을까요?',
    nickname: '신규입사자',
    password_hash: '0000',
    category: '질문',
    likes_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    author_code: '0828', // 구성원 B씨
  },
];

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comment-1',
    post_id: 'post-1',
    content: '와 드디어 생겼네요! 다들 익명이라고 너무 선 넘는 글만 없었으면 좋겠어요.',
    nickname: '익명1',
    password_hash: '0000',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: 'comment-2',
    post_id: 'post-3',
    content: '디카페인 진짜 대찬성입니다! 저도 같은 생각이었어요.',
    nickname: '동료직원',
    password_hash: '0000',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'comment-3',
    post_id: 'post-4',
    content: '팀장님 전결입니다! 인사포털 전자결재 양식 2번 쓰시면 됩니다.',
    nickname: '친절한선배',
    password_hash: '0000',
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  }
];

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY || '';
  const localUrl = localStorage.getItem(STORAGE_KEY_SUPABASE_URL) || '';
  const localKey = localStorage.getItem(STORAGE_KEY_SUPABASE_KEY) || '';

  return {
    url: envUrl || localUrl,
    anonKey: envKey || localKey,
  };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey);
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export function resetSupabaseClient() {
  supabaseInstance = null;
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (url && anonKey) {
    localStorage.setItem(STORAGE_KEY_SUPABASE_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_SUPABASE_KEY, anonKey.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_SUPABASE_URL);
    localStorage.removeItem(STORAGE_KEY_SUPABASE_KEY);
  }
  resetSupabaseClient();
}

// Local storage helper functions
function getLocalPosts(): Post[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_POSTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(INITIAL_POSTS));
      return INITIAL_POSTS;
    }
    const parsed: Post[] = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Ensure all existing posts are updated to 0000 as requested
      let modified = false;
      const updated = parsed.map((p) => {
        if (p.password_hash !== '0000') {
          modified = true;
          return { ...p, password_hash: '0000' };
        }
        return p;
      });
      if (modified) {
        localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(updated));
      }
      return updated;
    }
    return INITIAL_POSTS;
  } catch {
    return INITIAL_POSTS;
  }
}

function saveLocalPosts(posts: Post[]) {
  localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
}

function getLocalComments(): Comment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(INITIAL_COMMENTS));
      return INITIAL_COMMENTS;
    }
    const parsed: Comment[] = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Ensure all existing comments are updated to 0000 as requested
      let modified = false;
      const updated = parsed.map((c) => {
        if (c.password_hash !== '0000') {
          modified = true;
          return { ...c, password_hash: '0000' };
        }
        return c;
      });
      if (modified) {
        localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(updated));
      }
      return updated;
    }
    return INITIAL_COMMENTS;
  } catch {
    return INITIAL_COMMENTS;
  }
}

function saveLocalComments(comments: Comment[]) {
  localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(comments));
}

export function getLikedPostIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LIKED_POSTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function toggleLocalLikedPostId(id: string): boolean {
  const liked = getLikedPostIds();
  const index = liked.indexOf(id);
  let isNowLiked = false;
  if (index === -1) {
    liked.push(id);
    isNowLiked = true;
  } else {
    liked.splice(index, 1);
    isNowLiked = false;
  }
  localStorage.setItem(STORAGE_KEY_LIKED_POSTS, JSON.stringify(liked));
  return isNowLiked;
}

// Unified Data API
export async function syncAllPasswordsTo0000() {
  try {
    const posts = getLocalPosts().map((p) => ({ ...p, password_hash: '0000' }));
    saveLocalPosts(posts);
    const comments = getLocalComments().map((c) => ({ ...c, password_hash: '0000' }));
    saveLocalComments(comments);

    const client = getSupabaseClient();
    if (client) {
      await client.from('posts').update({ password_hash: '0000' }).neq('password_hash', '0000');
      await client.from('comments').update({ password_hash: '0000' }).neq('password_hash', '0000');
    }
  } catch (e) {
    console.warn('syncAllPasswordsTo0000 warning:', e);
  }
}

// Run migration immediately on module load
if (typeof window !== 'undefined') {
  syncAllPasswordsTo0000();
}

export async function apiFetchPosts(): Promise<{ posts: Post[]; isSupabase: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch error, fallback to local:', error.message);
        return { posts: getLocalPosts(), isSupabase: false, error: error.message };
      }

      // Ensure all remote posts are treated with password_hash 0000
      const remotePosts = (data || []).map((p: Post) => ({
        ...p,
        password_hash: '0000',
      }));

      // Background update to Supabase if any differed
      client.from('posts').update({ password_hash: '0000' }).neq('password_hash', '0000').then();

      return { posts: remotePosts, isSupabase: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Supabase 연결 실패';
      return { posts: getLocalPosts(), isSupabase: false, error: msg };
    }
  }

  return { posts: getLocalPosts(), isSupabase: false };
}

export async function apiCreatePost(postData: {
  title: string;
  content: string;
  nickname: string;
  password_hash: string;
  category: string;
  author_code?: string;
}): Promise<{ success: boolean; post?: Post; error?: string }> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('posts')
        .insert([
          {
            title: postData.title,
            content: postData.content,
            nickname: postData.nickname,
            password_hash: postData.password_hash,
            category: postData.category,
            likes_count: 0,
            author_code: postData.author_code || '0613',
          },
        ])
        .select()
        .single();

      if (error) {
        console.warn('Supabase post insert failed, saving locally:', error.message);
      } else if (data) {
        return { success: true, post: data };
      }
    } catch (err: unknown) {
      console.warn('Supabase call threw error, fallback to local', err);
    }
  }

  // Local fallback
  const posts = getLocalPosts();
  const newPost: Post = {
    id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: postData.title,
    content: postData.content,
    nickname: postData.nickname || '익명',
    password_hash: postData.password_hash,
    category: postData.category || '잡담',
    likes_count: 0,
    created_at: new Date().toISOString(),
    author_code: postData.author_code || '0613',
  };
  posts.unshift(newPost);
  saveLocalPosts(posts);
  return { success: true, post: newPost };
}

export async function apiUpdatePost(
  postId: string,
  passwordInput: string,
  updates: { title: string; content: string; category: string }
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (client) {
    try {
      // First verify password or update with match (0000 always valid for existing posts)
      const { data: post, error: fetchErr } = await client
        .from('posts')
        .select('password_hash')
        .eq('id', postId)
        .single();

      if (fetchErr) throw fetchErr;
      const isValid = passwordInput === '0000' || post.password_hash === passwordInput || post.password_hash === '0000';
      if (!isValid) {
        return { success: false, error: '비밀번호가 일치하지 않습니다.' };
      }

      const { error: updateErr } = await client
        .from('posts')
        .update({
          title: updates.title,
          content: updates.content,
          category: updates.category,
          password_hash: '0000',
        })
        .eq('id', postId);

      if (updateErr) throw updateErr;
      return { success: true };
    } catch (err: unknown) {
      console.warn('Supabase update failed, attempting local fallback:', err);
    }
  }

  const posts = getLocalPosts();
  const target = posts.find((p) => p.id === postId);
  if (!target) return { success: false, error: '게시글을 찾을 수 없습니다.' };
  const isValid = passwordInput === '0000' || target.password_hash === passwordInput || target.password_hash === '0000';
  if (!isValid) {
    return { success: false, error: '비밀번호가 일치하지 않습니다.' };
  }

  target.title = updates.title;
  target.content = updates.content;
  target.category = updates.category;
  target.password_hash = '0000';
  saveLocalPosts(posts);
  return { success: true };
}

export async function apiDeletePost(
  postId: string,
  passwordInput: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data: post, error: fetchErr } = await client
        .from('posts')
        .select('password_hash')
        .eq('id', postId)
        .single();

      if (fetchErr) throw fetchErr;
      const isValid = passwordInput === '0000' || post.password_hash === passwordInput || post.password_hash === '0000';
      if (!isValid) {
        return { success: false, error: '비밀번호가 일치하지 않습니다.' };
      }

      const { error: delErr } = await client.from('posts').delete().eq('id', postId);
      if (delErr) throw delErr;
      return { success: true };
    } catch (err: unknown) {
      console.warn('Supabase delete failed, using local fallback:', err);
    }
  }

  const posts = getLocalPosts();
  const target = posts.find((p) => p.id === postId);
  if (!target) return { success: false, error: '게시글을 찾을 수 없습니다.' };
  const isValid = passwordInput === '0000' || target.password_hash === passwordInput || target.password_hash === '0000';
  if (!isValid) {
    return { success: false, error: '비밀번호가 일치하지 않습니다.' };
  }

  const updatedPosts = posts.filter((p) => p.id !== postId);
  saveLocalPosts(updatedPosts);

  // Also remove associated comments locally
  const comments = getLocalComments();
  saveLocalComments(comments.filter((c) => c.post_id !== postId));

  return { success: true };
}

export async function apiToggleLike(postId: string): Promise<{ likesCount: number; isLiked: boolean }> {
  const isLiked = toggleLocalLikedPostId(postId);
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data: post, error } = await client
        .from('posts')
        .select('likes_count')
        .eq('id', postId)
        .single();

      if (!error && post) {
        const delta = isLiked ? 1 : -1;
        const nextLikes = Math.max(0, (post.likes_count || 0) + delta);
        await client.from('posts').update({ likes_count: nextLikes }).eq('id', postId);
        return { likesCount: nextLikes, isLiked };
      }
    } catch (err) {
      console.warn('Supabase toggle like failed, using local:', err);
    }
  }

  const posts = getLocalPosts();
  const target = posts.find((p) => p.id === postId);
  if (target) {
    target.likes_count = Math.max(0, (target.likes_count || 0) + (isLiked ? 1 : -1));
    saveLocalPosts(posts);
    return { likesCount: target.likes_count, isLiked };
  }

  return { likesCount: 0, isLiked };
}

export async function apiFetchComments(postId: string): Promise<Comment[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('Supabase comments fetch failed, using local:', err);
    }
  }

  const comments = getLocalComments();
  return comments.filter((c) => c.post_id === postId);
}

export async function apiCreateComment(commentData: {
  post_id: string;
  content: string;
  nickname: string;
  password_hash: string;
}): Promise<{ success: boolean; comment?: Comment; error?: string }> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('comments')
        .insert([
          {
            post_id: commentData.post_id,
            content: commentData.content,
            nickname: commentData.nickname,
            password_hash: commentData.password_hash,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        return { success: true, comment: data };
      }
    } catch (err) {
      console.warn('Supabase create comment failed, using local:', err);
    }
  }

  const comments = getLocalComments();
  const newComment: Comment = {
    id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    post_id: commentData.post_id,
    content: commentData.content,
    nickname: commentData.nickname || '익명',
    password_hash: commentData.password_hash,
    created_at: new Date().toISOString(),
  };
  comments.push(newComment);
  saveLocalComments(comments);
  return { success: true, comment: newComment };
}

export async function apiDeleteComment(
  commentId: string,
  passwordInput: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data: comment, error: fetchErr } = await client
        .from('comments')
        .select('password_hash')
        .eq('id', commentId)
        .single();

      if (fetchErr) throw fetchErr;
      const isValid = passwordInput === '0000' || comment.password_hash === passwordInput || comment.password_hash === '0000';
      if (!isValid) {
        return { success: false, error: '비밀번호가 일치하지 않습니다.' };
      }

      const { error: delErr } = await client.from('comments').delete().eq('id', commentId);
      if (delErr) throw delErr;
      return { success: true };
    } catch (err) {
      console.warn('Supabase delete comment failed, using local:', err);
    }
  }

  const comments = getLocalComments();
  const target = comments.find((c) => c.id === commentId);
  if (!target) return { success: false, error: '댓글을 찾을 수 없습니다.' };
  const isValid = passwordInput === '0000' || target.password_hash === passwordInput || target.password_hash === '0000';
  if (!isValid) {
    return { success: false, error: '비밀번호가 일치하지 않습니다.' };
  }

  const filtered = comments.filter((c) => c.id !== commentId);
  saveLocalComments(filtered);
  return { success: true };
}

// ---------------- NOTES / MESSAGES SYSTEM ---------------- //
export function getAllLocalNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTES);
    if (!raw) {
      // Sample notes partitioned by recipient
      const initialNotes: Note[] = [
        {
          id: 'note-sample-a-1',
          post_id: 'post-1',
          post_title: '익명게시판이 새로 오픈되었습니다! 자유롭게 이야기 나눠요.',
          recipient_nickname: '운영자',
          recipient_code: '0613', // 회사 구성원 A씨 전용
          sender_nickname: '구성원 B씨',
          sender_code: '0828',
          content: 'A님, 사내 익명게시판 개설 감사합니다. 건의사항 남겼으니 확인 부탁드립니다!',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          read: false,
        },
        {
          id: 'note-sample-b-1',
          post_id: 'post-2',
          post_title: '이번 주 금요일 점심 구내식당 메뉴 보셨나요?',
          recipient_nickname: '배고픈개발자',
          recipient_code: '0828', // 회사 구성원 B씨 전용
          sender_nickname: '구성원 A씨',
          sender_code: '0613',
          content: 'B님 안녕하세요! 이번 주 금요일 점심 같이 드실래요? 11시 40분에 로비에서 봬요 ㅎㅎ',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          read: false,
        },
      ];
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(initialNotes));
      return initialNotes;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getLocalNotes(userCode?: string): Note[] {
  const allNotes = getAllLocalNotes();
  if (!userCode) {
    return allNotes;
  }
  // 회사 구성원 B씨(0828)는 회사 구성원 A씨(0613)의 쪽지를 확인할 수 없도록 수신인 코드 격리
  return allNotes.filter((n) => {
    if (n.recipient_code) {
      return n.recipient_code === userCode;
    }
    // 레거시 쪽지는 기본적으로 0613(A씨) 귀속
    return userCode === '0613';
  });
}

export function saveLocalNotes(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes:', e);
  }
}

export async function apiSendNote(noteData: {
  post_id: string;
  post_title: string;
  recipient_nickname: string;
  recipient_code?: string;
  sender_nickname?: string;
  sender_code?: string;
  content: string;
  parent_note_id?: string;
  reply_to_content?: string;
}): Promise<{ success: boolean; note?: Note; error?: string }> {
  const allNotes = getAllLocalNotes();
  const newNote: Note = {
    id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    post_id: noteData.post_id,
    post_title: noteData.post_title,
    recipient_nickname: noteData.recipient_nickname,
    recipient_code: noteData.recipient_code || '0613',
    sender_nickname: noteData.sender_nickname?.trim() || '익명의 동료',
    sender_code: noteData.sender_code || '',
    content: noteData.content.trim(),
    created_at: new Date().toISOString(),
    read: false,
    parent_note_id: noteData.parent_note_id,
    reply_to_content: noteData.reply_to_content,
  };

  allNotes.unshift(newNote);
  saveLocalNotes(allNotes);
  return { success: true, note: newNote };
}

export async function apiMarkNoteAsRead(noteId: string): Promise<boolean> {
  const allNotes = getAllLocalNotes();
  const updated = allNotes.map((n) => (n.id === noteId ? { ...n, read: true } : n));
  saveLocalNotes(updated);
  return true;
}

export async function apiDeleteNote(noteId: string): Promise<boolean> {
  const allNotes = getAllLocalNotes();
  const updated = allNotes.filter((n) => n.id !== noteId);
  saveLocalNotes(updated);
  return true;
}
