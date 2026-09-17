import React, { useState } from 'react';
import { Mail, X, Trash2, Clock, Inbox, Reply, ShieldCheck } from 'lucide-react';
import { Note, MEMBERS } from '../types';

interface NoteInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  currentUserCode: string;
  onMarkAsRead: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onOpenReplyModal: (note: Note) => void;
}

export default function NoteInboxModal({
  isOpen,
  onClose,
  notes,
  currentUserCode,
  onMarkAsRead,
  onDeleteNote,
  onOpenReplyModal,
}: NoteInboxModalProps) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  if (!isOpen) return null;

  const currentMember = MEMBERS[currentUserCode] || {
    code: currentUserCode,
    name: `구성원 (${currentUserCode})`,
    role: '사내 구성원',
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const now = new Date();
      const past = new Date(isoString);
      const diffMs = now.getTime() - past.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffMin < 1) return '방금 전';
      if (diffMin < 60) return `${diffMin}분 전`;
      if (diffHour < 24) return `${diffHour}시간 전`;
      return `${diffDay}일 전`;
    } catch {
      return '';
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    if (!note.read) {
      onMarkAsRead(note.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-[#FFFFFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#073991]/10 text-[#073991] flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#073991] text-base">익명 쪽지함</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#073991]/10 text-[#073991] border border-[#073991]/20">
                  {currentMember.name} 전용
                </span>
              </div>
              <p className="text-[11px] text-[#1D5276]/70">
                본인 계정으로 도착한 익명 쪽지만 안전하게 보관 및 열람됩니다
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

        {/* Security Isolation Notice */}
        <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-100 flex items-center gap-2 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-[#073991] flex-shrink-0" />
          <span className="leading-tight">
            <strong>개별 비공개 보관함:</strong> 수신자 본인만 열람할 수 있도록 암호화 격리되어 있으며 타인은 절대 접근할 수 없습니다.
          </span>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {notes.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Inbox className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">도착한 쪽지가 없습니다</p>
              <p className="text-xs text-slate-400 mt-1">
                게시글 카드의 쪽지 아이콘을 눌러 동료 작성자에게 먼저 첫 쪽지를 보내보세요!
              </p>
            </div>
          ) : (
            notes.map((note) => {
              const isSelected = selectedNote?.id === note.id;
              const isReply = !!note.parent_note_id;

              return (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/50 border-[#073991]/40 shadow-xs'
                      : note.read
                      ? 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-50'
                      : 'bg-[#FFFFFF] border-[#073991]/30 shadow-xs hover:border-[#073991]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      {isReply && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#1D5276]/10 text-[#1D5276] border border-[#1D5276]/20 flex items-center gap-1">
                          <Reply className="w-2.5 h-2.5" />
                          회신
                        </span>
                      )}
                      <span className="font-bold text-[#1D5276]">
                        {note.sender_nickname}
                      </span>
                      <span className="text-slate-400 text-[11px]">→</span>
                      <span className="text-xs text-slate-600 font-medium">
                        받는이: <span className="text-[#073991] font-semibold">{note.recipient_nickname}</span>
                      </span>
                      {!note.read && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#DC2626] text-white">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(note.created_at)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNote(note.id);
                          if (selectedNote?.id === note.id) setSelectedNote(null);
                        }}
                        className="text-slate-400 hover:text-[#DC2626] p-1 rounded-md hover:bg-red-50 transition-colors"
                        title="쪽지 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Related Post title badge */}
                  <div className="text-[11px] text-slate-500 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/60 inline-block mb-2">
                    게시글: <span className="font-medium text-slate-700">{note.post_title}</span>
                  </div>

                  {/* Previous reply reference if this note is a reply */}
                  {note.reply_to_content && (
                    <div className="mb-2 p-2 bg-slate-100/80 rounded-lg border border-slate-200/60 text-[11px] text-slate-500 italic line-clamp-2">
                      <span className="font-medium not-italic text-slate-600">이전 쪽지: </span>
                      "{note.reply_to_content}"
                    </div>
                  )}

                  {/* Note Content */}
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>

                  {/* Reply Button on Note Card */}
                  <div className="mt-3 pt-2 border-t border-slate-100/80 flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenReplyModal(note);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] hover:bg-blue-50 text-[#073991] border border-[#073991]/30 hover:border-[#073991] rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>답장 회신하기</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs">
          <span className="text-slate-500">
            총 <strong className="text-[#073991]">{notes.length}</strong>개의 쪽지
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#073991] hover:bg-[#1D5276] text-[#FFFFFF] font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
