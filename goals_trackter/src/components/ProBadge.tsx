import { Crown, Lock, Sparkles } from 'lucide-react';

interface ProBadgeProps {
  variant?: 'small' | 'medium' | 'large' | 'lock';
  showLabel?: boolean;
  className?: string;
}

export default function ProBadge({ variant = 'small', showLabel = true, className = '' }: ProBadgeProps) {
  if (variant === 'lock') {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 ${className}`}>
        <Lock className="w-3 h-3 text-gray-500" />
        {showLabel && <span className="text-xs font-bold text-gray-500">PRO</span>}
      </div>
    );
  }

  if (variant === 'small') {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-sm ${className}`}>
        <Crown className="w-3 h-3 text-white" />
        {showLabel && <span className="text-xs font-bold text-white">PRO</span>}
      </div>
    );
  }

  if (variant === 'medium') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-md ${className}`}>
        <Crown className="w-4 h-4 text-white" />
        {showLabel && <span className="text-sm font-bold text-white">PRO</span>}
      </div>
    );
  }

  // large variant
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg ${className}`}>
      <Sparkles className="w-5 h-5 text-white" />
      {showLabel && <span className="text-base font-bold text-white">PRO MEMBER</span>}
    </div>
  );
}
