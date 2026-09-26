import React from 'react';

interface RiskBadgeProps {
  level: string; // CRITICAL, HIGH, MEDIUM, LOW, SAFE, INFO
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, className = '', size = 'md' }) => {
  const norm = (level || 'INFO').toUpperCase();

  let colors = 'bg-slate-800 text-slate-300 border-slate-700';
  if (norm.includes('CRITICAL') || norm.includes('RED') || norm.includes('FAIL') || norm.includes('MALWARE')) {
    colors = 'bg-red-950/60 text-red-400 border-red-800/80 shadow-sm shadow-red-950';
  } else if (norm.includes('HIGH') || norm.includes('ORANGE') || norm.includes('PHISH') || norm.includes('BEC')) {
    colors = 'bg-orange-950/60 text-orange-400 border-orange-800/80';
  } else if (norm.includes('MEDIUM') || norm.includes('YELLOW') || norm.includes('SUSPICIOUS')) {
    colors = 'bg-amber-950/50 text-amber-400 border-amber-800/70';
  } else if (norm.includes('LOW') || norm.includes('BLUE')) {
    colors = 'bg-blue-950/50 text-blue-400 border-blue-800/70';
  } else if (norm.includes('SAFE') || norm.includes('GREEN') || norm.includes('PASS') || norm.includes('LEGIT')) {
    colors = 'bg-emerald-950/50 text-emerald-400 border-emerald-800/70';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider',
    md: 'text-xs px-2.5 py-1 tracking-wide',
    lg: 'text-sm px-3.5 py-1.5 font-semibold'
  }[size];

  return (
    <span className={`inline-flex items-center font-mono font-medium uppercase border rounded-md ${colors} ${sizeClasses} ${className}`}>
      {level}
    </span>
  );
};
