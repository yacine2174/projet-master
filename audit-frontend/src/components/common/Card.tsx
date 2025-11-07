import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`
        bg-slate-800/70 backdrop-blur-sm
        border border-slate-700 rounded-xl
        p-6 shadow-sm
        transition-all duration-200
        hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-500/5
        ${onClick ? 'cursor-pointer hover:bg-slate-700/50' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
