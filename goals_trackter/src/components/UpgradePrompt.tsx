import { Sparkles, X, Check, ArrowRight } from 'lucide-react';

interface UpgradePromptProps {
  onClose: () => void;
  onUpgrade: () => void;
  reason?: string;
  feature?: string;
}

export default function UpgradePrompt({ onClose, onUpgrade, reason, feature }: UpgradePromptProps) {
  const defaultReason = reason || 'Upgrade to Pro to unlock this feature';
  const featureName = feature || 'this feature';

  const proFeatures = [
    'Unlimited habits and goals',
    'Advanced analytics and insights',
    'All templates (10+ available)',
    'Progress photos for habits',
    'Export to CSV and PDF',
    'Custom themes',
    'Priority support'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md p-8 rounded-[32px] glass-light dark:glass-dark relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute p-2 transition-all rounded-full top-4 right-4 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-3 text-2xl font-bold text-center text-gray-900 dark:text-white">
          Upgrade to Pro
        </h3>

        {/* Reason */}
        <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
          {defaultReason}
        </p>

        {/* Features List */}
        <div className="p-6 mb-6 space-y-3 rounded-2xl glass-light dark:glass-dark">
          <div className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Pro Plan includes:
          </div>
          {proFeatures.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <Check className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="p-4 mb-6 text-center rounded-2xl bg-blue-500/10">
          <div className="flex items-baseline justify-center gap-2 mb-1">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">$4.99</span>
            <span className="text-gray-600 dark:text-gray-400">/month</span>
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">
            or $49.99/year (save 17%)
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onUpgrade}
            className="w-full py-4 text-sm font-semibold text-white transition-all bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl hover:shadow-lg hover:scale-[1.02] active:scale-95"
          >
            Upgrade Now
            <ArrowRight className="inline w-5 h-5 ml-2" />
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 text-sm font-semibold text-gray-600 transition-all rounded-2xl glass-light dark:glass-dark dark:text-gray-400 hover:scale-[1.02] active:scale-95"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
