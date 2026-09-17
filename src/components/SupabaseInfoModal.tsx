import { useState } from 'react';
import { Database, X, Check, Copy, ExternalLink, ShieldCheck, RefreshCw } from 'lucide-react';
import { getSupabaseCredentials, saveSupabaseCredentials, getSupabaseClient } from '../lib/supabase';

interface SupabaseInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

const SQL_SCHEMA = `-- 게시글 테이블
create table posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  nickname text not null,
  password_hash text not null,
  category text,
  likes_count int default 0,
  created_at timestamp with time zone default now()
);

-- 댓글 테이블
create table comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade,
  content text not null,
  nickname text not null,
  password_hash text not null,
  created_at timestamp with time zone default now()
);`;

export default function SupabaseInfoModal({
  isOpen,
  onClose,
  onConfigUpdated,
}: SupabaseInfoModalProps) {
  const currentCreds = getSupabaseCredentials();
  const [url, setUrl] = useState(currentCreds.url);
  const [anonKey, setAnonKey] = useState(currentCreds.anonKey);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConnected = !!getSupabaseClient();

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SQL_SCHEMA);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSave = () => {
    saveSupabaseCredentials(url, anonKey);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    onConfigUpdated();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      saveSupabaseCredentials(url, anonKey);
      const client = getSupabaseClient();
      if (!client) {
        setTestResult('URL과 Anon Key를 모두 입력해 주세요.');
        setIsTesting(false);
        return;
      }
      const { error } = await client.from('posts').select('id').limit(1);
      if (error) {
        setTestResult(`연결 오류: ${error.message}`);
      } else {
        setTestResult('성공: Supabase 데이터베이스와 정상적으로 연결되었습니다!');
        onConfigUpdated();
      }
    } catch (e: unknown) {
      setTestResult(e instanceof Error ? e.message : '연결 실패');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Supabase 데이터베이스 연동 안내</h3>
              <p className="text-xs text-slate-500">실제 Supabase 프로젝트와 연결하거나 로컬 모드로 사용할 수 있습니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Status Indicator */}
          <div className="p-4 rounded-xl border flex items-center justify-between bg-slate-50 border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-amber-400 ring-4 ring-amber-100'}`} />
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {isConnected ? 'Supabase 실시간 DB 연동 중' : '로컬 모드(브라우저 저장소) 동작 중'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {isConnected
                    ? '클라우드 Supabase 인스턴스와 통신합니다.'
                    : 'Supabase 키 미설정 시에도 글 작성, 댓글, 수정/삭제 기능이 즉시 정상 작동합니다.'}
                </p>
              </div>
            </div>
          </div>

          {/* Credentials Form */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Supabase 접속 정보 설정
            </h4>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Supabase URL (예: https://xyzcompany.supabase.co)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Supabase Anon Key
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJh..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
              />
            </div>

            {testResult && (
              <p className={`text-xs p-2 rounded-lg ${testResult.startsWith('성공') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
                {testResult}
              </p>
            )}

            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                <span>연결 테스트</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                {saveSuccess ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{saveSuccess ? '저장됨' : '설정 저장'}</span>
              </button>
            </div>
          </div>

          {/* SQL Editor Schema Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                요구된 Supabase SQL 스키마
              </h4>
              <button
                type="button"
                onClick={handleCopySql}
                className="text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-1 font-medium cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? '복사됨!' : 'SQL 쿼리 복사'}</span>
              </button>
            </div>
            <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
              {SQL_SCHEMA}
            </pre>
          </div>

          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              실제 서비스 운영 시 Supabase의 RLS(Row Level Security) 정책을 활성화하여 글 및 댓글의 쓰기/읽기 권한을 구성원 환경에 맞춰 안전하게 관리할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-xs">
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <span>Supabase 대시보드 바로가기</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
