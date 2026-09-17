import React from 'react';

interface CompanyLogoProps {
  className?: string;
  size?: number;
}

/**
 * Exact vector recreation of the user's uploaded logo (`스크린샷_2026-09-16_160513-removebg-preview.png`):
 * A geometric hexagon motif made of four distinct quadrilateral segments with rounded exterior corners:
 * - Top-Left: Vivid Cyan Blue (#008FDA)
 * - Top-Right: Warm Orange (#F37F13)
 * - Bottom-Left: Bright Lemon Yellow (#F6D000)
 * - Bottom-Right: Fresh Lime-Green (#8EC536)
 * Separated by a clean orthogonal cross-channel.
 */
export default function CompanyLogo({ className = "w-full h-full", size }: CompanyLogoProps) {
  return (
    <svg
      viewBox="0 0 120 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: (size * 90) / 120 } : undefined}
      aria-label="회사 로고"
    >
      {/* Top-Left: Blue (#008FDA) */}
      <path
        d="M 38 17 
           C 40 17, 56 17, 56 17 
           L 47 43 
           L 18 43 
           C 16 43, 14 41.5, 14.8 39.5 
           L 24.5 20.8 
           C 26.5 17.8, 30 17, 38 17 Z"
        fill="#008FDA"
      />

      {/* Top-Right: Orange (#F37F13) */}
      <path
        d="M 64 17 
           L 82 17 
           C 90 17, 94.5 19.5, 97.5 23 
           L 106.2 39.2 
           C 107.5 41.5, 105.8 43, 103.5 43 
           L 73 43 
           Z"
        fill="#F37F13"
      />

      {/* Bottom-Left: Yellow (#F6D000) */}
      <path
        d="M 18 47 
           L 47 47 
           L 56 73 
           C 56 73, 40 73, 38 73 
           C 30 73, 26.5 72.2, 24.5 69.2 
           L 14.8 50.5 
           C 14 48.5, 16 47, 18 47 Z"
        fill="#F6D000"
      />

      {/* Bottom-Right: Lime Green (#8EC536) */}
      <path
        d="M 73 47 
           L 103.5 47 
           C 105.8 47, 107.5 48.5, 106.2 50.8 
           L 97.5 67 
           C 94.5 70.5, 90 73, 82 73 
           L 64 73 
           Z"
        fill="#8EC536"
      />
    </svg>
  );
}
