import React from 'react';

interface LeeNTechLogoProps {
  className?: string;
  height?: number;
}

/**
 * 리앤테크(주) - LeeNTech 공식 CI/로고 원본 형태 벡터 구현
 * 원본 사양:
 * 1. 심볼 마크 (좌측 입체 헥사곤 4분할):
 *    - 상단 좌측: 시안 블루 (#008EDA)
 *    - 상단 우측: 오렌지 (#F37021)
 *    - 하단 좌측: 라임 옐로우 (#D6DE22)
 *    - 하단 우측: 다크 차콜 그레이 (#3C3C3B)
 *    - 중앙: 화이트 크로스 분할선
 * 2. 브랜드 텍스트:
 *    - "Lee" (다크 차콜 #3C3C3B)
 *    - "N" (비비드 마젠타 핑크 #E5007D)
 *    - "Tech" (다크 차콜 #3C3C3B)
 * 3. 국문 사명:
 *    - "리앤테크(주)" (코퍼레이트 블루 #0072BC, Tech 하단 정렬)
 */
export default function LeeNTechLogo({ className = "h-12 w-auto", height }: LeeNTechLogoProps) {
  return (
    <svg
      viewBox="0 0 450 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={height ? { height, width: 'auto' } : undefined}
      aria-label="LeeNTech 리앤테크(주) 로고"
    >
      {/* 1. 좌측 4분할 헥사곤 심볼마크 */}
      <g transform="translate(10, 8)">
        {/* 상단 좌측 (시안 블루) */}
        <path
          d="M 32 8 
             L 47 8 
             L 39 36 
             L 15 36 
             L 21.5 16 
             C 23.5 10.5 27 8 32 8 Z"
          fill="#008EDA"
        />

        {/* 상단 우측 (오렌지) */}
        <path
          d="M 53 8 
             L 68 8 
             C 73 8 76.5 10.5 78.5 16 
             L 85 36 
             L 61 36 
             Z"
          fill="#F37021"
        />

        {/* 하단 좌측 (라임 옐로우) */}
        <path
          d="M 15 42 
             L 39 42 
             L 47 70 
             L 32 70 
             C 27 70 23.5 67.5 21.5 62 
             L 15 42 Z"
          fill="#D6DE22"
        />

        {/* 하단 우측 (다크 차콜 그레이) */}
        <path
          d="M 61 42 
             L 85 42 
             L 78.5 62 
             C 76.5 67.5 73 70 68 70 
             L 53 70 
             Z"
          fill="#3C3C3B"
        />
      </g>

      {/* 2. 브랜드 영문명 "LeeNTech" */}
      <text
        x="122"
        y="62"
        fill="#3C3C3B"
        fontFamily="'Montserrat', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
        fontWeight="800"
        fontSize="52"
        letterSpacing="-1.2"
      >
        Lee
      </text>

      <text
        x="218"
        y="62"
        fill="#E5007D"
        fontFamily="'Montserrat', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
        fontWeight="900"
        fontSize="54"
        letterSpacing="-1.2"
      >
        N
      </text>

      <text
        x="266"
        y="62"
        fill="#3C3C3B"
        fontFamily="'Montserrat', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
        fontWeight="800"
        fontSize="52"
        letterSpacing="-1.2"
      >
        Tech
      </text>

      {/* 3. 하단 국문 사명 "리앤테크(주)" */}
      <text
        x="256"
        y="88"
        fill="#0072BC"
        fontFamily="'Pretendard', 'Noto Sans KR', 'Malgun Gothic', -apple-system, sans-serif"
        fontWeight="800"
        fontSize="21"
        letterSpacing="0.2"
      >
        리앤테크(주)
      </text>
    </svg>
  );
}
