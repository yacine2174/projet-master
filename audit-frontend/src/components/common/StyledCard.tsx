import React from 'react';
import Card from './Card';

interface StyledCardProps {
  title: React.ReactNode;
  count?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const StyledCard: React.FC<StyledCardProps> = ({
  title,
  count,
  children,
  footer,
  className = '',
  onClick,
}) => {
  return (
    <Card className={`flex flex-col h-full ${className}`} onClick={onClick}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-100">
          {title}
          {count !== undefined && (
            <span className="ml-2 text-sm text-slate-400">
              ({count} {count === 1 ? 'élément' : 'éléments'})
            </span>
          )}
        </h3>
      </div>
      
      <div className="flex-1 text-slate-300">
        {children}
      </div>
      
      {footer && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          {footer}
        </div>
      )}
    </Card>
  );
};

export default StyledCard;
