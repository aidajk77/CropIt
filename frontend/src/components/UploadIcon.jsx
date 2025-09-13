// src/components/UploadIcon.jsx
import React from 'react';

const UploadIcon = ({ width = 48, height = 48, className = "" }) => {
  return (
    <svg 
      width={width}
      height={height}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="uploadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#336E6E" />
          <stop offset="100%" stopColor="#54E0E0" />
        </linearGradient>
      </defs>
      <path 
        d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" 
        fill="url(#uploadGradient)"
      />
      <path 
        d="M12,11L16,15H13V19H11V15H8L12,11Z" 
        fill="url(#uploadGradient)"
      />
    </svg>
  );
};

export default UploadIcon;