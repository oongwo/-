export interface Post {
  id: string;
  title: string;
  content: string;
  nickname: string;
  password_hash: string;
  category: string;
  likes_count: number;
  created_at: string;
  author_code?: string; // '0613' (A씨) | '0828' (B씨)
}

export interface Comment {
  id: string;
  post_id: string;
  content: string;
  nickname: string;
  password_hash: string;
  created_at: string;
  author_code?: string;
}

export interface Note {
  id: string;
  post_id: string;
  post_title: string;
  recipient_nickname: string;
  recipient_code?: string; // '0613' (A씨) | '0828' (B씨)
  sender_nickname: string;
  sender_code?: string;    // '0613' (A씨) | '0828' (B씨)
  content: string;
  created_at: string;
  read: boolean;
  parent_note_id?: string;
  reply_to_content?: string;
}

export interface MemberProfile {
  code: string;
  name: string;
  role: string;
}

export const MEMBERS: Record<string, MemberProfile> = {
  '0613': { code: '0613', name: '회사 구성원 A씨', role: '구성원 A' },
  '0828': { code: '0828', name: '회사 구성원 B씨', role: '구성원 B' },
};

export type Category = '전체' | '회사생활' | '잡담' | '건의사항' | '질문' | '비밀이야기';

export const CATEGORIES: Category[] = ['전체', '회사생활', '잡담', '건의사항', '질문', '비밀이야기'];
export const POST_CATEGORIES = ['회사생활', '잡담', '건의사항', '질문', '비밀이야기'] as const;

