import React from 'react';

interface RetroInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const RetroInput: React.FC<RetroInputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-xs">
      {label && <label className="font-arcade text-[#00f3ff] text-xs uppercase tracking-widest">{label}</label>}
      <input 
        className={`
          w-full bg-black border-2 border-[#ff00de] text-[#ff00de] 
          font-arcade text-center text-xl p-3 outline-none 
          focus:shadow-[0_0_15px_#ff00de] focus:border-[#ff00ff]
          placeholder-pink-900 ${className}
        `}
        autoComplete="off"
        {...props}
      />
    </div>
  );
};