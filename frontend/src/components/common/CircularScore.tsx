import React from 'react';

interface CircularScoreProps {
  score: number;
  classification: string;
  confidence: number;
  size?: number;
}

export const CircularScore: React.FC<CircularScoreProps> = ({
  score,
  classification,
  confidence,
  size = 180
}) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = '#10B981'; // safe green
  let glowClass = 'text-emerald-400';
  if (score >= 80) {
    strokeColor = '#EF4444'; // critical red
    glowClass = 'text-red-400';
  } else if (score >= 60) {
    strokeColor = '#F97316'; // orange
    glowClass = 'text-orange-400';
  } else if (score >= 35) {
    strokeColor = '#F59E0B'; // amber
    glowClass = 'text-amber-400';
  } else if (score >= 15) {
    strokeColor = '#3B82F6'; // blue
    glowClass = 'text-blue-400';
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Score Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-extrabold tracking-tight font-mono ${glowClass}`}>
            {score}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
            / 100 RISK
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <h3 className="text-base font-bold tracking-wide uppercase text-slate-100 font-mono">
          {classification}
        </h3>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Detection Confidence: <span className="text-cyan-400 font-semibold">{confidence}%</span>
        </p>
      </div>
    </div>
  );
};
