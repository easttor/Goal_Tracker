import { Crown, Sparkles, ArrowRight } from 'lucide-react';

interface ProUpgradeBannerProps {
  onUpgrade: () => void;
  message?: string;
  compact?: boolean;
}

export default function ProUpgradeBanner({ onUpgrade, message, compact = false }: ProUpgradeBannerProps) {
  if (compact) {
    return (
      <button
        onClick={onUpgrade}
        className="w-full p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-between group hover:shadow-lg transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4" />
          <span className="text-sm font-semibold">Upgrade to Pro</span>
        </div>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    );
  }

  return (
    <div className="p-6 rounded-[24px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-xl relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Crown className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">Unlock Pro Features</h3>
            <p className="text-sm text-white/90">
              {message || 'Get unlimited habits, goals, advanced analytics, and more'}
            </p>
          </div>
        </div>

        <button
          onClick={onUpgrade}
          className="w-full bg-white text-purple-600 font-bold py-3 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
        >
          <Sparkles className="w-5 h-5" />
          <span>Upgrade Now</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-center text-xs text-white/80 mt-2">
          From $4.99/month • Cancel anytime
        </p>
      </div>
    </div>
  );
}
