import React from 'react';

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success';
}

export const RetroButton: React.FC<RetroButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  
  const baseStyle = "font-arcade uppercase px-6 py-3 border-4 transition-all duration-100 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed";
  
  let colorStyle = "";
  if (variant === 'primary') {
    colorStyle = "border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff] hover:text-black shadow-[0_0_10px_#00f3ff]";
  } else if (variant === 'danger') {
    colorStyle = "border-[#ff0055] text-[#ff0055] hover:bg-[#ff0055] hover:text-black shadow-[0_0_10px_#ff0055]";
  } else if (variant === 'success') {
    colorStyle = "border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black shadow-[0_0_10px_#00ff41]";
  }

  return (
    <button className={`${baseStyle} ${colorStyle} ${className}`} {...props}>
      {children}
    </button>
  );
};