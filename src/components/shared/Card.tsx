
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, ...props }) => {
  return (
    <div className={`bg-slate-800 shadow-xl rounded-lg p-6 ${className}`} {...props}>
      {title && <h2 className="text-2xl font-semibold text-sky-400 mb-4">{title}</h2>}
      {children}
    </div>
  );
};
