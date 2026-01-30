
import React from 'react';

interface Props {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const UserAvatar: React.FC<Props> = ({ name, size = 'md', className = '' }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const colors = [
    'bg-indigo-500', 'bg-violet-500', 'bg-emerald-500', 
    'bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-fuchsia-500'
  ];
  
  // İsme göre sabit bir renk seçer
  const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const colorClass = colors[charCodeSum % colors.length];

  const sizeClasses = {
    sm: 'w-6 h-6 text-[8px]',
    md: 'w-10 h-10 text-[10px]',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl'
  };

  return (
    <div className={`${sizeClasses[size]} ${colorClass} rounded-xl flex items-center justify-center text-white font-black uppercase tracking-tighter shadow-lg border-2 border-white/10 shrink-0 ${className}`}>
      {initials}
    </div>
  );
};

export default UserAvatar;
