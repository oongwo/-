export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay < 7) return `${diffDay}일 전`;

    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  } catch {
    return '날짜 미상';
  }
}

export function getRandomNickname(): string {
  const adjectives = [
    '퇴근원하는', '커피마시는', '야근요정', '월급루팡', '간식탐험가',
    '코딩하는', '눈치빠른', '회의중인', '열정가득', '칼퇴꿈나무',
    '출근한지5분된', '점심기다리는', '버그잡는', '아이디어뱅크'
  ];
  const nouns = [
    '쿼카', '판다', '수달', '다람쥐', '고양이', '사원', '대리',
    '연구원', '펭귄', '호랑이', '토끼', '개발자', '디자이너', '기획자'
  ];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}
