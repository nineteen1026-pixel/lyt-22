import { cn } from '@/lib/utils';

interface ProgressRingProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  gradient?: string;
  className?: string;
  label?: string;
  sublabel?: string;
}

export default function ProgressRing({
  score,
  maxScore = 100,
  size = 120,
  strokeWidth = 10,
  gradient = 'from-pink-400 to-rose-400',
  className,
  label,
  sublabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  const offset = circumference - (percentage / 100) * circumference;

  const gradientId = `gradient-${gradient.replace(/\s|-|from|to|via/g, '')}`;

  const getColorClass = () => {
    if (percentage >= 80) return 'text-emerald-500';
    if (percentage >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" className={cn('text-pink-400')} />
            <stop offset="100%" stopColor="currentColor" className={cn('text-rose-400')} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#pinkGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            'transition-all duration-1000 ease-out',
            gradient
          )}
          style={{
            stroke: percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#f43f5e',
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className={cn('font-bold text-3xl', getColorClass())}>
          {Math.round(score)}
        </span>
        {label && <span className="text-xs text-gray-500 mt-1">{label}</span>}
        {sublabel && <span className="text-[10px] text-gray-400">{sublabel}</span>}
      </div>
    </div>
  );
}
