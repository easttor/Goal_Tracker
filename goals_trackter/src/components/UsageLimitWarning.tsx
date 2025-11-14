import { AlertCircle, Crown, Sparkles } from 'lucide-react';

interface UsageLimitWarningProps {
  currentCount: number;
  maxCount: number;
  itemName: string; // 'habit' or 'goal'
  onUpgrade: () => void;
}

export default function UsageLimitWarning({ currentCount, maxCount, itemName, onUpgrade }: UsageLimitWarningProps) {
  // Only show if close to limit (one slot remaining)
  if (currentCount < maxCount - 1) return null;

  const isAtLimit = currentCount >= maxCount;
  const slotsRemaining = Math.max(0, maxCount - currentCount);

  return (
    <div className={`mb-4 p-4 rounded-xl ${
      isAtLimit 
        ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800' 
        : 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800'
    }`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
          isAtLimit ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
        }`} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-semibold ${
              isAtLimit ? 'text-red-900 dark:text-red-100' : 'text-yellow-900 dark:text-yellow-100'
            }`}>
              {isAtLimit ? `${itemName.charAt(0).toUpperCase() + itemName.slice(1)} Limit Reached` : `Almost at your ${itemName} limit!`}
            </h4>
            <span className={`text-sm font-bold ${
              isAtLimit ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'
            }`}>
              {currentCount}/{maxCount}
            </span>
          </div>
          
          <p className={`text-sm mb-3 ${
            isAtLimit ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'
          }`}>
            {isAtLimit 
              ? `You've reached the Free plan limit of ${maxCount} ${itemName}s. Upgrade to Pro for unlimited ${itemName}s!`
              : `Only ${slotsRemaining} ${itemName} slot${slotsRemaining === 1 ? '' : 's'} remaining on your Free plan. Upgrade to Pro for unlimited!`
            }
          </p>

          <button
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2.5 px-4 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Crown className="w-4 h-4" />
            Upgrade to Pro - $4.99/month
          </button>

          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Unlimited {itemName}s</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>All templates</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Advanced analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
